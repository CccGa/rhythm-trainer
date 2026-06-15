const express = require('express');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;

// 解析 JSON 请求体
app.use(express.json());

// 示例 API 接口
app.post('/save-midi', (req, res) => {
    try {
        const midiData = req.body;
        console.log('收到 MIDI 数据');
        res.status(200).send({ message: 'Success' });
    } catch (error) {
        res.status(500).send({ error: 'Failed' });
    }
});

// 托管前端静态文件
app.use(express.static(path.join(__dirname, 'dist')));

// 路由重定向
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.listen(PORT, () => {
    console.log('Server is running on port ' + PORT);
});