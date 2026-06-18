const fs = require('fs');
let c = fs.readFileSync('E:/节奏听辨生成器/rhythm-trainer/src/App.vue', 'utf8');

// 基线改用 auto-fill，让宽度自适应
c = c.replace(
  '.switch-grid {\n  display: grid;\n  grid-template-columns: repeat(2, 1fr);\n  gap: 24px;\n  margin-top: 18px;\n  max-width: 614px;\n  margin-left: auto;\n  margin-right: auto;\n}',
  '.switch-grid {\n  display: grid;\n  grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));\n  gap: 24px;\n  margin-top: 18px;\n  max-width: 640px;\n  margin-left: auto;\n  margin-right: auto;\n}'
);

// 1300px 规则改为强制4列
c = c.replace(
  '@media (min-width: 1300px) {',
  '@media (min-width: 1300px) {'
);
// 确保 1300px 规则里的 switch-grid 是 4 列（已经在前面有了）

fs.writeFileSync('E:/节奏听辨生成器/rhythm-trainer/src/App.vue', c, 'utf8');
console.log('OK');
