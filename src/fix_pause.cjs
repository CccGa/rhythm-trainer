const fs = require('fs');
const path = 'E:/节奏听辨生成器/rhythm-trainer/src/App.vue';
let c = fs.readFileSync(path, 'utf8');

// 1. 增加 playElapsed ref（跟踪已播放的时长）
c = c.replace(
  'const isPlaying = ref(false)',
  'const isPlaying = ref(false)\nconst playElapsed = ref(0)'
);

// 2. togglePlayback: 暂停时记录 elapsed，恢复时重调度
c = c.replace(
  'async function togglePlayback() {\n  if (isPlaying.value) { stopPlayback(); return }\n  await startPlayback()\n}',
  'async function togglePlayback() {\n  if (isPlaying.value) {\n    playElapsed.value = (Date.now() - playStartTime) / 1000\n    stopPlayback()\n    return\n  }\n  await startPlayback()\n}'
);

// 3. startPlayback: 在开头记录开始时间，重置 elapsed（如果是新播放）
// 加 playStartTime 变量
c = c.replace(
  '  isPlaying.value = true\n  statusMessage.value = \'正在播放。\'',
  '  playStartTime = Date.now()\n  isPlaying.value = true\n  statusMessage.value = \'正在播放。\''
);

// 4. 在 let cursor = 0 之后，如果有 playElapsed，将 cursor 前移
c = c.replace(
  '  let cursor = 0\n  if (useReference.value) {',
  '  let cursor = playElapsed.value\n  if (useReference.value) {'
);

// 5. stopPlayback 重置 playElapsed（停止而非暂停时）
c = c.replace(
  'function stopPlayback() {\n  stopTimers.forEach((id) => window.clearTimeout(id))\n  stopTimers = []\n  isPlaying.value = false\n}',
  'function stopPlayback() {\n  stopTimers.forEach((id) => window.clearTimeout(id))\n  stopTimers = []\n  isPlaying.value = false\n}\n\nfunction resetPlayback() {\n  stopPlayback()\n  playElapsed.value = 0\n}'
);

// 6. 在模板中停止按钮调 resetPlayback
c = c.replace(
  '        <button class=\"danger-button\" @click=\"stopPlayback\" :disabled=\"!isPlaying\">停止</button>',
  '        <button class=\"danger-button\" @click=\"resetPlayback\" :disabled=\"!isPlaying\">停止</button>'
);

// 7. 重置 playElapsed 的场景：生成题目时、播放完成时
c = c.replace(
  '  scheduleTimer(() => { isPlaying.value = false; statusMessage.value = \'播放完成。\' }, questionCursor + 0.2)',
  '  scheduleTimer(() => { isPlaying.value = false; playElapsed.value = 0; statusMessage.value = \'播放完成。\' }, questionCursor + 0.2)'
);

// 8. 加 playStartTime 全局变量声明
c = c.replace(
  'let stopTimers = []',
  'let stopTimers = []\nlet playStartTime = 0'
);

// 9. 生成题目时重置 playElapsed
c = c.replace(
  'hasQuestion.value = false\n  hasGenerated.value = true',
  'hasQuestion.value = false\n  hasGenerated.value = true\n  playElapsed.value = 0'
);

fs.writeFileSync(path, c, 'utf8');
console.log('OK');
