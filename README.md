# Jiya 智能工作台

> 高效生活 · 智慧管理 | 移动端优先的 PWA 个人工作台

## 功能模块

| 模块 | 功能 |
|------|------|
| 📋 **今日看板** | 进度环、Todo 列表、今日消费速记、快速记账浮窗、快捷入口 |
| 📚 **学习与健康** | 英语打卡（月度日历、收藏本、随机复习）、运动计划（周循环设置、记录统计） |
| 💰 **财务管理** | 完整记账（含图片压缩）、分类统计与图表、搜索筛选、JSON 备份导出 |
| 🤖 **AI 产品经理资讯** | 4 分类 Tab（新技术/新产品/新开源/新点子）、对接飞书多维表格 CRUD |
| 🏪 **探店副业** | 素材采集、飞书知识库管理、爆款笔记生成器（LLM + 规则模板）、HTML 内容解析 |
| 🎯 **专注模式** | 可配置时长（5-120min）、粉红噪音、震动 + 提示音结束提醒、标题栏显示倒计时 |
| 📦 **历史归档** | 已完成 Todo 按月份/来源分组查看、搜索筛选 |
| ⚙️ **设置** | 飞书应用配置、大模型 API 配置、数据源配置、数据导入导出 |

## 技术栈

- **框架**: Vue 3 + TypeScript + Vite
- **路由**: Vue Router 4（Hash 模式，适配 GitHub Pages）
- **存储**: IndexedDB（本地数据）+ 飞书多维表格（云端知识库）
- **样式**: 纯 CSS 变量、移动端优先、跟随系统深色/浅色主题
- **PWA**: Web App Manifest + Service Worker

## 数据结构

### IndexedDB（本地，不上云）
- `learning_records` — 英语学习记录
- `sport_records` — 运动记录
- `expenses` — 账单记录（含压缩图片 Base64）
- `todo_items` — 待办事项
- `settings` — 应用配置

### 飞书多维表格（云端）
- `ai_news` — AI 资讯（字段：标题、链接、摘要、分类、创建时间）
- `shop_materials` — 探店素材（字段：标题、标签、探店分类、正文内容、来源链接、创建时间）
- `daily_briefs` — 每日简报（可选，字段：日期、标题、内容、资讯数、素材数、创建时间）

## 快速开始

```bash
# 安装依赖
npm install

# 开发模式
npm run dev

# 构建生产版本
npm run build

# 预览构建结果
npm run preview
```

## 飞书知识库配置

### 1. 创建飞书应用
访问 [飞书开放平台](https://open.feishu.cn/app)，创建**企业自建应用**。

### 2. 添加权限
在「权限管理」中搜索并添加：
- `bitable:app` — 多维表格

### 3. 创建多维表格
在飞书中新建多维表格，创建以下数据表：

**ai_news 表** — 字段配置：
| 字段名 | 类型 | 说明 |
|--------|------|------|
| 标题 | 文本 | 资讯标题 |
| 链接 | 链接 | 资讯来源链接 |
| 摘要 | 文本 | 内容摘要 |
| 分类 | 文本 | 新技术/新产品/新开源/新点子 |
| 创建时间 | 数字 | 时间戳 |

**shop_materials 表** — 字段配置：
| 字段名 | 类型 | 说明 |
|--------|------|------|
| 标题 | 文本 | 素材标题 |
| 标签 | 多选 | 标签列表 |
| 探店分类 | 文本 | 分类 |
| 正文内容 | 文本 | 正文 |
| 来源链接 | 文本 | 来源 |
| 创建时间 | 数字 | 时间戳 |

### 4. 获取配置参数
1. 打开多维表格，URL 中 `/apps/xxx/` → `xxx` 即为 **app_token**
2. 点击右上角「...」→「高级权限」→ 复制 **table_id**

### 5. 填入工作台
在「设置」页面填入所有参数，点击「测试连接」验证。

## 大模型配置（可选）

用于生成爆款笔记资讯。支持：
- **DeepSeek** — https://platform.deepseek.com/
- **硅基流动 (SiliconFlow)** — https://siliconflow.cn/
- **零一万物** — https://platform.lingyiwanwu.com/

若不配置，将使用内置规则模板生成统计报告。

## 安全提示 ⚠️

飞书 App Secret 和大模型 API Key 存储在浏览器本地（IndexedDB，加密存储）。
**此方案仅适用于个人使用/私有部署场景！**

建议：
- 创建**仅限本人使用的飞书企业自建应用**
- 授予最小权限（仅操作指定多维表格）
- 代码中不做任何云端日志上报
- 如需生产环境使用，请自建代理网关

## GitHub Pages 部署

1. 将代码推送到 GitHub 仓库的 `main` 分支
2. 在仓库 Settings → Pages → Source 选择 **GitHub Actions**
3. GitHub Actions 会自动构建并部署
4. SPA 路由通过 `404.html` 重定向 + Hash 模式实现回退

## 项目结构

```
src/
├── main.ts              # 应用入口
├── App.vue              # 主布局（侧边栏 + 主内容区）
├── types/index.ts       # TypeScript 类型定义
├── router/index.ts      # 路由配置
├── services/
│   ├── db.ts            # IndexedDB 封装（Promise 风格）
│   ├── feishu.ts        # 飞书 API 调用（含 Token 自动刷新）
│   ├── image.ts         # 图片压缩工具
│   └── llm.ts           # 大模型 API + 规则模板
├── utils/format.ts      # 工具函数
├── views/
│   ├── Dashboard.vue    # 今日看板
│   ├── LearningHealth.vue # 学习与健康
│   ├── Finance.vue      # 财务管理
│   ├── AiNews.vue       # AI 资讯
│   ├── ShopSide.vue     # 探店副业
│   ├── FocusMode.vue    # 专注模式
│   ├── HistoryArchive.vue # 历史归档
│   └── Settings.vue     # 设置
└── assets/global.css    # 全局样式
```
