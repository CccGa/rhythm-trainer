const fs = require('fs');
let c = fs.readFileSync('E:/节奏听辨生成器/rhythm-trainer/src/App.vue', 'utf8');

// 在 input, select 规则的大括号后面插入 number input 高度
// 找到规则结尾 (box-sizing: border-box;})
c = c.replace(
  '  box-sizing: border-box;\n}\n\ninput[type=\"range\"] { padding: 0; }',
  '  box-sizing: border-box;\n}\ninput[type=\"number\"] { height: 42px; }\n\ninput[type=\"range\"] { padding: 0; }'
);

fs.writeFileSync('E:/节奏听辨生成器/rhythm-trainer/src/App.vue', c, 'utf8');
console.log('OK');
