const fs = require('fs');
const path = require('path');
const root = path.resolve(__dirname, '..');
const indexPath = path.join(root, 'index.html');
const html = fs.readFileSync(indexPath, 'utf8');

const styleStart = html.indexOf('<style>');
const styleEnd = html.indexOf('</style>', styleStart);
let styleContent = '';
let htmlWithoutStyle = html;
if (styleStart !== -1 && styleEnd !== -1 && styleEnd > styleStart) {
  styleContent = html.slice(styleStart + '<style>'.length, styleEnd);
  htmlWithoutStyle = html.slice(0, styleStart) + html.slice(styleEnd + '</style>'.length);
}

const scriptTag = '<script type="text/babel">';
const scriptStart = htmlWithoutStyle.indexOf(scriptTag);
const scriptEnd = htmlWithoutStyle.indexOf('</script>', scriptStart);
if (scriptStart === -1 || scriptEnd === -1) {
  throw new Error('Inline script tag not found in index.html');
}

const scriptContent = htmlWithoutStyle.slice(scriptStart + scriptTag.length, scriptEnd);
const htmlWithExternalScript = htmlWithoutStyle.slice(0, scriptStart)
  + '<script type="text/babel" src="/root-app.js"></script>'
  + htmlWithoutStyle.slice(scriptEnd + '</script>'.length);

let finalHtml = htmlWithExternalScript;
if (styleContent) {
  const headClose = finalHtml.indexOf('</head>');
  if (headClose === -1) {
    throw new Error('Could not find </head> in index.html');
  }
  finalHtml = finalHtml.slice(0, headClose)
    + '    <link rel="stylesheet" href="/root.css">\n'
    + finalHtml.slice(headClose);
}

fs.writeFileSync(indexPath, finalHtml, 'utf8');
fs.writeFileSync(path.join(root, 'root-app.js'), scriptContent, 'utf8');
if (styleContent) {
  fs.writeFileSync(path.join(root, 'root.css'), styleContent, 'utf8');
}
console.log('Extracted inline script and CSS to root-app.js and root.css');
