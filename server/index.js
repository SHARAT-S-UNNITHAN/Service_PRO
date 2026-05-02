require('dotenv').config(); // Load environment variables from .env

const express = require('express');
const cors = require('cors');
const path = require('path');
const helmet = require('helmet');

const db = require('./db');
const authRoutes = require('./routes/auth');
const adminRoutes = require('./routes/admin');
const mlService = require('./ml/simple-ml');
const fs = require('fs');
const multer = require('multer');
const CSVTraining = require('./ml/csv-training');
const DirectCSVTraining = require('./ml/direct-csv-training');
const directCsvTrainer = new DirectCSVTraining(mlService);
const providerRoutes = require('./routes/provider');
const userRoutes = require('./routes/user');
const completionRoutes = require('./routes/completion');
const { authMiddleware, requireRole, requireVerifiedProvider } = require('./middleware/auth');
const { sendOtpToCustomer } = require('./services/emailService');

const app = express();
const PORT = process.env.PORT || 4000;

// ────────────────────────────────────────────────
// Middleware
// ────────────────────────────────────────────────
app.use(helmet());
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:5173'],
  credentials: true
}));
app.use(express.json());

app.use('/uploads', (req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  res.header("Access-Control-Allow-Methods", "GET, OPTIONS");
  next();
}, express.static(path.join(__dirname, 'uploads')));
// ────────────────────────────────────────────────
// CSV Training Setup for ML
// ────────────────────────────────────────────────

// Initialize CSV Trainer
const csvTrainer = new CSVTraining(mlService);

// Configure multer for CSV file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, 'ml/uploads');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    cb(null, `training_${Date.now()}_${file.originalname}`);
  }
});

const upload = multer({ 
  storage: storage, 
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'text/csv' || file.originalname.endsWith('.csv')) {
      cb(null, true);
    } else {
      cb(new Error('Only CSV files are allowed'));
    }
  }
});

// ────────────────────────────────────────────────
// ML CSV Training Routes (Admin only)
// ────────────────────────────────────────────────

// Upload CSV file for training
app.post('/api/ml/upload-csv', authMiddleware, requireRole(['admin']), upload.single('csvfile'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No CSV file uploaded' });
    }
    
    console.log(`[CSV Upload] Processing: ${req.file.filename}`);
    const result = await csvTrainer.importFromCSV(req.file.path);
    
    res.json({
      success: true,
      message: `Successfully imported ${result.imported} training records`,
      file: req.file.filename,
      records_imported: result.imported
    });
  } catch (error) {
    console.error('[CSV Upload] Error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Bulk import from folder
app.post('/api/ml/bulk-import', authMiddleware, requireRole(['admin']), async (req, res) => {
  try {
    const csvFolder = path.join(__dirname, 'ml/csv_data');
    if (!fs.existsSync(csvFolder)) {
      return res.status(400).json({ error: 'CSV folder not found. Create: server/ml/csv_data/' });
    }
    
    const results = await csvTrainer.importFromFolder(csvFolder);
    res.json({
      success: true,
      files_processed: results.length,
      total_records: results.reduce((sum, r) => sum + r.imported, 0),
      details: results
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get training statistics
app.get('/api/ml/training-stats', authMiddleware, requireRole(['admin']), async (req, res) => {
  db.get(`
    SELECT 
      COUNT(DISTINCT b.id) as total_bookings,
      COUNT(DISTINCT r.id) as total_reviews,
      COUNT(DISTINCT b.provider_id) as unique_providers,
      MIN(b.created_at) as oldest_data,
      MAX(b.created_at) as newest_data,
      printf('%.2f', AVG(r.rating)) as avg_rating
    FROM bookings b
    LEFT JOIN reviews r ON r.booking_id = b.id
  `, [], (err, stats) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json({
      training_data: stats,
      ml_status: {
        is_trained: mlService.isTrained || false,
        weights: mlService.weights || null,
        training_samples: mlService.trainingData?.length || 0
      }
    });
  });
});

// Download sample CSV template
app.get('/api/ml/sample-csv', authMiddleware, requireRole(['admin']), (req, res) => {
  const sampleCSV = `provider_name,rating,response_time,review_count,amount,success_score,location,profession
"Sample Provider 1",4.8,12,156,5000,1.0,Alappuzha,Plumber
"Sample Provider 2",4.5,25,89,3500,0.9,Kayamkulam,Electrician
"Sample Provider 3",3.8,120,23,2000,0.7,Alappuzha,AC Repair
"Sample Provider 4",4.2,45,67,8000,0.85,Chengannur,Painter
"Sample Provider 5",2.5,480,5,1000,0.3,Haripad,General`;
  
  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', 'attachment; filename=sample_training.csv');
  res.send(sampleCSV);
});


// Public ML status endpoint (no auth required for demo)
app.get('/api/ml/status', (req, res) => {
  res.json({
    ml_enabled: true,
    ml_version: 'simple-ml',
    is_trained: mlService.isTrained || false,
    weights: mlService.weights || null,
    training_samples: mlService.trainingData?.length || 0
  });
});

// Direct CSV Training - NO database insertion!
app.post('/api/ml/direct-train', authMiddleware, requireRole(['admin']), upload.single('csvfile'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No CSV file uploaded' });
    }
    
    console.log(`[Direct Train] Processing: ${req.file.filename}`);
    const result = await directCsvTrainer.trainFromCSV(req.file.path);
    
    res.json({
      success: true,
      message: `ML trained directly from CSV with ${result.records} records`,
      records_used: result.records,
      no_database_changes: true
    });
  } catch (error) {
    console.error('[Direct Train] Error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get current ML weights with debug info
app.get('/api/ml/weights', (req, res) => {
  res.json({
    weights: mlService.weights,
    is_trained: mlService.isTrained,
    source: mlService.trainingSource || (mlService.csvTrainingData ? 'csv_trained' : 'real_data'),
    csv_records: mlService.csvTrainingData?.length || 0,
    csv_active: mlService.trainingSource === 'csv',
    // Debug info
    debug: {
      hasCsvData: !!mlService.csvTrainingData,
      trainingSource: mlService.trainingSource,
      weightsValue: mlService.weights
    }
  });
});

// Reset ML to use only real data
app.post('/api/ml/reset', authMiddleware, requireRole(['admin']), async (req, res) => {
  // Clear CSV-trained weights
  mlService.csvTrainingData = null;
  await mlService.train(); // Retrain with real data only
  res.json({ success: true, message: 'ML reset to use only real database data' });
});

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

// ============================================
// ROUTE 1: Detailed Search (Homepage form) with ML Scoring
// ============================================
app.get("/search/providers", async (req, res) => {
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
      COALESCE(p.total_earnings, 0) AS total_earnings,

      COALESCE(AVG(r.rating), 0) AS average_rating,
      COUNT(DISTINCT r.id) AS review_count,
      
      COALESCE(AVG(
        CASE 
          WHEN b.responded_at IS NOT NULL
          THEN (julianday(b.responded_at) - julianday(b.created_at)) * 24 * 60
          ELSE NULL 
        END
      ), 60) AS avg_response_time,

      (
        SELECT GROUP_CONCAT(profession, ',')
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
    if (words.length === 1) {
      query += ` AND EXISTS (SELECT 1 FROM provider_professions pp WHERE pp.provider_id = p.id AND LOWER(pp.profession) LIKE ?)`;
      params.push(`%${words[0]}%`);
    } else {
      const conditions = words.map(() => `LOWER(pp.profession) LIKE ?`).join(" AND ");
      query += ` AND EXISTS (SELECT 1 FROM provider_professions pp WHERE pp.provider_id = p.id AND (${conditions}))`;
      words.forEach(word => params.push(`%${word}%`));
    }
  }

  if (location) {
    const loc = `%${location.toLowerCase()}%`;
    query += ` AND (LOWER(p.district) LIKE ? OR LOWER(p.region) LIKE ? OR LOWER(p.address) LIKE ?)`;
    params.push(loc, loc, loc);
  }

  query += ` GROUP BY p.id LIMIT 50`;

  db.all(query, params, async (err, rows) => {
    if (err) {
      console.error("[SEARCH] DB error:", err.message);
      return res.status(500).json({ error: "Search failed" });
    }

    const providers = rows.map(row => ({
      id: row.id,
      full_name: row.full_name || row.username,
      average_rating: parseFloat(row.average_rating) || 0,
      review_count: parseInt(row.review_count) || 0,
      avg_response_time: parseFloat(row.avg_response_time) || 60,
      total_earnings: parseFloat(row.total_earnings) || 0,
      district: row.district,
      region: row.region,
      description: row.description,
      profile_photo_url: row.profile_photo ? `http://localhost:${PORT}${row.profile_photo}` : null,
      professions: row.professions ? row.professions.split(',').map(p => p.trim()) : []
    }));

    const scoredProviders = await mlService.batchPredict(providers);

    // Add star display for frontend
    scoredProviders.forEach(provider => {
      const rating = provider.average_rating || 0;
      const fullStars = Math.floor(rating);
      const hasHalfStar = rating % 1 >= 0.5;
      const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);
      
      provider.star_display = {
        rating: rating.toFixed(1),
        full_stars: fullStars,
        half_star: hasHalfStar,
        empty_stars: emptyStars,
        as_emoji: '⭐'.repeat(fullStars) + (hasHalfStar ? '⭐' : '') + '☆'.repeat(emptyStars)
      };
      
      // IMPORTANT: Add 'rating' field for frontend compatibility
      provider.rating = rating;
      provider.stars = rating;
    });

    scoredProviders.sort((a, b) => b.ml_score - a.ml_score);
    res.json(scoredProviders);
  });
});

// ============================================
// ROUTE 2: Universal Search (Navbar) with ML Scoring
// ============================================
app.get('/api/search', async (req, res) => {
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
      COALESCE(p.total_earnings, 0) AS total_earnings,

      COALESCE(AVG(r.rating), 0) AS average_rating,
      COUNT(DISTINCT r.id) AS review_count,
      
      COALESCE(AVG(
        CASE 
          WHEN b.responded_at IS NOT NULL
          THEN (julianday(b.responded_at) - julianday(b.created_at)) * 24 * 60
          ELSE NULL 
        END
      ), 60) AS avg_response_time,

      (
        SELECT GROUP_CONCAT(profession, ',')
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

  db.all(query, [searchTerm, searchTerm, searchTerm, searchTerm, searchTerm, searchTerm, searchTerm], async (err, rows) => {
    if (err) {
      console.error("[UNIVERSAL SEARCH] DB error:", err.message);
      return res.status(500).json({ error: "Search failed" });
    }

    const providers = rows.map(row => ({
      id: row.id,
      full_name: row.full_name || row.username,
      average_rating: parseFloat(row.average_rating) || 0,
      review_count: parseInt(row.review_count) || 0,
      avg_response_time: parseFloat(row.avg_response_time) || 60,
      total_earnings: parseFloat(row.total_earnings) || 0,
      district: row.district,
      region: row.region,
      description: row.description,
      profile_photo_url: row.profile_photo ? `http://localhost:${PORT}${row.profile_photo}` : null,
      professions: row.professions ? row.professions.split(',').map(p => p.trim()) : []
    }));

    const scoredProviders = await mlService.batchPredict(providers);

    // Add star display for frontend
    scoredProviders.forEach(provider => {
      const rating = provider.average_rating || 0;
      const fullStars = Math.floor(rating);
      const hasHalfStar = rating % 1 >= 0.5;
      const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);
      
      provider.star_display = {
        rating: rating.toFixed(1),
        full_stars: fullStars,
        half_star: hasHalfStar,
        empty_stars: emptyStars,
        as_emoji: '⭐'.repeat(fullStars) + (hasHalfStar ? '⭐' : '') + '☆'.repeat(emptyStars)
      };
      
      // IMPORTANT: Add 'rating' field for frontend compatibility
      provider.rating = rating;
      provider.stars = rating;
    });

    scoredProviders.sort((a, b) => b.ml_score - a.ml_score);
    res.json(scoredProviders);
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
// OTP Completion routes (protected)
// ────────────────────────────────────────────────
app.use('/api', completionRoutes);

// ────────────────────────────────────────────────
// Analytics Routes
// ────────────────────────────────────────────────

app.post('/api/bookings/:id/confirm-work', authMiddleware, requireRole(['user']), (req, res) => {
  const bookingId = parseInt(req.params.id);
  const { cash_amount_paid } = req.body;

  if (isNaN(bookingId)) return res.status(400).json({ error: 'Invalid booking ID' });
  if (!cash_amount_paid || isNaN(cash_amount_paid) || Number(cash_amount_paid) < 0) {
    return res.status(400).json({ error: 'Please enter a valid amount paid' });
  }

  db.get(
    `SELECT b.id, b.status, b.customer_confirmed, b.user_id
     FROM bookings b WHERE b.id = ? AND b.user_id = ?`,
    [bookingId, req.user.id],
    (err, booking) => {
      if (err) return res.status(500).json({ error: 'Database error' });
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

app.get('/api/provider/performance/weekly', authMiddleware, requireRole(['provider']), (req, res) => {
  db.get('SELECT id FROM providers WHERE user_id = ?', [req.user.id], (err, provider) => {
    if (err || !provider) return res.status(404).json({ error: 'Provider not found' });

    Promise.all([
      new Promise((rs, rj) => db.get(`
        SELECT COUNT(*) as bookings, SUM(COALESCE(cash_amount_paid, 0)) as earnings
        FROM bookings
        WHERE provider_id = ? AND status = 'completed'
          AND completed_at >= DATE('now', 'weekday 0', '-7 days')
      `, [provider.id], (e, r) => e ? rj(e) : rs(r))),
      new Promise((rs, rj) => db.get(`
        SELECT COUNT(*) as bookings, SUM(COALESCE(cash_amount_paid, 0)) as earnings
        FROM bookings
        WHERE provider_id = ? AND status = 'completed'
          AND completed_at >= DATE('now', 'weekday 0', '-14 days')
          AND completed_at < DATE('now', 'weekday 0', '-7 days')
      `, [provider.id], (e, r) => e ? rj(e) : rs(r))),
      new Promise((rs, rj) => db.get(`
        SELECT COUNT(*) as total_completed,
               SUM(COALESCE(cash_amount_paid, 0)) as total_earnings,
               AVG(COALESCE(cash_amount_paid, 0)) as avg_per_job
        FROM bookings
        WHERE provider_id = ? AND status = 'completed'
      `, [provider.id], (e, r) => e ? rj(e) : rs(r))),
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

app.get('/api/admin/overview', authMiddleware, requireRole(['admin']), (req, res) => {
  const queries = {
    totals: `
      SELECT
        (SELECT COUNT(*) FROM users WHERE role='user') as total_users,
        (SELECT COUNT(*) FROM providers) as total_providers,
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

app.get('/api/admin/activity', authMiddleware, requireRole(['admin']), (req, res) => {
  const { type = 'all', limit = 30 } = req.query;
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

app.get('/api/admin/user-spending', authMiddleware, requireRole(['admin']), (req, res) => {
  Promise.all([
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