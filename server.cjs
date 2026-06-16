<<<<<<< HEAD
const express = require('express');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3000;

// 解析 JSON
app.use(express.json());

// 托管前端静态文件
app.use(express.static(path.join(__dirname, 'dist')));

// 核心修改：将 '*' 换成 /(.*)/，这是正则表达式，专门用来捕获所有路径
app.get(/(.*)/, (req, res) => {
    res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.listen(PORT, () => {
    console.log('Server is running on port ' + PORT);
=======
const express = require('express');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3000;

// 解析 JSON
app.use(express.json());

// 托管前端静态文件
app.use(express.static(path.join(__dirname, 'dist')));

// 核心修改：将 '*' 换成 /(.*)/，这是正则表达式，专门用来捕获所有路径
app.get(/(.*)/, (req, res) => {
    res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.listen(PORT, () => {
    console.log('Server is running on port ' + PORT);
>>>>>>> c52144e88f2078c98968d21f39f341377a03fec9
});