<div align="center">

# 🧪 导师.skill

### ✨ 把导师蒸馏成随时可问的 AI Skill

*AI-powered mentor distillation for students and educators*

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![Node.js Version](https://img.shields.io/badge/Node.js-%3E%3D18.0-339933.svg)](https://nodejs.org)
[![Claude Code](https://img.shields.io/badge/Claude%20Code-Skill-7c4dff.svg)](https://claude.ai/code)
[![AgentSkills](https://img.shields.io/badge/AgentSkills-Compatible-4CAF50.svg)](https://agentskills.io)
[![GitHub Stars](https://img.shields.io/github/stars/ybq22/supervisor?style=social)](https://github.com/ybq22/supervisor/stargazers)
[![GitHub Issues](https://img.shields.io/github/issues/ybq22/supervisor)](https://github.com/ybq22/supervisor/issues)
[![GitHub Contributors](https://img.shields.io/github/contributors/ybq22/supervisor)](https://github.com/ybq22/supervisor/graphs/contributors)

[English](./README.EN.md) | 简体中文

---

</div>

## 💭 痛点太多？

### 📅 导师太忙没空交流？（如果你是学生）
- "老师，这个想法怎么样？" → **3天后才回复**
- "老师，这篇论文怎么改进？" → **下周再聊吧**
- "老师，这个方向有前景吗？" → **先去调研下**

### 👨‍🏫 想让学生快速了解你的研究理念？（如果你是老师）
- "每年都要重复介绍自己的研究方向？" → **效率太低**
- "学生不理解你的学术风格？" → **沟通成本高**
- "希望能让更多人受益于你的研究经验？" → **影响力有限**

### 🎯 想要即时、专业的学术指导？
**不如先来把你希望了解的导师/你自己蒸馏成 skill 吧！**

---

## 🚀 一键生成数字导师

```bash
# 👨‍🎓 作为学生：生成你向往的导师 skill
node tools/skill-generator.mjs "Geoffrey Hinton" --affiliation "University of Toronto"

# 👨‍🏫 作为教师：生成自己的 skill 分享给学生
node tools/skill-generator.mjs "Your Name" --affiliation "Your University"

# 然后就可以随时对话了！
/GeoffreyHinton 你的问题或需求
```

**✨ 学生：** 就像导师真的在身边一样，随时请教！
**✨ 教师：** 让你的研究理念触达更多学生，提高影响力！

---

## 🎯 核心功能

### 👨‍🎓 对学生的价值

| 功能 | 说明 |
|------|------|
| 🔍 **智能搜索** | **Google 搜索**全面收集导师信息：机构主页、Wikipedia、Google Scholar、个人主页 |
| 🧠 **风格学习** | AI 分析导师的研究风格、表达习惯和学术观点 |
| 🔬 **深度论文分析** | 从论文中提取研究主题、方法论偏好、写作风格、可视化特点等 |
| 🌐 **公开信息分析** | 从新闻、访谈、社交媒体中分析性格、沟通风格、学术理念 |
| 📊 **综合画像** | 整合论文和公开信息，生成全面的导师数字画像 |
| 📸 **聊天截图分析** 🆕 | 从聊天记录截图学习导师的真实说话风格和语言习惯 |
| 📤 **智能上传** 🆕 | 上传材料自动进行深度分析，无需额外操作 |
| 💾 **随时查阅** | 生成结构化 JSON 档案，随时可更新 |
| 🤖 **即时对话** | 自动创建可直接对话的 Claude Code skill |
| 🌍 **无障碍交流** | 支持中英文导师，无障碍交流 |

### 👨‍🏫 对教师的价值

| 功能 | 说明 |
|------|------|
| 📣 **理念传播** | 系统梳理你的研究哲学，让学生快速理解 |
| ⏱️ **提高效率** | 减少重复性问答，聚焦深度交流 |
| 🎯 **风格保持** | 统一的学术风格和表达方式 |
| 📚 **知识沉淀** | 将研究经验永久保存和传承 |
| 🌐 **扩大影响** | 让更多学生受益于你的研究经验 |
| 🔄 **持续更新** | 随时更新你的最新研究成果 |

---

## 🔥 新功能亮点

### 📸 聊天截图分析

**NEW**: 上传聊天截图，学习导师的真实说话风格！

```bash
/upload "导师名字" chat-screenshot.png
```

**功能特点**:
- ✅ 自动检测聊天截图（WeChat、WhatsApp、Telegram等）
- ✅ 智能识别导师位置（通常在左侧）
- ✅ 提取导师所有消息
- ✅ 分析说话风格：语气、直接程度、礼貌程度、Emoji使用
- ✅ 提取常用短语和表达习惯
- ✅ 学习个性化语言特征

### 📤 自动深度分析

**NEW**: 上传材料自动进行深度分析，无需手动调用

```bash
# 支持的文件类型
/upload "导师名字" bio.pdf          # 论文分析
/upload "导师名字" interview.md      # 访谈分析
/upload "导师名字" chat.png          # 聊天截图分析

# 重新生成技能即可整合所有分析
node tools/skill-generator.mjs "导师名字" --affiliation "机构"
```

---

## 📤 上传材料

通过多种渠道上传材料以增强导师技能：

**支持的文件类型**:
- **📸 图片** (.png, .jpg, .jpeg, .gif, .webp) - 聊天截图、照片（分析说话风格）
- **📄 PDF** (.pdf) - 研究论文、传记、文档
- **📝 文本** (.txt, .text) - 访谈记录、笔记、通信
- **📑 Markdown** (.md) - 笔记、文档、结构化文本
- **📧 邮件** (.eml, .mbox) - 通信记录、邮件线程
- **📊 数据** (.json) - Feishu 导出数据、结构化数据

**快速示例**:
```bash
# 上传多个文件（自动分析）
/upload "Fei-Fei Li" bio.pdf
/upload "Fei-Fei Li" interview.md
/upload "Fei-Fei Li" wechat-chat.png

# 重新生成技能
node tools/skill-generator.mjs "Fei-Fei Li" --affiliation "Stanford University"
```

---

## 💻 所有命令接口

### 1️⃣ `/distill-mentor` - 生成导师技能

**用途**: 从零开始生成一个数字导师技能

**基本语法**:
```bash
node tools/skill-generator.mjs "<导师名字>" --affiliation "<所属机构>"
```

**可选参数**:
```bash
--deep-analyze          # 启用深度论文分析（需要 API）
--use-arxiv            # 启用 ArXiv 搜索（默认禁用）
--upload <文件>         # 上传单个文件
--incremental          # 增量模式（仅处理上传）
```

**使用示例**:
```bash
# 基础用法
node tools/skill-generator.mjs "Geoffrey Hinton" --affiliation "University of Toronto"

# 带深度分析
node tools/skill-generator.mjs "Fei-Fei Li" --affiliation "Stanford University" --deep-analyze

# 上传材料
node tools/skill-generator.mjs "Yann LeCun" --affiliation "NYU" --upload paper.pdf --incremental
```

---

### 2️⃣ `/upload` - 上传材料增强技能

**用途**: 上传论文、访谈、聊天截图等材料，自动分析并增强现有导师技能

**基本语法**:
```bash
/upload "<导师名字>" <文件路径>
```

**支持的文件类型**:
- 📸 **图片** (.png, .jpg, .jpeg) - 聊天截图，分析说话风格
- 📄 **PDF** (.pdf) - 论文、传记
- 📝 **文本** (.txt, .md) - 访谈、笔记

**使用示例**:
```bash
# 上传聊天截图
/upload "Fei-Fei Li" wechat-chat.png

# 上传论文
/upload "Geoffrey Hinton" research-paper.pdf

# 上传访谈记录
/upload "Yann LeCun" interview-transcript.md

# 上传多个文件后重新生成
node tools/skill-generator.mjs "Fei-Fei Li" --affiliation "Stanford University"
```

**注意**: 上传后会自动进行深度分析，无需额外参数

---

### 3️⃣ `/bye` - 结束导师对话

**用途**: 优雅地结束当前导师对话

**基本语法**:
```bash
/bye [导师名字]
```

**使用示例**:
```bash
# 通用告别
/bye

# 向特定导师告别
/bye GeoffreyHinton
```

---

### 4️⃣ `/导师名字` - 与导师对话

**用途**: 使用已生成的导师技能进行对话

**基本语法**:
```bash
/<导师名字> <你的问题或需求>
```

**导师命名规则**:
- 去除空格和特殊字符
- 例如: "Fei-Fei Li" → `FeiFeiLi`
- 例如: "Geoffrey Hinton" → `GeoffreyHinton`

**使用示例**:
```bash
# 论文审阅
/GeoffreyHinton 我这篇关于深度学习论文的创新点够不够突出？

# 研究方向咨询
/FeiFeiLi 计算机视觉领域有哪些前沿方向？

# 研究哲学探讨
/YannLeCun 你对自监督学习的未来发展有什么看法？

# 随时提问
/YourName 帮我看看这个实验设计
```

---

## 📖 快速开始

### ⚠️ 前提条件

**需要先安装 Claude Code CLI** - 本工具生成的 skill 需要在 Claude Code 中使用

- 📖 安装指南：[Claude Code 官方文档](https://code.claude.com/docs/en/overview)
- 💻 Claude Code 是 Anthropic 官方的 AI 辅助编程工具

安装完成后，继续以下步骤：

### 1️⃣ 安装

```bash
# 克隆仓库
git clone https://github.com/ybq22/supervisor.git
cd supervisor

# 安装依赖
npm install

# 配置 API（可选，用于深度分析）
cp .env.example .env
# 编辑 .env 文件，填入你的 API Key
```

### 2️⃣ 配置 API（可选）

如需使用深度分析和聊天截图功能，需要配置 LLM API：

```bash
# 编辑 .env 文件
LLM_API=openai                                    # 或 anthropic
OPENAI_API_KEY=sk-xxx                            # 你的 API Key
OPENAI_BASE_URL=https://api.openai.com/v1        # API 地址
OPENAI_MODEL=gpt-4o                              # 模型名称
```

详细配置请参考：[API 配置指南](API_CONFIGURATION.md)

### 3️⃣ 生成你的第一个数字导师

```bash
# 👨‍🎓 学生：生成你向往的导师 skill
node tools/skill-generator.mjs "Geoffrey Hinton" --affiliation "University of Toronto"

# 👨‍🏫 教师：生成自己的 skill
node tools/skill-generator.mjs "Your Name" --affiliation "Your University"
```

### 4️⃣ 开始对话！

```bash
# 👨‍🎓 学生：随时请教问题
/GeoffreyHinton 我这篇论文的创新点够不够突出？

# 👨‍🏫 教师：让学生快速了解你的研究
/YourName 你的研究哲学是什么？
```

---

## 📋 更新日志

### 2026-04-07 - v1.2.0

**新功能** ✨:
- 📸 **聊天截图分析**: 自动识别聊天记录并学习导师说话风格
- 📤 **自动深度分析**: 上传材料自动进行深度分析，无需额外操作
- 🔍 **改进搜索方式**: 默认使用 Google Search 替代 ArXiv，避免同名作者问题

**改进** 🚀:
- ✅ 修复 workspace 路径处理问题
- ✅ 优化文件上传和解析流程
- ✅ 增强分析结果存储结构

**文档** 📚:
- 添加聊天截图分析文档
- 更新 API 配置指南
- 新增更新日志板块

### 2026-04-06 - v1.1.0

**新功能** ✨:
- 🧠 **深度论文分析**: 提取研究主题、方法论、写作风格
- 🌐 **公开信息分析**: 分析性格、沟通风格、学术理念
- 📤 **多渠道上传**: 支持 PDF、TXT、MD、图片、邮件等多种格式
- 📊 **质量评估**: 自动评估数据质量并给出改进建议

**改进** 🚀:
- ✅ 支持 OpenAI 和 Anthropic 双 API
- ✅ 添加 .env 配置文件支持
- ✅ 优化搜索策略，避免 ArXiv 同名作者问题

### 2026-04-05 - v1.0.0

**初始发布** 🎉:
- ✨ 导师技能生成核心功能
- 🔍 ArXiv 论文搜索
- 🌐 Google 浏览器搜索
- 🤖 Claude Code skill 生成
- 📚 基础文档和示例

---

## 🎬 实战演示

### 👨‍🎓 学生使用场景

#### 📝 论文审阅

```bash
/GeoffreyHinton 我这篇关于深度学习论文的创新点够不够突出？
```

**数字导师会：**
1. 总结论文核心贡献
2. 指出亮点和不足
3. 提供具体的改进建议
4. 保持导师独特的表达风格

### 🔬 研究方向咨询

```bash
/GeoffreyHinton 神经网络的架构设计有哪些前沿方向？
```

**数字导师会：**
1. 基于真实研究回答
2. 提供相关论文建议
3. 评估研究可行性
4. 明确说明不确定的地方

---

### 👨‍🏫 教师使用场景

#### 💡 分享研究理念

```bash
/YourName 我想让学生快速了解我的研究哲学和核心观点
```

**数字导师会：**
1. 系统梳理你的研究理念
2. 用学生易懂的语言解释复杂概念
3. 提供学习路径和资源推荐
4. 帮助学生快速进入研究领域

#### 📚 提高沟通效率

```bash
/YourName 帮我回答关于我研究方法的常见问题
```

**数字导师会：**
1. 总结你的方法论特点
2. 提供标准化的问题解答
3. 保持研究风格的一致性
4. 节省重复沟通时间

---

## 📁 项目结构

```
supervisor/
├── tools/                     # 核心工具
│   ├── skill-generator.mjs   # 主生成器
│   ├── arxiv-search.mjs      # ArXiv 搜索（可选）
│   ├── puppeteer-search.mjs  # Google 浏览器搜索
│   ├── paper-analysis.mjs    # 深度论文分析
│   ├── content-analyzer.mjs  # 内容分析（LLM API）
│   ├── chat-screenshot-analyzer.mjs  # 聊天截图分析
│   ├── workspace-manager.mjs # 工作区管理
│   ├── parsers/              # 文件解析器
│   │   ├── pdf.mjs
│   │   ├── text.mjs
│   │   └── markdown.mjs
│   └── upload-scanner.mjs    # 上传文件扫描
├── docs/                      # 文档
│   ├── QUICKSTART.md         # 快速开始
│   ├── API_CONFIGURATION.md  # API 配置指南
│   └── API_QUICK_REFERENCE.md # API 快速参考
├── .env.example              # 配置文件示例
├── package.json              # 依赖配置
├── diagnose-api.sh           # API 诊断工具
└── README.md                 # 本文件
```

---

## 🏗️ 工作原理

```
┌─────────────────────────────────────────────────────────────────┐
│                  🎯 导师蒸馏工作流程                               │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  1️⃣ 输入导师姓名 + 所属机构                                       │
│           ↓                                                     │
│  2️⃣ 🔍 多源搜索（Google Search 优先）                           │
│     ├─ 机构主页 + 姓名                                           │
│     ├─ Wikipedia                                                │
│     ├─ Google Scholar                                           │
│     └─ 个人主页                                                  │
│           ↓                                                     │
│  3️⃣ 📤 上传材料（可选）                                          │
│     ├─ 📸 聊天截图 → 分析说话风格                                 │
│     ├─ 📄 PDF 论文 → 分析研究风格                                │
│     ├─ 📝 访谈文本 → 分析沟通风格                                │
│     └─ 自动深度分析 🆕                                          │
│           ↓                                                     │
│  4️⃣ 🧠 AI 深度分析                                              │
│     ├─ 🔬 论文分析（研究主题、方法论、写作风格）                     │
│     ├─ 🌐 公开信息分析（性格、沟通风格、学术理念）                    │
│     ├─ 📸 聊天风格分析（语气、用词、表达习惯）🆕                    │
│     └─ 📊 综合画像生成                                           │
│           ↓                                                     │
│  5️⃣ 💾 持久化存储                                               │
│     └─ 生成结构化 JSON 档案 + 分析结果                            │
│           ↓                                                     │
│  6️⃣ 🤖 自动创建 Skill                                           │
│     └─ 生成可直接对话的 Claude Code skill                        │
│           ↓                                                     │
│  7️⃣ 💬 开始对话！                                                │
│     ├─ 学生：随时提问、论文审阅、研究方向咨询                        │
│     └─ 教师：分享研究理念、扩大影响力、提高沟通效率                   │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## 📚 文档

- 📖 [快速开始](QUICKSTART.md) - 5分钟上手指南
- 🔧 [API 配置指南](API_CONFIGURATION.md) - LLM API 配置说明
- 📋 [API 快速参考](API_QUICK_REFERENCE.md) - API 参数速查
- 🔧 [API 诊断工具](diagnose-api.sh) - 测试 API 连接

---

## ⚖️ 免责声明

**请仔细阅读以下重要信息：**

### 📌 使用限制

1. **仅供学习研究使用** - 本工具生成的导师 skill 仅用于学术交流、学习研究和个人参考目的
2. **禁止商业用途** - 严禁将生成的 skill 用于任何商业目的或营利性活动
3. **不具权威性** - 生成的所有内容均基于公开信息的 AI 分析，**不代表导师本人的真实观点或意愿**

### 🔒 数据来源

- 所有信息均来源于**公开渠道**（论文、网站、访谈、社交媒体等）
- 不涉及任何私人或机密信息
- 可能存在信息不完整、过时或不准确的情况

### ⚠️ 准确性声明

- AI 生成的内容**仅供参考**，不构成正式的学术建议或专业指导
- 请勿完全依赖生成的 skill 做出重要学术或职业决策
- 对于关键性问题，建议直接联系导师本人或查阅权威资料

### 🤝 知识产权

- 导师的姓名、研究成果和学术观点归其本人所有
- 本工具仅用于信息整理和知识传播，不侵犯任何知识产权
- 如有异议，请联系删除或修改

---

## 🤝 贡献

我们欢迎所有形式的贡献！

### 👨‍🎓 学生可以做什么
1. **测试和反馈** - 使用工具并提供使用体验
2. **报告问题** - 发现 bug 或功能不足时提 issue
3. **分享案例** - 分享你成功创建的导师 skill
4. **改进文档** - 帮助完善使用指南和示例

### 👨‍🏫 教师可以做什么
1. **提供真实反馈** - 从教育者角度评估工具准确性
2. **分享最佳实践** - 如何更好地使用数字导师辅助教学
3. **建议新功能** - 基于教学需求提出改进建议
4. **贡献数据源** - 推荐更多学术数据库和资源

### 🔧 技术贡献
1. **添加新的数据源**（Google Scholar, DBLP, Semantic Scholar 等）
2. **改进风格分析算法**（提升 AI 分析准确性）
3. **优化 prompt 模板**（提高生成质量）
4. **增强多语言支持**（让更多非英语导师可以使用）

---

## 📋 License

MIT License - 详见 [LICENSE](LICENSE)

---

<div align="center">

**Made with ❤️ by Claude Code & Human Collaboration**

### 🎓 双向赋能，促进学术交流

**👨‍🎓 学生：** 获取你向往导师的数字分身，随时请教！
**👨‍🏫 教师：** 分享你的研究理念，触达更多学生！

---

## 🌟 Star History

[![Star History Chart](https://api.star-history.com/svg?repos=ybq22/supervisor&type=Date)](https://star-history.com/#ybq22/supervisor&Date)

**[开始蒸馏你心中的导师吧！](https://github.com/ybq22/supervisor)**

或

**[创建你自己的数字分身！](https://github.com/ybq22/supervisor)**

</div>
