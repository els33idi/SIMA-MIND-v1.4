const fs = require('fs');
const FormData = require('form-data');

// Get token from stdin or use default
const token = process.argv[2] || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJ1c2VyLTE3Nzg4ODEwMTc0NDQiLCJkZXZpY2VJZCI6InRlc3QtZGV2aWNlLTEyMyIsImlhdCI6MTc3ODg4MzA5NCwiZXhwIjoxNzc5NDg3ODk0fQ.7jki8YJ2cB_00pPq97IXeJlup28Mks__7LgegTixafU';

// Create test document
const testContent = `Machine Learning Fundamentals

What is Machine Learning?
Machine learning is a subset of artificial intelligence that enables systems to learn and improve from experience without being explicitly programmed.

Key Concepts:
1. Supervised Learning - Learning from labeled data
2. Unsupervised Learning - Finding patterns in unlabeled data
3. Reinforcement Learning - Learning through reward and punishment

Applications:
- Image Recognition
- Natural Language Processing
- Recommendation Systems
- Predictive Analytics

Best Practices:
- Use quality training data
- Split data into train/test sets
- Validate model performance
- Monitor for overfitting`;

fs.writeFileSync('test_doc_phase2.txt', testContent);

// Create form and upload
const form = new FormData();
form.append('file', fs.createReadStream('test_doc_phase2.txt'));

const url = 'http://localhost:4000/api/documents/upload';
const options = {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    ...form.getHeaders()
  },
  body: form
};

console.log('Uploading document to Phase 2...');

fetch(url, options)
  .then(r => {
    if (!r.ok) throw new Error(`HTTP ${r.status}`);
    return r.json();
  })
  .then(data => {
    console.log('\n✅ PHASE 2 DOCUMENT UPLOAD SUCCESS!');
    console.log(JSON.stringify(data, null, 2));
    
    if (data.document) {
      console.log('\n📄 Document Details:');
      console.log(`  - Name: ${data.document.name}`);
      console.log(`  - Size: ${data.document.size} bytes`);
      console.log(`  - Type: ${data.document.type}`);
      console.log(`  - Extracted Text: ${data.document.textLength} characters`);
    }
    
    process.exit(0);
  })
  .catch(e => {
    console.error('\n❌ Error:', e.message);
    process.exit(1);
  });
