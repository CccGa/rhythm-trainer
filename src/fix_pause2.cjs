const fs = require('fs');
const path = 'E:/节奏听辨生成器/rhythm-trainer/src/App.vue';
let c = fs.readFileSync(path, 'utf8');

// 恢复 scheduleTimer 为原始版本
c = c.replace(
  'function scheduleTimer(callback, delay) {\n  const adjusted = Math.max(0, delay - playElapsed.value)\n  if (adjusted <= 0 && delay > 0) return\n  if (delay > 0) {\n    const id = window.setTimeout(callback, adjusted * 1000)\n    stopTimers.push(id)\n  } else {\n    const id = window.setTimeout(callback, 0)\n    stopTimers.push(id)\n  }\n}',
  'function scheduleTimer(callback, delay) {\n  const id = window.setTimeout(callback, delay * 1000)\n  stopTimers.push(id)\n}'
);

// 新的方案：startPlayback 接受一个 elapsedOffs 参数
// togglePlayback 调用 startPlayback(playElapsed.value)
// startPlayback(elapsedOffs) 用 elapsedOffs 偏移所有定时器

// 1. togglePlayback
c = c.replace(
  '  await startPlayback()',
  '  await startPlayback(playElapsed.value)'
);

// 2. startPlayback(elapsedOffs) 接收参数
c = c.replace(
  'async function startPlayback() {\n  if (!hasQuestion.value) return\n  stopPlayback()',
  'async function startPlayback(elapsedOffs) {\n  if (!hasQuestion.value) return\n  stopPlayback()'
);

// 3. 所有 scheduleTimer 的 delay 改为加上 elapsedOffs
// 用重写的方式：把 startPlayback 里所有 scheduleTimer 替换为偏移版本
// 但简单的方式是：让 cursor 始终从 0 开始，但 scheduleTimer 的 delay 参数都加 elapsedOffs
// 最简单：用一个临时变量来包装 scheduleTimer
// 在 startPlayback 开头：const _st = (cb, d) => scheduleTimer(cb, d + elapsedOffs)
// 然后将所有 scheduleTimer 调用替换为 _st

c = c.replace(
  '  await Tone.loaded()\n  isPlaying.value = true\n  statusMessage.value = \'正在播放。\'',
  '  await Tone.loaded()\n  playStartTime = Date.now() - elapsedOffs * 1000\n  isPlaying.value = true\n  statusMessage.value = \'正在播放。\''
);

// 4. 在 startPlayback 开头定义 _st 包装
// 需要放在 isPlaying 下面的位置，在第一个 scheduleTimer 之前
c = c.replace(
  '  isPlaying.value = true\n  statusMessage.value = \'正在播放。\'\n\n  let cursor = 0',
  '  isPlaying.value = true\n  statusMessage.value = \'正在播放。\'\n  var _st = elapsedOffs > 0 ? function(cb,d){if(d<elapsedOffs)return;scheduleTimer(cb,d-elapsedOffs)} : scheduleTimer\n\n  let cursor = 0'
);

// 5. 将所有 scheduleTimer( 替换为 _st(
// 只替换 startPlayback 函数体内的部分 — 用范围替换
// 实际上 startPlayback 函数体内所有的 scheduleTimer 调用，只有这一处
// 但外面也有 scheduleTimer（exportAudioFile 里），不能全局替换

// 改为：在 startPlayback 内将 scheduleTimer 重命名为 _st，外部的不受影响
// 上面的 _st 已经定义了，但函数体里还用的 scheduleTimer
// 全局替换 scheduleTimer( -> _st( 在 startPlayback 内，但不影响其他函数
// 这个不好做，不如直接把 startPlayback 内所有的 scheduleTimer 逐个替换

// 简单方案：只改变 togglePlayback，保留 startPlayback 原有结构
// 当 resume 时重新调度全部事件，用 playElapsed 偏移所有时间

// 移除上面的 _st 定义
c = c.replace(
  '  var _st = elapsedOffs > 0 ? function(cb,d){if(d<elapsedOffs)return;scheduleTimer(cb,d-elapsedOffs)} : scheduleTimer\n\n  let cursor = 0',
  ''
);

// 回退 togglePlayback 到直接传 0
c = c.replace(
  '  await startPlayback(playElapsed.value)',
  '  await startPlayback(0)'
);

// 回退 startPlayback 签名
c = c.replace(
  'async function startPlayback(elapsedOffs)',
  'async function startPlayback()'
);

// 回退 playStartTime 计算
c = c.replace(
  '  playStartTime = Date.now() - elapsedOffs * 1000\n  isPlaying.value = true',
  '  playStartTime = Date.now()\n  isPlaying.value = true'
);

fs.writeFileSync(path, c, 'utf8');
console.log('OK');
