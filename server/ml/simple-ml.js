// server/ml/simple-ml.js
// Custom ML scoring - No external dependencies needed!

const db = require('../db');
const fs = require('fs');
const path = require('path');

class SimpleMLRanking {
  constructor() {
    this.weights = null;
    this.isTrained = false;
  }

  // Train the model using your data
  async train() {
    console.log('[ML] Training model with your data...');
    
    // Collect training data
    const data = await this.collectTrainingData();
    
    if (data.length < 5) {
      console.log('[ML] Not enough data, using default weights');
      this.useDefaultWeights();
      return false;
    }
    
    // Calculate optimal weights using linear regression
    this.weights = this.calculateOptimalWeights(data);
    this.isTrained = true;
    
    console.log(`[ML] Training complete! Using ${data.length} examples`);
    console.log(`[ML] Weights: Rating=${this.weights.rating.toFixed(2)}, Response=${this.weights.response.toFixed(2)}, Volume=${this.weights.volume.toFixed(2)}`);
    
    return true;
  }

  // Collect training data from bookings
  async collectTrainingData() {
    return new Promise((resolve, reject) => {
      db.all(`
        SELECT 
          COALESCE(r.rating, 3.5) as rating,
          CASE 
            WHEN b.responded_at IS NOT NULL 
            THEN (julianday(b.responded_at) - julianday(b.created_at)) * 24 * 60
            ELSE 60
          END as response_minutes,
          COUNT(r.id) over (partition by b.provider_id) as provider_reviews,
          CASE 
            WHEN b.status = 'completed' AND COALESCE(r.rating, 0) >= 4 THEN 1
            WHEN b.status = 'completed' AND COALESCE(r.rating, 0) >= 3 THEN 0.7
            WHEN b.status = 'completed' THEN 0.5
            WHEN b.status = 'rejected' THEN 0
            ELSE 0.3
          END as success_score
        FROM bookings b
        LEFT JOIN reviews r ON r.booking_id = b.id
        WHERE b.created_at IS NOT NULL
        LIMIT 1000
      `, [], (err, rows) => {
        if (err) {
          reject(err);
          return;
        }
        console.log(`[ML] Collected ${rows.length} training examples`);
        resolve(rows);
      });
    });
  }
  // Add this method to save model
async saveModel() {
  const fs = require('fs');
  const path = require('path');
  
  const modelData = {
    weights: this.weights,
    isTrained: this.isTrained,
    featureMeans: this.featureMeans,
    featureStdDev: this.featureStdDev,
    trainedAt: new Date().toISOString()
  };
  
  const modelPath = path.join(__dirname, 'model.json');
  fs.writeFileSync(modelPath, JSON.stringify(modelData, null, 2));
  console.log('[ML] Model saved to', modelPath);
}

// Add this method to load model
async loadModel() {
  const fs = require('fs');
  const path = require('path');
  
  const modelPath = path.join(__dirname, 'model.json');
  
  if (fs.existsSync(modelPath)) {
    try {
      const modelData = JSON.parse(fs.readFileSync(modelPath, 'utf8'));
      this.weights = modelData.weights;
      this.isTrained = modelData.isTrained;
      this.featureMeans = modelData.featureMeans;
      this.featureStdDev = modelData.featureStdDev;
      console.log('[ML] Model loaded from disk');
      return true;
    } catch (err) {
      console.log('[ML] Could not load model:', err.message);
      return false;
    }
  }
  return false;
}

  // Calculate optimal weights from data
  calculateOptimalWeights(data) {
    // Calculate average values
    let avgRating = 0, avgResponse = 0, avgVolume = 0, avgSuccess = 0;
    
    data.forEach(d => {
      avgRating += d.rating;
      avgResponse += Math.min(120, d.response_minutes);
      avgVolume += Math.min(50, d.provider_reviews || 0);
      avgSuccess += d.success_score;
    });
    
    avgRating /= data.length;
    avgResponse /= data.length;
    avgVolume /= data.length;
    avgSuccess /= data.length;
    
    // Calculate correlations (simplified)
    let ratingWeight = 0;
    let responseWeight = 0;
    let volumeWeight = 0;
    
    data.forEach(d => {
      const ratingDiff = d.rating - avgRating;
      const responseDiff = (Math.min(120, d.response_minutes) - avgResponse);
      const volumeDiff = (Math.min(50, d.provider_reviews || 0) - avgVolume);
      const successDiff = d.success_score - avgSuccess;
      
      ratingWeight += ratingDiff * successDiff;
      responseWeight += -responseDiff * successDiff; // Negative because faster is better
      volumeWeight += volumeDiff * successDiff;
    });
    
    // Normalize weights to sum to 100
    const total = Math.abs(ratingWeight) + Math.abs(responseWeight) + Math.abs(volumeWeight);
    
    return {
      rating: Math.max(20, Math.min(50, (Math.abs(ratingWeight) / total) * 100)),
      response: Math.max(15, Math.min(40, (Math.abs(responseWeight) / total) * 100)),
      volume: Math.max(10, Math.min(35, (Math.abs(volumeWeight) / total) * 100))
    };
  }

  // Default weights (safe fallback)
  useDefaultWeights() {
    this.weights = {
      rating: 40,   // Rating is most important
      response: 35,  // Response time matters
      volume: 25     // Review volume matters
    };
    this.isTrained = true;
  }

  // Calculate score for a provider
  calculateScore(provider) {
    if (!this.weights) {
      this.useDefaultWeights();
    }
    
    let score = 0;
    
    // 1. Rating score (0-40 points)
    const rating = provider.average_rating || 0;
    let ratingScore = (rating / 5) * this.weights.rating;
    
    // Bonus for high ratings
    if (rating >= 4.8) ratingScore *= 1.1;
    else if (rating >= 4.5) ratingScore *= 1.05;
    
    score += ratingScore;
    
    // 2. Response time score (0-35 points)
    const responseTime = provider.avg_response_time || 60;
    let responseScore = 0;
    
    if (responseTime <= 15) responseScore = this.weights.response;
    else if (responseTime <= 60) responseScore = this.weights.response * 0.9;
    else if (responseTime <= 240) responseScore = this.weights.response * 0.7;
    else if (responseTime <= 720) responseScore = this.weights.response * 0.5;
    else responseScore = this.weights.response * 0.3;
    
    score += responseScore;
    
    // 3. Review volume score (0-25 points)
    const reviewCount = provider.review_count || 0;
    let volumeScore = Math.min(this.weights.volume, (reviewCount / 20) * this.weights.volume);
    
    // Bonus for many reviews
    if (reviewCount >= 50) volumeScore *= 1.1;
    else if (reviewCount >= 100) volumeScore *= 1.2;
    
    score += volumeScore;
    
    // 4. Completion bonus (if available)
    if (provider.completion_rate) {
      const completionBonus = (provider.completion_rate / 100) * 5;
      score += completionBonus;
    }
    
    // 5. Trust bonus (if available)
    if (provider.trust_score) {
      const trustBonus = (provider.trust_score / 100) * 5;
      score += trustBonus;
    }
    
    // Penalties
    if (responseTime > 1440) score -= 10;
    if (reviewCount === 0) score *= 0.9;
    if (rating < 3.0 && reviewCount > 5) score -= 15;
    
    // Final normalization (0-100)
    return Math.max(0, Math.min(100, Math.round(score)));
  }

  // Predict for single provider
  async predictScore(provider) {
    return this.calculateScore(provider);
  }

  // Batch predict for search results
  async batchPredict(providers) {
    if (!this.isTrained) {
      await this.train();
    }
    
    return providers.map(provider => ({
      ...provider,
      ml_score: this.calculateScore(provider),
      ml_confidence: 'simple-ml',
      // Add star rating display info
      star_rating: (provider.average_rating || 0).toFixed(1),
      star_display: this.getStarDisplay(provider.average_rating || 0)
    }));
  }
  
  // Helper to get star display
  getStarDisplay(rating) {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);
    
    return {
      full: fullStars,
      half: hasHalfStar,
      empty: emptyStars,
      text: `${rating.toFixed(1)} ★`
    };
  }

  // Initialize
  async initialize() {
    console.log('[ML] Initializing scoring engine...');
    await this.train();
    console.log('[ML] Scoring engine ready!');
  }
}

// Create instance
const mlService = new SimpleMLRanking();

// Initialize
mlService.initialize().catch(console.error);

module.exports = mlService;