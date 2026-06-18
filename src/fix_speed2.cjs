const fs = require('fs');
let c = fs.readFileSync('E:/节奏听辨生成器/rhythm-trainer/src/App.vue', 'utf8');

// 回退刚才的改动
c = c.replace(
  'input[type=\"number\"], select {',
  'input, select {'
);

// 在 input, select 规则后面单独加一条 number input 的高度限制
c = c.replace(
  '  box-sizing: border-box;\n}\n\n.switch-grid',
  '  box-sizing: border-box;\n}\ninput[type=\"number\"] { height: 42px; }\n\n.switch-grid'
);

fs.writeFileSync('E:/节奏听辨生成器/rhythm-trainer/src/App.vue', c, 'utf8');
console.log('OK');
