// routes/auth.js
const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const db = require("../db");
const { uploadFields } = require("../middleware/multer");

const router = express.Router();

const SECRET = process.env.JWT_SECRET || "my-secure-secret-for-this-project-2025-do-not-change-or-share";

// Helper: generate JWT
const issueToken = (user) =>
  jwt.sign(
    { id: user.id, email: user.email, role: user.role },
    SECRET,
    { expiresIn: "7d" }
  );

// ────────────────────────────────────────────────
// POST /signup → regular user registration (creates user + customer record)
// ────────────────────────────────────────────────
router.post("/signup", async (req, res) => {
  const { 
    email, 
    password, 
    full_name, 
    phone, 
    address, 
    landmark 
  } = req.body;

  // Required fields validation
  if (!email || !password || !full_name || !phone || !address) {
    return res.status(400).json({ 
      error: "All required fields missing: email, password, full_name, phone, address" 
    });
  }

  // Phone validation: exactly 10 digits
  if (!/^\d{10}$/.test(phone)) {
    return res.status(400).json({ error: "Phone number must be exactly 10 digits" });
  }

  // Password length
  if (password.length < 8) {
    return res.status(400).json({ error: "Password must be at least 8 characters" });
  }

  try {
    const hashed = await bcrypt.hash(password, 10);

    // Start transaction
    await new Promise((resolve, reject) => {
      db.run("BEGIN TRANSACTION", (err) => {
        if (err) return reject(err);
        resolve();
      });
    });

    // 1. Create user
    const userId = await new Promise((resolve, reject) => {
      db.run(
        "INSERT INTO users (email, password, role) VALUES (?, ?, 'user')",
        [email.trim(), hashed],
        function (err) {
          if (err) return reject(err);
          resolve(this.lastID);
        }
      );
    });

    // 2. Create customer profile
    await new Promise((resolve, reject) => {
      db.run(
        `INSERT INTO customers (
          user_id, full_name, phone, address, landmark
        ) VALUES (?, ?, ?, ?, ?)`,
        [
          userId,
          full_name.trim(),
          phone.trim(),
          address.trim(),
          landmark ? landmark.trim() : null
        ],
        function (err) {
          if (err) return reject(err);
          resolve();
        }
      );
    });

    // Commit transaction
    await new Promise((resolve, reject) => {
      db.run("COMMIT", (err) => {
        if (err) return reject(err);
        resolve();
      });
    });

    res.status(201).json({ 
      message: "Account created successfully. Please log in." 
    });
  } catch (err) {
    // Rollback transaction
    await new Promise((resolve) => db.run("ROLLBACK", resolve));

    if (err.code === "SQLITE_CONSTRAINT") {
      return res.status(409).json({ error: "Email or phone already registered" });
    }

    console.error("[SIGNUP] Error:", err.message);
    res.status(500).json({ error: "Server error during signup" });
  }
});

// ────────────────────────────────────────────────
// POST /provider/register → provider + files + professions (unchanged)
// ────────────────────────────────────────────────
router.post(
  "/provider/register",
  uploadFields,
  async (req, res) => {
    const {
      username,
      email,
      password,
      fullName,
      phone,
      district,
      region,
      address,
      description = "",
      professions = "[]",
    } = req.body;

    if (
      !email ||
      !password ||
      !username ||
      !fullName ||
      !phone ||
      !district ||
      !region ||
      !address
    ) {
      return res.status(400).json({ error: "All required fields must be provided" });
    }

    if (!/^\d{10}$/.test(phone)) {
      return res.status(400).json({ error: "Phone must be a valid 10-digit number" });
    }

    if (password.length < 8) {
      return res.status(400).json({ error: "Password must be at least 8 characters" });
    }

    const profilePhoto = req.files?.profilePhoto?.[0]
      ? `/uploads/${req.files.profilePhoto[0].filename}`
      : null;

    const idProof = req.files?.idProof?.[0]
      ? `/uploads/${req.files.idProof[0].filename}`
      : null;

    const licenseDoc = req.files?.license?.[0]
      ? `/uploads/${req.files.license[0].filename}`
      : null;

    try {
      const hashed = await bcrypt.hash(password, 10);

      await new Promise((resolve, reject) => {
        db.run("BEGIN TRANSACTION", (err) => {
          if (err) return reject(err);
          resolve();
        });
      });

      const userId = await new Promise((resolve, reject) => {
        db.run(
          "INSERT INTO users (email, password, role) VALUES (?, ?, 'provider')",
          [email, hashed],
          function (err) {
            if (err) return reject(err);
            resolve(this.lastID);
          }
        );
      });

      const providerId = await new Promise((resolve, reject) => {
        db.run(
          `INSERT INTO providers (
            user_id, username, full_name, phone,
            district, region, address, description,
            profile_photo, id_proof, license_doc,
            is_verified, is_active
          ) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)`,
          [
            userId,
            username,
            fullName,
            phone,
            district,
            region,
            address,
            description.trim(),
            profilePhoto,
            idProof,
            licenseDoc,
            0, // pending
            1  // active by default
          ],
          function (err) {
            if (err) return reject(err);
            resolve(this.lastID);
          }
        );
      });

      let professionList = [];
      try {
        professionList = JSON.parse(professions);
      } catch (e) {
        console.warn("[REGISTER] Invalid professions JSON:", e.message);
      }

      if (Array.isArray(professionList) && professionList.length > 0) {
        const stmt = db.prepare(
          "INSERT OR IGNORE INTO provider_professions (provider_id, profession) VALUES (?, ?)"
        );

        professionList.forEach((prof) => {
          if (typeof prof === "string" && prof.trim()) {
            stmt.run(providerId, prof.trim());
          }
        });

        stmt.finalize((err) => {
          if (err) console.error("[REGISTER] Professions error:", err.message);
        });
      }

      await new Promise((resolve, reject) => {
        db.run("COMMIT", (err) => {
          if (err) return reject(err);
          resolve();
        });
      });

      res.status(201).json({
        message: "Provider account created successfully. Awaiting admin approval.",
      });
    } catch (err) {
      await new Promise((resolve) => db.run("ROLLBACK", resolve));

      if (req.files) {
        Object.values(req.files)
          .flat()
          .forEach((file) => require("fs").unlink(file.path, () => {}));
      }

      if (err.code === "SQLITE_CONSTRAINT") {
        return res.status(409).json({ error: "Email or phone already registered" });
      }

      console.error("[REGISTER] Full registration failed:", err.message);
      res.status(500).json({ error: "Server error during registration" });
    }
  }
);

// ────────────────────────────────────────────────
// POST /login → shared for all roles + provider status check
// ────────────────────────────────────────────────
router.post("/login", (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: "Email and password are required" });
  }

  db.get("SELECT * FROM users WHERE email = ?", [email], (err, user) => {
    if (err) {
      console.error("[LOGIN] DB error:", err.message);
      return res.status(500).json({ error: "Database error" });
    }

    if (!user || !bcrypt.compareSync(password, user.password)) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    if (user.role !== "provider") {
      const token = issueToken(user);
      return res.json({ token, role: user.role });
    }

    // Provider → check both verification and active status
    db.get(
      "SELECT is_verified, is_active FROM providers WHERE user_id = ?",
      [user.id],
      (err, prov) => {
        if (err) {
          console.error("[LOGIN] Provider check error:", err.message);
          return res.status(500).json({ error: "Server error" });
        }

        if (!prov) {
          return res.status(403).json({
            error: "Provider profile not found. Contact support."
          });
        }

        // Check active status first
        if (prov.is_active !== 1) {
          return res.status(403).json({
            error: "account_disabled",
            message: "Your provider account has been disabled by admin. You cannot log in at this time. Please contact support."
          });
        }

        // Then check verification
        if (prov.is_verified === 1) {
          // Approved + active → success
          const token = issueToken(user);
          return res.json({ token, role: user.role });
        }

        if (prov.is_verified === -1) {
          // Rejected
          return res.status(403).json({
            error: "account_rejected",
            message: "Your provider application has been rejected by admin. You cannot log in. Please contact support for details."
          });
        }

        // Pending
        return res.status(403).json({
          error: "account_pending",
          message: "Your provider account is pending admin approval. You will be able to log in once verified."
        });
      }
    );
  });
});

module.exports = router;