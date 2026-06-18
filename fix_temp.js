const fs = require('fs');
const path = 'E:/???????/rhythm-trainer/src/App.vue';
let c = fs.readFileSync(path, 'utf-8');
c = c.replace(/window\.addEventListener\([^;]+;;/g, '');
c = c.replace('};;function stopPlayback()', '}\n\nfunction stopPlayback()');
fs.writeFileSync(path, c, 'utf-8');
console.log('Done. Has autoCenterScore:', c.includes('autoCenterScore'));
