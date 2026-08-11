const fs = require('fs');
const path = require('path');

const htmlPath = path.join(__dirname, 'index.html');
const html = fs.readFileSync(htmlPath, 'utf-8');

// Extract just the script
const scriptMatch = html.match(/<script type="text\/babel">([\s\S]*?)<\/script>/);
if (!scriptMatch) {
  console.error('No babel script');
  process.exit(1);
}

const code = scriptMatch[1];
const lines = code.split('\n');

// Find all function declarations
const functionDecls = [];
let depth = 0;

for (let i = 0; i < lines.length; i++) {
  const line = lines[i];
  
  // Skip comments
  if (line.trim().startsWith('//')) continue;
  
  // Count braces
  for (let j = 0; j < line.length; j++) {
    const char = line[j];
    const prevChar = j > 0 ? line[j-1] : '';
    const nextChar = j < line.length - 1 ? line[j+1] : '';
    
    // Skip string content
    if (char === '"' || char === "'" || char === '`') {
      const quote = char;
      j++;
      while (j < line.length && line[j] !== quote) {
        if (line[j] === '\\') j++;
        j++;
      }
      continue;
    }
    
    if (char === '{') depth++;
    if (char === '}') depth--;
  }
  
  // Check for function declarations
  if (line.includes('function ') || line.includes(' =>')) {
    const match = line.match(/(function|const|const.*=>|const.*=>|async function)\s+(\w+)?/);
    if (match) {
      console.log(`Line ${i+1}: ${line.trim().substring(0, 80)}`);
    }
  }
}

console.log(`\nFinal depth: ${depth}`);
if (depth !== 0) {
  console.log(`ERROR: ${depth > 0 ? 'Missing' : 'Extra'} ${Math.abs(depth)} closing brace(s)`);
}
