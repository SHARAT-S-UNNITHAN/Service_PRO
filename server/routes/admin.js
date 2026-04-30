// routes/admin.js
const express = require("express");
const db = require("../db");
const { authMiddleware, requireRole } = require("../middleware/auth");

const router = express.Router();

// All routes require authentication + admin role
router.use(authMiddleware);
router.use(requireRole(["admin"]));

// ────────────────────────────────────────────────
// GET /admin/providers
// List all providers
// ────────────────────────────────────────────────
router.get("/providers", (req, res) => {
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
      u.email,
      GROUP_CONCAT(pp.profession) AS professions
    FROM providers p
    JOIN users u ON p.user_id = u.id
    LEFT JOIN provider_professions pp ON p.id = pp.provider_id
    GROUP BY p.id
    ORDER BY p.created_at DESC
  `;

  db.all(query, [], (err, rows) => {
    if (err) {
      console.error("[ADMIN] Error fetching providers:", err.message);
      return res.status(500).json({ error: "Database error" });
    }

    const enhancedRows = rows.map(row => ({
      ...row,
      profile_photo_url: row.profile_photo ? `http://localhost:4000${row.profile_photo}` : null,
      id_proof_url: row.id_proof ? `http://localhost:4000${row.id_proof}` : null,
      license_url: row.license_doc ? `http://localhost:4000${row.license_doc}` : null,
    }));

    res.json(enhancedRows);
  });
});

// ────────────────────────────────────────────────
// GET /admin/providers/:id
// Get single provider details
// ────────────────────────────────────────────────
router.get("/providers/:id", (req, res) => {
  const pid = parseInt(req.params.id, 10);

  if (isNaN(pid)) {
    return res.status(400).json({ error: "Invalid provider ID" });
  }

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
      u.email,
      GROUP_CONCAT(pp.profession) AS professions
    FROM providers p
    JOIN users u ON p.user_id = u.id
    LEFT JOIN provider_professions pp ON p.id = pp.provider_id
    WHERE p.id = ?
    GROUP BY p.id
  `;

  db.get(query, [pid], (err, row) => {
    if (err) {
      console.error("[ADMIN] Error fetching provider:", err.message);
      return res.status(500).json({ error: "Database error" });
    }

    if (!row) {
      return res.status(404).json({ error: "Provider not found" });
    }

    const enhancedRow = {
      ...row,
      profile_photo_url: row.profile_photo ? `http://localhost:4000${row.profile_photo}` : null,
      id_proof_url: row.id_proof ? `http://localhost:4000${row.id_proof}` : null,
      license_url: row.license_doc ? `http://localhost:4000${row.license_doc}` : null,
    };

    res.json(enhancedRow);
  });
});

// ────────────────────────────────────────────────
// PATCH /admin/providers/:id/verify
// ────────────────────────────────────────────────
router.patch("/providers/:id/verify", (req, res) => {
  const { is_verified } = req.body;
  const pid = parseInt(req.params.id, 10);

  let newStatus;
  if (is_verified === true || is_verified === 1) {
    newStatus = 1;
  } else if (is_verified === false || is_verified === -1) {
    newStatus = -1;
  } else if (is_verified === 0 || is_verified === null) {
    newStatus = 0;
  } else {
    return res.status(400).json({ 
      error: "is_verified must be 1 (approve), -1 (reject), or 0 (pending)" 
    });
  }

  if (isNaN(pid)) {
    return res.status(400).json({ error: "Invalid provider ID" });
  }

  const query = `
    UPDATE providers 
    SET is_verified = ?, 
        updated_at = CURRENT_TIMESTAMP 
    WHERE id = ?
  `;

  db.run(query, [newStatus, pid], function (err) {
    if (err) {
      console.error("[VERIFY] DB ERROR:", err.message);
      return res.status(500).json({ error: "Database error" });
    }

    if (this.changes === 0) {
      return res.status(404).json({ error: "Provider not found" });
    }

    const statusText = 
      newStatus === 1 ? "approved" :
      newStatus === -1 ? "rejected" : "reset to pending";

    res.json({
      message: `Provider has been ${statusText} successfully`,
      providerId: pid,
      is_verified: newStatus
    });
  });
});
// ─────────────────────────────────────────────────────────────
// ADD THIS to your server/routes/admin.js
// This endpoint fetches booking history for a specific customer
// Used by the CustomerProfileModal in CustomersSection.jsx
// ─────────────────────────────────────────────────────────────

// GET /admin/customers/:userId/bookings
router.get("/customers/:userId/bookings", (req, res) => {
  const { userId } = req.params;

  const query = `
    SELECT
      b.id,
      b.service_description,
      b.scheduled_date,
      b.address,
      b.status,
      b.created_at,
      p.full_name AS provider_name
    FROM bookings b
    JOIN providers p ON b.provider_id = p.id
    WHERE b.user_id = ?
    ORDER BY b.created_at DESC
    LIMIT 20
  `;

  db.all(query, [userId], (err, rows) => {
    if (err) {
      console.error("[ADMIN CUSTOMER BOOKINGS] DB error:", err.message);
      return res.status(500).json({ error: "Database error" });
    }
    res.json(rows);
  });
});

// ─────────────────────────────────────────────────────────────
// NOTE: The customers table uses `id` as customer ID but the
// bookings table uses `user_id`. The modal passes customer.user_id
// which is the users.id — this matches bookings.user_id correctly.
// ─────────────────────────────────────────────────────────────
// ────────────────────────────────────────────────
// PATCH /admin/providers/:id/toggle-active
// ────────────────────────────────────────────────
router.patch("/providers/:id/toggle-active", (req, res) => {
  const { is_active } = req.body;
  const pid = parseInt(req.params.id, 10);

  if (typeof is_active !== "number" || (is_active !== 0 && is_active !== 1)) {
    return res.status(400).json({ error: "is_active must be 0 or 1" });
  }

  if (isNaN(pid)) {
    return res.status(400).json({ error: "Invalid provider ID" });
  }

  db.run(
    "UPDATE providers SET is_active = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?",
    [is_active, pid],
    function (err) {
      if (err) return res.status(500).json({ error: "Database error" });
      if (this.changes === 0) return res.status(404).json({ error: "Provider not found" });

      res.json({ 
        message: `Provider ${is_active === 1 ? "enabled" : "disabled"} successfully`,
        is_active 
      });
    }
  );
});

// ────────────────────────────────────────────────
// DELETE /admin/providers/:id
// ────────────────────────────────────────────────
router.delete("/providers/:id", (req, res) => {
  const pid = parseInt(req.params.id, 10);

  if (isNaN(pid)) {
    return res.status(400).json({ error: "Invalid provider ID" });
  }

  db.run("DELETE FROM providers WHERE id = ?", [pid], function (err) {
    if (err) return res.status(500).json({ error: "Database error" });
    if (this.changes === 0) return res.status(404).json({ error: "Provider not found" });

    res.json({ message: "Provider deleted successfully" });
  });
});

// ────────────────────────────────────────────────
// USERS
// ────────────────────────────────────────────────
router.get("/users", (req, res) => {
  const query = `
    SELECT id, email, role, created_at 
    FROM users 
    ORDER BY created_at DESC
  `;

  db.all(query, [], (err, rows) => {
    if (err) return res.status(500).json({ error: "Database error" });
    res.json(rows);
  });
});

// ====================== CUSTOMERS ======================

// GET /admin/customers - List all customers
router.get("/customers", (req, res) => {
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
    ORDER BY c.created_at DESC
  `;

  db.all(query, [], (err, rows) => {
    if (err) {
      console.error("[ADMIN] Error fetching customers:", err.message);
      return res.status(500).json({ error: "Database error" });
    }
    res.json(rows);
  });
});

// GET /admin/customers/:id - Get single customer details
router.get("/customers/:id", (req, res) => {
  const cid = parseInt(req.params.id, 10);

  if (isNaN(cid)) {
    return res.status(400).json({ error: "Invalid customer ID" });
  }

  const query = `
    SELECT 
      c.*,
      u.email
    FROM customers c
    JOIN users u ON c.user_id = u.id
    WHERE c.id = ?
  `;

  db.get(query, [cid], (err, row) => {
    if (err) return res.status(500).json({ error: "Database error" });
    if (!row) return res.status(404).json({ error: "Customer not found" });
    res.json(row);
  });
});

// DELETE /admin/customers/:id
router.delete("/customers/:id", (req, res) => {
  const cid = parseInt(req.params.id, 10);

  if (isNaN(cid)) {
    return res.status(400).json({ error: "Invalid customer ID" });
  }

  db.run("DELETE FROM customers WHERE id = ?", [cid], function (err) {
    if (err) return res.status(500).json({ error: "Database error" });
    if (this.changes === 0) return res.status(404).json({ error: "Customer not found" });
    res.json({ message: "Customer deleted successfully" });
  });
});

// ==================== COMPLAINTS ROUTES ====================

// GET /admin/complaints - List all complaints
router.get("/complaints", (req, res) => {
  const query = `
    SELECT 
      pc.id,
      pc.subject,
      pc.complaint_text,
      pc.severity,
      pc.warning_sent,
      pc.status,
      pc.created_at,
      pc.admin_notes,
      p.full_name AS provider_name,
      c.full_name AS customer_name
    FROM provider_complaints pc
    LEFT JOIN providers p ON pc.provider_id = p.id
    LEFT JOIN customers c ON pc.customer_id = c.id
    ORDER BY pc.created_at DESC
  `;

  db.all(query, [], (err, rows) => {
    if (err) {
      console.error("[ADMIN] Error fetching complaints:", err.message);
      return res.status(500).json({ error: "Database error" });
    }
    res.json(rows);
  });
});

// PATCH /admin/complaints/:id - Update complaint status
router.patch("/complaints/:id", (req, res) => {
  const { id } = req.params;
  const { status, admin_notes } = req.body;

  const validStatuses = ["pending", "under_review", "resolved", "dismissed"];
  if (!validStatuses.includes(status)) {
    return res.status(400).json({ error: "Invalid status" });
  }

  const query = `
    UPDATE provider_complaints 
    SET status = ?, 
        admin_notes = COALESCE(?, admin_notes),
        updated_at = CURRENT_TIMESTAMP 
    WHERE id = ?
  `;

  db.run(query, [status, admin_notes, id], function (err) {
    if (err) return res.status(500).json({ error: "Database error" });
    if (this.changes === 0) return res.status(404).json({ error: "Complaint not found" });

    res.json({ message: "Complaint updated successfully" });
  });
});

// DELETE /admin/complaints/:id
router.delete("/complaints/:id", (req, res) => {
  const { id } = req.params;

  db.run("DELETE FROM provider_complaints WHERE id = ?", [id], function (err) {
    if (err) return res.status(500).json({ error: "Database error" });
    if (this.changes === 0) return res.status(404).json({ error: "Complaint not found" });

    res.json({ message: "Complaint deleted successfully" });
  });
});

// ────────────────────────────────────────────────
// POST /admin/complaints/:id/warning
router.post("/complaints/:id/warning", (req, res) => {
  const complaintId = parseInt(req.params.id, 10);
  const { message } = req.body;

  // Validation
  if (isNaN(complaintId)) {
    return res.status(400).json({ error: "Invalid complaint ID" });
  }

  if (!message || typeof message !== "string" || message.trim().length === 0) {
    return res.status(400).json({ error: "Warning message cannot be empty" });
  }

  // Format message
  const now = new Date();
  const formattedDate = now.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "long",
    year: "numeric"
  });
  const formattedTime = now.toLocaleTimeString("en-IN", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true
  });

  const warningText = `
══════════════════════════════════════
          ADMIN WARNING
══════════════════════════════════════

Date : ${formattedDate}
Time : ${formattedTime} IST

Message:
${message.trim()}

Please address this issue at the earliest.
══════════════════════════════════════
`;

  // Check complaint exists
  db.get(
    "SELECT id, warning_sent FROM provider_complaints WHERE id = ?",
    [complaintId],
    (err, row) => {
      if (err) {
        console.error("Error checking complaint:", err.message);
        return res.status(500).json({ error: "Database error" });
      }

      if (!row) {
        return res.status(404).json({ error: "Complaint not found" });
      }

      // 🔥 Prevent duplicate warning
      if (row.warning_sent === 1) {
        return res.status(400).json({ error: "Warning already sent" });
      }

      // Update DB
      db.run(
        `UPDATE provider_complaints 
         SET 
           admin_notes = COALESCE(admin_notes, '') || ?,
           status = 'under_review',
           warning_sent = 1,   -- ✅ FIX ADDED
           updated_at = CURRENT_TIMESTAMP
         WHERE id = ?`,
        [warningText, complaintId],
        function (err) {
          if (err) {
            console.error("Error sending warning:", err.message);
            return res.status(500).json({ error: "Failed to send warning message" });
          }

          res.json({
            success: true,
            message: "Warning sent successfully"
          });
        }
      );
    }
  );
});

// Catch unmatched admin routes
router.use((req, res) => {
  res.status(404).json({ error: "Admin route not found" });
});

module.exports = router;