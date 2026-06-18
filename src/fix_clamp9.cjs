const fs = require('fs');
const path = 'E:/节奏听辨生成器/rhythm-trainer/src/App.vue';
let c = fs.readFileSync(path, 'utf8');

// Touch pan move
c = c
  .replace('    const minX = 80 - tw', '    const minX = 80 - tw - 150')
  .replace('    const minY = 120 - th', '    const minY = 120 - th - 50');

// Mouse move
c = c
  .replace('  const minX = 80 - tw', '  const minX = 80 - tw - 150')
  .replace('  const minY = 120 - th', '  const minY = 120 - th - 50');

fs.writeFileSync(path, c, 'utf8');
console.log('Done.');
