const fs = require('fs');
const path = 'E:/节奏听辨生成器/rhythm-trainer/src/App.vue';
let c = fs.readFileSync(path, 'utf8');

// exportAudioFile: 参考音（A4 + 音高预览）
c = c.replace(
  '    exportSynth.triggerAttackRelease(\'A4\', 3, cursor); cursor += 3\n    if (selectedPitches.value.length > 1) {',
  '    if (useReference.value) {\n      exportSynth.triggerAttackRelease(\'A4\', 3, cursor); cursor += 3\n      if (selectedPitches.value.length > 1) {'
);

// exportAudioFile: 参考音结束 + 预备拍开始
c = c.replace(
  '      cursor += 1\n    }\n    for (let t = 0; t < fullBarSeconds() * 2; t += clickStepSeconds()) click.triggerAttackRelease(\'C6\', \'32n\', cursor + t)\n    cursor += fullBarSeconds() * 2',
  '      cursor += 1\n    }\n    }\n    if (useCountIn.value) {\n      for (let t = 0; t < fullBarSeconds() * 2; t += clickStepSeconds()) click.triggerAttackRelease(\'C6\', \'32n\', cursor + t)\n      cursor += fullBarSeconds() * 2\n    }'
);

fs.writeFileSync(path, c, 'utf8');
console.log('OK');
