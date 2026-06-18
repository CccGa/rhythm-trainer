const fs = require('fs');
let c = fs.readFileSync('E:/节奏听辨生成器/rhythm-trainer/src/App.vue', 'utf8');

c = c.replace(
  '@media (min-width: 1200px) {\n  .switch-grid { grid-template-columns: repeat(4, 1fr); gap: 32px; max-width: 660px; }',
  '@media (min-width: 1200px) {\n  .switch-grid { grid-template-columns: repeat(4, 1fr); gap: 32px; }'
);

fs.writeFileSync('E:/节奏听辨生成器/rhythm-trainer/src/App.vue', c, 'utf8');
console.log('OK');
