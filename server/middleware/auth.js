// middleware/auth.js
const jwt = require("jsonwebtoken");
const db = require("../db");

const SECRET = process.env.JWT_SECRET;

// ────────────────────────────────────────────────
// JWT Authentication Middleware
// ────────────────────────────────────────────────
const authMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader?.startsWith("Bearer ")) {
    return res.status(401).json({ error: "No token provided" });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, SECRET);
    req.user = decoded; // { id, email, role, iat, exp }
    next();
  } catch (err) {
    console.error("[AUTH] Token verification failed:", err.message);
    return res.status(401).json({ error: "Invalid or expired token" });
  }
};

// ────────────────────────────────────────────────
// Role-based access control middleware
// ────────────────────────────────────────────────
const requireRole = (roles) => (req, res, next) => {
  if (!req.user || !roles.includes(req.user.role)) {
    return res.status(403).json({
      error: `Access denied: ${roles.join(" or ")} role required`,
    });
  }
  next();
};

// ────────────────────────────────────────────────
// Provider verification middleware
// Blocks unverified OR rejected providers
// Shows **specific message** for rejected accounts
// ────────────────────────────────────────────────
const requireVerifiedProvider = (req, res, next) => {
  // Only check for providers
  if (req.user.role !== "provider") {
    return next(); // users & admins pass through
  }

  db.get(
    "SELECT is_verified FROM providers WHERE user_id = ?",
    [req.user.id],
    (err, row) => {
      if (err) {
        console.error("[VERIFIED] DB error checking provider:", err.message);
        return res.status(500).json({ error: "Server error checking account status" });
      }

      if (!row) {
        return res.status(403).json({
          error: "Provider profile not found. Please contact support."
        });
      }

      // Approved → allow access
      if (row.is_verified === 1) {
        return next();
      }

      // Rejected → clear rejection message
      if (row.is_verified === -1) {
        return res.status(403).json({
          error: "Your provider account has been **rejected** by admin. You cannot access the provider dashboard. Please contact support for clarification or appeal."
        });
      }

      // Pending (0 or any other value) → waiting message
      return res.status(403).json({
        error: "Your provider account is not yet approved by admin. Please wait for verification."
      });
    }
  );
};

// middleware/auth.js  (add at the end)

const requireActiveProvider = (req, res, next) => {
  if (req.user.role !== "provider") {
    return next(); // non-providers pass
  }

  db.get(
    "SELECT is_active FROM providers WHERE user_id = ?",
    [req.user.id],
    (err, row) => {
      if (err) {
        console.error("[ACTIVE] DB error checking provider status:", err.message);
        return res.status(500).json({ error: "Server error checking account status" });
      }

      if (!row) {
        return res.status(403).json({ error: "Provider profile not found" });
      }

      if (row.is_active !== 1) {
        return res.status(403).json({
          error: "Your provider account has been disabled by admin. You cannot access the provider dashboard. Please contact support."
        });
      }

      next();
    }
  );
};

module.exports = {
  authMiddleware,
  requireRole,
  requireVerifiedProvider,
  requireActiveProvider,  // ← new export
};