const fs = require('fs');
let c = fs.readFileSync('E:/节奏听辨生成器/rhythm-trainer/src/App.vue', 'utf8');

c = c.replace(
  '.switch-grid {\n  display: grid;\n  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));\n  gap: 12px;\n  margin-top: 18px;\n}',
  '.switch-grid {\n  display: grid;\n  grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));\n  gap: 12px;\n  margin-top: 18px;\n  max-width: 620px;\n  margin-left: auto;\n  margin-right: auto;\n}'
);

fs.writeFileSync('E:/节奏听辨生成器/rhythm-trainer/src/App.vue', c, 'utf8');
console.log('OK');
