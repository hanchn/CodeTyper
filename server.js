import express from 'express';
import fs from 'fs';
import path from 'path';
import detect from 'detect-port';
import chalk from 'chalk';
import open from 'open';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const app = express();
const DEFAULT_PORT = 3000;

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

app.use(express.static(__dirname));

// 新增API：获取所有代码文件列表
app.get('/api/files', (req, res) => {
  const codeDir = path.join(__dirname, 'code');
  fs.readdir(codeDir, (err, files) => {
    if (err) {
      console.error('读取代码目录失败:', err);
      return res.status(500).send('无法读取代码文件');
    }
    // 过滤掉非代码文件（如.bak, .tmp等）
    const codeFiles = files.filter(file => 
      !file.startsWith('.') && 
      !file.endsWith('.bak') && 
      !file.endsWith('.tmp')
    );
    res.json(codeFiles);
  });
});

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

detect(DEFAULT_PORT).then(_port => {
  if (DEFAULT_PORT !== _port) {
    console.log(chalk.yellow(`⚠️ 端口 ${DEFAULT_PORT} 被占用，使用端口 ${_port}`));
  }
  app.listen(_port, async () => {
    const url = `http://localhost:${_port}`;
    const fullUrl = `${url}/?code=example.js&fontSize=16&speed=60&lineHeight=1.6&loop=false`;

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
