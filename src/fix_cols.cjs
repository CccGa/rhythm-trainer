const fs = require('fs');
let c = fs.readFileSync('E:/节奏听辨生成器/rhythm-trainer/src/App.vue', 'utf8');

c = c.replace(
  '.switch-grid {\n  display: grid;\n  grid-template-columns: repeat(auto-fill, minmax(130px, 1fr));\n  gap: 32px;\n  margin-top: 18px;\n  max-width: 680px;\n  margin-left: auto;\n  margin-right: auto;\n}',
  '.switch-grid {\n  display: grid;\n  grid-template-columns: repeat(4, 1fr);\n  gap: 32px 24px;\n  margin-top: 18px;\n  max-width: 680px;\n  margin-left: auto;\n  margin-right: auto;\n}'
);

// 窄屏时改为2列
c = c.replace(
  '@media (max-width: 720px) {',
  '@media (max-width: 720px) {\n  .switch-grid { grid-template-columns: repeat(2, 1fr); gap: 20px; }'
);

fs.writeFileSync('E:/节奏听辨生成器/rhythm-trainer/src/App.vue', c, 'utf8');
console.log('OK');
