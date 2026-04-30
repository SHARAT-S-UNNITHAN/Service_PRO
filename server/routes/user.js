const express = require("express");
const db = require("../db");
const { authMiddleware, requireRole } = require("../middleware/auth");
const { sendBookingNotificationToProvider } = require("../services/emailService");

const router = express.Router();

// All routes require authentication + user role
router.use(authMiddleware);
router.use(requireRole(["user"]));

// ────────────────────────────────────────────────
// GET /user/profile
// Fetch customer's own profile details
// ────────────────────────────────────────────────
router.get("/profile", (req, res) => {
  console.log(`[USER PROFILE] Fetching for user_id: ${req.user.id}, email: ${req.user.email}`);

  // First, check if customer profile exists
  const checkQuery = `
    SELECT 
      c.id,
      c.full_name,
      c.phone,
      c.address,
      c.landmark,
      c.created_at,
      c.updated_at,
      u.email
    FROM customers c
    JOIN users u ON c.user_id = u.id
    WHERE c.user_id = ?
  `;

  db.get(checkQuery, [req.user.id], (err, row) => {
    if (err) {
      console.error("[USER PROFILE] Fetch error:", err.message);
      return res.status(500).json({ error: "Database error: " + err.message });
    }

    if (row) {
      // Profile exists, return it
      console.log(`[USER PROFILE] Profile found for user ${req.user.id}`);
      return res.json(row);
    }

    // No profile - auto-create basic one
    console.log(`[USER PROFILE] No profile found. Auto-creating for user ${req.user.id}`);
    
    // Check if customers table exists
    db.get("SELECT name FROM sqlite_master WHERE type='table' AND name='customers'", (err, tableExists) => {
      if (err || !tableExists) {
        console.error("[USER PROFILE] Customers table does not exist!");
        return res.status(500).json({ error: "Customers table not found" });
      }

      // Insert basic profile
      const emailName = req.user.email.split('@')[0].replace(/[^a-zA-Z]/g, '').substring(0, 20) || 'User';
      const defaultPhone = '0000000000';
      const defaultAddress = 'Address not set';

      const insertQuery = `
        INSERT INTO customers (user_id, full_name, phone, address, landmark, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
      `;

      db.run(insertQuery, [req.user.id, emailName, defaultPhone, defaultAddress, null], function(insertErr) {
        if (insertErr) {
          console.error("[USER PROFILE] Auto-create error:", insertErr.message);
          return res.status(500).json({ error: "Failed to create profile: " + insertErr.message });
        }

        console.log(`[USER PROFILE] Created profile with id ${this.lastID} for user ${req.user.id}`);

        // Fetch the newly created profile
        db.get(checkQuery, [req.user.id], (fetchErr, newRow) => {
          if (fetchErr) {
            console.error("[USER PROFILE] Fetch after create error:", fetchErr.message);
            return res.status(500).json({ error: "Profile created but failed to fetch" });
          }
          res.json(newRow);
        });
      });
    });
  });
});

// ────────────────────────────────────────────────
// GET /user/otp-notifications
// Returns all OTPs sent to this user (for their bookings)
// ────────────────────────────────────────────────
router.get("/otp-notifications", (req, res) => {
  const query = `
    SELECT
      bo.id,
      bo.booking_id,
      bo.otp_code,
      bo.expires_at,
      bo.is_used,
      bo.created_at,
      b.service_description,
      p.full_name AS provider_name
    FROM booking_otps bo
    JOIN bookings b   ON bo.booking_id = b.id
    JOIN providers p  ON b.provider_id = p.id
    WHERE b.user_id = ?
    ORDER BY bo.created_at DESC
  `;

  db.all(query, [req.user.id], (err, rows) => {
    if (err) {
      console.error("[OTP NOTIFICATIONS] DB error:", err.message);
      return res.status(500).json({ error: "Database error" });
    }
    res.json(rows);
  });
});

// ────────────────────────────────────────────────
// PUT /user/profile
// Update customer's profile details
// ────────────────────────────────────────────────
router.put("/profile", (req, res) => {
  const { full_name, phone, address, landmark } = req.body;

  if (!full_name || !phone || !address) {
    return res.status(400).json({ error: "Full name, phone, and address are required" });
  }

  if (!/^\d{10}$/.test(phone)) {
    return res.status(400).json({ error: "Phone number must be exactly 10 digits" });
  }

  const query = `
    UPDATE customers 
    SET 
      full_name = ?,
      phone = ?,
      address = ?,
      landmark = ?,
      updated_at = CURRENT_TIMESTAMP
    WHERE user_id = ?
  `;

  db.run(
    query,
    [
      full_name.trim(),
      phone.trim(),
      address.trim(),
      landmark ? landmark.trim() : null,
      req.user.id
    ],
    function (err) {
      if (err) {
        console.error("[USER PROFILE] Update error:", err.message);
        return res.status(500).json({ error: "Database error" });
      }

      if (this.changes === 0) {
        return res.status(404).json({ error: "Profile not found" });
      }

      res.json({ message: "Profile updated successfully" });
    }
  );
});

// ────────────────────────────────────────────────
// POST /user/bookings - Create a new booking request (WITH EMAIL NOTIFICATION & PROFESSION)
// ────────────────────────────────────────────────
router.post("/bookings", (req, res) => {
  const { provider_id, service_description, scheduled_date, address, notes, profession } = req.body;

  if (!provider_id || !service_description || !scheduled_date || !address) {
    return res.status(400).json({ error: "All fields are required" });
  }

  // First, verify provider exists and is active
  db.get(
    "SELECT id, full_name FROM providers WHERE id = ? AND is_verified = 1 AND is_active = 1",
    [provider_id],
    (err, provider) => {
      if (err) {
        console.error("[BOOKING] Provider check error:", err.message);
        return res.status(500).json({ error: "Server error" });
      }
      if (!provider) {
        return res.status(404).json({ error: "Provider not found or unavailable" });
      }

      // Insert the booking with profession field
      db.run(
        `INSERT INTO bookings (
          user_id, provider_id, service_description, scheduled_date, 
          address, notes, profession, status, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, 'pending', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`,
        [
          req.user.id, 
          provider_id, 
          service_description.trim(), 
          scheduled_date, 
          address.trim(), 
          notes?.trim() || "",
          profession?.trim() || null,
        ],
        function (err) {
          if (err) {
            console.error("[BOOKING] Insert error:", err.message);
            return res.status(500).json({ error: "Failed to create booking" });
          }

          const bookingId = this.lastID;

          // Send response immediately (don't wait for email)
          res.status(201).json({
            message: "Booking request sent successfully",
            bookingId: bookingId,
          });

          // ────────────────────────────────────────────────
          // Send email notification to provider (async, non-blocking)
          // ────────────────────────────────────────────────
          const emailQuery = `
            SELECT
              p.full_name AS provider_name,
              u.email AS provider_email,
              c.full_name AS customer_name,
              c.phone AS customer_phone
            FROM providers p
            JOIN users u ON p.user_id = u.id
            JOIN customers c ON c.user_id = ?
            WHERE p.id = ?
          `;

          db.get(emailQuery, [req.user.id, provider_id], async (err, row) => {
            if (err || !row) {
              console.error("[EMAIL] Could not fetch email data:", err?.message);
              return;
            }

            try {
              await sendBookingNotificationToProvider({
                providerEmail: row.provider_email,
                providerName: row.provider_name,
                customerName: row.customer_name,
                customerPhone: row.customer_phone,
                serviceDescription: service_description,
                scheduledDate: scheduled_date,
                address: address,
                notes: notes,
                bookingId: bookingId,
              });
              console.log(`[EMAIL] Booking notification sent for booking #${bookingId} to ${row.provider_email}`);
            } catch (emailErr) {
              // Email failure should NOT affect booking - just log it
              console.error("[EMAIL] Failed to send booking notification:", emailErr.message);
            }
          });
        }
      );
    }
  );
});

// ────────────────────────────────────────────────
// GET /user/bookings
// Get list of user's bookings
// ────────────────────────────────────────────────
router.get("/bookings", (req, res) => {
  const query = `
    SELECT 
      b.id,
      b.provider_id,
      b.service_description,
      b.scheduled_date,
      b.address,
      b.notes,
      b.status,
      b.created_at,
      p.full_name AS provider_name,
      p.district AS provider_district
    FROM bookings b
    JOIN providers p ON b.provider_id = p.id
    WHERE b.user_id = ?
    ORDER BY b.created_at DESC
  `;

  db.all(query, [req.user.id], (err, rows) => {
    if (err) {
      console.error("[USER BOOKINGS] Fetch error:", err.message);
      return res.status(500).json({ error: "Database error" });
    }

    res.json(rows);
  });
});

// ────────────────────────────────────────────────
// GET /user/reviews
// Get all reviews submitted by the logged-in user
// ────────────────────────────────────────────────
router.get("/reviews", (req, res) => {
  const query = `
    SELECT 
      r.id,
      r.booking_id,
      r.rating,
      r.review_text,
      r.response_time_minutes,
      r.created_at,
      b.service_description,
      p.full_name AS provider_name
    FROM reviews r
    JOIN bookings b ON r.booking_id = b.id
    JOIN providers p ON r.provider_id = p.id
    WHERE r.user_id = ?
    ORDER BY r.created_at DESC
  `;

  db.all(query, [req.user.id], (err, rows) => {
    if (err) {
      console.error("[USER REVIEWS] Fetch error:", err.message);
      return res.status(500).json({ error: "Database error" });
    }

    res.json(rows);
  });
});

// ────────────────────────────────────────────────
// POST /user/reviews
// Submit a review for a completed booking
// ────────────────────────────────────────────────
router.post("/reviews", (req, res) => {
  const { booking_id, rating, review_text } = req.body;

  if (!booking_id || !rating || rating < 1 || rating > 5) {
    return res.status(400).json({
      error: "Valid booking_id and rating (1-5) are required",
    });
  }

  db.get(
    `SELECT id, provider_id, created_at, responded_at 
     FROM bookings 
     WHERE id = ? AND user_id = ? AND status = 'completed'`,
    [booking_id, req.user.id],
    (err, booking) => {
      if (err) return res.status(500).json({ error: "Database error" });

      if (!booking) {
        return res.status(403).json({
          error: "You can only review your own completed bookings",
        });
      }

      // Calculate response time
      let responseTime = null;

      if (booking.responded_at) {
        const created = new Date(booking.created_at);
        const responded = new Date(booking.responded_at);

        responseTime = Math.floor(
          (responded - created) / (1000 * 60)
        ); // minutes
      }

      db.run(
        `INSERT INTO reviews 
        (booking_id, user_id, provider_id, rating, review_text, response_time_minutes, created_at)
        VALUES (?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)`,
        [
          booking_id,
          req.user.id,
          booking.provider_id,
          rating,
          review_text ? review_text.trim() : null,
          responseTime,
        ],
        function (err) {
          if (err)
            return res.status(500).json({
              error: "Failed to submit review",
            });

          res.status(201).json({
            message: "Review submitted successfully",
            reviewId: this.lastID,
            response_time_minutes: responseTime,
          });
        }
      );
    }
  );
});

// ────────────────────────────────────────────────
// POST /user/complaints
// Submit a complaint against a provider
// ────────────────────────────────────────────────
router.post("/complaints", (req, res) => {
  const { booking_id, provider_id, subject, complaint_text, severity } = req.body;

  if (!provider_id || !complaint_text?.trim()) {
    return res.status(400).json({ error: "Provider ID and complaint text are required" });
  }

  // First, get the customer's ID from users → customers table
  db.get(
    "SELECT id FROM customers WHERE user_id = ?",
    [req.user.id],
    (err, customer) => {
      if (err) {
        console.error("[USER COMPLAINT] Customer lookup error:", err.message);
        return res.status(500).json({ error: "Database error" });
      }

      if (!customer) {
        return res.status(404).json({ error: "Customer profile not found" });
      }

      // Validate provider exists
      db.get("SELECT id FROM providers WHERE id = ?", [provider_id], (err, provider) => {
        if (err) return res.status(500).json({ error: "Database error" });
        if (!provider) return res.status(404).json({ error: "Provider not found" });

        const finalSubject = subject?.trim() || `Complaint regarding booking #${booking_id || 'N/A'}`;

        db.run(
          `INSERT INTO provider_complaints 
            (booking_id, customer_id, provider_id, subject, complaint_text, severity, status, created_at)
           VALUES (?, ?, ?, ?, ?, ?, 'pending', CURRENT_TIMESTAMP)`,
          [
            booking_id || null,
            customer.id,
            provider_id,
            finalSubject,
            complaint_text.trim(),
            severity || "medium"
          ],
          function (err) {
            if (err) {
              console.error("[USER COMPLAINT] Insert error:", err.message);
              return res.status(500).json({ error: "Failed to submit complaint" });
            }

            res.status(201).json({
              message: "Complaint submitted successfully. The admin team will review it soon.",
              complaintId: this.lastID
            });
          }
        );
      });
    }
  );
});

// Optional: 404 for unmatched user routes
router.use((req, res) => {
  res.status(404).json({ error: "User route not found" });
});

module.exports = router;