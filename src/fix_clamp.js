const fs = require('fs');
const path = 'E:\\节奏听辨生成器\\rhythm-trainer\\src\\App.vue';
let content = fs.readFileSync(path, 'utf8');
const nl = '\n';

const old1 = '    const margin = 150' + nl + '    const totalW = scoreContentWidth.value * scoreScale.value' + nl + '    const totalH = scoreContentHeight.value * scoreScale.value' + nl + '    const gapW = Math.max(margin, (paper.clientWidth - totalW) / 2)' + nl + '    const gapH = Math.max(margin, (paper.clientHeight - totalH) / 2)' + nl + '    const minX = -(totalW + gapW - paper.clientWidth)' + nl + '    const maxX = gapW' + nl + '    const minY = -(totalH + gapH - paper.clientHeight)' + nl + '    const maxY = gapH';
const new1 = '    const sc = scoreScale.value' + nl + '    const tw = scoreContentWidth.value * sc' + nl + '    const th = scoreContentHeight.value * sc' + nl + '    const minX = (50 - tw) / sc' + nl + '    const maxX = (paper.clientWidth - 50) / sc' + nl + '    const minY = (100 - th) / sc' + nl + '    const maxY = (paper.clientHeight - 100) / sc';
content = content.replace(old1, new1);

const old2 = '  const margin = 150' + nl + '  const totalW = scoreContentWidth.value * scoreScale.value' + nl + '  const totalH = scoreContentHeight.value * scoreScale.value' + nl + '  const gapW = Math.max(margin, (paper.clientWidth - totalW) / 2)' + nl + '  const gapH = Math.max(margin, (paper.clientHeight - totalH) / 2)' + nl + '  const minX = -(totalW + gapW - paper.clientWidth)' + nl + '  const maxX = gapW' + nl + '  const minY = -(totalH + gapH - paper.clientHeight)' + nl + '  const maxY = gapH';
const new2 = '  const sc = scoreScale.value' + nl + '  const tw = scoreContentWidth.value * sc' + nl + '  const th = scoreContentHeight.value * sc' + nl + '  const minX = (50 - tw) / sc' + nl + '  const maxX = (paper.clientWidth - 50) / sc' + nl + '  const minY = (100 - th) / sc' + nl + '  const maxY = (paper.clientHeight - 100) / sc';
content = content.replace(old2, new2);

content = content.replace('let scoreMouseDown = false', 'function clampStaff(){var p=scorePaperEl.value;if(!p)return;var sc=scoreScale.value;var pw=p.clientWidth;var ph=p.clientHeight;var tw=scoreContentWidth.value*sc;var th=scoreContentHeight.value*sc;var x=scoreTranslateX.value;var y=scoreTranslateY.value;var ix=(50-tw)/sc;var mx=(pw-50)/sc;var iy=(100-th)/sc;var my=(ph-100)/sc;if(x<ix)x=ix;if(x>mx)x=mx;if(y<iy)y=iy;if(y>my)y=my;scoreTranslateX.value=x;scoreTranslateY.value=y}' + nl + 'let scoreMouseDown = false');

content = content.replace('  scoreScale.value = newScale' + nl + '}', '  scoreScale.value = newScale' + nl + '  clampStaff()' + nl + '}');
content = content.replace('    scoreScale.value = newScale' + nl + '    return', '    scoreScale.value = newScale' + nl + '    clampStaff()' + nl + '    return');
content = content.replace('    scoreTranslateY.value = Math.max(minY, Math.min(maxY, scoreGesture.startTranslateY + (touch.clientY - scoreGesture.startY)))' + nl + '  }' + nl + '}', '    scoreTranslateY.value = Math.max(minY, Math.min(maxY, scoreGesture.startTranslateY + (touch.clientY - scoreGesture.startY)))' + nl + '    clampStaff()' + nl + '  }' + nl + '}');
content = content.replace('  scoreTranslateY.value = Math.max(minY, Math.min(maxY, scoreMouseStartTY + (e.clientY - scoreMouseStartY)))' + nl + 'function handleScoreMouseUp', '  scoreTranslateY.value = Math.max(minY, Math.min(maxY, scoreMouseStartTY + (e.clientY - scoreMouseStartY)))' + nl + '  clampStaff()' + nl + 'function handleScoreMouseUp');

fs.writeFileSync(path, content, 'utf8');
console.log('Done.');
const v = fs.readFileSync(path, 'utf8');
console.log('margin=150:', v.includes('const margin = 150'));
console.log('clampStaff count:', (v.match(/clampStaff/g) || []).length);
