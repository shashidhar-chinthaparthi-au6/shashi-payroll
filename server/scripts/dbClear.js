/*
  Database Cleanup Script
  - Drops unnecessary collections left from earlier iterations
  - Clears data from keepers to reset to a clean state
  - Respects current NODE_ENV and uses config connection
*/

const mongoose = require('mongoose');
const config = require('../config/config');

const REQUIRED_COLLECTIONS = [
  'users',
  'employees',
  'attendances',
  'payslips',
  'payrolls',
];

async function run() {
  const env = process.env.NODE_ENV || 'development';
  const uri = (config[env] && config[env].mongodb && config[env].mongodb.uri) || config.mongoURI;

  console.log(`[db:clear] Connecting to ${uri} (env=${env})`);
  await mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true });

  const db = mongoose.connection.db;
  const collections = await db.listCollections().toArray();
  const names = collections.map(c => c.name);

  console.log('[db:clear] Existing collections:', names);

  // Drop unnecessary collections
  const toDrop = names.filter(name => !REQUIRED_COLLECTIONS.includes(name));
  for (const name of toDrop) {
    try {
      await db.dropCollection(name);
      console.log(`[db:clear] Dropped collection: ${name}`);
    } catch (err) {
      console.warn(`[db:clear] Skip drop ${name}:`, err.message);
    }
  }

  // Clean required collections
  for (const name of REQUIRED_COLLECTIONS) {
    if (names.includes(name)) {
      try {
        await db.collection(name).deleteMany({});
        console.log(`[db:clear] Cleared data: ${name}`);
      } catch (err) {
        console.warn(`[db:clear] Skip clear ${name}:`, err.message);
      }
    }
  }

  await mongoose.disconnect();
  console.log('[db:clear] Done.');
}

run().catch(err => {
  console.error('[db:clear] Failed:', err);
  process.exit(1);
});


