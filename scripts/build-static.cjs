const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
const output = path.join(root, 'dist');
fs.mkdirSync(output, {recursive:true});
for (const entry of fs.readdirSync(root, {withFileTypes:true})) {
  if (entry.isFile() && entry.name.endsWith('.html') || entry.isDirectory() && ['assets','case-assets','data','tools'].includes(entry.name)) {
    fs.cpSync(path.join(root,entry.name), path.join(output,entry.name), {recursive:true});
  }
}
console.log('Static site prepared in dist/');
