<div align="center">

# 🧪 Mentor.skill

### ✨ Distill Mentors into AI Skills You Can Query Anytime

*AI-powered mentor distillation for students and educators*

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![Node.js Version](https://img.shields.io/badge/Node.js-%3E%3D18.0-339933.svg)](https://nodejs.org)
[![Claude Code](https://img.shields.io/badge/Claude%20Code-Skill-7c4dff.svg)](https://claude.ai/code)
[![AgentSkills](https://img.shields.io/badge/AgentSkills-Compatible-4CAF50.svg)](https://agentskills.io)
[![GitHub Stars](https://img.shields.io/github/stars/ybq22/supervisor?style=social)](https://github.com/ybq22/supervisor/stargazers)
[![GitHub Issues](https://img.shields.io/github/issues/ybq22/supervisor)](https://github.com/ybq22/supervisor/issues)
[![GitHub Contributors](https://img.shields.io/github/contributors/ybq22/supervisor)](https://github.com/ybq22/supervisor/graphs/contributors)

English | [简体中文](./README.md)

---

</div>

## 💭 Common Pain Points?

### 📅 Mentor Too Busy to Connect? (If You're a Student)
- "Professor, what do you think of this idea?" → **Replies in 3 days**
- "Professor, how can I improve this paper?" → **Let's discuss next week**
- "Professor, is this direction promising?" → **Go research it first**

### 👨‍🏫 Want Students to Quickly Understand Your Research Philosophy? (If You're a Professor)
- "Repeating your research direction every year?" → **Too inefficient**
- "Students don't understand your academic style?" → **High communication cost**
- "Want more people to benefit from your research experience?" → **Limited impact**

### 🎯 Want Instant, Professional Academic Guidance?
**Why not distill your desired mentor/yourself into a skill first!**

---

## 🚀 Generate Digital Mentor in One Click

```bash
# 👨‍🎓 As a student: Generate a skill for an admired mentor
node tools/skill-generator.mjs "Geoffrey Hinton" --affiliation "University of Toronto"

# 👨‍🏫 As a professor: Generate your own skill to share with students
node tools/skill-generator.mjs "Your Name" --affiliation "Your University"

# Then start conversing!
/GeoffreyHinton Your questions or needs
```

**✨ Students:** It's like having your mentor by your side, ready to help anytime!
**✨ Professors:** Let your research philosophy reach more students and amplify your impact!

---

## 🎯 Core Features

### 👨‍🎓 Value for Students

| Feature | Description |
|---------|-------------|
| 🔍 **Smart Search** | **Google Search** comprehensively collects mentor info: institutional pages, Wikipedia, Google Scholar, personal homepages |
| 🧠 **Style Learning** | AI analyzes mentor's research style, expression habits, and academic viewpoints |
| 🔬 **Deep Paper Analysis** | Extracts research themes, methodology preferences, writing style, visualization features from papers |
| 🌐 **Public Info Analysis** | Analyzes personality, communication style, academic philosophy from news, interviews, social media |
| 📊 **Comprehensive Profile** | Integrates papers and public info to generate a complete digital portrait of mentor |
| 📸 **Chat Screenshot Analysis** 🆕 | Learn mentor's authentic speaking style and language habits from chat screenshots |
| 📤 **Smart Upload** 🆕 | Upload materials for automatic deep analysis, no extra steps needed |
| 💾 **Access Anytime** | Generate structured JSON profiles, update anytime |
| 🤖 **Instant Conversation** | Automatically creates Claude Code skills ready for dialogue |
| 🌍 **Barrier-Free Communication** | Supports Chinese and English mentors seamlessly |

### 👨‍🏫 Value for Professors

| Feature | Description |
|---------|-------------|
| 📣 **Philosophy Dissemination** | Systematically organize your research philosophy for quick student understanding |
| ⏱️ **Improve Efficiency** | Reduce repetitive Q&A, focus on deep discussions |
| 🎯 **Style Consistency** | Unified academic style and expression |
| 📚 **Knowledge Preservation** | Permanently preserve and pass down research experience |
| 🌐 **Amplify Impact** | Let more students benefit from your research experience |
| 🔄 **Continuous Updates** | Update your latest research findings anytime |

---

## 🔥 New Features

### 📸 Chat Screenshot Analysis

**NEW**: Upload chat screenshots to learn mentor's authentic speaking style!

```bash
/upload "Mentor Name" chat-screenshot.png
```

**Features**:
- ✅ Automatically detects chat screenshots (WeChat, WhatsApp, Telegram, etc.)
- ✅ Intelligently identifies mentor position (usually on the left)
- ✅ Extracts all mentor messages
- ✅ Analyzes speaking style: tone, directness, politeness, emoji usage
- ✅ Extracts common phrases and expressions
- ✅ Learns personalized language characteristics

### 📤 Automatic Deep Analysis

**NEW**: Upload materials for automatic deep analysis, no manual steps needed

```bash
# Supported file types
/upload "Mentor Name" bio.pdf          # Paper analysis
/upload "Mentor Name" interview.md      # Interview analysis
/upload "Mentor Name" chat.png          # Chat screenshot analysis

# Regenerate skill to integrate all analyses
node tools/skill-generator.mjs "Mentor Name" --affiliation "Institution"
```

---

## 📤 Upload Materials

Enhance mentor skills through multiple channels:

**Supported File Types**:
- **📸 Images** (.png, .jpg, .jpeg, .gif, .webp) - Chat screenshots, photos (analyzes speaking style)
- **📄 PDF** (.pdf) - Research papers, biographies, documents
- **📝 Text** (.txt, .text) - Interview transcripts, notes, correspondence
- **📑 Markdown** (.md) - Notes, documentation, structured text
- **📧 Email** (.eml, .mbox) - Correspondence, email threads
- **📊 Data** (.json) - Feishu exports, structured data

**Quick Example**:
```bash
# Upload multiple files (auto-analyzed)
/upload "Fei-Fei Li" bio.pdf
/upload "Fei-Fei Li" interview.md
/upload "Fei-Fei Li" wechat-chat.png

# Regenerate skill
node tools/skill-generator.mjs "Fei-Fei Li" --affiliation "Stanford University"
```

---

## 💻 All Command Interfaces

### 1️⃣ `/distill-mentor` - Generate Mentor Skill

**Purpose**: Generate a digital mentor skill from scratch

**Basic Syntax**:
```bash
node tools/skill-generator.mjs "<Mentor Name>" --affiliation "<Institution>"
```

**Optional Parameters**:
```bash
--deep-analyze          # Enable deep paper analysis (requires API)
--use-arxiv            # Enable ArXiv search (disabled by default)
--upload <file>         # Upload a single file
--incremental          # Incremental mode (process upload only)
```

**Usage Examples**:
```bash
# Basic usage
node tools/skill-generator.mjs "Geoffrey Hinton" --affiliation "University of Toronto"

# With deep analysis
node tools/skill-generator.mjs "Fei-Fei Li" --affiliation "Stanford University" --deep-analyze

# Upload materials
node tools/skill-generator.mjs "Yann LeCun" --affiliation "NYU" --upload paper.pdf --incremental
```

---

### 2️⃣ `/upload` - Upload Materials to Enhance Skills

**Purpose**: Upload papers, interviews, chat screenshots, etc. to automatically analyze and enhance existing mentor skills

**Basic Syntax**:
```bash
/upload "<Mentor Name>" <file_path>
```

**Supported File Types**:
- 📸 **Images** (.png, .jpg, .jpeg) - Chat screenshots, analyze speaking style
- 📄 **PDF** (.pdf) - Papers, biographies
- 📝 **Text** (.txt, .md) - Interviews, notes

**Usage Examples**:
```bash
# Upload chat screenshot
/upload "Fei-Fei Li" wechat-chat.png

# Upload paper
/upload "Geoffrey Hinton" research-paper.pdf

# Upload interview transcript
/upload "Yann LeCun" interview-transcript.md

# Regenerate after uploading multiple files
node tools/skill-generator.mjs "Fei-Fei Li" --affiliation "Stanford University"
```

**Note**: Automatic deep analysis is performed after upload, no extra parameters needed

---

### 3️⃣ `/bye` - End Mentor Conversation

**Purpose**: Gracefully end current mentor conversation

**Basic Syntax**:
```bash
/bye [mentor_name]
```

**Usage Examples**:
```bash
# Generic goodbye
/bye

# Say goodbye to specific mentor
/bye GeoffreyHinton
```

---

### 4️⃣ `/MentorName` - Chat with Mentor

**Purpose**: Converse with generated mentor skills

**Basic Syntax**:
```bash
/<MentorName> <your question or request>
```

**Mentor Naming Rules**:
- Remove spaces and special characters
- Examples: "Fei-Fei Li" → `FeiFeiLi`
- Examples: "Geoffrey Hinton" → `GeoffreyHinton`

**Usage Examples**:
```bash
# Paper review
/GeoffreyHinton Are the innovations in my deep learning paper prominent enough?

# Research direction consultation
/FeiFeiLi What are the frontier directions in computer vision?

# Research philosophy discussion
/YannLeCun What's your view on the future of self-supervised learning?

# Ask questions anytime
/YourName Help me review this experimental design
```

---

## 📖 Quick Start

### ⚠️ Prerequisites

**Claude Code CLI required** - Generated skills work within Claude Code

- 📖 Installation guide: [Claude Code Official Docs](https://code.claude.com/docs/en/overview)
- 💻 Claude Code is Anthropic's official AI-assisted programming tool

After installing Claude Code, continue below:

### 1️⃣ Installation

```bash
# Clone repository
git clone https://github.com/ybq22/supervisor.git
cd supervisor

# Install dependencies
npm install

# Configure API (optional, for deep analysis)
cp .env.example .env
# Edit .env file and add your API Key
```

### 2️⃣ Configure API (Optional)

For deep analysis and chat screenshot features, configure LLM API:

```bash
# Edit .env file
LLM_API=openai                                    # or anthropic
OPENAI_API_KEY=sk-xxx                            # Your API Key
OPENAI_BASE_URL=https://api.openai.com/v1        # API endpoint
OPENAI_MODEL=gpt-4o                              # Model name
```

For detailed configuration, see: [API Configuration Guide](API_CONFIGURATION.md)

### 3️⃣ Generate Your First Digital Mentor

```bash
# 👨‍🎓 As a student: Generate a skill for an admired mentor
node tools/skill-generator.mjs "Geoffrey Hinton" --affiliation "University of Toronto"

# 👨‍🏫 As a professor: Generate your own skill
node tools/skill-generator.mjs "Your Name" --affiliation "Your University"
```

### 4️⃣ Start Conversing!

```bash
# 👨‍🎓 Student: Ask questions anytime
/GeoffreyHinton Are the innovations in my paper prominent enough?

# 👨‍🏫 Professor: Let students quickly understand your research
/YourName What is your research philosophy?
```

---

## 📦 Multi-CLI Compatibility & .agents Specification

Supervisor now supports **interactive installation** and the latest **.agents specification**, allowing seamless integration with multiple AI CLIs (e.g., Claude Code, Gemini CLI).

After the execution of `skill-generator.mjs` finishes, you will be prompted to choose your preferred installation method:

1. **Centralized management using the `.agents` specification (Recommended)**:
   - Skills and profiles will be installed in the `~/.agents` directory, and `~/.agents/.skill-lock.json` will be automatically updated.
   - You will then be asked which CLIs to link to (e.g., `claude,gemini`). The system will automatically create the necessary symlinks (or fallback to copying files on Windows due to permission limits). This allows you to invoke the exact same AI mentor across different tools.
2. **Traditional direct installation**:
   - If selected, the files will be installed directly into the designated CLI workspace (defaulting to `~/.claude`), preserving the legacy user experience.

---

## 📋 Changelog

### 2026-04-07 - v1.2.0

**New Features** ✨:
- 📸 **Chat Screenshot Analysis**: Automatically recognize chat records and learn mentor's speaking style
- 📤 **Automatic Deep Analysis**: Upload materials for automatic deep analysis without manual steps
- 🔍 **Improved Search**: Default to Google Search instead of ArXiv, avoiding same-name author issues

**Improvements** 🚀:
- ✅ Fixed workspace path handling
- ✅ Optimized file upload and parsing flow
- ✅ Enhanced analysis result storage structure

**Documentation** 📚:
- Added chat screenshot analysis documentation
- Updated API configuration guide
- Added changelog section

### 2026-04-06 - v1.1.0

**New Features** ✨:
- 🧠 **Deep Paper Analysis**: Extract research themes, methodology, writing style
- 🌐 **Public Info Analysis**: Analyze personality, communication style, academic philosophy
- 📤 **Multi-Channel Upload**: Support PDF, TXT, MD, images, emails, and more
- 📊 **Quality Assessment**: Automatically assess data quality and provide improvement suggestions

**Improvements** 🚀:
- ✅ Support both OpenAI and Anthropic APIs
- ✅ Added .env configuration file support
- ✅ Optimized search strategy to avoid ArXiv same-name author issues

### 2026-04-05 - v1.0.0

**Initial Release** 🎉:
- ✨ Core mentor skill generation
- 🔍 ArXiv paper search
- 🌐 Google browser search
- 🤖 Claude Code skill generation
- 📚 Basic documentation and examples

---

## 🎬 Real-World Examples

### 👨‍🎓 Student Use Cases

#### 📝 Paper Review

```bash
/GeoffreyHinton Are the innovations in my deep learning paper prominent enough?
```

**Digital Mentor Will:**
1. Summarize paper's core contributions
2. Highlight strengths and weaknesses
3. Provide specific improvement suggestions
4. Maintain mentor's unique expression style

### 🔬 Research Direction Consultation

```bash
/GeoffreyHinton What are the frontier directions in neural network architecture design?
```

**Digital Mentor Will:**
1. Answer based on real research
2. Suggest relevant papers
3. Assess research feasibility
4. Clearly indicate uncertainties

---

### 👨‍🏫 Professor Use Cases

#### 💡 Share Research Philosophy

```bash
/YourName I want students to quickly understand my research philosophy and core views
```

**Digital Mentor Will:**
1. Systematically organize your research philosophy
2. Explain complex concepts in student-friendly language
3. Provide learning paths and resource recommendations
4. Help students quickly enter the research field

#### 📚 Improve Communication Efficiency

```bash
/YourName Help me answer common questions about my research methodology
```

**Digital Mentor Will:**
1. Summarize your methodology characteristics
2. Provide standardized Q&A
3. Maintain consistency in research style
4. Save time on repetitive communication

---

## 📁 Project Structure

```
supervisor/
├── tools/                     # Core tools
│   ├── skill-generator.mjs   # Main generator
│   ├── arxiv-search.mjs      # ArXiv search (optional)
│   ├── puppeteer-search.mjs  # Google browser search
│   ├── paper-analysis.mjs    # Deep paper analysis
│   ├── content-analyzer.mjs  # Content analysis (LLM API)
│   ├── chat-screenshot-analyzer.mjs  # Chat screenshot analysis
│   ├── workspace-manager.mjs # Workspace management
│   ├── parsers/              # File parsers
│   │   ├── pdf.mjs
│   │   ├── text.mjs
│   │   └── markdown.mjs
│   └── upload-scanner.mjs    # Upload file scanner
├── docs/                      # Documentation
│   ├── QUICKSTART.md         # Quick start guide
│   ├── API_CONFIGURATION.md  # API configuration guide
│   └── API_QUICK_REFERENCE.md # API quick reference
├── .env.example              # Configuration example
├── package.json              # Dependencies
├── diagnose-api.sh           # API diagnostic tool
└── README.md                 # This file
```

---

## 🏗️ How It Works

```
┌─────────────────────────────────────────────────────────────────┐
│              🎯 Mentor Distillation Workflow                       │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  1️⃣ Input mentor name + affiliation                              │
│           ↓                                                     │
│  2️⃣ 🔍 Multi-source Search (Google Search Priority)              │
│     ├─ Institutional page + name                                  │
│     ├─ Wikipedia                                                 │
│     ├─ Google Scholar                                            │
│     └─ Personal homepage                                         │
│           ↓                                                     │
│  3️⃣ 📤 Upload Materials (Optional)                               │
│     ├─ 📸 Chat screenshot → Analyze speaking style                │
│     ├─ 📄 PDF paper → Analyze research style                     │
│     ├─ 📝 Interview text → Analyze communication style           │
│     └─ Automatic deep analysis 🆕                                │
│           ↓                                                     │
│  4️⃣ 🧠 AI Deep Analysis                                          │
│     ├─ 🔬 Paper analysis (themes, methodology, writing style)      │
│     ├─ 🌐 Public info analysis (personality, communication, philosophy) │
│     ├─ 📸 Chat style analysis (tone, word choice, expression) 🆕   │
│     └─ 📊 Comprehensive profile generation                       │
│           ↓                                                     │
│  5️⃣ 💾 Persistent Storage                                        │
│     └─ Generate structured JSON profile + analysis results       │
│           ↓                                                     │
│  6️⃣ 🤖 Auto-Create Skill                                        │
│     └─ Generate ready-to-use Claude Code skill                   │
│           ↓                                                     │
│  7️⃣ 💬 Start Conversing!                                        │
│     ├─ Students: Ask questions, paper reviews, research consultation │
│     └─ Professors: Share philosophy, amplify impact, improve efficiency │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## 📚 Documentation

- 📖 [Quick Start](QUICKSTART.md) - 5-minute getting started guide
- 🔧 [API Configuration](API_CONFIGURATION.md) - LLM API configuration
- 📋 [API Quick Reference](API_QUICK_REFERENCE.md) - API parameter cheat sheet
- 🔧 [API Diagnostic Tool](diagnose-api.sh) - Test API connection

---

## ⚖️ Disclaimer

**Please read the following important information carefully:**

### 📌 Usage Limitations

1. **For Learning and Research Only** - Generated mentor skills are for academic communication, learning, research, and personal reference only
2. **No Commercial Use** - Strictly prohibit using generated skills for any commercial or profit-making activities
3. **Not Authoritative** - All generated content is based on AI analysis of public information and **does not represent the mentor's actual views or intentions**

### 🔒 Data Sources

- All information comes from **public channels** (papers, websites, interviews, social media, etc.)
- Does not involve any private or confidential information
- May be incomplete, outdated, or inaccurate

### ⚠️ Accuracy Statement

- AI-generated content is **for reference only** and does not constitute formal academic advice or professional guidance
- Do not rely entirely on generated skills for important academic or career decisions
- For critical issues, consult the mentor directly or authoritative sources

### 🤝 Intellectual Property

- Mentor names, research achievements, and academic views belong to themselves
- This tool is for information organization and knowledge dissemination only, and does not infringe on any intellectual property rights
- If you have any objections, please contact for removal or modification

---

## 🤝 Contributing

We welcome all forms of contributions!

### 👨‍🎓 What Students Can Do
1. **Test and Feedback** - Use the tool and share your experience
2. **Report Issues** - Submit issues when finding bugs or feature gaps
3. **Share Cases** - Share mentor skills you've successfully created
4. **Improve Documentation** - Help improve usage guides and examples

### 👨‍🏫 What Professors Can Do
1. **Provide Authentic Feedback** - Evaluate tool accuracy from an educator's perspective
2. **Share Best Practices** - How to better use digital mentors to assist teaching
3. **Suggest New Features** - Propose improvements based on teaching needs
4. **Contribute Data Sources** - Recommend more academic databases and resources

### 🔧 Technical Contributions
1. **Add New Data Sources** (Google Scholar, DBLP, Semantic Scholar, etc.)
2. **Improve Style Analysis Algorithms** (Enhance AI analysis accuracy)
3. **Optimize Prompt Templates** (Improve generation quality)
4. **Enhance Multi-language Support** (Enable more non-English mentors)

---

## 📋 License

MIT License - See [LICENSE](LICENSE)

---

<div align="center">

**Made with ❤️ by Claude Code & Human Collaboration**

### 🎓 Two-Way Empowerment for Academic Communication

**👨‍🎓 Students:** Get a digital replica of your admired mentor, ready to help anytime!
**👨‍🏫 Professors:** Share your research philosophy and reach more students!

---

## 🌟 Star History

[![Star History Chart](https://api.star-history.com/svg?repos=ybq22/supervisor&type=Date)](https://star-history.com/#ybq22/supervisor&Date)

**[Start Distilling Your Admired Mentor!](https://github.com/ybq22/supervisor)**

or

**[Create Your Own Digital Replica!](https://github.com/ybq22/supervisor)**

</div>
