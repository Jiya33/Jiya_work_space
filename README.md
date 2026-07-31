# Jiya 智能工作台

> 高效生活 · 智慧管理 | 移动端优先的 PWA 个人工作台
>
> **当前版本：`workspace.1.0`** · 线上地址：https://jiya33.github.io/Jiya_work_space/

## 功能模块

| 模块 | 功能 |
|------|------|
| 📋 **今日看板** | 进度环、Todo 列表、今日消费速记、快速记账浮窗（拍照/相册双入口）、快捷入口 |
| 📚 **英语学习** | 10 个主题单元（短语/句子/段落/对话/口语提示）、浏览器 TTS 朗读、语速调节、中英切换、影子跟读、逐条收藏、单元打卡、月度日历、随机复习 |
| 🏃 **运动计划** | 周循环计划编辑、快速打卡、本周统计、7 天趋势柱状图、5 套训练指南（热身/动作/放松/常见错误）、视频库（B站/YouTube 链接内嵌 + 本地视频存 IndexedDB） |
| 💰 **财务管理** | 完整记账（图片压缩、拍照/相册双入口、图片单独删除）、分类统计与 Canvas 图表、搜索筛选、JSON 备份导出 |
| 🤖 **AI 资讯** | 11 个内置免费 RSS 源自动采集（多 CORS 代理 fallback）、关键词四分类、已读/收藏、搜索、手动添加、link 去重、30 天自动清理、一键转存飞书 / 复制 Markdown 到腾讯文档 |
| 🎯 **专注模式** | 可配置时长（5-120min）、Web Audio 实时合成柴火燃烧声（低频轰鸣 + 随机噼啪爆裂）、音量实时调节、震动 + 提示音结束提醒、标题栏倒计时 |
| 📦 **历史归档** | 已完成 Todo 按月份/来源分组查看、搜索筛选 |
| ⚙️ **设置** | 飞书应用配置、资讯源管理（内置源开关 + 自定义 RSS）、腾讯文档入口、大模型 API 配置、数据导入导出 |

## 技术栈

- **框架**: Vue 3 + TypeScript + Vite
- **路由**: Vue Router 4（Hash 模式，适配 GitHub Pages）
- **存储**: IndexedDB v2（本地全量数据）+ 飞书多维表格（可选云端归档）
- **资讯采集**: 纯前端 RSS/Atom 解析（DOMParser）+ 公共 CORS 代理多路 fallback
- **语音**: Web Speech API（`speechSynthesis`）
- **音效**: Web Audio API 程序化合成
- **样式**: 纯 CSS 变量、移动端优先、跟随系统深色/浅色主题
- **PWA**: Web App Manifest + Service Worker

## 数据结构

### IndexedDB（本地，DB_VERSION = 2）
- `learning_records` — 英语学习记录
- `sport_records` — 运动记录
- `sport_plans` — 运动周计划
- `sport_videos` — 运动视频（链接或本地 Blob）
- `expenses` — 账单记录（含压缩图片 Base64）
- `todo_items` — 待办事项
- `news_items` — AI 资讯（索引：link、category）
- `settings` — 应用配置

### 飞书多维表格（云端，可选）
- `ai_news` — 手动转存的优质资讯（字段：标题、链接、摘要、分类、创建时间）

## 快速开始

```bash
npm install      # 安装依赖
npm run dev      # 开发模式
npm run build    # 构建（含 vue-tsc 类型检查）
npm run preview  # 预览构建结果
```

## 部署

```bash
./deploy.sh <GitHub_Token>
```

脚本会依次：构建 → 推送 `main` → 强推 `dist` 到 `gh-pages` → 调 API 触发 Pages 重建。

GitHub Pages 源已设为 **gh-pages 分支**，`base` 路径为 `/Jiya_work_space/`，SPA 回退依赖 `404.html` + Hash 路由。

## AI 资讯采集说明

内置源包含：量子位、机器之心、爱范儿、36氪、人人都是产品经理、少数派、InfoQ、OpenAI Blog、Google AI Blog、Hacker News、GitHub Trending。

由于浏览器跨域限制，抓取经由公共 CORS 代理（allorigins / codetabs / corsproxy.io / thingproxy）依次尝试。若某个源长期失败，可在「设置 → 资讯源管理」中关闭它或替换为其他 RSS 地址。

## 飞书配置（可选，仅用于转存）

1. 在[飞书开放平台](https://open.feishu.cn/app)创建企业自建应用，添加 `bitable:app` 权限
2. 新建多维表格并创建 `ai_news` 表（字段见上方数据结构）
3. 从 URL `/apps/xxx/` 取 **app_token**，从表格高级权限取 **table_id**
4. 在「设置」页填入并测试连接

## 安全提示 ⚠️

飞书 App Secret 与大模型 API Key 存储在浏览器本地 IndexedDB。
**此方案仅适用于个人使用/私有部署场景。** 建议使用仅限本人的自建应用并授予最小权限；如需生产环境使用，请自建代理网关。

## 项目结构

```
src/
├── main.ts                 # 应用入口
├── App.vue                 # 主布局（侧边栏 + 主内容区）
├── types/index.ts          # TypeScript 类型定义
├── router/index.ts         # 路由配置
├── data/
│   ├── english.ts          # 10 个英语主题单元教材
│   └── sport.ts            # 5 套训练指南 + 视频链接工具
├── services/
│   ├── db.ts               # IndexedDB 封装（Promise 风格）
│   ├── news.ts             # RSS 采集、解析、分类、Markdown 导出
│   ├── feishu.ts           # 飞书 API（含 Token 自动刷新）
│   └── image.ts            # 图片压缩
├── utils/format.ts         # 工具函数
├── views/
│   ├── Dashboard.vue       # 今日看板
│   ├── English.vue         # 英语学习
│   ├── Sport.vue           # 运动计划
│   ├── Finance.vue         # 财务管理
│   ├── AiNews.vue          # AI 资讯
│   ├── FocusMode.vue       # 专注模式
│   ├── HistoryArchive.vue  # 历史归档
│   └── Settings.vue        # 设置
└── assets/global.css       # 全局样式
```

## 变更日志

见 [CHANGELOG.md](./CHANGELOG.md)。
