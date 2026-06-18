const fs = require('fs');
const path = 'E:/节奏听辨生成器/rhythm-trainer/src/App.vue';
let c = fs.readFileSync(path, 'utf8');

// 1. 在模板的节拍器/音高预览那一栏增加两个checkbox
c = c.replace(
  '        <label><input v-model=\"useMetronome\" type=\"checkbox\" /> 节拍器</label>\n        <label><input v-model=\"showPitchPreview\" type=\"checkbox\" /> 音高预览</label>',
  '        <label><input v-model=\"useCountIn\" type=\"checkbox\" /> 预备拍</label>\n        <label><input v-model=\"useReference\" type=\"checkbox\" /> 参考音</label>\n        <label><input v-model=\"useMetronome\" type=\"checkbox\" /> 节拍器</label>\n        <label><input v-model=\"showPitchPreview\" type=\"checkbox\" /> 音高预览</label>'
);

// 2. 在 script 中增加两个 ref（在 useMetronome 和 showPitchPreview 之前）
c = c.replace(
  'const useMetronome = ref(true)',
  'const useCountIn = ref(true)\nconst useReference = ref(true)\nconst useMetronome = ref(true)'
);

// 3. startPlayback: 参考音（A4提示 + 音高预览）加 useReference 条件判断
// A4 提示音 — 这部分是参考音的一部分
c = c.replace(
  '  scheduleTimer(() => playTone(\'A4\', 3), cursor)\n  cursor += 3\n\n  if (selectedPitches.value.length > 1) {',
  '  if (useReference.value) {\n    scheduleTimer(() => playTone(\'A4\', 3), cursor)\n    cursor += 3\n    if (selectedPitches.value.length > 1) {'
);

c = c.replace(
  '    })\n    cursor += 1\n  }\n\n  const countInSeconds = fullBarSeconds() * 2',
  '    })\n    cursor += 1\n  }\n  }\n\n  const countInSeconds = fullBarSeconds() * 2'
);

// 4. startPlayback: 预备拍加 useCountIn 条件判断
c = c.replace(
  '  const countInSeconds = fullBarSeconds() * 2\n  for (let t = 0; t < countInSeconds; t += clickStepSeconds()) {\n    scheduleTimer(playClick, cursor + t)\n  }\n  cursor += countInSeconds',
  '  let countInSeconds = 0\n  if (useCountIn.value) {\n    countInSeconds = fullBarSeconds() * 2\n    for (let t = 0; t < countInSeconds; t += clickStepSeconds()) {\n      scheduleTimer(playClick, cursor + t)\n    }\n    cursor += countInSeconds\n  }'
);

// 5. exportAudioFile: 参考音部分加 useReference 条件
c = c.replace(
  '    exportSynth.triggerAttackRelease(\'A4\', \'2n\', cursor)\n    cursor += 3\n\n    if (selectedPitches.value.length > 1) {',
  '    if (useReference.value) {\n    exportSynth.triggerAttackRelease(\'A4\', \'2n\', cursor)\n    cursor += 3\n\n    if (selectedPitches.value.length > 1) {'
);

c = c.replace(
  '      })\n      cursor += 1\n    }\n\n    const countInSeconds = fullBarSeconds() * 2',
  '      })\n      cursor += 1\n    }\n    }\n\n    let countInSeconds = 0\n    if (useCountIn.value) {\n      countInSeconds = fullBarSeconds() * 2'
);

// 6. exportAudioFile: 预备拍加 useCountIn 条件（这部分紧接在 countInSeconds 之后）
c = c.replace(
  '    for (let t = 0; t < fullBarSeconds() * 2; t += clickStepSeconds()) click.triggerAttackRelease(\'C6\', \'32n\', cursor + t)\n    cursor += countInSeconds',
  '      for (let t = 0; t < countInSeconds; t += clickStepSeconds()) click.triggerAttackRelease(\'C6\', \'32n\', cursor + t)\n      cursor += countInSeconds\n    }'
);

// 7. 旧版 Tone.Offline 播放里的预备拍（如果有第二个）也加条件
// 检查是否还有另一处 countInSeconds 声明需要调整
const oldExportCountIn = '    let countInSeconds = 0\n    if (useCountIn.value) {\n      countInSeconds = fullBarSeconds() * 2\n      for (let t = 0; t < countInSeconds; t += clickStepSeconds()) click.triggerAttackRelease(\'C6\', \'32n\', cursor + t)\n      cursor += countInSeconds\n    }';

fs.writeFileSync(path, c, 'utf8');
console.log('OK');
