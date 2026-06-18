const fs = require('fs');
const path = 'E:/节奏听辨生成器/rhythm-trainer/src/App.vue';
let c = fs.readFileSync(path, 'utf8');
const n = '\n';
// Fix touch pan block (4-space indent)
const oldPan = '    const sc = scoreScale.value' + n +
'    const tw = scoreContentWidth.value * sc' + n +
'    const th = scoreContentHeight.value * sc' + n +
'    const minX = (80 - tw) / sc' + n +
'    const maxX = (paper.clientWidth - 80) / sc' + n +
'    const minY = (120 - th) / sc' + n +
'    const maxY = (paper.clientHeight - 120) / sc';
const newPan = '    const sc = scoreScale.value' + n +
'    const tw = scoreContentWidth.value * sc' + n +
'    const th = scoreContentHeight.value * sc' + n +
'    const minX = 80 - tw' + n +
'    const maxX = paper.clientWidth - 80' + n +
'    const minY = 120 - th' + n +
'    const maxY = paper.clientHeight - 120';
console.log('Pan match:', c.includes(oldPan));
c = c.replace(oldPan, newPan);

// Fix mouse move block (2-space indent)
const oldMouse = '  const sc = scoreScale.value' + n +
'  const tw = scoreContentWidth.value * sc' + n +
'  const th = scoreContentHeight.value * sc' + n +
'  const minX = (80 - tw) / sc' + n +
'  const maxX = (paper.clientWidth - 80) / sc' + n +
'  const minY = (120 - th) / sc' + n +
'  const maxY = (paper.clientHeight - 120) / sc';
const newMouse = '  const sc = scoreScale.value' + n +
'  const tw = scoreContentWidth.value * sc' + n +
'  const th = scoreContentHeight.value * sc' + n +
'  const minX = 80 - tw' + n +
'  const maxX = paper.clientWidth - 80' + n +
'  const minY = 120 - th' + n +
'  const maxY = paper.clientHeight - 120';
console.log('Mouse match:', c.includes(oldMouse));
c = c.replace(oldMouse, newMouse);

fs.writeFileSync(path, c, 'utf8');
console.log('Done.');
