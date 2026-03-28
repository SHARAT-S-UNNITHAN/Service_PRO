// src/routes/user.js
const express = require("express");
const db = require("../db");
const { authMiddleware, requireRole } = require("../middleware/auth");

const router = express.Router();

// All routes require authentication + user role
router.use(authMiddleware);
router.use(requireRole(["user"]));

// ────────────────────────────────────────────────
// GET /user/profile
// Fetch customer's own profile details
// ────────────────────────────────────────────────
router.get("/profile", (req, res) => {
  const query = `
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

  db.get(query, [req.user.id], (err, row) => {
    if (err) {
      console.error("[USER PROFILE] Fetch error:", err.message);
      return res.status(500).json({ error: "Database error" });
    }

    if (!row) {
      return res.status(404).json({ error: "Customer profile not found" });
    }

    res.json(row);
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
// POST /user/bookings
// Create a new booking request
// ────────────────────────────────────────────────
router.post("/bookings", (req, res) => {
  const { provider_id, service_description, scheduled_date, address } = req.body;

  if (!provider_id || !service_description || !scheduled_date || !address) {
    return res.status(400).json({ error: "All fields are required" });
  }

  db.get(
    "SELECT id FROM providers WHERE id = ? AND is_verified = 1 AND is_active = 1",
    [provider_id],
    (err, prov) => {
      if (err) return res.status(500).json({ error: "Server error" });
      if (!prov) return res.status(404).json({ error: "Provider not found or unavailable" });

      db.run(
        `INSERT INTO bookings (
          user_id, provider_id, service_description, scheduled_date, address, status, created_at
        ) VALUES (?, ?, ?, ?, ?, 'pending', CURRENT_TIMESTAMP)`,
        [req.user.id, provider_id, service_description, scheduled_date, address],
        function (err) {
          if (err) return res.status(500).json({ error: "Failed to create booking" });
          res.status(201).json({
            message: "Booking request sent successfully",
            bookingId: this.lastID,
          });
        }
      );
    }
  );
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

      // 🔥 CALCULATE RESPONSE TIME
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
          responseTime, // ✅ STORE IT
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
            customer.id,           // ← Use customer.id (NOT req.user.id)
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