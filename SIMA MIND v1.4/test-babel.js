const fs = require('fs');
const path = require('path');

// Read the HTML file
const htmlPath = path.join(__dirname, 'index.html');
const html = fs.readFileSync(htmlPath, 'utf-8');

// Extract the script content
const scriptMatch = html.match(/<script type="text\/babel">([\s\S]*?)<\/script>/);
if (!scriptMatch) {
  console.error('No babel script found');
  process.exit(1);
}

const jsCode = scriptMatch[1];

console.log('Script length:', jsCode.length);
console.log('First 500 chars:');
console.log(jsCode.substring(0, 500));

// Try to find syntax issues
console.log('\n--- Checking for common patterns ---');

// Count braces
const openBraces = (jsCode.match(/\{/g) || []).length;
const closeBraces = (jsCode.match(/\}/g) || []).length;
console.log(`Open braces: ${openBraces}, Close braces: ${closeBraces}`);

const openParens = (jsCode.match(/\(/g) || []).length;
const closeParens = (jsCode.match(/\)/g) || []).length;
console.log(`Open parens: ${openParens}, Close parens: ${closeParens}`);

const openBrackets = (jsCode.match(/\[/g) || []).length;
const closeBrackets = (jsCode.match(/\]/g) || []).length;
console.log(`Open brackets: ${openBrackets}, Close brackets: ${closeBrackets}`);

// Check for problematic patterns
console.log('\n--- Checking for problematic patterns ---');
const lines = jsCode.split('\n');
lines.forEach((line, i) => {
  const lineNum = i + 1 + 26; // Approximate line number in HTML
  
  // Check for template literals with unescaped quotes
  if (line.includes('`')) {
    if (!line.includes('${') && line.includes('"') && line.includes("'")) {
      console.log(`Line ${lineNum}: Mixed quotes in template: ${line.substring(0, 80)}`);
    }
  }
  
  // Check for incomplete JSX
  if (line.includes('<') && line.includes('>')) {
    if (!line.includes('/') && !line.includes('jsx')) {
      // Might be incomplete JSX
    }
  }
});

console.log('\nScript content extracted successfully');
console.log('Attempting to transpile with Babel...');

// Try to import Babel and transpile
try {
  const babel = require('@babel/core');
  const result = babel.transform(jsCode, {
    presets: ['@babel/preset-react'],
    filename: 'index.jsx'
  });
  console.log('Transpilation successful!');
  console.log('Output length:', result.code.length);
} catch (e) {
  console.error('Transpilation error:', e.message);
  if (e.loc) console.error('Line:', e.loc);
}
