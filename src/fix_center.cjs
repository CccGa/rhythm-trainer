const fs = require('fs');
let c = fs.readFileSync('E:/节奏听辨生成器/rhythm-trainer/src/App.vue', 'utf8');

const oldX = "      scoreTranslateX.value = Math.max(0, (paper.clientWidth - scoreContentWidth.value * scoreScale.value) / 2)";
const newX = "      var _ms=scoreEl.value?scoreEl.value.querySelector(\"svg\"):null;var _sw=_ms?(Number(_ms.getAttribute(\"width\"))||_ms.getBoundingClientRect().width||scoreContentWidth.value):scoreContentWidth.value;scoreTranslateX.value=Math.max(0,(paper.clientWidth-_sw*scoreScale.value)/2)";

const oldY = "      scoreTranslateY.value = Math.max(0, (paper.clientHeight - scoreContentHeight.value * scoreScale.value) / 2)";
const newY = "      var _ms2=scoreEl.value?scoreEl.value.querySelector(\"svg\"):null;var _sh=_ms2?(Number(_ms2.getAttribute(\"height\"))||_ms2.getBoundingClientRect().height||scoreContentHeight.value):scoreContentHeight.value;scoreTranslateY.value=Math.max(0,(paper.clientHeight-_sh*scoreScale.value)/2)";

console.log('Match X:', c.includes(oldX));
console.log('Match Y:', c.includes(oldY));
c = c.replace(oldX, newX);
c = c.replace(oldY, newY);
fs.writeFileSync('E:/节奏听辨生成器/rhythm-trainer/src/App.vue', c, 'utf8');
console.log('OK');
