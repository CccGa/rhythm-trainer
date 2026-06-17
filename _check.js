const fs = require('fs');
const path = require('path').resolve('src/App.vue');
let content = fs.readFileSync(path, 'utf-8');
const m = content.match(/<template>([\s\S]*?)<\/template>/);
const tpl = m[1];
const lines = tpl.split('\n');
for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const opens = (line.match(/<\w+[^>]*>/g) || []).length;
    const closes = (line.match(/<\/\w+>/g) || []).length;
    const selfCloses = (line.match(/<[^>]*\/>/g) || []).length;
    if (opens - closes - selfCloses !== 0) {
        console.log('?' + (i+1) + ': opens=' + opens + ' closes=' + closes + ' self=' + selfCloses + ' ' + line.trim().substring(0,80));
    }
}
console.log('done');
