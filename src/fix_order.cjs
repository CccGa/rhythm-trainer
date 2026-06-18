const fs = require('fs');
const path = 'E:/节奏听辨生成器/rhythm-trainer/src/App.vue';
let c = fs.readFileSync(path, 'utf8');

c = c.replace(
  '<label><input v-model=\"useCountIn\" type=\"checkbox\" /> 预备拍</label>\n        <label><input v-model=\"useReference\" type=\"checkbox\" /> 参考音</label>\n        <label><input v-model=\"useMetronome\" type=\"checkbox\" /> 节拍器</label>\n        <label><input v-model=\"showPitchPreview\" type=\"checkbox\" /> 音高预览</label>',
  '<label><input v-model=\"useMetronome\" type=\"checkbox\" /> 节拍器</label>\n        <label><input v-model=\"useCountIn\" type=\"checkbox\" /> 预备拍</label>\n        <label><input v-model=\"useReference\" type=\"checkbox\" /> 参考音</label>\n        <label><input v-model=\"showPitchPreview\" type=\"checkbox\" /> 音高预览</label>'
);

fs.writeFileSync(path, c, 'utf8');
console.log('OK');
