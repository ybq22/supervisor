# Quick Start Guide

Get started with distill-mentor in 3 simple steps.

---

## Step 1: Choose Your API Provider

### Option A: Anthropic Claude (Recommended for Quality)
```bash
export ANTHROPIC_API_KEY="sk-ant-..."
```

### Option B: OpenAI (Recommended for Cost)
```bash
export LLM_API="openai"
export OPENAI_API_KEY="sk-..."
```

💡 **Don't have an API key?**
- Anthropic: https://console.anthropic.com/
- OpenAI: https://platform.openai.com/api-keys

---

## Step 2: Generate a Mentor Skill

### Basic Generation (ArXiv papers only)
```bash
node tools/skill-generator.mjs "Geoffrey Hinton" --affiliation "University of Toronto"
```

### With Deep Analysis (includes public information)
```bash
node tools/skill-generator.mjs "Geoffrey Hinton" --affiliation "University of Toronto" --deep-analyze
```

### With Uploads (includes additional materials)
```bash
# Place files in uploads directory
cp research_paper.pdf ~/.claude/uploads/pdfs/
cp interview_notes.md ~/.claude/uploads/markdown/

# Generate skill with uploads
node tools/skill-generator.mjs "Geoffrey Hinton" --affiliation "University of Toronto"
```

**Supported upload types:**
- Text (.txt, .text)
- Markdown (.md)
- PDF (.pdf)
- Email (.eml, .mbox)
- Images (.png, .jpg, .jpeg, .gif, .webp)
- Feishu exports (.json)

See [UPLOAD_GUIDE.md](docs/UPLOAD_GUIDE.md) for details.

---

## Step 3: Use Your Mentor Skill

Once generated, interact with your mentor:

```bash
# Using Claude Code CLI
/GeoffreyHinton What are your research interests?
```

Or load the skill and ask questions:
```bash
/GeoffreyHinton
```

Then ask: *What do you think about the future of AI?*

---

## 📊 What You Get

After generation, you'll have:

1. **Profile JSON**: `~/.claude/mentors/GeoffreyHinton.json`
   - Complete structured profile
   - Research themes and methodology
   - Personality and communication style

2. **Skill File**: `~/.claude/skills/GeoffreyHinton/SKILL.md`
   - Ready-to-use mentor skill
   - Emulates research style and perspectives
   - Provides academic guidance

3. **Analysis Report**: `reports/Geoffrey_Hinton_deep_analysis.json`
   - Raw analysis data
   - Source materials
   - Confidence levels

---

## 🎯 Example Workflow

```bash
# 1. Set API key
export ANTHROPIC_API_KEY="sk-ant-..."

# 2. Generate mentor skill
node tools/skill-generator.mjs "Yann LeCun" --affiliation "NYU" --deep-analyze

# 3. Use the mentor
/YannLeCun What's your approach to computer vision?
```

---

## 🔧 Switching APIs

Want to try a different API? Just switch environment variables:

```bash
# From Anthropic to OpenAI
export LLM_API="openai"
export OPENAI_API_KEY="sk-..."

# Regenerate the skill
node tools/skill-generator.mjs "Geoffrey Hinton" --affiliation "University of Toronto" --deep-analyze
```

---

## 💡 Tips

1. **Cost Control**: Start with basic generation (ArXiv only) to test
2. **Better Results**: Use `--deep-analyze` for comprehensive analysis
3. **Chinese Mentors**: Works great with Chinese names (e.g., "刘知远")
4. **Affiliation**: Helps disambiguate authors with similar names
5. **Multiple Mentors**: Generate as many as you want!

---

## 📚 Next Steps

- **Full Configuration**: See `API_CONFIGURATION.md`
- **Implementation Details**: See `IMPLEMENTATION_STATUS.md`
- **Bug Reports**: See `BUG-FIX-REPORT.md`
- **Project README**: See `README.md`

---

## 🆘 Troubleshooting

### "API key not set"
```bash
# Check which provider is configured
node tools/test-api-config.mjs

# Set the appropriate key
export ANTHROPIC_API_KEY="..."  # or OPENAI_API_KEY
```

### "No papers found"
- ArXiv API might be rate-limited
- Try again in a few minutes
- Or use `--deep-analyze` to include public information

### "Unknown skill"
- Skill names cannot have spaces
- Use: `/GeoffreyHinton` not `/Geoffrey Hinton`

---

## 🌐 中文快速参考 / Chinese Quick Reference

### 基本用法 / Basic Usage

```bash
# 1. 设置 API 密钥 / Set API key
export ANTHROPIC_API_KEY="sk-ant-..."
# 或使用 OpenAI / Or use OpenAI:
export LLM_API="openai"
export OPENAI_API_KEY="sk-..."

# 2. 生成导师技能 / Generate mentor skill
node tools/skill-generator.mjs "Geoffrey Hinton" --affiliation "University of Toronto"

# 3. 使用导师技能 / Use mentor skill
/GeoffreyHinton 你喜欢什么样的研究？
```

### 支持的 API / Supported APIs

- **Anthropic Claude** (默认推荐 / Recommended for quality)
- **OpenAI** (成本更低 / Lower cost)

详见: `API_CONFIGURATION.md`

---

**Ready to distill your first mentor?** 🚀

```bash
export ANTHROPIC_API_KEY="your-key-here"
node tools/skill-generator.mjs "Geoffrey Hinton" --affiliation "University of Toronto"
```
