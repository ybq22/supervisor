# .env 文件配置指南

## 🎯 快速开始

### 方式 1: 使用 .env 文件（推荐）

```bash
# 1. 复制示例文件
cp .env.example .env

# 2. 编辑 .env 文件，填入你的 API 密钥
nano .env  # 或使用你喜欢的编辑器

# 3. 直接运行命令（自动加载 .env）
node tools/skill-generator.mjs "Geoffrey Hinton" --deep-analyze
```

### 方式 2: 使用环境变量

```bash
export ANTHROPIC_API_KEY="sk-ant-..."
node tools/skill-generator.mjs "Geoffrey Hinton" --deep-analyze
```

## 📝 .env 文件配置示例

### 使用 Anthropic Claude（推荐）

```bash
# .env
LLM_API=anthropic
ANTHROPIC_API_KEY=sk-ant-your-key-here
ANTHROPIC_MODEL=claude-sonnet-4-20250514
```

### 使用 OpenAI

```bash
# .env
LLM_API=openai
OPENAI_API_KEY=sk-your-key-here
OPENAI_MODEL=gpt-4o
```

### 使用 DeepSeek

```bash
# .env
LLM_API=openai
OPENAI_API_KEY=your-deepseek-key
OPENAI_BASE_URL=https://api.deepseek.com/v1
OPENAI_MODEL=deepseek-chat
```

### 使用 Azure OpenAI

```bash
# .env
LLM_API=openai
OPENAI_API_KEY=your-azure-key
OPENAI_BASE_URL=https://your-resource.openai.azure.com/
OPENAI_MODEL=gpt-4
```

## 🔧 支持的配置项

### Anthropic Claude 配置

| 配置项 | 说明 | 默认值 | 示例 |
|--------|------|--------|------|
| `LLM_API` | API 提供商 | `anthropic` | `anthropic` |
| `ANTHROPIC_API_KEY` | API 密钥 | 必填 | `sk-ant-...` |
| `ANTHROPIC_MODEL` | 模型名称 | `claude-sonnet-4-20250514` | `claude-opus-4-20250514` |
| `ANTHROPIC_BASE_URL` | API 端点 | `https://api.anthropic.com` | 自定义端点 |

### OpenAI 配置

| 配置项 | 说明 | 默认值 | 示例 |
|--------|------|--------|------|
| `LLM_API` | API 提供商 | `anthropic` | `openai` |
| `OPENAI_API_KEY` | API 密钥 | 必填 | `sk-...` |
| `OPENAI_MODEL` | 模型名称 | `gpt-4o` | `gpt-4o-mini` |
| `OPENAI_BASE_URL` | API 端点 | `https://api.openai.com/v1` | 自定义端点 |

## 🌐 常用 API 服务商

### 国内可用的 API

| 服务商 | BASE_URL | 推荐模型 | 说明 |
|--------|----------|----------|------|
| DeepSeek | `https://api.deepseek.com/v1` | `deepseek-chat` | 性价比高 |
| 阿里云百炼 | `https://dashscope.aliyuncs.com/compatible-mode/v1` | `qwen-max` | 阿里云 |
| 智谱 AI | `https://open.bigmodel.cn/api/paas/v4` | `glm-4` | 清华系 |
| 月之暗面 | `https://api.moonshot.cn/v1` | `moonshot-v1-8k` | Kimi |

### 国外 API

| 服务商 | BASE_URL | 推荐模型 | 说明 |
|--------|----------|----------|------|
| OpenAI | `https://api.openai.com/v1` | `gpt-4o` | 官方 API |
| Anthropic | `https://api.anthropic.com` | `claude-sonnet-4-20250514` | 官方 API |
| Groq | `https://api.groq.com/openai/v1` | `llama-3.3-70b-versatile` | 超快速度 |

## 💡 完整配置示例

### 示例 1: 使用 DeepSeek（国内推荐）

```bash
# .env
LLM_API=openai
OPENAI_API_KEY=sk-xxxxxxxxxxxx
OPENAI_BASE_URL=https://api.deepseek.com/v1
OPENAI_MODEL=deepseek-chat
```

**测试运行**:
```bash
node tools/skill-generator.mjs "测试导师" --deep-analyze
```

### 示例 2: 使用 Anthropic Claude（官方）

```bash
# .env
LLM_API=anthropic
ANTHROPIC_API_KEY=sk-ant-xxxxxxxxxxxx
ANTHROPIC_MODEL=claude-sonnet-4-20250514
```

**测试运行**:
```bash
node tools/skill-generator.mjs "Geoffrey Hinton" --deep-analyze
```

### 示例 3: 使用阿里云百炼

```bash
# .env
LLM_API=openai
OPENAI_API_KEY=sk-xxxxxxxxxxxx
OPENAI_BASE_URL=https://dashscope.aliyuncs.com/compatible-mode/v1
OPENAI_MODEL=qwen-max
```

**测试运行**:
```bash
node tools/skill-generator.mjs "国内导师" --deep-analyze
```

## 🔐 安全最佳实践

### 1. 保护 .env 文件

```bash
# 确保 .env 在 .gitignore 中
echo ".env" >> .gitignore

# 设置文件权限（仅用户可读写）
chmod 600 .env
```

### 2. 验证配置

```bash
# 检查当前配置
node -e "import('./tools/content-analyzer.mjs').then(m => console.log(JSON.stringify(m.getAPIConfig(), null, 2)))"
```

### 3. 测试 API 连接

```bash
# 运行验证脚本
./test-dual-api.sh
```

## 🚨 常见问题

### Q: .env 文件需要放在哪里？
A: 放在项目根目录（`package.json` 所在目录）

### Q: 修改 .env 后需要重启吗？
A: 不需要，每次运行命令时会自动重新加载

### Q: 可以同时配置多个 API 吗？
A: 可以，但系统只会使用 `LLM_API` 指定的那个

### Q: 如何知道当前使用的是哪个 API？
A:
```bash
node -e "import('./tools/content-analyzer.mjs').then(m => console.log('Provider:', m.getAPIConfig().provider))"
```

### Q: 支持 API 代理吗？
A: 支持！通过 `BASE_URL` 配置代理端点

### Q: 国内网络如何配置？
A: 推荐使用国内 API 服务（如 DeepSeek）或配置代理

## 📚 相关文档

- **快速指南**: `API_QUICK_REFERENCE.md`
- **完整配置**: `API_CONFIGURATION.md`
- **示例文件**: `.env.example`

## 🎯 总结

✅ **.env 文件自动加载** - 无需手动 source
✅ **支持多种 API** - Anthropic、OpenAI、DeepSeek 等
✅ **自定义端点** - 通过 BASE_URL 配置
✅ **简单安全** - 配置集中管理，不会提交到 git

---

**推荐配置流程**:
1. 复制 `.env.example` 到 `.env`
2. 填入你的 API 密钥和配置
3. 运行命令，系统自动加载配置
4. 开始使用！🚀
