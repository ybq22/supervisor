# LLM API 快速配置指南

深度分析功能已支持 **Anthropic Claude** 和 **OpenAI** 双 API！

## 🚀 30秒配置

### 使用 Anthropic Claude（推荐）
```bash
export ANTHROPIC_API_KEY="sk-ant-..."
```

### 使用 OpenAI
```bash
export LLM_API="openai"
export OPENAI_API_KEY="sk-..."
```

## 📊 功能对比

| 特性 | Anthropic Claude | OpenAI |
|------|-----------------|---------|
| 分析质量 | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ |
| 速度 | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ |
| 成本 | 较高 | 较低 |
| 结构化输出 | 优秀 | 良好 |
| 推荐场景 | 深度分析 | 快速分析 |

## 💰 成本参考

每次导师分析（3篇论文 + 3个公开资料）：

| 提供商 | 模型 | 预估成本 |
|--------|------|----------|
| Anthropic | claude-sonnet-4 | ~$0.06 |
| Anthropic | claude-haiku-4 | ~$0.006 |
| OpenAI | gpt-4o | ~$0.05 |
| OpenAI | gpt-4o-mini | ~$0.003 |

## 🔄 快速切换

```bash
# 切换到 Anthropic
export LLM_API="anthropic"
export ANTHROPIC_API_KEY="sk-ant-..."

# 切换到 OpenAI
export LLM_API="openai"
export OPENAI_API_KEY="sk-..."
```

## 🎯 使用示例

### 方式1：环境变量（推荐）
```bash
# 设置 API
export ANTHROPIC_API_KEY="sk-ant-..."

# 运行分析
node tools/skill-generator.mjs "Geoffrey Hinton" --deep-analyze
```

### 方式2：单次命令
```bash
# 使用 Anthropic
LLM_API=anthropic ANTHROPIC_API_KEY="sk-ant-..." \
  node tools/deep-analyzer.mjs "Yann LeCun"

# 使用 OpenAI
LLM_API=openai OPENAI_API_KEY="sk-..." \
  node tools/deep-analyzer.mjs "Fei-Fei Li"
```

## 🔧 高级配置

### 自定义模型
```bash
# Anthropic
export ANTHROPIC_MODEL="claude-opus-4-20250514"

# OpenAI
export OPENAI_MODEL="gpt-4o-mini"
```

### 使用兼容 API
```bash
# Azure OpenAI
export LLM_API="openai"
export OPENAI_BASE_URL="https://your-resource.openai.azure.com/"
export OPENAI_API_KEY="your-key"
export OPENAI_MODEL="gpt-4"

# DeepSeek
export LLM_API="openai"
export OPENAI_BASE_URL="https://api.deepseek.com/v1"
export OPENAI_API_KEY="your-key"
export OPENAI_MODEL="deepseek-chat"
```

## 📝 支持的功能

深度分析功能支持的内容分析：
- ✅ 论文内容分析
- ✅ 公开信息分析
- ✅ 研究主题提取
- ✅ 沟通风格分析
- ✅ 学术价值观识别
- ✅ 写作模式分析

## 🧪 测试配置

```bash
# 测试当前配置
node -e "import('./tools/content-analyzer.mjs').then(m => console.log(m.getAPIConfig()))"

# 应该看到类似输出：
# {
#   provider: 'anthropic', // 或 'openai'
#   apiKey: 'sk-ant-...',
#   model: 'claude-sonnet-4-20250514',
#   baseURL: '...'
# }
```

## 🚨 常见问题

**Q: 如何知道当前使用的是哪个 API？**
A: 检查 `LLM_API` 环境变量，默认是 `anthropic`

**Q: 可以同时配置两个 API 吗？**
A: 可以，系统会根据 `LLM_API` 的值自动选择

**Q: 哪个 API 效果更好？**
A: Claude Sonnet 4 在分析任务上表现更好，GPT-4o 性价比更高

**Q: 如何降低成本？**
A: 使用 `claude-haiku-4` 或 `gpt-4o-mini`，成本降低 90%

## 📚 完整文档

详细配置请参考：`API_CONFIGURATION.md`

---

**总结**: 双 API 已完全实现，开箱即用！🎉
