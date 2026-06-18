const fs = require('fs');
let c = fs.readFileSync('E:/节奏听辨生成器/rhythm-trainer/src/App.vue', 'utf8');

// 交换顺序：把 @media (min-width: 1300px) 移到 switch-grid 基线的后面
// 把基线用 repeat(2, 1fr)，1300px 规则放后面覆盖
c = c.replace(
  '@media (min-width: 1300px) {\n  .switch-grid { grid-template-columns: repeat(4, 1fr); gap: 28px; max-width: 640px; }\n}\n\n@media (max-width: 720px) {',
  '@media (max-width: 720px) {'
);

// 把 1300px 规则加到 switch-grid 基线后面
// 找到 .switch-grid 基线的结束花括号，在它后面插入
c = c.replace(
  '  margin-right: auto;\n}\n\n.switch-grid label',
  '  margin-right: auto;\n}\n\n@media (min-width: 1300px) {\n  .switch-grid { grid-template-columns: repeat(4, 1fr); gap: 28px; max-width: 640px; }\n}\n\n.switch-grid label'
);

fs.writeFileSync('E:/节奏听辨生成器/rhythm-trainer/src/App.vue', c, 'utf8');
console.log('OK');
