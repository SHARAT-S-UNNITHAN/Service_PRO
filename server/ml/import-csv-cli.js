// server/ml/import-csv-cli.js
const CSVTraining = require('./csv-training');
const mlService = require('./simple-ml');

const csvTrainer = new CSVTraining(mlService);

const csvFile = process.argv[2];
if (!csvFile) {
  console.log('Usage: npm run ml:import-csv -- path/to/file.csv');
  process.exit(1);
}

csvTrainer.importFromCSV(csvFile)
  .then(result => {
    console.log(`✅ Imported ${result.imported} records`);
    process.exit(0);
  })
  .catch(err => {
    console.error('❌ Import failed:', err);
    process.exit(1);
  });