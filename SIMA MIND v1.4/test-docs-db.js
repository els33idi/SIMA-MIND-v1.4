const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./sima.db');

db.all("SELECT name FROM sqlite_master WHERE type='table' AND name='documents'", (err, rows) => {
  if (err) {
    console.error('Error:', err);
    db.close();
    return;
  }
  
  if (rows && rows.length > 0) {
    console.log('✓ Documents table exists');
    
    db.all('PRAGMA table_info(documents)', (err, cols) => {
      if (err) console.error('Error:', err);
      console.log('\nDocuments table columns:');
      cols.forEach(col => console.log(`  - ${col.name} (${col.type})`));
      db.close();
    });
  } else {
    console.log('✗ Documents table does not exist');
    db.close();
  }
});
