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
    // 只过滤掉隐藏文件和临时文件
    const codeFiles = files.filter(file => 
      !file.startsWith('.') && 
      !file.endsWith('.bak') && 
      !file.endsWith('.tmp')
    );
    res.json(codeFiles);
  });
});

app.get('/api/code', (req, res) => {
  const codeDir = path.join(__dirname, 'code');
  const requestedFile = req.query.file;

  fs.readdir(codeDir, (err, files) => {
    if (err) {
      console.error('读取代码目录失败:', err);
      return res.status(500).send('无法读取代码文件');
    }

    // 过滤有效文件
    const validFiles = files.filter(file => 
      !file.startsWith('.') && 
      !file.endsWith('.bak') && 
      !file.endsWith('.tmp')
    );

    // 如果没有指定文件或文件不存在，使用第一个有效文件
    const fileToRead = requestedFile && validFiles.includes(requestedFile) 
      ? requestedFile 
      : validFiles[0];

    if (!fileToRead) {
      return res.status(404).send('目录中没有可用的文件');
    }

    const filePath = path.join(codeDir, fileToRead);
    
    // 根据文件扩展名设置正确的Content-Type
    const ext = path.extname(fileToRead).toLowerCase();
    switch (ext) {
      case '.html':
        res.type('text/html');
        break;
      case '.css':
        res.type('text/css');
        break;
      case '.js':
        res.type('application/javascript');
        break;
      default:
        res.type('text/plain');
    }

    fs.readFile(filePath, 'utf8', (err, data) => {
      if (err) {
        console.error(`读取文件失败：${fileToRead}`, err);
        return res.status(500).send('读取文件失败');
      }
      res.send(data);
    });
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
