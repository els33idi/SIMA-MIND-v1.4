const fs = require('fs');
const path = require('path');
const babel = require('@babel/core');
const root = path.resolve(__dirname, '..');
const inputPath = path.join(root, 'root-app.js');
const outputPath = path.join(root, 'root-app.bundle.js');
const code = fs.readFileSync(inputPath, 'utf8');
const result = babel.transformSync(code, {
  configFile: false,
  babelrc: false,
  presets: [[require('@babel/preset-env'), { modules: false }], [require('@babel/preset-react'), { runtime: 'classic' }]],
  sourceMaps: false,
  comments: false,
  compact: false,
});
fs.writeFileSync(outputPath, result.code, 'utf8');
console.log('Built root-app.bundle.js');
