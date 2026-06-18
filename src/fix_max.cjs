const fs = require('fs');
let c = fs.readFileSync('E:/节奏听辨生成器/rhythm-trainer/src/App.vue', 'utf8');
const n = '\n';

// Touch pan
c = c.replace(
  '    const maxX = paper.clientWidth - 80' + n + '    const minY = 120 - th',
  '    const maxX = paper.clientWidth - 120' + n + '    const minY = 120 - th'
);
c = c.replace(
  '    const maxY = paper.clientHeight - 120' + n + '    scoreTranslateX.value',
  '    const maxY = paper.clientHeight - 170' + n + '    scoreTranslateX.value'
);

// Mouse move
c = c.replace(
  '  const maxX = paper.clientWidth - 80' + n + '  const minY = 120 - th',
  '  const maxX = paper.clientWidth - 120' + n + '  const minY = 120 - th'
);
c = c.replace(
  '  const maxY = paper.clientHeight - 120' + n + '  scoreTranslateX.value',
  '  const maxY = paper.clientHeight - 170' + n + '  scoreTranslateX.value'
);

// clampStaff
c = c.replace(
  'var maxX=pw-gap;var minY=vgap-th;var maxY=ph-vgap',
  'var maxX=pw-gap-100;var minY=vgap-th;var maxY=ph-vgap-50'
);

fs.writeFileSync('E:/节奏听辨生成器/rhythm-trainer/src/App.vue', c, 'utf8');
console.log('OK');
