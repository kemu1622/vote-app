# 路遥歌手第三轮选拔赛 - 投票系统

这是一个现场活动投票大屏系统，支持微信扫码投票、实时结果展示。

## 功能特点

- 📱 **微信扫码投票**：用户通过微信扫描大屏二维码即可投票
- 🔒 **防重复投票**：每人限投一票（基于token机制）
- 📊 **实时结果展示**：大屏实时显示投票结果和排名
- 🎨 **炫酷UI设计**：深色渐变背景 + 粒子动画 + 流光进度条

## 本地开发

### 安装依赖
```bash
npm install
```

### 启动服务器
```bash
npm start
```

访问：`http://localhost:3000`

## 部署到 Vercel

### 1. 上传代码到 GitHub
```bash
# 初始化Git仓库
git init

# 添加所有文件
git add .

# 提交
git commit -m "初始提交"

# 关联GitHub仓库（替换成你的仓库地址）
git remote add origin https://github.com/你的用户名/vote-app.git

# 推送
git push -u origin main
```

### 2. 部署到 Vercel
1. 访问 [vercel.com](https://vercel.com)
2. 用 GitHub 账号登录
3. 点击 "New Project"
4. 选择你的 `vote-app` 仓库
5. 点击 "Deploy"

部署完成后，获得永久免费域名（比如 `vote-app.vercel.app`）

## 自定义配置

编辑 `config.json` 文件：

```json
{
  "title": "路遥歌手第三轮选拔赛",
  "subtitle": "为你喜欢的歌手投上宝贵一票",
  "maxVotes": 1,
  "options": [
    { "id": 1, "name": "选手1", "desc": "待定", "color": "#FF6B6B" },
    { "id": 2, "name": "选手2", "desc": "待定", "color": "#4ECDC4" },
    { "id": 3, "name": "选手3", "desc": "待定", "color": "#45B7D1" },
    { "id": 4, "name": "选手4", "desc": "待定", "color": "#FFA07A" },
    { "id": 5, "name": "选手5", "desc": "待定", "color": "#98D8C8" }
  ]
}
```

修改后重新部署即可。

## 技术栈

- **前端**：HTML + CSS + JavaScript（无框架）
- **后端**：Node.js + Express（本地开发）/ Vercel Serverless Functions（生产环境）
- **数据存储**：内存存储（本地开发）/ `votes.json` 文件（Vercel）

## 注意事项

⚠️ **Vercel 限制**：
- `votes.json` 文件在 Vercel 上是**临时存储**，每次部署会重置
- 如果需要永久存储投票数据，建议使用 Vercel KV 或其他数据库

##  License

MIT
