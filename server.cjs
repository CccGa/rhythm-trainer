
const fs = require('fs');
const path = require('path');

// 打印当前目录下有什么文件，方便我们看 dist 文件夹在不在
console.log('--- 当前目录下的文件列表 ---');
console.log(fs.readdirSync(__dirname)); 
console.log('--------------------------');

// 保持你原来的设置
app.use(express.static(path.join(__dirname, 'dist')));
const express = require('express');
const fs = require('fs');
const path = require('path');
const cors = require('cors');
const MidiWriter = require('midi-writer-js'); // 引入 MIDI 库

const app = express();
app.use(cors());
app.use(express.json({ limit: '10mb' }));

app.post('/save-midi', (req, res) => {
    const rhythmData = req.body.data;
    if (!rhythmData || !Array.isArray(rhythmData)) return res.status(400).send('数据格式错误');

    // 1. 创建 MIDI 音轨
    const track = new MidiWriter.Track();
    
    // 2. 将你的节奏数据转换为 MIDI 音符
    rhythmData.forEach(item => {
        // 假设 duration 'q' 对应 MIDI 的 4分音符
        const pitch = item.tone; // 例如 "D4"
        const duration = item.duration === 'q' ? '4' : '2'; 
        
        track.addEvent(new MidiWriter.NoteEvent({
            pitch: [pitch],
            duration: duration
        }));
    });

    // 3. 写出文件
    const write = new MidiWriter.Writer(track);
    const buffer = Buffer.from(write.buildFile(), 'binary');
    const filePath = path.join(__dirname, 'public', 'score.mid');

    fs.writeFile(filePath, buffer, (err) => {
        if (err) return res.status(500).send('保存失败');
        res.send('成功保存为 MIDI');
    });
});

app.listen(3001, () => console.log('服务已启动，支持 MIDI 生成'));