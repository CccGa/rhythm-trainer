const fs = require('fs');
const path = 'E:/节奏听辨生成器/rhythm-trainer/src/App.vue';
let c = fs.readFileSync(path, 'utf8');

// 移除 cursor = playElapsed.value 的改动（回退到 cursor = 0）
c = c.replace(
  '  let cursor = playElapsed.value\n  if (useReference.value) {',
  '  let cursor = 0\n  if (useReference.value) {'
);

// togglePlayback: 暂停时记录 elapsed，恢复时传偏移给 startPlayback
c = c.replace(
  'async function togglePlayback() {\n  if (isPlaying.value) {\n    playElapsed.value = (Date.now() - playStartTime) / 1000\n    stopPlayback()\n    return\n  }\n  await startPlayback()\n}',
  'async function togglePlayback() {\n  if (isPlaying.value) {\n    playElapsed.value = (Date.now() - playStartTime) / 1000\n    stopPlayback()\n    statusMessage.value = \'已暂停。\'\n    return\n  }\n  await startPlayback(playElapsed.value)\n}'
);

// startPlayback 接收 elapsedOffs 参数
c = c.replace(
  'async function startPlayback() {\n  if (!hasQuestion.value) return\n  stopPlayback()\n  await Tone.start()\n  await Tone.loaded()\n  playStartTime = Date.now()\n  isPlaying.value = true\n  statusMessage.value = \'正在播放。\'\n\n  let cursor = 0',
  'async function startPlayback(elOffs) {\n  if (!hasQuestion.value) return\n  stopPlayback()\n  await Tone.start()\n  await Tone.loaded()\n  playStartTime = Date.now() - (elOffs||0) * 1000\n  isPlaying.value = true\n  statusMessage.value = \'正在播放。\'\n\n  let cursor = 0\n  var _delay = function(d){return Math.max(0,d-(elOffs||0))}'
);

// 替换 startPlayback 内所有 scheduleTimer 的 delay 参数
// scheduleTimer(cb, cursor) → scheduleTimer(cb, _delay(cursor))
// 但这影响所有函数里的 scheduleTimer... 

// 换个方式：改为用 _st 包装
c = c.replace(
  '  var _delay = function(d){return Math.max(0,d-(elOffs||0))}',
  '  var _st = (elOffs||0)>0 ? function(cb,d){if(d<elOffs)return;scheduleTimer(cb,d-elOffs)} : scheduleTimer'
);

// 在 startPlayback 内，把 scheduleTimer( 替换为 _st(
// 用笨办法逐个替换 — 但是外面 exportAudioFile 也有 scheduleTimer，不能全局替换
// 最好的方法：重新写 startPlayback，把该函数体里的 scheduleTimer 替换

fs.writeFileSync(path, c, 'utf8');
console.log('OK');
