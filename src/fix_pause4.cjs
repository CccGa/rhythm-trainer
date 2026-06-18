const fs = require('fs');
const path = 'E:/节奏听辨生成器/rhythm-trainer/src/App.vue';
let c = fs.readFileSync(path, 'utf8');

// 先回到干净的 base：移除所有之前尝试的残留
// 保留 playElapsed ref 和 playStartTime/stopTimers
// 但回退 togglePlayback, startPlayback, scheduleTimer 为核心干净版本

// 1. scheduleTimer 改为带偏移感知
c = c.replace(
  'function scheduleTimer(callback, delay) {\n  const id = window.setTimeout(callback, delay * 1000)\n  stopTimers.push(id)\n}',
  'function scheduleTimer(callback, delay) {\n  var d = delay\n  if (playElapsed.value > 0) { d -= playElapsed.value; if (d <= 0) { if (d < 0) return; d = 0 } }\n  const id = window.setTimeout(callback, d * 1000)\n  stopTimers.push(id)\n}'
);

// 2. togglePlayback — 暂停时记录 elapsed，恢复时正常调用 startPlayback（因为 scheduleTimer 内部会处理）
c = c.replace(
  'async function togglePlayback() {\n  if (isPlaying.value) {\n    playElapsed.value = (Date.now() - playStartTime) / 1000\n    stopPlayback()\n    statusMessage.value = \'已暂停。\'\n    return\n  }\n  await startPlayback(playElapsed.value)\n}',
  'async function togglePlayback() {\n  if (isPlaying.value) {\n    playElapsed.value = (Date.now() - playStartTime) / 1000\n    stopPlayback()\n    statusMessage.value = \'已暂停。\'\n    return\n  }\n  await startPlayback()\n}'
);

// 3. startPlayback — 去掉 elOffs 参数，回到原始无参版本
c = c.replace(
  'async function startPlayback(elOffs)',
  'async function startPlayback()'
);

// 4. 去掉 _st 定义
c = c.replace(
  '  var _st = (elOffs||0)>0 ? function(cb,d){if(d<elOffs)return;scheduleTimer(cb,d-elOffs)} : scheduleTimer\n\n  let cursor = 0\n  if (useReference.value)',
  '  let cursor = 0\n  if (useReference.value)'
);

// 5. playStartTime 恢复正常
c = c.replace(
  '  playStartTime = Date.now() - (elOffs||0) * 1000\n  isPlaying.value',
  '  playStartTime = Date.now()\n  isPlaying.value'
);

// 6. 当重新生成题目或点击停止时重置 playElapsed
// stopPlayback 只暂停，resetPlayback 是停止
// 已经有的 resetPlayback 会重置 playElapsed

fs.writeFileSync(path, c, 'utf8');
console.log('OK');
