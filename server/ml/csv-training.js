// server/ml/csv-training.js
const fs = require('fs');
const path = require('path');
const csv = require('csv-parser');
const db = require('../db');

class CSVTraining {
  constructor(mlService) {
    this.mlService = mlService;
  }

  async importFromCSV(filePath) {
    console.log(`[CSV Training] Importing data from: ${filePath}`);
    
    const trainingData = [];
    
    return new Promise((resolve, reject) => {
      fs.createReadStream(filePath)
        .pipe(csv())
        .on('data', (row) => {
          const record = {
            rating: parseFloat(row.rating) || parseFloat(row.review_rating) || 0,
            response_minutes: parseFloat(row.response_time) || parseFloat(row.response_minutes) || 60,
            review_count: parseInt(row.review_count) || parseInt(row.reviews) || 0,
            amount: parseFloat(row.amount) || parseFloat(row.payment) || 0,
            provider_name: row.provider_name || row.name || 'CSV Provider',
            location: row.location || row.city || 'Unknown',
            profession: row.profession || row.service_type || 'General'
          };
          
          // Calculate success score
          let successScore = parseFloat(row.success_score);
          if (isNaN(successScore)) {
            if (record.rating >= 4.5) successScore = 1.0;
            else if (record.rating >= 4.0) successScore = 0.9;
            else if (record.rating >= 3.0) successScore = 0.7;
            else if (record.rating >= 2.0) successScore = 0.4;
            else successScore = 0.2;
          }
          record.success_score = successScore;
          
          if (record.rating > 0 && record.rating <= 5) {
            trainingData.push(record);
          }
        })
        .on('end', async () => {
          console.log(`[CSV Training] Read ${trainingData.length} valid records`);
          
          if (trainingData.length === 0) {
            resolve({ imported: 0, file: filePath });
            return;
          }
          
          // Insert into database
          let inserted = 0;
          for (const record of trainingData) {
            try {
              const providerId = await this.findOrCreateProvider(record);
              if (providerId) {
                await this.insertBooking(providerId, record);
                inserted++;
              }
            } catch (err) {
              console.error('[CSV] Insert error:', err.message);
            }
          }
          
          console.log(`[CSV Training] Inserted ${inserted} records into database`);
          
          // Update ML model if there's new data
          if (inserted > 0 && this.mlService) {
            await this.updateMLModel(trainingData);
          }
          
          resolve({ imported: inserted, file: filePath });
        })
        .on('error', reject);
    });
  }

  async findOrCreateProvider(record) {
    return new Promise((resolve) => {
      // Try to find existing provider
      db.get(
        `SELECT id FROM providers WHERE full_name LIKE ? OR username LIKE ? LIMIT 1`,
        [`%${record.provider_name}%`, `%${record.provider_name.toLowerCase().replace(/\s/g, '')}%`],
        (err, provider) => {
          if (provider) {
            resolve(provider.id);
          } else {
            // Create new provider
            db.run(
              `INSERT INTO providers (full_name, username, district, is_verified, is_active, created_at) 
               VALUES (?, ?, ?, 1, 1, datetime('now'))`,
              [record.provider_name, record.provider_name.toLowerCase().replace(/\s/g, ''), record.location],
              function(err) {
                if (!err && this.lastID) {
                  resolve(this.lastID);
                } else {
                  // Fallback: use first available provider
                  db.get(`SELECT id FROM providers WHERE is_verified = 1 LIMIT 1`, [], (err, p) => {
                    resolve(p?.id || null);
                  });
                }
              }
            );
          }
        }
      );
    });
  }

  async insertBooking(providerId, record) {
    return new Promise((resolve) => {
      const daysAgo = Math.floor(Math.random() * 90);
      const responseMinutes = Math.min(record.response_minutes, 1440);
      
      db.run(`
        INSERT INTO bookings (provider_id, user_id, status, created_at, responded_at, cash_amount_paid, profession)
        VALUES (?, 1, 'completed', datetime('now', '-? days'), datetime('now', '-? minutes'), ?, ?)
      `, [providerId, daysAgo, responseMinutes, record.amount || 1000, record.profession], function(err) {
        if (!err && this.lastID && record.rating > 0) {
          // Add review
          db.run(`
            INSERT INTO reviews (booking_id, provider_id, rating, review_text, created_at)
            VALUES (?, ?, ?, ?, datetime('now', '-? days'))
          `, [this.lastID, providerId, record.rating, `CSV Import: ${record.rating}★ rating`, daysAgo]);
        }
        resolve(!err);
      });
    });
  }

  async updateMLModel(newData) {
    console.log(`[CSV Training] Updating ML model with ${newData.length} new records...`);
    
    if (!this.mlService.collectTrainingData) {
      console.log('[CSV Training] ML service doesn\'t support retraining');
      return;
    }
    
    try {
      // Refresh training data
      await this.mlService.collectTrainingData();
      
      // Retrain
      if (this.mlService.train) {
        await this.mlService.train();
      }
      
      // Save model if method exists
      if (this.mlService.saveModel) {
        await this.mlService.saveModel();
      }
      
      console.log(`[CSV Training] ML model updated successfully!`);
    } catch (err) {
      console.error('[CSV Training] Error updating model:', err.message);
    }
  }

  async importFromFolder(folderPath) {
    if (!fs.existsSync(folderPath)) {
      return [];
    }
    
    const files = fs.readdirSync(folderPath).filter(f => f.endsWith('.csv'));
    const results = [];
    
    for (const file of files) {
      const result = await this.importFromCSV(path.join(folderPath, file));
      results.push(result);
    }
    
    return results;
  }
}

module.exports = CSVTraining;