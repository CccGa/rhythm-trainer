const fs = require('fs');
const path = 'E:/节奏听辨生成器/rhythm-trainer/src/App.vue';
let c = fs.readFileSync(path, 'utf8');

// Replace clampStaff with edge-gap version
const oldClamp = 'function clampStaff(){var p=scorePaperEl.value;if(!p)return;var s=scoreEl.value;if(!s)return;var svg=s.querySelector("svg");if(!svg)return;var sw=Number(svg.getAttribute("width"))||svg.getBoundingClientRect().width||scoreContentWidth.value;var sh=Number(svg.getAttribute("height"))||svg.getBoundingClientRect().height||scoreContentHeight.value;var sc=scoreScale.value;var tw=sw*sc;var th=sh*sc;var pw=p.clientWidth;var ph=p.clientHeight;var x=scoreTranslateX.value;var y=scoreTranslateY.value;var gap=80;var vgap=120;var cx=pw/2;var cy=ph/2;if(tw>pw-gap*2){x=cx-tw/2}else{var minX=gap-tw;var maxX=pw-gap;var lx=x;if(lx<minX)lx=minX;if(lx>maxX)lx=maxX;x=lx}if(th>ph-vgap*2){y=cy-th/2}else{var minY=vgap-th;var maxY=ph-vgap;var ly=y;if(ly<minY)ly=minY;if(ly>maxY)ly=maxY;y=ly}scoreTranslateX.value=x;scoreTranslateY.value=y}';

const newClamp = 'function clampStaff(){var p=scorePaperEl.value;if(!p)return;var s=scoreEl.value;if(!s)return;var svg=s.querySelector("svg");if(!svg)return;var sw=Number(svg.getAttribute("width"))||svg.getBoundingClientRect().width||scoreContentWidth.value;var sh=Number(svg.getAttribute("height"))||svg.getBoundingClientRect().height||scoreContentHeight.value;var sc=scoreScale.value;var tw=sw*sc;var th=sh*sc;var pw=p.clientWidth;var ph=p.clientHeight;var x=scoreTranslateX.value;var y=scoreTranslateY.value;var gap=80;var vgap=120;var minX=gap;var maxX=pw-gap-tw;if(minX>maxX){var cx=pw/2;x=cx-tw/2}else{if(x<minX)x=minX;if(x>maxX)x=maxX}var minY=vgap;var maxY=ph-vgap-th;if(minY>maxY){var cy=ph/2;y=cy-th/2}else{if(y<minY)y=minY;if(y>maxY)y=maxY}scoreTranslateX.value=x;scoreTranslateY.value=y}';

console.log('Match:', c.includes(oldClamp));
c = c.replace(oldClamp, newClamp);

fs.writeFileSync(path, c, 'utf8');
const v = fs.readFileSync(path, 'utf8');
console.log('new:', v.includes('var minX=gap'));
