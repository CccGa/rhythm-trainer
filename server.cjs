const express = require('express');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3000;

// 解析 JSON
app.use(express.json());

// 托管前端静态文件
app.use(express.static(path.join(__dirname, 'dist')));

// 使用正则匹配所有路由，避免 PathError
app.get(/(.*)/, (req, res) => {
    res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.listen(PORT, () => {
    console.log('Server is running on port ' + PORT);
});
