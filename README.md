# 导师蒸馏系统 (Mentor Supervisor)

自动"蒸馏"学术导师风格，生成可对话的数字导师 skill。

## 功能特点

- 🔍 自动搜索公开学术信息（ArXiv）
- 🧠 AI 驱动的风格分析（Claude API）
- 💾 本地 JSON 档案存储
- 🤖 自动生成 Claude Code skill
- 🌍 多语言支持（中英文）

## 快速开始

### 安装

```bash
# 克隆仓库
git clone <repository-url>
cd supervisor

# 确保 Node.js 版本 >= 18
node --version
```

### 使用

1. **生成导师档案**

```bash
# 在 Claude Code 中
/distill-mentor Geoffrey Hinton --affiliation "University of Toronto"
```

2. **与数字导师对话**

```bash
/Geoffrey Hinton 你觉得我的论文怎么样？
```

## 工作原理

```
输入导师姓名
    ↓
搜索 ArXiv 论文
    ↓
分析研究风格
    ↓
生成 JSON 档案
    ↓
生成 Mentor Skill
    ↓
可以对话了！
```

## 输出文件

- **档案**: `~/.claude/mentors/{name}.json`
- **Skill**: `~/.claude/skills/mentor-{name}.md`

## 文档

- [使用指南](docs/USAGE.md)
- [架构设计](docs/superpowers/specs/2026-03-31-mentor-supervisor-design.md)
- [实施计划](docs/superpowers/plans/2026-03-31-mentor-supervisor.md)

## 开发

```bash
# 运行测试
node tests/test-distill-mentor.js

# 查看测试报告
cat TEST_REPORT.md
```

## License

MIT
