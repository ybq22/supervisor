# 浏览器搜索示例

## 示例：生成 Geoffrey Hinton 的数字分身

```bash
/distill-mentor "Geoffrey Hinton" --affiliation "University of Toronto"
```

## 执行流程

### 1️⃣ 收集导师信息

```
🔍 收集导师信息: Geoffrey Hinton
🌐 使用浏览器搜索模式（全面收集信息，推荐）
📋 工作流程:

📚 [1/5] 收集导师信息...
[1/5] 正在搜索 ArXiv 论文...
✓ 找到 10 篇论文

[2/5] 浏览器搜索模式：全面收集信息...

   🔍 搜索 1/4: 个人主页和学术信息...
      ✓ 找到 15 个结果

   🔍 搜索 2/4: 论文和出版物...
      ✓ 找到 10 个结果

   🔍 搜索 3/4: 演讲、访谈和观点...
      ✓ 找到 8 个结果

   🔍 搜索 4/4: Wikipedia 和百科信息...
      ✓ 找到 5 个结果

   📊 浏览器搜索总计: 30 个唯一结果

[3/5] 验证数据质量...
数据质量评分: 0.9/1.0
数据来源: arxiv, browser-search
✅ 数据质量优秀！
```

### 2️⃣ 分析研究风格

```
🧠 [2/5] 分析研究风格...
✓ 风格分析完成: 理论驱动型
```

### 3️⃣ 生成档案

```
📝 [3/5] 生成导师档案...
✓ 档案生成完成
```

### 4️⃣ 保存文件

```
💾 [4/5] 保存档案文件...
✓ 档案已保存: /Users/xxx/.claude/mentors/Yoshua_Bengio.json
```

### 5️⃣ 生成 Skill

```
🤖 [5/5] 生成对话 Skill...
✓ Mentor skill 已生成: /Users/xxx/.claude/skills/yoshua-bengio/SKILL.md
```

## 收集到的信息

### 📊 统计数据

- **ArXiv 论文**: 10 篇
- **搜索结果**: 30 个唯一网页
- **数据质量**: 0.9/1.0（优秀）

### 📁 信息分类

**个人主页 (6)**
- yoshuabengio.org
- ResearchGate
- Academia.edu
- 等等

**学术机构 (4)**
- Mila - Quebec AI Institute
- Université de Montréal
- CIFAR
- 等等

**论文/研究 (8)**
- Google Scholar (164,000+ 引用)
- ArXiv 最新论文
- DBLP 出版物
- 等等

**演讲/访谈 (7)**
- TED talks
- YouTube 演讲
- 会议演讲
- 等等

**Wikipedia (2)**
- 英文维基百科
- 法文维基百科

**其他 (3)**
- ACM Turing Award
- 采访文章
- 等等

## 使用数字分身

生成后，可以直接对话：

```bash
/yoshua-bengio 你觉得深度学习的未来发展方向是什么？
```

数字导师会基于收集到的真实信息，以 Geoffrey Hinton 的风格回答问题。

## 快速模式对比

如果使用快速模式：

```bash
/distill-mentor "Geoffrey Hinton" --no-browser
```

**结果对比**：

| 指标 | 浏览器搜索 | 快速模式 |
|------|-----------|---------|
| 时间 | ~25 秒 | ~4 秒 |
| ArXiv 论文 | 10 篇 | 10 篇 |
| 网页结果 | 30 个 | 8 个 |
| 数据质量 | 0.9/1.0 | 0.6/1.0 |
| 演讲/访谈 | ✅ | ❌ |
| Wikipedia | ✅ | ❌ |

## 建议

- **首次使用**：推荐使用浏览器搜索（默认）
- **快速测试**：使用 `--no-browser`
- **高质量需求**：必须使用浏览器搜索

## 下一步

查看完整文档：
- README.md - 项目概述
- PUPPETEER_GUIDE.md - 浏览器搜索详细指南
- QUICKSTART.md - 快速参考
