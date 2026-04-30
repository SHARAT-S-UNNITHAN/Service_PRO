require('dotenv').config(); // Load environment variables from .env

const express = require('express');
const cors = require('cors');
const path = require('path');
const helmet = require('helmet');

const db = require('./db');
const authRoutes = require('./routes/auth');
const adminRoutes = require('./routes/admin');
const providerRoutes = require('./routes/provider');
const userRoutes = require('./routes/user');
const completionRoutes = require('./routes/completion'); // ← ADDED for OTP verification
const { authMiddleware, requireRole, requireVerifiedProvider } = require('./middleware/auth');
const { sendOtpToCustomer } = require('./services/emailService');

const app = express();
const PORT = process.env.PORT || 4000;

// ────────────────────────────────────────────────
// Middleware
// ────────────────────────────────────────────────
app.use(helmet());               // Security headers (XSS, clickjacking, etc.)
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:5173'], // your frontend ports
  credentials: true
}));
app.use(express.json());

// Serve uploaded files with CORS headers (fixes image loading from frontend)
app.use('/uploads', (req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*"); // dev: allow all
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  res.header("Access-Control-Allow-Methods", "GET, OPTIONS");
  next();
}, express.static(path.join(__dirname, 'uploads')));

// ────────────────────────────────────────────────
// Public routes
// ────────────────────────────────────────────────
app.use('/', authRoutes);

app.get('/providers/:id', (req, res) => {
  const { id } = req.params;

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
    if (err) {
      console.error("[PUBLIC PROVIDER DETAIL] DB error:", err.message);
      return res.status(500).json({ error: "Database error" });
    }

    if (!row) {
      return res.status(404).json({ error: "Provider not found" });
    }

    if (row.is_verified !== 1 || row.is_active !== 1) {
      return res.status(404).json({ error: "Provider profile not available" });
    }

    const publicData = {
      id: row.id,
      full_name: row.full_name || row.username,
      district: row.district,
      region: row.region,
      address: row.address,
      description: row.description,
      profile_photo_url: row.profile_photo ? `http://localhost:${PORT}${row.profile_photo}` : null,
      is_verified: row.is_verified,
      professions: row.professions ? row.professions.split(',').map(p => p.trim()) : [],
    };

    res.json(publicData);
  });
});

// ────────────────────────────────────────────────
// REPLACE the existing app.get("/search/providers", ...) in your index.js
// ────────────────────────────────────────────────

app.get("/search/providers", (req, res) => {
  let { service, location } = req.query;

  service  = service  ? decodeURIComponent(service).trim()  : "";
  location = location ? decodeURIComponent(location).trim() : "";

  let query = `
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

      COALESCE(AVG(r.rating), 0) AS average_rating,
      COUNT(DISTINCT r.id) AS review_count,
      COALESCE(AVG(
        CASE 
          WHEN b.status = 'accepted' 
          THEN (julianday(b.updated_at) - julianday(b.created_at)) * 24 * 60 
          ELSE NULL 
        END
      ), 45) AS avg_response_time,

      GROUP_CONCAT(DISTINCT r.review_text) AS reviews,

      (
        SELECT GROUP_CONCAT(DISTINCT profession)
        FROM provider_professions 
        WHERE provider_id = p.id
      ) AS professions

    FROM providers p
    LEFT JOIN reviews r ON r.provider_id = p.id
    LEFT JOIN bookings b ON b.provider_id = p.id
    WHERE p.is_verified = 1 AND p.is_active = 1
  `;

  const params = [];

  if (service) {
    const fullPhrase = `%${service.toLowerCase()}%`;
    const words = service.toLowerCase().split(/\s+/).filter(Boolean);

    // Strategy:
    // 1. Try EXACT full phrase match first (e.g. "car service" matches "Car Service")
    // 2. If multi-word, require ALL words to appear in the SAME profession row (AND logic)
    //    This prevents "car" matching "Carpenter" when user typed "Car Service"

    if (words.length === 1) {
      // Single word: simple LIKE match on professions
      query += `
        AND EXISTS (
          SELECT 1 FROM provider_professions pp
          WHERE pp.provider_id = p.id
            AND LOWER(pp.profession) LIKE ?
        )
      `;
      params.push(fullPhrase);

    } else {
      // Multi-word (e.g. "Car Service", "AC Repair"):
      // Match providers whose ANY profession contains the FULL phrase
      // OR whose ANY single profession contains ALL individual words
      const allWordsCondition = words
        .map(() => `LOWER(pp.profession) LIKE ?`)
        .join(" AND ");

      query += `
        AND EXISTS (
          SELECT 1 FROM provider_professions pp
          WHERE pp.provider_id = p.id
            AND (
              LOWER(pp.profession) LIKE ?
              OR (${allWordsCondition})
            )
        )
      `;

      // First param = full phrase, then one param per word (all on same row)
      params.push(fullPhrase);
      words.forEach(w => params.push(`%${w}%`));
    }
  }

  if (location) {
    const loc = `%${location.toLowerCase()}%`;
    query += `
      AND (
        LOWER(p.district) LIKE ? OR
        LOWER(p.region)   LIKE ? OR
        LOWER(p.address)  LIKE ?
      )
    `;
    params.push(loc, loc, loc);
  }

  query += `
    GROUP BY p.id
    LIMIT 50
  `;

  db.all(query, params, (err, rows) => {
    if (err) {
      console.error("[DETAILED SEARCH] DB error:", err.message);
      return res.status(500).json({ error: "Search failed" });
    }

    const results = rows.map(row => {
      const rating       = parseFloat(row.average_rating)  || 0;
      const reviewCount  = parseInt(row.review_count)       || 0;
      const responseTime = parseFloat(row.avg_response_time)|| 45;
      const reviews      = row.reviews ? row.reviews.split(",").filter(Boolean) : [];

      // ML-style scoring
      let score = 0;
      score += Math.pow(rating, 1.3) * 0.45;
      score += Math.min(reviewCount * 0.12, 1.8);
      score += Math.max(0, 5 - (responseTime / 15)) * 0.25;
      score += reviews.length > 0 ? 0.8 : 0;

      return {
        ...row,
        profile_photo_url: row.profile_photo
          ? `http://localhost:${PORT}${row.profile_photo}`
          : null,
        professions: row.professions
          ? row.professions.split(",").map(p => p.trim()).filter(Boolean)
          : [],
        reviews,
        average_rating: rating,
        avg_response_time: responseTime,
        ml_score: parseFloat(score.toFixed(2)),
      };
    });

    results.sort((a, b) => b.ml_score - a.ml_score);
    res.json(results);
  });
});

// ────────────────────────────────────────────────
// Admin routes (protected)
// ────────────────────────────────────────────────
app.use('/admin', adminRoutes);

// ────────────────────────────────────────────────
// Provider routes (protected)
// ────────────────────────────────────────────────
app.use('/provider', providerRoutes);

// ────────────────────────────────────────────────
// User routes (protected)
// ────────────────────────────────────────────────
app.use('/user', userRoutes);

// ────────────────────────────────────────────────
// OTP Completion routes (protected) - ADDED for OTP verification
// ────────────────────────────────────────────────
app.use('/api', completionRoutes);

// ────────────────────────────────────────────────
// Public Search Routes
// ────────────────────────────────────────────────

// Universal search (navbar) - single q param
// ────────────────────────────────────────────────
// Universal Search (navbar) - with Smart Scoring
// ────────────────────────────────────────────────
// ────────────────────────────────────────────────
// Universal Search (navbar) - Smart Search + Fixed Professions
// ────────────────────────────────────────────────
// ────────────────────────────────────────────────
// Universal Search with Basic ML-style Scoring
// ────────────────────────────────────────────────
app.get('/api/search', (req, res) => {
  const { q } = req.query;

  if (!q || q.trim().length < 2) {
    return res.status(400).json({ error: "Search query too short" });
  }

  const searchTerm = `%${q.trim().toLowerCase()}%`;

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

      COALESCE(AVG(r.rating), 0) AS average_rating,
      COUNT(DISTINCT r.id) AS review_count,
      COALESCE(AVG(
        CASE 
          WHEN b.status = 'accepted' 
          THEN (julianday(b.updated_at) - julianday(b.created_at)) * 24 * 60 
          ELSE NULL 
        END
      ), 45) AS avg_response_time,

      GROUP_CONCAT(DISTINCT r.review_text) AS reviews,
      (
        SELECT GROUP_CONCAT(DISTINCT profession)
        FROM provider_professions 
        WHERE provider_id = p.id
      ) AS professions

    FROM providers p
    LEFT JOIN reviews r ON r.provider_id = p.id
    LEFT JOIN bookings b ON b.provider_id = p.id
    WHERE p.is_verified = 1 
      AND p.is_active = 1
      AND (
        LOWER(p.full_name) LIKE ? OR 
        LOWER(p.username) LIKE ? OR 
        LOWER(p.description) LIKE ? OR 
        LOWER(p.district) LIKE ? OR 
        LOWER(p.region) LIKE ? OR 
        LOWER(p.address) LIKE ? OR 
        EXISTS (
          SELECT 1 FROM provider_professions pp 
          WHERE pp.provider_id = p.id AND LOWER(pp.profession) LIKE ?
        )
      )
    GROUP BY p.id
    LIMIT 50
  `;

  db.all(
    query,
    [searchTerm, searchTerm, searchTerm, searchTerm, searchTerm, searchTerm, searchTerm],
    (err, rows) => {
      if (err) {
        console.error("[UNIVERSAL SEARCH] DB error:", err.message);
        return res.status(500).json({ error: "Search failed" });
      }

      const results = rows.map(row => {
        const rating = parseFloat(row.average_rating) || 0;
        const reviewCount = parseInt(row.review_count) || 0;
        const responseTime = parseFloat(row.avg_response_time) || 45;
        const reviews = row.reviews ? row.reviews.split(',').filter(Boolean) : [];

        // === Basic ML-style Scoring ===
        let score = 0;

        // 1. Rating with non-linear boost (high ratings get extra points)
        score += Math.pow(rating, 1.3) * 0.45;

        // 2. Review count bonus (more reviews = more trustworthy, like real ML models)
        score += Math.min(reviewCount * 0.12, 1.8);

        // 3. Response time penalty (faster = better)
        const responseScore = Math.max(0, 5 - (responseTime / 15));
        score += responseScore * 0.25;

        // 4. Simple sentiment boost
        let sentiment = 0;
        if (reviews.length > 0) {
          const positive = ["good", "great", "excellent", "fast", "quick", "professional", "helpful", "amazing"];
          reviews.forEach(review => {
            const text = review.toLowerCase();
            positive.forEach(word => {
              if (text.includes(word)) sentiment += 1.2;
            });
          });
          sentiment = Math.min(sentiment / reviews.length, 4);
        }
        score += sentiment * 0.18;

        return {
          ...row,
          profile_photo_url: row.profile_photo ? `http://localhost:${PORT}${row.profile_photo}` : null,
          professions: row.professions 
            ? row.professions.split(',').map(p => p.trim()).filter(Boolean) 
            : [],
          reviews: reviews,
          average_rating: rating,
          avg_response_time: responseTime,
          ml_score: parseFloat(score.toFixed(2))   // ← Final "ML" score
        };
      });

      // Sort by ML score (highest first)
      results.sort((a, b) => b.ml_score - a.ml_score);

      res.json(results);
    }
  );
});

// ────────────────────────────────────────────────
// Detailed Search (home page form) - with Smart ML Scoring + Fixed Join
// ────────────────────────────────────────────────
app.get("/search/providers", (req, res) => {
  let { service, location } = req.query;

  service = service ? decodeURIComponent(service).trim() : "";
  location = location ? decodeURIComponent(location).trim() : "";

  let query = `
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

      COALESCE(AVG(r.rating), 0) AS average_rating,
      COUNT(DISTINCT r.id) AS review_count,
      COALESCE(AVG(
        CASE 
          WHEN b.status = 'accepted' 
          THEN (julianday(b.updated_at) - julianday(b.created_at)) * 24 * 60 
          ELSE NULL 
        END
      ), 45) AS avg_response_time,

      GROUP_CONCAT(DISTINCT r.review_text) AS reviews,

      -- Fixed professions using subquery (safest way)
      (
        SELECT GROUP_CONCAT(DISTINCT profession)
        FROM provider_professions 
        WHERE provider_id = p.id
      ) AS professions

    FROM providers p
    LEFT JOIN reviews r ON r.provider_id = p.id
    LEFT JOIN bookings b ON b.provider_id = p.id
    WHERE p.is_verified = 1 AND p.is_active = 1
  `;

  const params = [];

  if (service) {
    const words = service.toLowerCase().split(/\s+/).filter(Boolean);

    if (words.length > 0) {
      const conditions = words.map(() => `
        EXISTS (
          SELECT 1 FROM provider_professions pp 
          WHERE pp.provider_id = p.id AND LOWER(pp.profession) LIKE ?
        )
      `).join(" OR ");

      query += ` AND (${conditions}) `;

      words.forEach(word => params.push(`%${word}%`));
    }
  }

  if (location) {
    const loc = `%${location.toLowerCase()}%`;
    query += `
      AND (
        LOWER(p.district) LIKE ? OR
        LOWER(p.region) LIKE ? OR
        LOWER(p.address) LIKE ?
      )
    `;
    params.push(loc, loc, loc);
  }

  query += `
    GROUP BY p.id
    ORDER BY average_rating DESC, avg_response_time ASC
    LIMIT 50
  `;

  db.all(query, params, (err, rows) => {
    if (err) {
      console.error("[DETAILED SEARCH] DB error:", err.message);
      return res.status(500).json({ error: "Search failed" });
    }

    const results = rows.map(row => {
      const rating = parseFloat(row.average_rating) || 0;
      const reviewCount = parseInt(row.review_count) || 0;
      const responseTime = parseFloat(row.avg_response_time) || 45;
      const reviews = row.reviews ? row.reviews.split(',').filter(Boolean) : [];

      // Basic ML-style Scoring
      let score = 0;
      score += Math.pow(rating, 1.3) * 0.45;                    // Rating boost
      score += Math.min(reviewCount * 0.12, 1.8);               // More reviews = better
      score += Math.max(0, 5 - (responseTime / 15)) * 0.25;     // Faster response = better
      score += (reviews.length > 0 ? 0.8 : 0);                  // Has reviews bonus

      return {
        ...row,
        profile_photo_url: row.profile_photo ? `http://localhost:${PORT}${row.profile_photo}` : null,
        professions: row.professions 
          ? row.professions.split(',').map(p => p.trim()).filter(Boolean) 
          : [],
        reviews: reviews,
        average_rating: rating,
        avg_response_time: responseTime,
        ml_score: parseFloat(score.toFixed(2))
      };
    });

    // Sort by ml_score
    results.sort((a, b) => b.ml_score - a.ml_score);
    res.json(results);
  });
});

// ────────────────────────────────────────────────
// Analytics & Completion Flow Routes (NEW)
// ────────────────────────────────────────────────

// CUSTOMER: Confirm work done + enter cash amount
// POST /api/bookings/:id/confirm-work
app.post('/api/bookings/:id/confirm-work', authMiddleware, requireRole(['user']), (req, res) => {
  const bookingId = parseInt(req.params.id);
  const { cash_amount_paid } = req.body;

  if (isNaN(bookingId)) return res.status(400).json({ error: 'Invalid booking ID' });
  if (!cash_amount_paid || isNaN(cash_amount_paid) || Number(cash_amount_paid) < 0) {
    return res.status(400).json({ error: 'Please enter a valid amount paid' });
  }

  // Verify booking belongs to this user and is accepted
  db.get(
    `SELECT b.id, b.status, b.customer_confirmed, b.user_id
     FROM bookings b WHERE b.id = ? AND b.user_id = ?`,
    [bookingId, req.user.id],
    (err, booking) => {
      if (err)      return res.status(500).json({ error: 'Database error' });
      if (!booking) return res.status(404).json({ error: 'Booking not found' });
      if (booking.status !== 'accepted') {
        return res.status(400).json({ error: 'Booking must be accepted before confirming completion' });
      }
      if (booking.customer_confirmed === 1) {
        return res.status(400).json({ error: 'You have already confirmed this booking' });
      }

      db.run(
        `UPDATE bookings
         SET cash_amount_paid = ?, customer_confirmed = 1, customer_confirmed_at = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP
         WHERE id = ?`,
        [Number(cash_amount_paid), bookingId],
        function (updateErr) {
          if (updateErr) return res.status(500).json({ error: 'Failed to confirm booking' });
          console.log(`[CONFIRM WORK] Booking #${bookingId} confirmed by customer. Amount: ₹${cash_amount_paid}`);
          res.json({ message: 'Work confirmed successfully. The provider can now complete the booking.' });
        }
      );
    }
  );
});

// ANALYTICS: Provider earnings trend (last 30 days) - FIXED VERSION
// GET /api/provider/earnings/trend
app.get('/api/provider/earnings/trend', authMiddleware, requireRole(['provider']), (req, res) => {
  db.get('SELECT id FROM providers WHERE user_id = ?', [req.user.id], (err, provider) => {
    if (err || !provider) return res.status(404).json({ error: 'Provider not found' });

    db.all(`
      SELECT
        DATE(completed_at) as date,
        SUM(COALESCE(cash_amount_paid, 0)) as earnings,
        COUNT(*) as bookings,
        GROUP_CONCAT(COALESCE(profession, 'Other')) as professions_breakdown
      FROM bookings
      WHERE provider_id = ?
        AND status = 'completed'
        AND completed_at >= DATE('now', '-30 days')
      GROUP BY DATE(completed_at)
      ORDER BY date ASC
    `, [provider.id], (err2, rows) => {
      if (err2) return res.status(500).json({ error: 'Database error' });
      res.json(rows || []);
    });
  });
});

// ANALYTICS: Provider weekly performance summary - FIXED VERSION
// GET /api/provider/performance/weekly
app.get('/api/provider/performance/weekly', authMiddleware, requireRole(['provider']), (req, res) => {
  db.get('SELECT id FROM providers WHERE user_id = ?', [req.user.id], (err, provider) => {
    if (err || !provider) return res.status(404).json({ error: 'Provider not found' });

    Promise.all([
      // This week
      new Promise((rs, rj) => db.get(`
        SELECT COUNT(*) as bookings, SUM(COALESCE(cash_amount_paid, 0)) as earnings
        FROM bookings
        WHERE provider_id = ? AND status = 'completed'
          AND completed_at >= DATE('now', 'weekday 0', '-7 days')
      `, [provider.id], (e, r) => e ? rj(e) : rs(r))),
      // Last week
      new Promise((rs, rj) => db.get(`
        SELECT COUNT(*) as bookings, SUM(COALESCE(cash_amount_paid, 0)) as earnings
        FROM bookings
        WHERE provider_id = ? AND status = 'completed'
          AND completed_at >= DATE('now', 'weekday 0', '-14 days')
          AND completed_at < DATE('now', 'weekday 0', '-7 days')
      `, [provider.id], (e, r) => e ? rj(e) : rs(r))),
      // All time
      new Promise((rs, rj) => db.get(`
        SELECT COUNT(*) as total_completed,
               SUM(COALESCE(cash_amount_paid, 0)) as total_earnings,
               AVG(COALESCE(cash_amount_paid, 0)) as avg_per_job
        FROM bookings
        WHERE provider_id = ? AND status = 'completed'
      `, [provider.id], (e, r) => e ? rj(e) : rs(r))),
      // Earnings by profession (from booking.profession column - correct!)
      new Promise((rs, rj) => db.all(`
        SELECT
          COALESCE(profession, 'Other') as profession,
          COUNT(*) as jobs,
          SUM(COALESCE(cash_amount_paid, 0)) as earnings
        FROM bookings
        WHERE provider_id = ? AND status = 'completed'
          AND cash_amount_paid IS NOT NULL
        GROUP BY COALESCE(profession, 'Other')
        ORDER BY earnings DESC
      `, [provider.id], (e, r) => e ? rj(e) : rs(r))),
    ])
    .then(([thisWeek, lastWeek, allTime, byProfession]) => {
      res.json({ thisWeek, lastWeek, allTime, byProfession });
    })
    .catch(() => res.status(500).json({ error: 'Database error' }));
  });
});

// ANALYTICS: Customer spending trend (last 6 months)
// GET /api/customer/spending/trend
app.get('/api/customer/spending/trend', authMiddleware, requireRole(['user']), (req, res) => {
  db.all(
    `SELECT
       STRFTIME('%Y-%m', completed_at) as month,
       SUM(COALESCE(cash_amount_paid, 0)) as spent,
       COUNT(*) as bookings
     FROM bookings
     WHERE user_id = ?
       AND status = 'completed'
       AND completed_at >= DATE('now', '-6 months')
     GROUP BY STRFTIME('%Y-%m', completed_at)
     ORDER BY month ASC`,
    [req.user.id],
    (err, rows) => {
      if (err) return res.status(500).json({ error: 'Database error' });
      res.json(rows || []);
    }
  );
});

// ANALYTICS: Customer favorite providers
// GET /api/customer/favorite-providers
app.get('/api/customer/favorite-providers', authMiddleware, requireRole(['user']), (req, res) => {
  db.all(
    `SELECT
       p.full_name AS provider_name,
       COUNT(b.id) AS bookings,
       SUM(COALESCE(b.cash_amount_paid, 0)) AS total_spent
     FROM bookings b
     JOIN providers p ON b.provider_id = p.id
     WHERE b.user_id = ? AND b.status = 'completed'
     GROUP BY b.provider_id
     ORDER BY bookings DESC
     LIMIT 3`,
    [req.user.id],
    (err, rows) => {
      if (err) return res.status(500).json({ error: 'Database error' });
      res.json(rows || []);
    }
  );
});

// ANALYTICS: Admin platform overview
// GET /api/admin/revenue/overview
app.get('/api/admin/revenue/overview', authMiddleware, requireRole(['admin']), (req, res) => {
  const queries = {
    daily: `SELECT DATE(completed_at) as period, SUM(COALESCE(cash_amount_paid,0)) as revenue, COUNT(*) as bookings
            FROM bookings WHERE status='completed' AND completed_at >= DATE('now','-30 days')
            GROUP BY DATE(completed_at) ORDER BY period`,
    totals: `SELECT
               COUNT(*) as total_bookings,
               SUM(CASE WHEN status='completed' THEN 1 ELSE 0 END) as completed,
               SUM(CASE WHEN status='pending' THEN 1 ELSE 0 END) as pending,
               SUM(COALESCE(cash_amount_paid,0)) as total_revenue,
               COUNT(DISTINCT user_id) as unique_customers,
               COUNT(DISTINCT provider_id) as active_providers
             FROM bookings`,
  };

  Promise.all([
    new Promise((res, rej) => db.all(queries.daily, [], (e, r) => e ? rej(e) : res(r))),
    new Promise((res, rej) => db.get(queries.totals, [], (e, r) => e ? rej(e) : res(r))),
  ]).then(([daily, totals]) => {
    res.json({ daily, totals });
  }).catch(() => res.status(500).json({ error: 'Database error' }));
});

// ═══════════════════════════════════════════════════════════════
// ADD ALL THESE to server/index.js  (after existing routes)
// These power the new Admin Analytics Panel
// ═══════════════════════════════════════════════════════════════

// ── Platform Overview ──────────────────────────────────────────
app.get('/api/admin/overview', authMiddleware, requireRole(['admin']), (req, res) => {
  const queries = {
    totals: `
      SELECT
        (SELECT COUNT(*) FROM users WHERE role='user') as total_users,
        (SELECT COUNT(*) FROM users WHERE role='provider') as total_providers,
        (SELECT COUNT(*) FROM providers WHERE is_verified=1) as verified_providers,
        (SELECT COUNT(*) FROM providers WHERE is_verified=0) as pending_providers,
        (SELECT COUNT(*) FROM bookings) as total_bookings,
        (SELECT COUNT(*) FROM bookings WHERE status='completed') as completed_bookings,
        (SELECT COUNT(*) FROM bookings WHERE status='pending') as pending_bookings,
        (SELECT COALESCE(SUM(cash_amount_paid),0) FROM bookings WHERE status='completed') as total_revenue,
        (SELECT COUNT(*) FROM provider_complaints WHERE status='pending') as open_complaints,
        (SELECT COUNT(*) FROM bookings WHERE DATE(created_at)=DATE('now')) as bookings_today
    `,
    daily: `
      SELECT DATE(created_at) as date,
             COUNT(*) as bookings,
             SUM(CASE WHEN status='completed' THEN COALESCE(cash_amount_paid,0) ELSE 0 END) as revenue
      FROM bookings
      WHERE created_at >= DATE('now','-30 days')
      GROUP BY DATE(created_at) ORDER BY date ASC
    `,
    monthly: `
      SELECT STRFTIME('%Y-%m', created_at) as month,
             COUNT(*) as bookings,
             SUM(CASE WHEN status='completed' THEN COALESCE(cash_amount_paid,0) ELSE 0 END) as revenue
      FROM bookings
      WHERE created_at >= DATE('now','-6 months')
      GROUP BY STRFTIME('%Y-%m', created_at) ORDER BY month ASC
    `,
  };
  Promise.all([
    new Promise((rs,rj)=>db.get(queries.totals,[],(e,r)=>e?rj(e):rs(r))),
    new Promise((rs,rj)=>db.all(queries.daily,[],(e,r)=>e?rj(e):rs(r))),
    new Promise((rs,rj)=>db.all(queries.monthly,[],(e,r)=>e?rj(e):rs(r))),
  ]).then(([totals,daily,monthly])=>res.json({totals,daily,monthly}))
    .catch(()=>res.status(500).json({error:'Database error'}));
});

// ── Provider Leaderboard - FIXED VERSION ───────────────────────────────────────
app.get('/api/admin/leaderboard', authMiddleware, requireRole(['admin']), (req, res) => {
  db.all(`
    SELECT
      p.id,
      p.full_name,
      p.district,
      COALESCE(p.trust_score, 100) as trust_score,
      COALESCE(p.total_earnings, 0) as total_earnings,
      COUNT(DISTINCT b.id) as completed_jobs,
      COALESCE(AVG(r.rating), 0) as avg_rating,
      COALESCE(AVG(r.response_time_minutes), 0) as avg_response_time,
      (
        SELECT GROUP_CONCAT(DISTINCT profession)
        FROM provider_professions
        WHERE provider_id = p.id
      ) as professions
    FROM providers p
    LEFT JOIN bookings b ON b.provider_id = p.id AND b.status = 'completed'
    LEFT JOIN reviews r  ON r.provider_id = p.id
    WHERE p.is_verified = 1
    GROUP BY p.id
    ORDER BY total_earnings DESC
    LIMIT 50
  `, [], (err, rows) => {
    if (err) return res.status(500).json({ error: 'Database error' });
    res.json(rows || []);
  });
});

// ── Activity Feed ──────────────────────────────────────────────
app.get('/api/admin/activity', authMiddleware, requireRole(['admin']), (req, res) => {
  const { type = 'all', limit = 30 } = req.query;
  const events = [];
  const queries = [];

  if (type === 'all' || type === 'booking') {
    queries.push(new Promise((rs,rj) => db.all(`
      SELECT 'booking' as type, b.id, b.status,
             b.service_description as detail,
             c.full_name as user_name,
             p.full_name as provider_name,
             b.created_at as time
      FROM bookings b
      JOIN customers c ON b.user_id=c.user_id
      JOIN providers p ON b.provider_id=p.id
      ORDER BY b.created_at DESC LIMIT 20
    `, [], (e,r)=>e?rj(e):rs(r))));
  }
  if (type === 'all' || type === 'signup') {
    queries.push(new Promise((rs,rj) => db.all(`
      SELECT 'signup' as type, u.id,
             CASE WHEN u.role='provider' THEN prov.full_name ELSE cust.full_name END as user_name,
             u.role as detail, NULL as provider_name,
             u.rowid as rowid_sort,
             datetime(u.rowid/1000,'unixepoch') as time
      FROM users u
      LEFT JOIN providers prov ON prov.user_id=u.id
      LEFT JOIN customers cust ON cust.user_id=u.id
      WHERE u.role IN ('user','provider')
      ORDER BY u.id DESC LIMIT 20
    `, [], (e,r)=>e?rj(e):rs(r))));
  }
  if (type === 'all' || type === 'complaint') {
    queries.push(new Promise((rs,rj) => db.all(`
      SELECT 'complaint' as type, pc.id,
             pc.severity as detail,
             c.full_name as user_name,
             p.full_name as provider_name,
             pc.created_at as time
      FROM provider_complaints pc
      JOIN customers c ON pc.customer_id=c.id
      JOIN providers p ON pc.provider_id=p.id
      ORDER BY pc.created_at DESC LIMIT 20
    `, [], (e,r)=>e?rj(e):rs(r))));
  }

  Promise.all(queries.length ? queries : [Promise.resolve([])])
    .then(results => {
      const all = results.flat()
        .sort((a,b) => new Date(b.time||0) - new Date(a.time||0))
        .slice(0, parseInt(limit));
      res.json(all);
    })
    .catch(() => res.status(500).json({ error: 'Database error' }));
});

// ── Inactive Providers ─────────────────────────────────────────
app.get('/api/admin/inactive-providers', authMiddleware, requireRole(['admin']), (req, res) => {
  db.all(`
    SELECT
      p.id, p.full_name, p.district, p.created_at,
      COALESCE(p.trust_score, 100) as trust_score,
      COALESCE(AVG(r.rating), 0) as avg_rating,
      COUNT(DISTINCT b.id) as total_bookings,
      MAX(b.created_at) as last_booking_date,
      (SELECT GROUP_CONCAT(DISTINCT profession) FROM provider_professions WHERE provider_id=p.id) as professions
    FROM providers p
    LEFT JOIN bookings b ON b.provider_id=p.id
    LEFT JOIN reviews r  ON r.provider_id=p.id
    WHERE p.is_verified=1 AND p.is_active=1
    GROUP BY p.id
    HAVING last_booking_date IS NULL
       OR last_booking_date < DATE('now','-30 days')
    ORDER BY last_booking_date ASC NULLS FIRST
    LIMIT 50
  `, [], (err, rows) => {
    if (err) return res.status(500).json({ error: 'Database error' });
    // Add reason label
    const result = (rows||[]).map(p => ({
      ...p,
      reason: !p.last_booking_date ? 'Just joined / No bookings'
             : p.avg_rating > 0 && p.avg_rating < 3 ? 'Low ratings'
             : p.total_bookings === 0 ? 'No bookings yet'
             : 'Inactive 30+ days',
    }));
    res.json(result);
  });
});

// ── Duplicate Booking Detector ─────────────────────────────────
app.get('/api/admin/duplicate-bookings', authMiddleware, requireRole(['admin']), (req, res) => {
  db.all(`
    SELECT
      b1.id as booking1_id, b2.id as booking2_id,
      b1.service_description,
      b1.status as status1, b2.status as status2,
      c.full_name as customer_name,
      p.full_name as provider_name,
      b1.created_at as time1, b2.created_at as time2,
      ROUND((JULIANDAY(b2.created_at) - JULIANDAY(b1.created_at)) * 24, 2) as hours_apart
    FROM bookings b1
    JOIN bookings b2 ON b1.user_id=b2.user_id
                    AND b1.provider_id=b2.provider_id
                    AND b1.id < b2.id
                    AND ABS(JULIANDAY(b2.created_at) - JULIANDAY(b1.created_at)) < 1
    JOIN customers c ON b1.user_id=c.user_id
    JOIN providers p ON b1.provider_id=p.id
    ORDER BY b1.created_at DESC
  `, [], (err, rows) => {
    if (err) return res.status(500).json({ error: 'Database error' });
    res.json(rows || []);
  });
});

// ── Provider of the Week ───────────────────────────────────────
app.get('/api/admin/provider-of-week', authMiddleware, requireRole(['admin']), (req, res) => {
  db.all(`
    SELECT
      p.id, p.full_name, p.district,
      COALESCE(p.trust_score,100) as trust_score,
      COUNT(DISTINCT b.id) as jobs_this_week,
      COALESCE(SUM(b.cash_amount_paid),0) as earnings_this_week,
      COALESCE(AVG(r.rating),0) as avg_rating,
      (SELECT GROUP_CONCAT(DISTINCT profession) FROM provider_professions WHERE provider_id=p.id) as professions
    FROM providers p
    JOIN bookings b ON b.provider_id=p.id
    LEFT JOIN reviews r ON r.provider_id=p.id
    WHERE p.is_verified=1
      AND b.status='completed'
      AND b.completed_at >= DATE('now','weekday 0','-7 days')
    GROUP BY p.id
    ORDER BY jobs_this_week DESC, earnings_this_week DESC
    LIMIT 3
  `, [], (err, rows) => {
    if (err) return res.status(500).json({ error: 'Database error' });
    res.json(rows || []);
  });
});

// ── User Spending Analytics - FIXED VERSION ────────────────────────────────────
app.get('/api/admin/user-spending', authMiddleware, requireRole(['admin']), (req, res) => {
  Promise.all([
    // Top spenders
    new Promise((rs, rj) => db.all(`
      SELECT c.full_name, c.id,
             COUNT(b.id) as bookings,
             COALESCE(SUM(b.cash_amount_paid), 0) as total_spent,
             COALESCE(AVG(b.cash_amount_paid), 0) as avg_per_booking
      FROM customers c
      JOIN bookings b ON b.user_id = c.user_id AND b.status = 'completed'
      GROUP BY c.id
      ORDER BY total_spent DESC
      LIMIT 10
    `, [], (e, r) => e ? rj(e) : rs(r))),

    // FIXED: use b.profession (stored on booking) instead of
    // joining provider_professions which multiplied amounts
    new Promise((rs, rj) => db.all(`
      SELECT
        COALESCE(b.profession, 'Other') as profession,
        COUNT(b.id) as bookings,
        COALESCE(SUM(b.cash_amount_paid), 0) as total_revenue
      FROM bookings b
      WHERE b.status = 'completed'
        AND b.cash_amount_paid IS NOT NULL
      GROUP BY COALESCE(b.profession, 'Other')
      ORDER BY total_revenue DESC
      LIMIT 10
    `, [], (e, r) => e ? rj(e) : rs(r))),
  ])
  .then(([topSpenders, byCategory]) => res.json({ topSpenders, byCategory }))
  .catch(() => res.status(500).json({ error: 'Database error' }));
});

// ANALYTICS: Admin top earning providers
// GET /api/admin/providers/top-earners
app.get('/api/admin/providers/top-earners', authMiddleware, requireRole(['admin']), (req, res) => {
  db.all(
    `SELECT
       p.full_name, p.district,
       COUNT(b.id) as completed_jobs,
       SUM(COALESCE(b.cash_amount_paid, 0)) as total_earnings,
       AVG(COALESCE(b.cash_amount_paid, 0)) as avg_per_job
     FROM providers p
     JOIN bookings b ON b.provider_id = p.id
     WHERE b.status = 'completed'
     GROUP BY p.id
     ORDER BY total_earnings DESC
     LIMIT 10`,
    [],
    (err, rows) => {
      if (err) return res.status(500).json({ error: 'Database error' });
      res.json(rows || []);
    }
  );
});

// ────────────────────────────────────────────────
// Protected general routes
// ────────────────────────────────────────────────
app.get('/me', authMiddleware, (req, res) => {
  res.json({
    id: req.user.id,
    email: req.user.email,
    role: req.user.role,
  });
});

// ────────────────────────────────────────────────
// 404 handler
// ────────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('[SERVER ERROR]', err.stack);
  res.status(500).json({ error: 'Internal server error' });
});

// ────────────────────────────────────────────────
// Start server
// ────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
  console.log(`Static files served at: http://localhost:${PORT}/uploads`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`JWT Secret loaded: ${process.env.JWT_SECRET ? 'Yes' : 'No (using fallback)'}`);
});