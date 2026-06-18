const fs = require('fs');
let c = fs.readFileSync('E:/节奏听辨生成器/rhythm-trainer/src/App.vue', 'utf8');

// 替换 switch-grid 基础样式
c = c.replace(
  '.switch-grid {\n  display: grid;\n  grid-template-columns: repeat(4, 1fr);\n  gap: 32px 24px;\n  margin-top: 18px;\n  max-width: 680px;\n  margin-left: auto;\n  margin-right: auto;\n}',
  '.switch-grid {\n  display: grid;\n  grid-template-columns: repeat(2, 1fr);\n  gap: 24px;\n  margin-top: 18px;\n  max-width: 614px;\n  margin-left: auto;\n  margin-right: auto;\n}'
);

// 加宽屏规则
c = c.replace(
  '@media (max-width: 720px) {\n  .switch-grid { grid-template-columns: repeat(2, 1fr); gap: 20px; }',
  '@media (min-width: 1300px) {\n  .switch-grid { grid-template-columns: repeat(4, 1fr); gap: 28px; max-width: 640px; }\n}\n\n@media (max-width: 720px) {\n  .switch-grid { grid-template-columns: repeat(2, 1fr); gap: 20px; }'
);

fs.writeFileSync('E:/节奏听辨生成器/rhythm-trainer/src/App.vue', c, 'utf8');
console.log('OK');
