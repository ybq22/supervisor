# LLM API Configuration Guide

The deep analysis system supports both **Anthropic Claude** and **OpenAI** APIs. Choose based on your availability, cost, and preference.

---

## 🎯 Quick Setup

### Option 1: Anthropic Claude (Default)

```bash
# Set your Anthropic API key
export ANTHROPIC_API_KEY="sk-ant-..."
```

**Default Model**: `claude-sonnet-4-20250514`

**Optional**: Specify a different model
```bash
export ANTHROPIC_MODEL="claude-opus-4-20250514"
```

---

### Option 2: OpenAI

```bash
# Set provider to OpenAI
export LLM_API="openai"

# Set your OpenAI API key
export OPENAI_API_KEY="sk-..."
```

**Default Model**: `gpt-4o`

**Optional**: Specify a different model
```bash
export OPENAI_MODEL="gpt-4o-mini"
```

---

## 📋 Supported Models

### Anthropic Claude
- `claude-sonnet-4-20250514` (default, good balance)
- `claude-opus-4-20250514` (highest quality)
- `claude-haiku-4-20250514` (fastest, lowest cost)

### OpenAI
- `gpt-4o` (default, good balance)
- `gpt-4o-mini` (faster, lower cost)
- `gpt-4-turbo` (legacy, still good)
- `gpt-3.5-turbo` (fastest, lowest quality)

---

## 🔄 Switching Between APIs

### Method 1: Environment Variable (Recommended)

```bash
# Use Anthropic
export LLM_API="anthropic"  # or just don't set (it's the default)
export ANTHROPIC_API_KEY="sk-ant-..."

# Use OpenAI
export LLM_API="openai"
export OPENAI_API_KEY="sk-..."
```

### Method 2: Per-Command

```bash
# Run with Anthropic
LLM_API=anthropic ANTHROPIC_API_KEY="sk-ant-..." node tools/deep-analyzer.mjs "Geoffrey Hinton"

# Run with OpenAI
LLM_API=openai OPENAI_API_KEY="sk-..." node tools/deep-analyzer.mjs "Geoffrey Hinton"
```

---

## 🔧 Advanced Configuration

### Custom Base URL (for OpenAI-compatible APIs)

```bash
# Using Azure OpenAI
export LLM_API="openai"
export OPENAI_BASE_URL="https://your-resource.openai.azure.com/"
export OPENAI_API_KEY="your-key"
export OPENAI_MODEL="gpt-4"

# Using other OpenAI-compatible APIs
export LLM_API="openai"
export OPENAI_BASE_URL="https://api.deepseek.com/v1"
export OPENAI_API_KEY="your-key"
export OPENAI_MODEL="deepseek-chat"
```

---

## 💰 Cost Comparison

### Per Mentor Analysis (3 papers + 3 public sources)

| Provider | Model | Input Tokens | Output Tokens | Est. Cost |
|----------|-------|--------------|---------------|-----------|
| Anthropic | claude-sonnet-4 | ~9,000 | ~3,000 | ~$0.06 |
| Anthropic | claude-haiku-4 | ~9,000 | ~3,000 | ~$0.006 |
| OpenAI | gpt-4o | ~9,000 | ~3,000 | ~$0.05 |
| OpenAI | gpt-4o-mini | ~9,000 | ~3,000 | ~$0.003 |
| OpenAI | gpt-3.5-turbo | ~9,000 | ~3,000 | ~$0.002 |

*Estimates as of 2026-04-01. Actual costs may vary.*

---

## 📝 Example Usage

### Analyzing a Mentor with Different APIs

```bash
# Using Anthropic Claude
export ANTHROPIC_API_KEY="sk-ant-..."
node tools/deep-analyzer.mjs "Geoffrey Hinton" --affiliation "University of Toronto"

# Switch to OpenAI
export LLM_API="openai"
export OPENAI_API_KEY="sk-..."
node tools/deep-analyzer.mjs "Geoffrey Hinton" --affiliation "University of Toronto"
```

### Generating Skills with Different APIs

```bash
# Using Anthropic (default)
export ANTHROPIC_API_KEY="sk-ant-..."
node tools/skill-generator.mjs "Geoffrey Hinton" --affiliation "University of Toronto" --deep-analyze

# Using OpenAI
export LLM_API="openai"
export OPENAI_API_KEY="sk-..."
node tools/skill-generator.mjs "Geoffrey Hinton" --affiliation "University of Toronto" --deep-analyze
```

---

## ⚙️ Permanent Configuration

### For Bash/Zsh Users

Add to `~/.bashrc` or `~/.zshrc`:

```bash
# Anthropic Claude (default)
export ANTHROPIC_API_KEY="sk-ant-..."
export ANTHROPIC_MODEL="claude-sonnet-4-20250514"

# OR OpenAI
export LLM_API="openai"
export OPENAI_API_KEY="sk-..."
export OPENAI_MODEL="gpt-4o"
```

Then reload:
```bash
source ~/.bashrc  # or source ~/.zshrc
```

### For Project-Specific Configuration

Create `.env` file in project root:

```bash
# .env
LLM_API=openai
OPENAI_API_KEY=sk-...
OPENAI_MODEL=gpt-4o
```

Then load before running:
```bash
source .env
node tools/deep-analyzer.mjs "Geoffrey Hinton"
```

---

## 🧪 Testing Configuration

Test which API is being used:

```bash
# Should print: anthropic or openai
node -e "import('./tools/content-analyzer.mjs').then(m => console.log(m.getAPIConfig().provider))"
```

Test a simple analysis:

```bash
# Create test file
echo "Test paper content" > /tmp/test_paper.txt

# Run with Anthropic
export ANTHROPIC_API_KEY="sk-ant-..."
node tools/content-analyzer.mjs /tmp/test_paper.txt "Test Paper" "Test Mentor"

# Run with OpenAI
export LLM_API=openai OPENAI_API_KEY="sk-..."
node tools/content-analyzer.mjs /tmp/test_paper.txt "Test Paper" "Test Mentor"
```

---

## 🚨 Troubleshooting

### Error: ANTHROPIC_API_KEY not set
**Solution**: Set the API key
```bash
export ANTHROPIC_API_KEY="sk-ant-..."
```

### Error: OPENAI_API_KEY not set
**Solution**: Set the API key and provider
```bash
export LLM_API="openai"
export OPENAI_API_KEY="sk-..."
```

### Error: API error 401
**Cause**: Invalid API key
**Solution**: Verify your API key is correct and active

### Error: API error 429
**Cause**: Rate limit exceeded
**Solution**: Wait a few minutes and try again, or switch to a different API provider

### Error: Could not parse as JSON
**Cause**: Model didn't return valid JSON
**Solution**: Try a different model (e.g., gpt-4o instead of gpt-3.5-turbo)

---

## 🎓 Recommendation

### For Best Results: Anthropic Claude
- Better at following complex instructions
- More structured output
- Better at analysis tasks
- Use: `claude-sonnet-4-20250514` or `claude-opus-4-20250514`

### For Cost Efficiency: OpenAI
- Lower cost per token
- Faster response times
- Good for simple tasks
- Use: `gpt-4o` or `gpt-4o-mini`

---

## 📚 Additional Resources

- [Anthropic API Documentation](https://docs.anthropic.com/)
- [OpenAI API Documentation](https://platform.openai.com/docs/)
- [Model Comparison](https://docs.anthropic.com/claude/docs/models-overview)
- [Pricing: Anthropic](https://docs.anthropic.com/claude/docs/rate-limits)
- [Pricing: OpenAI](https://openai.com/pricing)

---

## 🔐 Security Best Practices

1. **Never commit API keys to git**
   ```bash
   # Add to .gitignore
   echo ".env" >> .gitignore
   echo "*.key" >> .gitignore
   ```

2. **Use environment variables, not hardcoded keys**

3. **Rotate keys regularly** (monthly recommended)

4. **Set spending limits** in your API console

5. **Monitor usage** to detect unusual activity

---

Last updated: 2026-04-01
