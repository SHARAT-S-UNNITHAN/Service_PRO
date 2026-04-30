const express = require("express");
const db      = require("../db");
const { authMiddleware, requireRole } = require("../middleware/auth");
const { sendOtpToCustomer }           = require("../services/emailService");

const router = express.Router();

function generateOtp() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// POST /api/bookings/:id/request-completion
router.post("/bookings/:id/request-completion", authMiddleware, requireRole(["provider"]), (req, res) => {
  const bookingId = parseInt(req.params.id);
  if (isNaN(bookingId)) return res.status(400).json({ error: "Invalid booking ID" });

  db.get(
    `SELECT b.id, b.status, b.service_description, b.user_id,
            b.customer_confirmed, b.cash_amount_paid,
            p.id AS provider_id, p.full_name AS provider_name,
            c.full_name AS customer_name, u_cust.email AS customer_email
     FROM bookings b
     JOIN providers p  ON b.provider_id = p.id
     JOIN customers c  ON b.user_id = c.user_id
     JOIN users u_cust ON b.user_id = u_cust.id
     WHERE b.id = ? AND p.user_id = ?`,
    [bookingId, req.user.id],
    async (err, booking) => {
      if (err)      return res.status(500).json({ error: "Database error" });
      if (!booking) return res.status(404).json({ error: "Booking not found or access denied" });
      if (booking.status !== "accepted") return res.status(400).json({ error: "Booking must be accepted" });
      if (booking.customer_confirmed !== 1) {
        return res.status(400).json({
          error: "Customer has not confirmed the work yet. Ask them to confirm from their dashboard first.",
          code: "CUSTOMER_NOT_CONFIRMED"
        });
      }

      const otp       = generateOtp();
      const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString();

      db.run("DELETE FROM booking_otps WHERE booking_id = ?", [bookingId], () => {
        db.run(
          "INSERT INTO booking_otps (booking_id, otp_code, expires_at, is_used) VALUES (?, ?, ?, 0)",
          [bookingId, otp, expiresAt],
          async (insertErr) => {
            if (insertErr) return res.status(500).json({ error: "Failed to generate OTP" });

            try {
              await sendOtpToCustomer({
                customerEmail: booking.customer_email, customerName: booking.customer_name,
                providerName: booking.provider_name, serviceDescription: booking.service_description,
                otp, bookingId,
              });
            } catch (e) { console.error("[OTP] Email failed:", e.message); }

            res.json({
              message: "OTP sent to customer's email. Ask them for the 6-digit code.",
              booking_id: bookingId,
              customer_amount: booking.cash_amount_paid,
              expires_in_minutes: 10,
            });
          }
        );
      });
    }
  );
});

// POST /api/bookings/:id/verify-completion
router.post("/bookings/:id/verify-completion", authMiddleware, requireRole(["provider"]), (req, res) => {
  const bookingId = parseInt(req.params.id);
  const { otp }   = req.body;
  if (isNaN(bookingId))         return res.status(400).json({ error: "Invalid booking ID" });
  if (!otp || otp.length !== 6) return res.status(400).json({ error: "Enter the 6-digit OTP" });

  db.get(
    `SELECT b.id, b.status, b.cash_amount_paid, p.id AS provider_id
     FROM bookings b JOIN providers p ON b.provider_id = p.id
     WHERE b.id = ? AND p.user_id = ?`,
    [bookingId, req.user.id],
    (err, booking) => {
      if (err || !booking) return res.status(404).json({ error: "Booking not found" });
      if (booking.status !== "accepted") return res.status(400).json({ error: "Booking not in accepted status" });

      db.get("SELECT * FROM booking_otps WHERE booking_id = ? AND is_used = 0", [bookingId], (otpErr, record) => {
        if (otpErr || !record) return res.status(400).json({ error: "No OTP found. Request a new one." });
        if (new Date(record.expires_at) < new Date()) {
          db.run("DELETE FROM booking_otps WHERE booking_id = ?", [bookingId]);
          return res.status(400).json({ error: "OTP expired. Request a new one." });
        }
        if (record.otp_code !== otp.trim()) return res.status(400).json({ error: "Incorrect OTP." });

        db.run(
          "UPDATE bookings SET status='completed', completed_at=CURRENT_TIMESTAMP, updated_at=CURRENT_TIMESTAMP WHERE id=?",
          [bookingId],
          function (updateErr) {
            if (updateErr) return res.status(500).json({ error: "Failed to complete booking" });
            db.run("UPDATE booking_otps SET is_used=1 WHERE booking_id=?", [bookingId]);
            if (booking.cash_amount_paid) {
              db.run("UPDATE providers SET total_earnings=COALESCE(total_earnings,0)+? WHERE id=?",
                [booking.cash_amount_paid, booking.provider_id]);
            }
            res.json({ message: "Booking completed successfully!" });
          }
        );
      });
    }
  );
});

module.exports = router;
