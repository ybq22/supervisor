# 导师蒸馏系统 - 使用指南

## 目录

- [快速开始](#快速开始)
- [详细说明](#详细说明)
- [示例](#示例)
- [故障排除](#故障排除)

## 快速开始

### 第一步：生成导师档案

在 Claude Code 中运行：

```
/distill-mentor <导师姓名> [--affiliation "机构"]
```

### 第二步：等待生成

系统会自动：
1. 📚 搜索 ArXiv 论文
2. 🧠 分析研究风格
3. 📝 生成档案
4. 🤖 生成 skill

### 第三步：开始对话

```
/<导师姓名> 你好！
```

## 详细说明

### 参数说明

- **name** (必需): 导师姓名
- **--affiliation** (可选): 所属机构，帮助提高搜索准确性

### 数据来源

系统使用以下数据源：

1. **ArXiv** - 论文预印本
   - 最可靠的数据源
   - 包含论文标题、摘要、作者

2. **Google/DuckDuckGo** - 个人主页
   - 补充信息
   - 可能不稳定

### 风格分析

系统使用 Claude API 分析：
- 研究风格（理论型/实验型/混合型）
- 沟通风格（语气、语言偏好）
- 学术价值观
- 专业领域

## 示例

### 示例 1：国际学者

```
/distill-mentor Geoffrey Hinton --affiliation "University of Toronto"
```

### 示例 2：中国学者

```
/distill-mentor 姚期智 --affiliation "清华大学"
```

### 示例 3：不带机构

```
/distill-mentor Yann LeCun
```

## 故障排除

### 问题：找不到论文

**原因**: 导师没有在 ArXiv 发表过论文

**解决方案**:
- 使用导师的英文名
- 添加机构信息
- 考虑手动补充资料

### 问题：风格分析失败

**原因**: ANTHROPIC_API_KEY 未设置

**解决方案**:
```bash
export ANTHROPIC_API_KEY="your-key-here"
```

### 问题：生成的 skill 无法加载

**原因**: YAML frontmatter 格式错误

**解决方案**: 检查生成的 mentor-{name}.md 文件格式

## 高级用法

### 手动编辑档案

生成的 JSON 档案可以手动编辑：

```bash
vim ~/.claude/mentors/{name}.json
```

### 重新生成 skill

编辑档案后，重新运行：

```
/distill-mentor {name}
```

## 最佳实践

1. 使用英文名字搜索（更准确）
2. 提供机构信息（提高搜索质量）
3. 检查生成的档案质量
4. 手动调整不准确的信息

## 贡献

欢迎提交 Issue 和 Pull Request！
