const fs = require('fs');
let c = fs.readFileSync('E:/节奏听辨生成器/rhythm-trainer/src/App.vue', 'utf8');

c = c.replace(
  'input[type=\"number\"] { height: 42px; min-height: 42px; box-sizing: border-box; }',
  'input[type=\"number\"], select { height: 42px; min-height: 42px; box-sizing: border-box; }'
);

c = c.replace(
  'input, select {\n  min-height: 42px;',
  'input, select {'
);

fs.writeFileSync('E:/节奏听辨生成器/rhythm-trainer/src/App.vue', c, 'utf8');
console.log('OK');
