// server/ml/direct-csv-training.js
const fs = require('fs');
const path = require('path');
const csv = require('csv-parser');

class DirectCSVTraining {
  constructor(mlService) {
    this.mlService = mlService;
  }

  async trainFromCSV(filePath) {
    console.log(`[Direct CSV] ========== STARTING TRAINING ==========`);
    console.log(`[Direct CSV] File: ${filePath}`);
    
    const trainingData = [];
    
    return new Promise((resolve, reject) => {
      fs.createReadStream(filePath)
        .pipe(csv())
        .on('data', (row) => {
          const rating = parseFloat(row.rating) || 0;
          const responseTime = parseFloat(row.response_time) || 60;
          const reviewCount = parseInt(row.review_count) || 0;
          
          if (rating > 0 && rating <= 5) {
            trainingData.push({ rating, responseTime, reviewCount });
          }
        })
        .on('end', async () => {
          console.log(`[Direct CSV] Read ${trainingData.length} valid records`);
          
          if (trainingData.length === 0) {
            resolve({ trained: false, records: 0 });
            return;
          }
          
          // Calculate new weights
          const weights = this.calculateWeights(trainingData);
          console.log(`[Direct CSV] Calculated weights:`, weights);
          
          // DIRECTLY MODIFY the mlService properties
          this.mlService.weights = weights;
          this.mlService.isTrained = true;
          this.mlService.csvTrainingData = trainingData;
          this.mlService.trainingSource = 'csv';
          
          // Verify the update worked
          console.log(`[Direct CSV] VERIFICATION: mlService.weights =`, this.mlService.weights);
          console.log(`[Direct CSV] VERIFICATION: mlService.trainingSource = ${this.mlService.trainingSource}`);
          
          // Also store in a global location for safety
          global.csvTrainedWeights = weights;
          
          resolve({ trained: true, records: trainingData.length, weights: weights });
        })
        .on('error', reject);
    });
  }

  calculateWeights(data) {
    let avgRating = 0;
    let avgResponse = 0;
    let totalReviews = 0;
    
    data.forEach(d => {
      avgRating += d.rating;
      avgResponse += Math.min(120, d.responseTime);
      totalReviews += d.reviewCount || 0;
    });
    
    avgRating /= data.length;
    avgResponse /= data.length;
    const avgReviews = totalReviews / data.length;
    
    console.log(`[Direct CSV] Data stats - Avg Rating: ${avgRating.toFixed(2)}, Avg Response: ${avgResponse.toFixed(0)}min, Avg Reviews: ${avgReviews.toFixed(0)}`);
    
    // Calculate weights
    let ratingWeight = 40;
    let responseWeight = 35;
    let volumeWeight = 25;
    
    if (avgRating > 4.5) ratingWeight = 50;
    else if (avgRating > 4.0) ratingWeight = 45;
    else if (avgRating < 3.0) ratingWeight = 30;
    
    if (avgResponse < 15) responseWeight = 45;
    else if (avgResponse < 60) responseWeight = 40;
    else if (avgResponse > 240) responseWeight = 25;
    
    if (avgReviews > 100) volumeWeight = 30;
    else if (avgReviews > 50) volumeWeight = 25;
    else volumeWeight = 20;
    
    const total = ratingWeight + responseWeight + volumeWeight;
    return {
      rating: Math.round((ratingWeight / total) * 100),
      response: Math.round((responseWeight / total) * 100),
      volume: Math.round((volumeWeight / total) * 100)
    };
  }
}

module.exports = DirectCSVTraining;