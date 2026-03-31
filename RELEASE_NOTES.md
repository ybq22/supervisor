# Release Notes - v1.0.0

## 发布日期
2026-03-31

## 新功能

### 核心功能
- ✅ ArXiv 论文搜索
- ✅ AI 风格分析
- ✅ JSON 档案生成
- ✅ Mentor Skill 自动生成
- ✅ 完整错误处理
- ✅ 用户友好的进度提示

### 数据源
- ArXiv API（论文搜索）
- DuckDuckGo（个人主页，实验性）

### 支持
- 多语言（中英文）
- 跨平台（macOS, Linux, Windows）

## 使用方法

```bash
# 生成导师
/distill-mentor Geoffrey Hinton

# 对话
/Geoffrey Hinton 请解释一下深度学习
```

## 已知问题

1. Google 搜索不稳定（DuckDuckGo 反爬虫）
2. 需要设置 ANTHROPIC_API_KEY 才能进行风格分析

## 下一步计划

- [ ] 添加更多数据源（Semantic Scholar）
- [ ] 优化个人主页搜索
- [ ] 支持批量生成
- [ ] Web UI 界面

## 贡献者

- 开发：Claude Code + Human Collaboration
- 设计：基于 Brainstorming Skill
- 测试：5/5 单元测试通过

## 许可证

MIT
