// routes/provider.js
const express = require("express");
const db = require("../db");
const {
  authMiddleware,
  requireRole,
  requireVerifiedProvider,
} = require("../middleware/auth");

const router = express.Router();

// ────────────────────────────────────────────────
// AUTH REQUIRED (but NOT verified yet)
// ────────────────────────────────────────────────
router.use(authMiddleware);
router.use(requireRole(["provider"]));

// ────────────────────────────────────────────────
// HELPER: Get provider_id from user_id
// ────────────────────────────────────────────────
function getProviderId(userId, callback) {
  db.get(
    "SELECT id FROM providers WHERE user_id = ?",
    [userId],
    (err, row) => {
      if (err) return callback(err);
      if (!row) return callback(new Error("Provider profile not found"));
      callback(null, row.id);
    }
  );
}

// ────────────────────────────────────────────────
// PROFILE ROUTES (NO verification required)
// ────────────────────────────────────────────────

// GET /provider/profile
router.get("/profile", (req, res) => {
  const query = `
    SELECT 
      p.id,
      p.user_id,
      p.username,
      p.full_name,
      p.phone,
      p.district,
      p.region,
      p.address,
      p.description,
      p.profile_photo,
      p.id_proof,
      p.license_doc,
      p.is_verified,
      p.is_active,
      p.created_at,
      p.updated_at,
      u.email
    FROM providers p
    JOIN users u ON p.user_id = u.id
    WHERE p.user_id = ?
  `;

  db.get(query, [req.user.id], (err, profile) => {
    if (err) return res.status(500).json({ error: "Database error" });
    if (!profile)
      return res.status(404).json({ error: "Provider profile not found" });

    db.all(
      "SELECT profession FROM provider_professions WHERE provider_id = ?",
      [profile.id],
      (err, rows) => {
        profile.professions = rows ? rows.map((r) => r.profession) : [];

        profile.profile_photo_url = profile.profile_photo
          ? `http://localhost:4000${profile.profile_photo}`
          : null;

        profile.id_proof_url = profile.id_proof
          ? `http://localhost:4000${profile.id_proof}`
          : null;

        profile.license_url = profile.license_doc
          ? `http://localhost:4000${profile.license_doc}`
          : null;

        res.json(profile);
      }
    );
  });
});

// GET /provider/status
router.get("/status", (req, res) => {
  db.get(
    "SELECT is_verified, is_active FROM providers WHERE user_id = ?",
    [req.user.id],
    (err, row) => {
      if (err) return res.status(500).json({ error: "Database error" });
      if (!row)
        return res.status(404).json({ error: "Provider profile not found" });
      res.json(row);
    }
  );
});

// PUT /provider/profile
router.put("/profile", (req, res) => {
  const { full_name, phone, email, district, region, address, description } = req.body;

  if (!full_name || !phone || !district || !region || !address) {
    return res.status(400).json({ error: "Required fields missing" });
  }

  db.serialize(() => {
    db.run("BEGIN TRANSACTION");

    // Update providers table
    db.run(
      `UPDATE providers
       SET full_name = ?, phone = ?, district = ?, region = ?, address = ?, description = ?, updated_at = CURRENT_TIMESTAMP
       WHERE user_id = ?`,
      [
        full_name.trim(),
        phone.trim(),
        district.trim(),
        region.trim(),
        address.trim(),
        description?.trim() || "",
        req.user.id,
      ]
    );

    // Update users table if email provided
    if (email) {
      db.run(
        "UPDATE users SET email = ? WHERE id = ?",
        [email.trim(), req.user.id],
        (err) => {
          if (err && err.message.includes("UNIQUE")) {
            db.run("ROLLBACK");
            return res.status(400).json({ error: "Email already in use" });
          }
        }
      );
    }

    db.run("COMMIT", (err) => {
      if (err) return res.status(500).json({ error: "Update failed" });
      res.json({ message: "Profile updated successfully" });
    });
  });
});

// GET /provider/professions
router.get("/professions", (req, res) => {
  getProviderId(req.user.id, (err, providerId) => {
    if (err)
      return res.status(404).json({ error: "Provider profile not found" });

    db.all(
      "SELECT profession FROM provider_professions WHERE provider_id = ?",
      [providerId],
      (err, rows) => {
        if (err) return res.status(500).json({ error: "Database error" });
        res.json({ professions: rows.map((r) => r.profession) });
      }
    );
  });
});

// ────────────────────────────────────────────────
// VERIFIED-ONLY ROUTES
// ────────────────────────────────────────────────
router.use(requireVerifiedProvider);

// GET /provider/bookings
router.get("/bookings", (req, res) => {
  getProviderId(req.user.id, (err, providerId) => {
    if (err)
      return res.status(404).json({ error: "Provider profile not found" });

    const query = `
      SELECT 
        b.id,
        b.user_id,
        b.service_description,
        b.scheduled_date,
        b.address,
        b.status,
        b.created_at,
        c.full_name AS customer_name
      FROM bookings b
      JOIN customers c ON b.user_id = c.user_id
      WHERE b.provider_id = ?
      ORDER BY b.created_at DESC
    `;

    db.all(query, [providerId], (err, rows) => {
      if (err) return res.status(500).json({ error: "Database error" });
      res.json(rows);
    });
  });
});

// ACCEPT booking
router.patch("/bookings/:bookingId/accept", (req, res) => {
  const { bookingId } = req.params;

  getProviderId(req.user.id, (err, providerId) => {
    if (err)
      return res.status(404).json({ error: "Provider profile not found" });

    db.run(
      `UPDATE bookings 
       SET 
         status = 'accepted',
         responded_at = CURRENT_TIMESTAMP,   -- 🔥 IMPORTANT
         updated_at = CURRENT_TIMESTAMP
       WHERE id = ? 
         AND provider_id = ? 
         AND status = 'pending'`,
      [bookingId, providerId],
      function (err) {
        if (err) return res.status(500).json({ error: "Database error" });

        if (this.changes === 0) {
          return res.status(400).json({
            error: "Booking not found or not pending",
          });
        }

        res.json({ message: "Booking accepted successfully" });
      }
    );
  });
});
// REJECT booking
router.patch("/bookings/:bookingId/reject", (req, res) => {
  const { bookingId } = req.params;

  getProviderId(req.user.id, (err, providerId) => {
    if (err)
      return res.status(404).json({ error: "Provider profile not found" });

    db.run(
      `UPDATE bookings 
       SET 
         status = 'rejected',
         responded_at = CURRENT_TIMESTAMP,   -- 🔥 IMPORTANT
         updated_at = CURRENT_TIMESTAMP
       WHERE id = ? 
         AND provider_id = ? 
         AND status = 'pending'`,
      [bookingId, providerId],
      function (err) {
        if (err) return res.status(500).json({ error: "Database error" });

        if (this.changes === 0) {
          return res.status(400).json({
            error: "Booking not found or not pending",
          });
        }

        res.json({ message: "Booking rejected successfully" });
      }
    );
  });
});

// GET /provider/reviews - Get all reviews for the logged-in provider
router.get("/reviews", (req, res) => {
  console.log("USER ID:", req.user.id);

  getProviderId(req.user.id, (err, providerId) => {
    if (err) {
      console.log("ERROR getting providerId:", err.message);
      return res.status(404).json({ error: "Provider profile not found" });
    }

    console.log("PROVIDER ID:", providerId);

    const query = `
      SELECT 
        r.id,
        r.rating,
        r.review_text,
        r.response_time_minutes,
        r.created_at,
        b.service_description,
        c.full_name AS customer_name
      FROM reviews r
      JOIN bookings b ON r.booking_id = b.id
      JOIN customers c ON b.user_id = c.user_id
      WHERE r.provider_id = ?
    `;

    db.all(query, [providerId], (err, rows) => {
      if (err) {
        console.log("DB ERROR:", err);
        return res.status(500).json({ error: "Database error" });
      }

      console.log("REVIEWS FOUND:", rows.length);
      res.json(rows);
    });
  });
});

// COMPLETE booking
router.patch("/bookings/:bookingId/complete", (req, res) => {
  const { bookingId } = req.params;

  getProviderId(req.user.id, (err, providerId) => {
    if (err)
      return res.status(404).json({ error: "Provider profile not found" });

    db.run(
      `UPDATE bookings 
       SET 
         status = 'completed',
         completed_at = CURRENT_TIMESTAMP,   -- 🔥 IMPORTANT
         updated_at = CURRENT_TIMESTAMP
       WHERE id = ? 
         AND provider_id = ? 
         AND status = 'accepted'`,
      [bookingId, providerId],
      function (err) {
        if (err) return res.status(500).json({ error: "Database error" });

        if (this.changes === 0) {
          return res.status(400).json({
            error: "Booking not found or not accepted",
          });
        }

        res.json({ message: "Booking marked as completed successfully" });
      }
    );
  });
});


// GET /provider/notifications - Get all admin warnings for this provider
router.get("/notifications", (req, res) => {
  getProviderId(req.user.id, (err, providerId) => {
    if (err) {
      console.error("Provider ID error:", err.message);
      return res.status(404).json({ error: "Provider profile not found" });
    }

    const query = `
      SELECT 
        id,
        subject,
        admin_notes AS message,
        severity,
        status,
        created_at,
        updated_at
      FROM provider_complaints 
      WHERE provider_id = ? 
        AND admin_notes IS NOT NULL 
        AND admin_notes != ''
      ORDER BY updated_at DESC
    `;

    db.all(query, [providerId], (err, rows) => {
      if (err) {
        console.error("[PROVIDER NOTIFICATIONS] Error:", err.message);
        return res.status(500).json({ error: "Database error" });
      }

      console.log("NOTIFICATIONS FOUND:", rows.length); // 🔥 debug
      res.json(rows);
    });
  });
});

// ────────────────────────────────────────────────
// PUBLIC ROUTE (MUST BE LAST)
// ────────────────────────────────────────────────
router.get("/:id", (req, res) => {
  const { id } = req.params;

  // ✅ manual validation
  if (isNaN(id)) {
    return res.status(400).json({ error: "Invalid provider ID" });
  }

  const query = `
    SELECT 
      p.id,
      p.username,
      p.full_name,
      p.district,
      p.region,
      p.address,
      p.description,
      p.profile_photo,
      p.is_verified,
      p.is_active,
      GROUP_CONCAT(pp.profession) AS professions
    FROM providers p
    LEFT JOIN provider_professions pp ON p.id = pp.provider_id
    WHERE p.id = ?
    GROUP BY p.id
  `;

  db.get(query, [id], (err, row) => {
    if (err) return res.status(500).json({ error: "Database error" });

    if (!row || row.is_verified !== 1 || row.is_active !== 1) {
      return res.status(404).json({ error: "Provider not found or not available" });
    }

    res.json({
      id: row.id,
      full_name: row.full_name || row.username,
      district: row.district,
      region: row.region,
      address: row.address,
      description: row.description,
      profile_photo_url: row.profile_photo
        ? `http://localhost:4000${row.profile_photo}`
        : null,
      is_verified: row.is_verified,
      professions: row.professions
        ? row.professions.split(",").map(p => p.trim())
        : [],
    });
  });
});

// Catch-all
router.use((req, res) => {
  res.status(404).json({ error: "Provider route not found" });
});

module.exports = router;