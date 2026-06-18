const fs = require('fs');
const path = 'E:/节奏听辨生成器/rhythm-trainer/src/App.vue';
let c = fs.readFileSync(path, 'utf8');

// 1. scheduleTimer 改为接收一个绝对的 timeOffset，内部减去 playElapsed
//    同时记录每个定时器的 metadata
c = c.replace(
  'function scheduleTimer(callback, delay) {\n  const id = window.setTimeout(callback, delay * 1000)\n  stopTimers.push(id)\n}',
  'function scheduleTimer(callback, delay) {\n  const adjusted = Math.max(0, delay - playElapsed.value)\n  if (adjusted <= 0 && delay > 0) return\n  if (delay > 0) {\n    const id = window.setTimeout(callback, adjusted * 1000)\n    stopTimers.push(id)\n  } else {\n    const id = window.setTimeout(callback, 0)\n    stopTimers.push(id)\n  }\n}'
);

// 2. startPlayback: cursor 从 0 开始（不是 playElapsed）
c = c.replace(
  '  let cursor = playElapsed.value\n  if (useReference.value) {',
  '  let cursor = 0\n  if (useReference.value) {'
);

// 3. startPlayback: 恢复时将 playElapsed 作为偏移传给 startPlayback
// 但 scheduleTimer 已经内部处理了，这里只需要保证 cursor=0 且 scheduleTimer 收到原始 delay

fs.writeFileSync(path, c, 'utf8');
console.log('OK');
