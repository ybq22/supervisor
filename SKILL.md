---
name: distill-mentor
description: "Distill academic mentors into AI Skills. Auto-collect papers, analyze research style, and generate conversational mentor skills. | 蒸馏学术导师的数字分身，自动收集论文、分析研究风格，生成可对话的导师 skill。"
argument-hint: "<mentor-name> [--affiliation <institution>]"
version: "1.1.0"
user-invocable: true
allowed-tools: Read, Write, Edit, Bash
---

> **Language / 语言**: This skill supports both English and Chinese. Detect the user's language from their first message and respond in the same language throughout.
>
> 本 Skill 支持中英文。根据用户第一条消息的语言，全程使用同一语言回复。

# Academic Mentor Distillation System / 导师蒸馏系统

Automatically collect academic mentor information and generate conversational digital mentor skills.

自动收集学术导师信息并生成可对话的数字导师 skill。

## 触发条件 / Trigger Conditions

Activate when the user says:
- `/distill-mentor <name>` or `/distill-mentor <name> --affiliation <institution>`
- "帮我生成 <导师名> 的 skill"
- "蒸馏 <导师名>"
- "Create mentor skill for <name>"

## 🆕 Deep Analysis Features (v1.1.0)

### Enhanced Paper Analysis

The system now performs **deep analysis** of mentor's papers to extract:

**Research Interests & Preferences**:
- Core research themes and evolution over time
- Problem type preferences (theoretical vs practical)
- Innovation style (groundbreaking vs incremental)
- Emerging research directions

**Research Methodology**:
- Experimental design patterns
- Dataset preferences and benchmarks used
- Ablation study approaches
- Evaluation metrics prioritized

**Visualization & Presentation**:
- Chart and figure preferences
- Visual style (minimalist vs detailed)
- Result presentation patterns
- Typical visualization techniques

**Writing Style**:
- Title patterns and structure
- Abstract organization
- Technical depth in body text
- Paragraph and transition patterns

**Research Thinking**:
- Innovation sources (theory/data/application-driven)
- Problem-solving approaches
- Typical research workflows
- Reasoning patterns

**Academic Values**:
- Attitudes toward simplicity, practicality, rigor
- Open-source and code-sharing stance
- Community engagement level

**Paper Organization**:
- Typical paper structure
- Section length preferences
- Method presentation style (formulas/pseudocode/text)
- Experiments section proportion

### Public Information Analysis

The system also analyzes **publicly available information**:

**Personality Traits**:
- Openness, conscientiousness, extraversion
- Communication and decision-making style
- Work-life balance patterns

**Communication Style**:
- Speaking style (from talks, interviews)
- Writing style (from blogs, social media)
- Humor, formality, interaction levels

**Academic Philosophy**:
- Research purpose and standards
- Teaching philosophy and mentorship style
- Views on field trends and future

**Social & Interpersonal**:
- Collaboration preferences
- Student-mentor relationship style
- Community service involvement

**Values & Beliefs**:
- Career priorities
- Success definition
- Social and ethical stances

**Personal Interests**:
- Hobbies outside academia
- Work-life integration
- Lifestyle preferences

### How to Use Deep Analysis

```bash
# Run deep analysis
node tools/deep-analyzer.mjs "<name>" --affiliation "<institution>"

# Search for public information
node tools/news-search.mjs "<name>" --affiliation "<institution>"

# Results saved to:
# reports/<name>_deep_analysis.json
# reports/<name>_news_search.json
```

The analysis uses the prompts in:
- `prompts/deep-paper-analyzer.md` - For paper analysis
- `prompts/public-info-analyzer.md` - For public info analysis

## 工作流程 / Workflow

### Step 1: Information Collection / 信息收集

**Data Sources / 数据来源:**
- ArXiv API: Recent papers and preprints
- Web Search: Personal homepage, lab website, institutional profiles
- Semantic Scholar API (optional): Paper citations and metadata
- User uploads: CV, publications list, personal materials

**Collection Methods / 收集方法:**

```bash
# ArXiv search
node ${CLAUDE_SKILL_DIR}/tools/arxiv-search.mjs "<name>" [--limit 20]

# Web search with browser
node ${CLAUDE_SKILL_DIR}/tools/puppeteer-search.mjs "<name>" "<institution>"

# Deep paper analysis (optional, requires API keys)
node ${CLAUDE_SKILL_DIR}/tools/paper-analysis.mjs "<name>"
```

### Step 2: Profile Analysis / 档案分析

Use `${CLAUDE_SKILL_DIR}/prompts/analyzer.md` to extract:
- Research areas and expertise
- Publication history and key papers
- Research style (theoretical vs applied)
- Communication patterns
- Academic values and philosophy

### Step 3: Style Analysis / 风格分析

Use `${CLAUDE_SKILL_DIR}/prompts/style-analyzer.md` to determine:
- Research methodology preferences
- Academic writing style
- Communication tone (formal, encouraging, direct)
- Typical feedback patterns
- Core research principles

### Step 4: Skill Generation / Skill 生成

Use `${CLAUDE_SKILL_DIR}/prompts/builder.md` to generate:

**1. Mentor Profile JSON** (`~/.claude/mentors/{name}.json`)
```json
{
  "meta": {
    "version": "1.0",
    "created_at": "ISO timestamp",
    "mentor_name": "Name",
    "affiliation": "Institution"
  },
  "profile": {
    "name_zh": "",
    "name_en": "",
    "institution": "",
    "department": "",
    "position": "",
    "website": ""
  },
  "research": {
    "primary_fields": [],
    "key_publications": []
  },
  "style": {
    "research_style": {},
    "communication_style": {}
  }
}
```

**2. Mentor Skill** (`~/.claude/skills/{name}/SKILL.md`)

### Step 5: Preview and Confirm / 预览确认

Show the user a summary and ask for confirmation:
```
📋 Mentor Profile Summary:

Name: <name>
Affiliation: <institution>
Research Areas: <areas>
Key Papers: <count> papers analyzed
Research Style: <style>

Confirm generation? (yes / modify / cancel)
```

## 工具使用 / Tool Usage

| Task | Tool |
|------|------|
| Search ArXiv papers | `Bash` → `node ${CLAUDE_SKILL_DIR}/tools/arxiv-search.mjs` |
| Web search (personal pages) | `Bash` → `node ${CLAUDE_SKILL_DIR}/tools/puppeteer-search.mjs` |
| Deep paper analysis | `Bash` → `node ${CLAUDE_SKILL_DIR}/tools/paper-analysis.mjs` |
| Read existing profiles | `Read` tool on `~/.claude/mentors/{name}.json` |
| Write profile JSON | `Write` tool |
| Generate mentor skill | Use prompts in `${CLAUDE_SKILL_DIR}/prompts/` |

## 输出位置 / Output Locations

**Profile JSON**: `~/.claude/mentors/{name}.json`

**Mentor Skill**: `~/.claude/skills/{name}/SKILL.md`

## 示例 / Examples

### Example 1: Chinese Mentor

```
/distill-mentor Geoffrey Hinton --affiliation "University of Toronto"
```

**Output**: Generates `Geoffrey_Hinton.json` and `geoffrey-hinton/SKILL.md` with:
- Knowledge graphs, representation learning research areas
- Applied research style
- Chinese communication patterns

### Example 2: English Mentor

```
/distill-mentor Geoffrey Hinton --affiliation "University of Toronto"
```

**Output**: Generates `Geoffrey_Hinton.json` and `Geoffrey_Hinton/SKILL.md` with:
- Deep learning, neural networks expertise
- Theoretical + experimental style
- English communication patterns

## 进化模式 / Evolution Mode

User says "追加信息" / "add more info":
1. Ask for additional materials (papers, CV, links)
2. Read existing profile with `Read`
3. Use `${CLAUDE_SKILL_DIR}/prompts/analyzer.md` for incremental analysis
4. Update profile with `Edit`
5. Regenerate skill

User says "这不对" / "that's wrong":
1. Identify correction target (research area, style, communication)
2. Update relevant section
3. Regenerate skill

## 管理命令 / Management Commands

**List mentors**: `ls ~/.claude/mentors/`

**Delete mentor**: `rm ~/.claude/mentors/{name}.json && rm -rf ~/.claude/skills/{name}/`

**View profile**: `cat ~/.claude/mentors/{name}.json | jq`

## 配置选项 / Configuration

**API Keys (optional, for enhanced features)**:
```bash
# For web reader MCP
export MCP_WEB_READER_ENABLED=true

# For deep paper analysis
export ANTHROPIC_API_KEY=sk-ant-xxx
```

**Data collection limits**:
```bash
# ArXiv search limit
node tools/arxiv-search.mjs "<name>" --limit 30

# Paper analysis depth
node tools/paper-analysis.mjs "<name>" --recent-years 3 --top-cited 10
```

## 故障排查 / Troubleshooting

**Problem**: No papers found on ArXiv
**Solution**: Use browser search instead - `node tools/puppeteer-search.mjs`

**Problem**: Profile quality low (< 0.6)
**Solution**:
1. Add institution info with `--affiliation`
2. Provide homepage URL or CV
3. Use deep paper analysis

**Problem**: Style analysis failed
**Solution**: System uses fallback defaults - skill still generated

## 架构说明 / Architecture

```
distill-mentor/
├── SKILL.md                    # This file - skill entry point
├── prompts/                    # Prompt templates
│   ├── intake.md              # Info collection questions
│   ├── analyzer.md            # Profile analysis
│   ├── builder.md             # Skill generation
│   └── style-analyzer.md      # Research style analysis
├── tools/                      # Implementation scripts
│   ├── arxiv-search.mjs       # ArXiv API search
│   ├── puppeteer-search.mjs   # Browser-based search
│   ├── paper-analysis.mjs     # Deep paper analysis
│   └── skill-generator.mjs    # Main generator logic
├── mentors/                    # Generated profiles (gitignored)
├── docs/                       # Documentation
├── examples/                   # Usage examples
└── tests/                      # Test files
```

## 文档 / Documentation

- **Quick Start**: See `docs/QUICKSTART.md`
- **Paper Analysis Guide**: See `docs/PAPER_ANALYSIS_GUIDE.md`
- **Puppeteer Setup**: See `docs/PUPPETEER_GUIDE.md`
- **Examples**: See `examples/` directory

## 限制 / Limitations

1. **ArXiv Coverage**: Works best for CS/Physics/Math mentors with ArXiv presence
2. **Language Style**: Style analysis works best with sufficient papers (5+)
3. **Real-time Updates**: Generated skills are static - regenerate for latest info

## 最佳实践 / Best Practices

1. **Always provide affiliation** when name is common
2. **Use browser search** for mentors without ArXiv presence
3. **Enable deep analysis** for comprehensive profiles (requires API keys)
4. **Review generated skill** before use - refine as needed
5. **Keep skills updated** - regenerate periodically for recent work

## 版本历史 / Version History

- **1.0.0** (2026-03-31): Initial AgentSkills format release
  - Restructured from monolithic CLI to modular skill system
  - Added prompt templates for each workflow stage
  - Separated tools into individual modules
