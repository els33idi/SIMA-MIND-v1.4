const fs = require('fs');
const path = require('path');

const htmlPath = path.join(__dirname, 'index.html');
const html = fs.readFileSync(htmlPath, 'utf-8');

// Find the SimaMindApp function and its return statement
const funcStart = html.indexOf('function SimaMindApp() {');
const funcEnd = html.indexOf('\nReactDOM.createRoot');

if (funcStart === -1 || funcEnd === -1) {
  console.error('Cannot find SimaMindApp function');
  process.exit(1);
}

const functionBody = html.substring(funcStart, funcEnd);

// Count JSX tags
const openTags = (functionBody.match(/<[A-Z]/g) || []).length;
const closeTags = (functionBody.match(/<\/[A-Z]/g) || []).length;
const selfClosing = (functionBody.match(/\/>/g) || []).length;

console.log(`Open tags: ${openTags}`);
console.log(`Close tags: ${closeTags}`);
console.log(`Self-closing: ${selfClosing}`);
console.log(`Expected close: ${openTags - selfClosing}`);
console.log(`Match: ${closeTags === (openTags - selfClosing) ? 'YES' : 'NO'}`);

// Find all JSX component tags
const componentRegex = /<([A-Z][a-zA-Z0-9]*)/g;
const components = {};
let match;
while ((match = componentRegex.exec(functionBody)) !== null) {
  const comp = match[1];
  components[comp] = (components[comp] || 0) + 1;
}

console.log('\nComponent usage:');
Object.entries(components).sort((a, b) => b[1] - a[1]).slice(0, 20).forEach(([name, count]) => {
  console.log(`  ${name}: ${count}`);
});
