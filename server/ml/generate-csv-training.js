    // server/ml/generate-csv-training.js
// Generate synthetic training data CSV

const fs = require('fs');
const path = require('path');

function generateTrainingCSV(recordCount = 1000) {
  const headers = ['provider_name', 'rating', 'response_time', 'review_count', 'amount', 'success_score', 'location', 'profession'];
  const rows = [headers.join(',')];
  
  const providers = [
    'Quick Service', 'Pro Electric', 'Best Plumbing', 'Elite AC', 'Smart Home',
    'Fast Repair', 'Quality Work', 'Trusted Service', 'Expert Hands', 'Reliable Co'
  ];
  
  const locations = ['Alappuzha', 'Kayamkulam', 'Chengannur', 'Mavelikara', 'Haripad', 'Ambalappuzha'];
  const professions = ['Plumber', 'Electrician', 'AC Repair', 'Painter', 'Carpenter', 'Home Cleaner'];
  
  for (let i = 0; i < recordCount; i++) {
    // Generate realistic patterns
    const rating = Math.min(5, Math.max(1, Math.random() * 4 + 1));
    const responseTime = rating > 4.5 ? Math.random() * 30 : Math.random() * 120;
    const reviewCount = Math.floor(rating > 4 ? Math.random() * 200 + 50 : Math.random() * 50);
    const amount = Math.floor((rating * 1000) + Math.random() * 5000);
    
    // Success score correlates with rating and response time
    let successScore = rating / 5;
    if (responseTime < 30) successScore += 0.1;
    if (responseTime > 240) successScore -= 0.2;
    successScore = Math.min(1, Math.max(0, successScore));
    
    const row = [
      providers[Math.floor(Math.random() * providers.length)],
      rating.toFixed(1),
      Math.round(responseTime),
      reviewCount,
      amount,
      successScore.toFixed(2),
      locations[Math.floor(Math.random() * locations.length)],
      professions[Math.floor(Math.random() * professions.length)]
    ];
    
    rows.push(row.join(','));
  }
  
  const filePath = path.join(__dirname, 'generated_training_data.csv');
  fs.writeFileSync(filePath, rows.join('\n'));
  console.log(`✅ Generated ${recordCount} training records at: ${filePath}`);
  return filePath;
}

// Run if called directly
if (require.main === module) {
  generateTrainingCSV(parseInt(process.argv[2]) || 500);
}

module.exports = generateTrainingCSV;