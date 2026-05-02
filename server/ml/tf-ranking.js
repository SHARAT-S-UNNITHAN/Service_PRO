// server/ml/tf-ranking.js
// Simple ML ranking that learns from your data

const tf = require('@tensorflow/tfjs-node');
const db = require('../db');

class MLRankingService {
  constructor() {
    this.model = null;
    this.isTrained = false;
    this.trainingData = [];
  }

  // Step 1: Collect training data from your database
  async collectTrainingData() {
    console.log('[ML] Collecting training data from bookings...');
    
    return new Promise((resolve, reject) => {
      db.all(`
        SELECT 
          b.id,
          b.status,
          r.rating as review_rating,
          b.cash_amount_paid,
          -- Calculate response time (if responded)
          CASE 
            WHEN b.responded_at IS NOT NULL 
            THEN (julianday(b.responded_at) - julianday(b.created_at)) * 24 * 60
            ELSE 60
          END as response_minutes,
          
          -- Is this a successful booking? (Our "label" for ML)
          CASE 
            WHEN b.status = 'completed' AND r.rating >= 4 THEN 1  -- Good outcome
            WHEN b.status = 'completed' AND r.rating < 4 THEN 0.5  -- OK outcome  
            WHEN b.status = 'rejected' THEN 0  -- Bad outcome
            ELSE 0.3  -- Neutral
          END as success_score
          
        FROM bookings b
        LEFT JOIN reviews r ON r.booking_id = b.id
        WHERE b.created_at IS NOT NULL
        ORDER BY b.created_at DESC
        LIMIT 5000
      `, [], (err, rows) => {
        if (err) {
          console.error('[ML] Error collecting data:', err);
          reject(err);
          return;
        }
        
        this.trainingData = rows.filter(r => r.success_score !== null);
        console.log(`[ML] Collected ${this.trainingData.length} training examples`);
        resolve(this.trainingData);
      });
    });
  }

  // Step 2: Build the neural network model
  buildModel() {
    console.log('[ML] Building neural network...');
    
    // Simple model: 3 inputs -> 1 output
    const model = tf.sequential();
    
    // Input layer: 3 features [rating, response_time, total_bookings]
    model.add(tf.layers.dense({
      inputShape: [3],
      units: 8,
      activation: 'relu'
    }));
    
    // Hidden layer
    model.add(tf.layers.dense({
      units: 4,
      activation: 'relu'
    }));
    
    // Output layer (score 0-1)
    model.add(tf.layers.dense({
      units: 1,
      activation: 'sigmoid'
    }));
    
    // Compile model
    model.compile({
      optimizer: tf.train.adam(0.01),
      loss: 'meanSquaredError',
      metrics: ['accuracy']
    });
    
    this.model = model;
    console.log('[ML] Model built successfully');
    return model;
  }

  // Step 3: Prepare data for training
  prepareFeatures(data) {
    // Extract features from each booking
    const features = data.map(booking => [
      // Feature 1: Review rating (0-5 scale, normalized)
      Math.min(5, Math.max(0, booking.review_rating || 3)) / 5,
      
      // Feature 2: Response time (normalized, faster is better)
      Math.max(0, Math.min(1, 1 - (booking.response_minutes / 240))),
      
      // Feature 3: Payment amount (normalized)
      Math.min(1, (booking.cash_amount_paid || 0) / 10000)
    ]);
    
    const labels = data.map(booking => [booking.success_score]);
    
    return {
      features: tf.tensor2d(features),
      labels: tf.tensor2d(labels)
    };
  }

  // Step 4: Train the model
  async trainModel(epochs = 50) {
    if (!this.model) {
      this.buildModel();
    }
    
    if (this.trainingData.length === 0) {
      await this.collectTrainingData();
    }
    
    console.log('[ML] Training model...');
    
    const { features, labels } = this.prepareFeatures(this.trainingData);
    
    // Train the model
    const history = await this.model.fit(features, labels, {
      epochs: epochs,
      batchSize: 32,
      validationSplit: 0.2,
      callbacks: {
        onEpochEnd: (epoch, logs) => {
          if (epoch % 10 === 0) {
            console.log(`[ML] Epoch ${epoch}: loss = ${logs.loss.toFixed(4)}, accuracy = ${logs.acc.toFixed(4)}`);
          }
        }
      }
    });
    
    this.isTrained = true;
    console.log('[ML] Training complete!');
    
    // Clean up tensors
    features.dispose();
    labels.dispose();
    
    return history;
  }

  // Step 5: Predict score for a provider
  async predictScore(provider) {
    if (!this.isTrained) {
      console.log('[ML] Model not trained yet, using fallback scoring');
      return this.fallbackScore(provider);
    }
    
    // Extract features for this provider
    const features = tf.tensor2d([[
      Math.min(1, (provider.average_rating || 3) / 5),
      Math.min(1, Math.max(0, 1 - ((provider.avg_response_time || 60) / 240))),
      Math.min(1, (provider.total_earnings || 0) / 10000)
    ]]);
    
    // Predict
    const prediction = this.model.predict(features);
    const score = (await prediction.data())[0];
    
    // Clean up
    features.dispose();
    prediction.dispose();
    
    // Convert to 0-100 scale
    return Math.round(score * 100);
  }
  
  // Fallback scoring when model isn't trained
  fallbackScore(provider) {
    let score = 0;
    score += (provider.average_rating || 0) * 15;
    score += Math.min(25, 25 - ((provider.avg_response_time || 60) / 15));
    score += Math.min(20, (provider.review_count || 0) * 0.5);
    return Math.min(100, Math.max(0, score));
  }
  
  // Step 6: Batch predict for search results
  async batchPredict(providers) {
    if (!this.isTrained || providers.length === 0) {
      // Use fallback scoring
      return providers.map(p => ({
        ...p,
        ml_score: this.fallbackScore(p),
        ml_confidence: 'fallback'
      }));
    }
    
    // Prepare batch features
    const features = providers.map(p => [
      Math.min(1, (p.average_rating || 3) / 5),
      Math.min(1, Math.max(0, 1 - ((p.avg_response_time || 60) / 240))),
      Math.min(1, (p.total_earnings || 0) / 10000)
    ]);
    
    const tensorFeatures = tf.tensor2d(features);
    const predictions = await this.model.predict(tensorFeatures);
    const scores = await predictions.data();
    
    // Clean up
    tensorFeatures.dispose();
    predictions.dispose();
    
    // Add scores to providers
    return providers.map((provider, index) => ({
      ...provider,
      ml_score: Math.round(scores[index] * 100),
      ml_confidence: 'tensorflow'
    }));
  }
  
  // Step 7: Save model to disk
  async saveModel() {
    if (!this.model) return;
    
    await this.model.save('file://./ml/model');
    console.log('[ML] Model saved to ./ml/model');
  }
  
  // Step 8: Load model from disk
  async loadModel() {
    try {
      this.model = await tf.loadLayersModel('file://./ml/model/model.json');
      this.isTrained = true;
      console.log('[ML] Model loaded from disk');
      return true;
    } catch (err) {
      console.log('[ML] No saved model found, will train new one');
      return false;
    }
  }
  
  // Step 9: Auto-train when server starts
  async initialize() {
    console.log('[ML] Initializing ML service...');
    
    // Try to load existing model
    const loaded = await this.loadModel();
    
    if (!loaded) {
      // Train new model
      await this.collectTrainingData();
      this.buildModel();
      await this.trainModel(30); // Train for 30 epochs
      await this.saveModel();
    }
    
    console.log('[ML] ML service ready!');
  }
}

// Create singleton instance
const mlService = new MLRankingService();

// Auto-initialize when loaded
mlService.initialize().catch(console.error);

module.exports = mlService;