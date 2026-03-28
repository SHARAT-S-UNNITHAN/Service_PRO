// index.js (main Express server entry point)
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
const { authMiddleware, requireRole, requireVerifiedProvider } = require('./middleware/auth');

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

// ────────────────────────────────────────────────
// Public Provider Detail Route (no auth required)
// ────────────────────────────────────────────────
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
// Detailed search (home page form)
// ────────────────────────────────────────────────
// Detailed Search (home page form) - with Smart ML Scoring
// ────────────────────────────────────────────────
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