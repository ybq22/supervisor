# Qingyao Ai - 导师档案示例

由于在 ArXiv 中未找到相关论文，这里创建一个示例档案来展示系统功能。

## 示例数据

### 基本信息
- **姓名**: Qingyao Ai
- **机构**: 示例大学 (Example)
- **领域**: 人工智能、机器学习

### 研究风格（模拟）
- **类型**: 理论+实验并重
- **描述**: 注重数学严谨性，同时强调实验验证
- **关键词**: ["数学化", "可解释性", "系统性"]

### 沟通风格（模拟）
- **语气**: 严谨但不失亲和
- **语言**: 中英混合，专业术语用英文
- **反馈模式**: 先肯定亮点，再指出问题，最后给具体建议

### 学术价值观（模拟）
- 研究应该解决真实问题
- 理论深度和实用性同样重要
- 重视代码质量和可复现性

## 如何使用真实导师

要为真实导师生成档案：

1. **使用在 ArXiv 有发表的导师**：
   ```
   /distill-mentor Geoffrey Hinton
   ```

2. **或者提供更多线索**：
   ```
   /distill-mentor Geoffrey Hinton --affiliation "University of Toronto"
   ```

3. **检查生成的档案**：
   ```bash
   cat ~/.claude/mentors/Geoffrey\ Hinton.json
   ```

## 工作流程示例

系统实际工作流程：

```
输入: /distill-mentor Geoffrey Hinton

[1/5] 📚 正在搜索 ArXiv...
✓ 找到 15 篇论文

[2/5] 🔍 正在搜索个人主页...
✓ 找到 3 个相关网页

[3/5] 🧠 正在分析研究风格...
✓ 风格分析完成

[4/5] 📝 正在生成 JSON 档案...
✓ 档案已保存: ~/.claude/mentors/Geoffrey Hinton.json

[5/5] 🤖 正在生成 Mentor Skill...
✓ Skill 已生成: ~/.claude/skills/mentor-Geoffrey Hinton.md

✅ 完成！

现在可以使用 /Geoffrey Hinton 来对话了！
```

## 建议

对于 "Qingyao Ai"：
1. 确认英文名字拼写
2. 检查是否在 ArXiv 发表过论文
3. 提供更多背景信息（机构、研究领域）
