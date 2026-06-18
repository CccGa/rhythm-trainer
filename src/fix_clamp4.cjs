const fs = require('fs');
const path = 'E:/节奏听辨生成器/rhythm-trainer/src/App.vue';
let c = fs.readFileSync(path, 'utf8');
const n = '\n';

// Fix touch pan block  
// Current: const minX = (80 - tw) / sc; const maxX = (paper.clientWidth - 50) / sc; const minY = (120 - th) / sc; const maxY = (paper.clientHeight - 100) / sc;
// Fix: const minX = 80 - tw; const maxX = paper.clientWidth - 80; const minY = 120 - th; const maxY = paper.clientHeight - 120;
c = c
  .replace('    const minX = (80 - tw) / sc', '    const minX = 80 - tw')
  .replace('    const maxX = (paper.clientWidth - 50) / sc', '    const maxX = paper.clientWidth - 80')
  .replace('    const minY = (120 - th) / sc', '    const minY = 120 - th')
  .replace('    const maxY = (paper.clientHeight - 100) / sc', '    const maxY = paper.clientHeight - 120');

// Fix mouse move block
c = c
  .replace('  const minX = (80 - tw) / sc', '  const minX = 80 - tw')
  .replace('  const maxX = (paper.clientWidth - 50) / sc', '  const maxX = paper.clientWidth - 80')
  .replace('  const minY = (120 - th) / sc', '  const minY = 120 - th')
  .replace('  const maxY = (paper.clientHeight - 100) / sc', '  const maxY = paper.clientHeight - 120');

fs.writeFileSync(path, c, 'utf8');
console.log('Done.');
const v = fs.readFileSync(path, 'utf8');
console.log('has / sc in pan:', v.includes('(80 - tw) / sc') || v.includes('(120 - th) / sc'));
