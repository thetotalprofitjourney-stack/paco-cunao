const fs = require('fs');
const path = require('path');
const db = require('../src/db/client');

const migrationsDir = path.join(__dirname, '../src/db/migrations');

async function runMigrations() {
  try {
    console.log('Running database migrations...');

    const files = fs
      .readdirSync(migrationsDir)
      .filter((f) => f.endsWith('.sql'))
      .sort();

    for (const file of files) {
      console.log(`Executing ${file}...`);
      const sql = fs.readFileSync(path.join(migrationsDir, file), 'utf8');
      await db.query(sql);
      console.log(`✓ ${file} completed`);
    }

    console.log('\n✓ All migrations completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error running migrations:', error);
    process.exit(1);
  }
}

runMigrations();
