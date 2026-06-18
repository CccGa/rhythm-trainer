const fs = require('fs');
let c = fs.readFileSync('E:/节奏听辨生成器/rhythm-trainer/src/App.vue', 'utf8');

c = c.replace(
  'input, select {',
  'input[type=\"number\"], select {'
);

fs.writeFileSync('E:/节奏听辨生成器/rhythm-trainer/src/App.vue', c, 'utf8');
console.log('OK');
