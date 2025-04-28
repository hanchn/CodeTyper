const express = require('express');
const fs = require('fs');
const path = require('path');
const detect = require('detect-port');
const chalk = require('chalk');
const app = express();
const DEFAULT_PORT = 3000;

const open = (...args) => import('open').then(module => module.default(...args));

app.use(express.static(__dirname));

// 读取 /code/ 文件夹
app.get('/api/code', (req, res) => {
  const fileName = req.query.file || 'example.js';
  const filePath = path.join(__dirname, 'code', fileName);

  fs.readFile(filePath, 'utf8', (err, data) => {
    if (err) {
      console.warn(`⚠️ 文件未找到：${fileName}，返回默认内容`);
      return res.send('Hello World !');
    }
    res.send(data);
  });
});

// 检测端口并启动
detect(DEFAULT_PORT).then(_port => {
  if (DEFAULT_PORT !== _port) {
    console.log(chalk.yellow(`⚠️ 端口 ${DEFAULT_PORT} 被占用，使用端口 ${_port}`));
  }
  app.listen(_port, async () => {
    const url = `http://localhost:${_port}`;
    const fullUrl = `${url}/?code=example.js&fontSize=16&speed=60&loop=true`;

    console.log();
    console.log(chalk.cyan('✨ Server started successfully'));
    console.log(chalk.green('🚀 打开浏览器体验吧：') + chalk.underline.blueBright(fullUrl));
    console.log(chalk.yellow('✅ Ready!'));
    console.log();

    await open(fullUrl);
  });
}).catch(err => {
  console.error('端口检测失败:', err);
});
