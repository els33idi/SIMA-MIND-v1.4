const fs = require('fs');
const path = require('path');

// Read the HTML file
const htmlPath = path.join(__dirname, 'index.html');
const html = fs.readFileSync(htmlPath, 'utf-8');

// Extract the script content
const scriptMatch = html.match(/<script type="text\/babel">([\s\S]*?)<\/script>/);
const jsCode = scriptMatch[1];
const lines = jsCode.split('\n');

let openCount = 0;
let closeCount = 0;
const stack = [];

lines.forEach((line, lineIndex) => {
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    
    // Skip strings and comments
    if (char === '"' || char === "'" || char === '`') {
      const quote = char;
      i++;
      while (i < line.length && line[i] !== quote) {
        if (line[i] === '\\') i++;
        i++;
      }
    } else if (char === '/' && line[i + 1] === '/') {
      break; // Skip rest of line
    } else if (char === '(' ) {
      openCount++;
      stack.push({ type: '(', line: lineIndex + 27, col: i });
    } else if (char === ')') {
      closeCount++;
      const last = stack[stack.length - 1];
      if (last && last.type === '(') {
        stack.pop();
      } else {
        console.log(`Extra ) at line ${lineIndex + 27}, col ${i}: ${line.substring(Math.max(0, i-40), i+40)}`);
      }
    }
  }
});

console.log(`\nTotal: ${openCount} open, ${closeCount} close`);
console.log(`Difference: ${closeCount - openCount} extra closing parens`);

if (stack.length > 0) {
  console.log(`\nUnclosed opening parens:`);
  stack.slice(0, 10).forEach(item => {
    const lineNum = item.line;
    const lineContent = lines[lineNum - 27] || '';
    console.log(`  Line ${lineNum}, col ${item.col}: ${lineContent.substring(0, 80)}`);
  });
}
