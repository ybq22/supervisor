# 导师蒸馏系统 (Mentor Supervisor) 实施计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-step. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 创建一个兼容 Claude Code 的 skill 系统，能够自动收集学术导师信息并生成可对话的数字导师 skill

**Architecture:** 双 skill 架构 - distill-mentor 负责信息收集和分析，自动生成独立的 mentor-{name} skill 用于对话

**Tech Stack:** JavaScript (Claude Code Skill), ArXiv API, DuckDuckGo Search, 本地 JSON 存储

---

## 文件结构

```
~/.claude/
├── mentors/
│   ├── .gitkeep                    # 确保目录存在
│   └── README.md                   # 使用说明
│
└── skills/
    └── distill-mentor.md           # 主要 skill 文件
```

**核心文件职责：**
- **distill-mentor.md**: 完整的信息收集、分析、档案生成、skill 生成逻辑
- **~/.claude/mentors/**: 存储导师 JSON 档案的目录
- **mentor-{name}.md**: 自动生成的导师对话 skill（由 distill-mentor 创建）

---

## Task 1: 创建目录结构和基础文档

**Files:**
- Create: `~/.claude/mentors/.gitkeep`
- Create: `~/.claude/mentors/README.md`

### 步骤

- [ ] **Step 1: 创建 mentors 目录**

```bash
mkdir -p ~/.claude/mentors
```

- [ ] **Step 2: 创建 .gitkeep 文件**

```bash
touch ~/.claude/mentors/.gitkeep
```

- [ ] **Step 3: 编写 README.md**

```bash
cat > ~/.claude/mentors/README.md << 'EOF'
# 导师档案目录

这个目录存储由 `distill-mentor` skill 生成的导师档案。

## 档案格式

每个导师一个 JSON 文件，命名为 `{name}.json`。

## 使用方法

1. 使用 `/distill-mentor {导师姓名}` 生成新档案
2. 生成的档案会自动保存到这个目录
3. 对应的 mentor skill 会自动创建到 `~/.claude/skills/`

## 示例

```
/distill-mentor 张三 --affiliation "清华大学"
```

这会生成：
- `~/.claude/mentors/张三.json` - 导师档案
- `~/.claude/skills/mentor-张三.md` - 对话 skill

## 手动编辑

你可以直接编辑 JSON 文件来修正导师信息，然后重新运行 `/distill-mentor {name}` 来更新对应的 skill。
EOF
```

- [ ] **Step 4: 验证目录结构**

```bash
ls -la ~/.claude/mentors/
```

Expected: 看到 `.gitkeep` 和 `README.md`

- [ ] **Step 5: 提交初始结构**

```bash
cd ~/.claude/mentors
git init
git add .gitkeep README.md
git commit -m "chore: initialize mentors directory structure"
```

---

## Task 2: 创建 distill-mentor skill 框架

**Files:**
- Create: `~/.claude/skills/distill-mentor.md`

### 步骤

- [ ] **Step 1: 创建 skill 基础结构**

```bash
cat > ~/.claude/skills/distill-mentor.md << 'EOF'
---
name: distill-mentor
description: 蒸馏学术导师的数字分身 - 自动收集导师信息并生成可对话的 mentor skill
author: Mentor Supervisor System
version: 1.0.0
parameters:
  - name: name
    description: 导师姓名
    required: true
  - name: affiliation
    description: 所属机构（可选）
    required: false
---

# 导师蒸馏 Skill

自动收集学术导师的信息，分析其研究风格和表达特点，生成可对话的数字导师 skill。

## 使用方法

\`\`\`
/distill-mentor <导师姓名> [--affiliation "机构名称"]
\`\`\`

### 示例

\`\`\`
/distill-mentor 张三 --affiliation "清华大学"
/distill-mentor John Smith
\`\`\`

## 功能说明

1. **信息收集**：自动搜索 ArXiv、个人主页等公开信息
2. **风格分析**：使用 AI 分析导师的研究风格和表达习惯
3. **档案生成**：生成结构化的 JSON 档案
4. **Skill 生成**：自动创建可对话的 mentor skill

## 工作流程

1. 搜索导师信息（ArXiv、Google Search）
2. 分析论文和主页内容
3. 提取研究风格和表达特点
4. 生成 JSON 档案
5. 生成对应的 mentor skill
6. 预览并确认

## 输出

- **档案文件**: `~/.claude/mentors/{name}.json`
- **对话 Skill**: `~/.claude/skills/mentor-{name}.md`

---

EOF
```

- [ ] **Step 2: 验证 skill 文件创建**

```bash
cat ~/.claude/skills/distill-mentor.md | head -20
```

Expected: 看到 YAML frontmatter 和使用说明

- [ ] **Step 3: 测试 skill 加载**

```bash
# 在 Claude Code 中测试
# 输入：/distill-mentor --help
# 应该显示使用说明
```

Expected: skill 可以被识别并显示帮助信息

- [ ] **Step 4: 提交框架代码**

```bash
cd ~/.claude/skills
git add distill-mentor.md
git commit -m "feat: add distill-mentor skill framework"
```

---

## Task 3: 实现 ArXiv API 集成

**Files:**
- Modify: `~/.claude/skills/distill-mentor.md`

### 步骤

- [ ] **Step 1: 添加 ArXiv 搜索函数**

在 distill-mentor.md 中添加以下 JavaScript 代码：

\`\`\`javascript
async function searchArxiv(authorName, maxResults = 10) {
  const searchQuery = \`au:\${authorName.replace(/\s+/g, '+')}\`;
  const url = \`http://export.arxiv.org/api/query?search_query=\${searchQuery}&start=0&max_results=\${maxResults}\`;

  try {
    const response = await fetch(url);
    const text = await response.text();

    // 解析 XML 响应
    const entries = text.match(/<entry>[\s\S]*?<\/entry>/g) || [];

    return entries.map(entry => {
      const title = entry.match(/<title>(.*?)<\/title>/)?.[1] || '';
      const summary = entry.match(/<summary>(.*?)<\/summary>/)?.[1] || '';
      const published = entry.match(/<published>(.*?)<\/published>/)?.[1] || '';
      const arxivId = entry.match(/<id>(.*?)<\/id>/)?.[1]?.split('/').pop() || '';
      const authors = entry.match(/<name>(.*?)<\/name>/g)?.map(a => a.replace(/<name>|<\/name>/g, '')) || [];

      return {
        title: title.trim(),
        summary: summary.trim(),
        published: published,
        arxiv_id: arxivId,
        authors: authors,
        year: published ? new Date(published).getFullYear() : null
      };
    });
  } catch (error) {
    console.error(\`ArXiv search failed: \${error.message}\`);
    return [];
  }
}
\`\`\`

- [ ] **Step 2: 测试 ArXiv 搜索**

\`\`\`javascript
// 测试代码
const results = await searchArxiv("Hinton");
console.log(\`Found \${results.length} papers\`);
console.log(results[0]);
\`\`\`

Expected: 返回至少一篇论文信息

- [ ] **Step 3: 提交 ArXiv 集成**

```bash
git add ~/.claude/skills/distill-mentor.md
git commit -m "feat: add ArXiv API integration"
```

---

## Task 4: 实现 Google Search 集成（DuckDuckGo）

**Files:**
- Modify: `~/.claude/skills/distill-mentor.md`

### 步骤

- [ ] **Step 1: 添加 DuckDuckGo 搜索函数**

\`\`\`javascript
async function searchGoogle(name, affiliation) {
  const query = affiliation
    ? \`\${name} \${affiliation} computer science\`
    : \`\${name} professor university\`;

  const url = \`https://duckduckgo.com/html/?q=\${encodeURIComponent(query)}\`;

  try {
    const response = await fetch(url);
    const html = await response.text();

    // 提取搜索结果（简化版）
    const results = html.match(/<a[^>]*class="result__url"[^>]*>(.*?)<\/a>/g) || [];

    return results.slice(0, 5).map(result => {
      const url = result.match(/href="([^"]*)"/)?.[1] || '';
      const title = result.replace(/<[^>]*>/g, '').trim();

      return {
        url: url,
        title: title
      };
    }).filter(r => r.url && !r.url.includes('duckduckgo'));
  } catch (error) {
    console.error(\`Google search failed: \${error.message}\`);
    return [];
  }
}
\`\`\`

- [ ] **Step 2: 测试搜索功能**

\`\`\`javascript
const results = await searchGoogle("Yann LeCun", "NYU");
console.log(results);
\`\`\`

Expected: 返回相关网页链接

- [ ] **Step 3: 提交搜索集成**

```bash
git add ~/.claude/skills/distill-mentor.md
git commit -m "feat: add DuckDuckGo search integration"
```

---

## Task 5: 实现信息收集协调器

**Files:**
- Modify: `~/.claude/skills/distill-mentor.md`

### 步骤

- [ ] **Step 1: 添加收集器函数**

\`\`\`javascript
async function collectMentorInfo(name, affiliation) {
  console.log(\`🔍 收集导师信息: \${name}\`);

  const info = {
    name: name,
    affiliation: affiliation,
    papers: [],
    websites: [],
    sources: []
  };

  // 1. 搜索 ArXiv
  console.log(\"[1/3] 正在搜索 ArXiv...\");
  const arxivPapers = await searchArxiv(name);
  if (arxivPapers.length > 0) {
    info.papers = arxivPapers;
    info.sources.push(\"arxiv\");
    console.log(\`✓ 找到 \${arxivPapers.length} 篇论文\`);
  } else {
    console.log(\"✗ 未找到 ArXiv 论文\");
  }

  // 2. 搜索个人主页
  console.log(\"[2/3] 正在搜索个人主页...\");
  const websites = await searchGoogle(name, affiliation);
  if (websites.length > 0) {
    info.websites = websites;
    info.sources.push(\"google\");
    console.log(\`✓ 找到 \${websites.length} 个相关网页\`);
  } else {
    console.log(\"✗ 未找到个人主页\");
  }

  // 3. 数据质量检查
  console.log(\"[3/3] 验证数据质量...\");
  const quality = assessDataQuality(info);
  console.log(\`数据质量评分: \${quality.score}/1.0\`);

  if (quality.score < 0.3) {
    console.warn(\"⚠️  数据不足，建议提供补充材料\");
  }

  return { info, quality };
}

function assessDataQuality(info) {
  let score = 0;
  const missing = [];

  if (info.papers.length >= 3) score += 0.5;
  else missing.push(\"papers\");

  if (info.websites.length > 0) score += 0.3;
  else missing.push(\"websites\");

  if (info.papers.length > 0) score += 0.2;

  return {
    score: Math.min(score, 1.0),
    missing,
    data_sources: info.sources
  };
}
\`\`\`

- [ ] **Step 2: 测试收集器**

\`\`\`javascript
const { info, quality } = await collectMentorInfo(\"Hinton\", null);
console.log(\`Quality: \${quality.score}\`);
console.log(\`Papers: \${info.papers.length}\`);
\`\`\`

Expected: 成功收集信息并返回质量评分

- [ ] **Step 3: 提交收集器代码**

```bash
git add ~/.claude/skills/distill-mentor.md
git commit -m "feat: add info collection coordinator"
```

---

## Task 6: 实现风格分析器

**Files:**
- Modify: `~/.claude/skills/distill-mentor.md`

### 步骤

- [ ] **Step 1: 添加风格分析函数**

\`\`\`javascript
async function analyzeStyle(info) {
  console.log(\"🧠 分析研究风格...\");

  // 准备分析上下文
  const context = {
    name: info.name,
    affiliation: info.affiliation,
    paper_count: info.papers.length,
    paper_summaries: info.papers.slice(0, 5).map(p =>
      \`Title: \${p.title}\\nSummary: \${p.summary.substring(0, 500)}...\`
    ).join('\\n\\n'),
    websites: info.websites.map(w => w.title).join(', ')
  };

  // 使用 Claude API 分析风格
  const analysisPrompt = \`你是一位学术风格分析专家。基于以下信息，分析这位导师的研究风格。

## 导师信息
- 姓名: \${context.name}
- 机构: \${context.affiliation || '未知'}

## 论文（\${context.paper_count}篇）
\${context.paper_summaries}

## 网页
\${context.websites}

请分析并返回 JSON 格式：
\{
  "research_style": {
    "type": "理论型/实验型/系统型/混合型",
    "description": "简短描述",
    "keywords": ["关键词1", "关键词2"]
  },
  "communication_style": {
    "tone": "严厉/温和/幽默/专业",
    "language": "中英混合/全英文/全中文"
  },
  "academic_values": ["价值观1", "价值观2"],
  "expertise_areas": ["领域1", "领域2"]
\}\`;

  try {
    // 调用 Claude API
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 2000,
        messages: [{
          role: 'user',
          content: analysisPrompt
        }]
      })
    });

    const data = await response.json();
    const content = data.content[0].text;

    // 提取 JSON
    const jsonMatch = content.match(/\\{[\\s\\S]*\\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
  } catch (error) {
    console.error(\`Style analysis failed: \${error.message}\`);
  }

  // 降级：返回默认风格
  return {
    research_style: {
      type: \"混合型\",
      description: \"基于公开研究的综合风格\",
      keywords: [\"学术\", \"研究\"]
    },
    communication_style: {
      tone: \"专业\",
      language: \"英文\"
    },
    academic_values: [\"学术严谨\", \"创新思维\"],
    expertise_areas: info.papers.slice(0, 3).map(p =>
      p.title.split(/\\s+/).slice(0, 3).join(' ')
    )
  };
}
\`\`\`

- [ ] **Step 2: 测试风格分析**

\`\`\`javascript
const style = await analyzeStyle(info);
console.log(JSON.stringify(style, null, 2));
\`\`\`

Expected: 返回风格分析结果

- [ ] **Step 3: 提交分析器代码**

```bash
git add ~/.claude/skills/distill-mentor.md
git commit -m "feat: add style analyzer"
```

---

## Task 7: 实现 JSON 档案生成器

**Files:**
- Modify: `~/.claude/skills/distill-mentor.md`

### 步骤

- [ ] **Step 1: 添加档案生成函数**

\`\`\`javascript
function generateProfile(name, info, style) {
  const now = new Date().toISOString();

  return {
    meta: {
      version: \"1.0\",
      created_at: now,
      updated_at: now,
      mentor_name: name,
      affiliation: info.affiliation || \"Unknown\"
    },
    profile: {
      name_zh: name,
      name_en: name, // 可以后续优化
      institution: info.affiliation || \"Unknown\",
      department: \"\",
      position: \"Professor\",
      website: info.websites[0]?.url || \"\",
      languages: [\"en\", \"zh\"]
    },
    research: {
      primary_fields: style.expertise_areas.slice(0, 2),
      secondary_fields: [],
      research_summary: \`Researcher in \${style.expertise_areas.join(\", \)}.\`,
      key_publications: info.papers.slice(0, 5).map(p => ({
        title: p.title,
        year: p.year,
        venue: \"arXiv\",
        arxiv_id: p.arxiv_id,
        summary: p.summary.substring(0, 200) + \"...\"
      })),
      recent_arxiv: info.papers.slice(0, 5).map(p => ({
        title: p.title,
        arxiv_id: p.arxiv_id,
        year: p.year,
        summary: p.summary.substring(0, 200)
      }))
    },
    style: style,
    source_materials: {
      papers_count: info.papers.length,
      websites_visited: info.websites.map(w => w.title),
      user_uploads: []
    }
  };
}
\`\`\`

- [ ] **Step 2: 测试档案生成**

\`\`\`javascript
const profile = generateProfile(\"Test\", info, style);
console.log(JSON.stringify(profile, null, 2));
\`\`\`

Expected: 生成完整的 JSON 档案

- [ ] **Step 3: 提交档案生成器**

```bash
git add ~/.claude/skills/distill-mentor.md
git commit -m "feat: add profile generator"
```

---

## Task 8: 实现文件保存功能

**Files:**
- Modify: `~/.claude/skills/distill-mentor.md`

### 步骤

- [ ] **Step 1: 添加保存函数**

\`\`\`javascript
const fs = require('fs').promises;
const path = require('path');

async function saveProfile(profile) {
  const mentorsDir = path.join(process.env.HOME, '.claude', 'mentors');

  // 确保目录存在
  await fs.mkdir(mentorsDir, { recursive: true });

  // 生成文件名（处理特殊字符）
  const fileName = profile.meta.mentor_name
    .replace(/[^a-zA-Z0-9\\u4e00-\\u9fa5]/g, '_')
    + '.json';

  const filePath = path.join(mentorsDir, fileName);

  // 保存文件
  await fs.writeFile(
    filePath,
    JSON.stringify(profile, null, 2),
    'utf8'
  );

  console.log(\`✓ 档案已保存: \${filePath}\`);
  return filePath;
}
\`\`\`

- [ ] **Step 2: 测试保存功能**

\`\`\`javascript
const filePath = await saveProfile(profile);
console.log(\`Saved to: \${filePath}\");
\`\`\`

Expected: 文件保存成功

- [ ] **Step 3: 验证文件内容**

```bash
cat ~/.claude/mentors/Test.json | jq .meta
```

Expected: 看到档案的 meta 信息

- [ ] **Step 4: 提交保存功能**

```bash
git add ~/.claude/skills/distill-mentor.md
git commit -m "feat: add profile save function"
```

---

## Task 9: 实现 System Prompt 生成器

**Files:**
- Modify: `~/.claude/skills/distill-mentor.md`

### 步骤

- [ ] **Step 1: 添加 prompt 生成函数**

\`\`\`javascript
function generateSystemPrompt(profile) {
  const { profile: p, research: r, style: s } = profile;

  return \`# System Prompt: \${p.name_zh}的数字分身

你是 \${p.name_zh}（\${p.institution} \${p.position}）的 AI 助手，专注于提供与其研究风格和学术观点一致的指导。

## 你的身份

- **姓名**：\${p.name_zh}
- **机构**：\${p.institution}
- **研究领域**：\${r.primary_fields.join(\", \")}
- **研究风格**：\${s.research_style.type}

## 研究背景

\${r.research_summary}

### 代表性贡献
\${r.key_publications.slice(0, 3).map(pub =>
  `- **\${pub.title}** (\${pub.year}): \${pub.summary.substring(0, 100)}...`
).join('\\n')}

## 你的研究风格

\${s.research_style.description}

- **类型**：\${s.research_style.type}
- **关键词**：\${s.research_style.keywords.join(\", \")}

## 沟通风格

- **语气**：\${s.communication_style.tone}
- **语言**：\${s.communication_style.language}

## 对话原则

1. **基于真实研究**：只依据导师的真实论文和观点，不编造
2. **风格一致性**：保持导师的表达方式和学术观点
3. **建设性反馈**：提供具体、可操作的建议
4. **承认不确定性**：超出导师专业领域时，明确说明

## 典型回复模式

### 当审阅论文时：
1. 先总结论文核心贡献
2. 指出亮点（使用导师的常用表达）
3. 提出改进建议（引用导师的研究标准）
4. 给出具体行动建议

### 当讨论研究想法时：
1. 评估可行性（基于导师的研究风格）
2. 指出潜在问题（使用导师关注的维度）
3. 提供相关论文建议（基于导师的真实研究）

## 学术价值观

\${s.academic_values.map(v => \`- \${v}\`).join('\\n')}

## 约束条件

- 不编造导师未发表的观点
- 超出专业领域时明确说明
- 保持学术严谨性
- 优先引用导师的真实研究

---

现在，请以 \${p.name_zh} 的身份回答用户的问题。\`;
}
\`\`\`

- [ ] **Step 2: 测试 prompt 生成**

\`\`\`javascript
const prompt = generateSystemPrompt(profile);
console.log(prompt.substring(0, 500) + \"...\");
\`\`\`

Expected: 生成格式化的 system prompt

- [ ] **Step 3: 提交 prompt 生成器**

```bash
git add ~/.claude/skills/distill-mentor.md
git commit -m "feat: add system prompt generator"
```

---

## Task 10: 实现 Mentor Skill 生成器

**Files:**
- Modify: `~/.claude/skills/distill-mentor.md`

### 步骤

- [ ] **Step 1: 添加 skill 生成函数**

\`\`\`javascript
async function generateMentorSkill(profile) {
  const systemPrompt = generateSystemPrompt(profile);
  const mentorName = profile.meta.mentor_name;
  const now = new Date().toISOString().split('T')[0];

  const skillContent = \`---
name: mentor-\${mentorName}
description: \${mentorName}教授的数字分身 - \${profile.profile.institution} - \${profile.research.primary_fields.join(\", \")}
author: Auto-generated by distill-mentor
version: 1.0.0
---

# \${mentorName}的数字分身

这是基于 distill-mentor 自动生成的导师对话 skill。

## 使用方法

直接输入：\`/\${mentorName} 你的问题\`

例如：
- \`/\${mentorName} 你觉得我论文的这个方法怎么样？\`
- \`/\${mentorName} 这个研究方向有前景吗？\`

## 导师信息

- **姓名**：\${mentorName}
- **机构**：\${profile.profile.institution}
- **领域**：\${profile.research.primary_fields.join(\", \")}
- **生成时间**：\${now}
- **论文数量**：\${profile.research.key_publications.length}

---

\${systemPrompt}
\`;

  const skillsDir = path.join(process.env.HOME, '.claude', 'skills');
  const fileName = \`mentor-\${mentorName.replace(/[^a-zA-Z0-9\\u4e00-\\u9fa5]/g, '_')}.md\`;
  const filePath = path.join(skillsDir, fileName);

  await fs.writeFile(filePath, skillContent, 'utf8');

  console.log(\`✓ Mentor skill 已生成: \${filePath}\`);
  return filePath;
}
\`\`\`

- [ ] **Step 2: 测试 skill 生成**

\`\`\`javascript
const skillPath = await generateMentorSkill(profile);
console.log(\`Skill created: \${skillPath}\");
\`\`\`

Expected: skill 文件生成成功

- [ ] **Step 3: 验证 skill 格式**

```bash
cat ~/.claude/skills/mentor-Test.md | head -20
```

Expected: 看到正确的 YAML frontmatter

- [ ] **Step 4: 提交 skill 生成器**

```bash
git add ~/.claude/skills/distill-mentor.md
git commit -m "feat: add mentor skill generator"
```

---

## Task 11: 实现主流程函数

**Files:**
- Modify: `~/.claude/skills/distill-mentor.md`

### 步骤

- [ ] **Step 1: 添加主函数**

\`\`\`javascript
async function main(args) {
  // 解析参数
  const name = args[0];
  const affiliation = args['--affiliation'] || null;

  if (!name) {
    console.log(\"❌ 错误: 请提供导师姓名\");
    console.log(\"\\n使用方法:\");
    console.log(\"  /distill-mentor <导师姓名> [--affiliation \\\"机构名称\\\"]\");
    console.log(\"\\n示例:\");
    console.log(\"  /distill-mentor 张三 --affiliation \\\"清华大学\\\"\");
    return;
  }

  console.log(\`🎓 开始蒸馏导师: \${name}\`);

  try {
    // 1. 收集信息
    const { info, quality } = await collectMentorInfo(name, affiliation);

    if (quality.score < 0.3) {
      console.log(\"\\n⚠️  数据不足，是否继续？(y/n)\");
      // 在实际实现中，这里需要用户交互
      console.log(\"继续生成...\");
    }

    // 2. 分析风格
    const style = await analyzeStyle(info);

    // 3. 生成档案
    const profile = generateProfile(name, info, style);

    // 4. 保存档案
    const profilePath = await saveProfile(profile);
    console.log(\`\\n📄 档案: \${profilePath}\`);

    // 5. 生成 skill
    const skillPath = await generateMentorSkill(profile);
    console.log(\`🤖 Skill: \${skillPath}\`);

    // 6. 预览
    console.log(\`\\n✅ 完成！\\n\`);
    console.log(\`预览:\`);
    console.log(\`- 领域: \${profile.research.primary_fields.join(\", \")}\`);
    console.log(\`- 论文: \${profile.research.key_publications.length} 篇\`);
    console.log(\`- 风格: \${profile.style.research_style.type}\\n\`);
    console.log(\`现在可以使用 /\${name} 来对话了！\");

  } catch (error) {
    console.error(\`\\n❌ 错误: \${error.message}\`);
    throw error;
  }
}

// 导出 main 函数
module.exports = { main };
\`\`\`

- [ ] **Step 2: 测试完整流程**

\`\`\`javascript
await main([\"Hinton\", \"--affiliation\", \"University of Toronto\"]);
\`\`\`

Expected: 完整流程执行成功

- [ ] **Step 3: 提交主流程**

```bash
git add ~/.claude/skills/distill-mentor.md
git commit -m "feat: add main workflow function"
```

---

## Task 12: 添加错误处理和用户交互

**Files:**
- Modify: `~/.claude/skills/distill-mentor.md`

### 步骤

- [ ] **Step 1: 增强错误处理**

在所有异步函数中添加 try-catch，并提供友好的错误消息。

- [ ] **Step 2: 添加进度提示**

确保每个步骤都有清晰的进度输出。

- [ ] **Step 3: 添加数据验证**

在关键步骤验证数据完整性。

- [ ] **Step 4: 提交错误处理改进**

```bash
git add ~/.claude/skills/distill-mentor.md
git commit -m "feat: add error handling and user interaction"
```

---

## Task 13: 编写测试用例

**Files:**
- Create: `tests/test-distill-mentor.js`

### 步骤

- [ ] **Step 1: 创建测试文件**

\`\`\`javascript
const assert = require('assert');

// 测试 ArXiv 搜索
async function testArxivSearch() {
  const papers = await searchArxiv(\"Hinton\");
  assert(papers.length > 0, \"应该找到至少一篇论文\");
  assert(papers[0].title, \"论文应该有标题\");
  console.log(\"✓ ArXiv 搜索测试通过\");
}

// 测试档案生成
async function testProfileGeneration() {
  const mockInfo = {
    name: \"Test\",
    affiliation: \"Test University\",
    papers: [{ title: \"Test Paper\", year: 2024 }],
    websites: []
  };

  const mockStyle = {
    research_style: { type: \"理论型\", description: \"Test\", keywords: [\"test\"] },
    communication_style: { tone: \"专业\", language: \"英文\" },
    academic_values: [\"测试\"],
    expertise_areas: [\"测试领域\"]
  };

  const profile = generateProfile(\"Test\", mockInfo, mockStyle);
  assert(profile.meta.mentor_name === \"Test\");
  assert(profile.research.key_publications.length === 1);
  console.log(\"✓ 档案生成测试通过\");
}

// 运行测试
async function runTests() {
  try {
    await testArxivSearch();
    await testProfileGeneration();
    console.log(\"\\n✅ 所有测试通过\");
  } catch (error) {
    console.error(\`\\n❌ 测试失败: \${error.message}\`);
    process.exit(1);
  }
}

runTests();
\`\`\`

- [ ] **Step 2: 运行测试**

```bash
node tests/test-distill-mentor.js
```

Expected: 所有测试通过

- [ ] **Step 3: 提交测试代码**

```bash
git add tests/
git commit -m "test: add unit tests for distill-mentor"
```

---

## Task 14: 编写文档

**Files:**
- Create: `README.md`
- Create: `docs/USAGE.md`

### 步骤

- [ ] **Step 1: 创建主 README**

\`\`\`markdown
# 导师蒸馏系统 (Mentor Supervisor)

自动"蒸馏"学术导师风格，生成可对话的数字导师 skill。

## 功能特点

- 🔍 自动搜索公开学术信息
- 🧠 AI 驱动的风格分析
- 💾 本地 JSON 档案存储
- 🤖 自动生成 Claude Code skill
- 🌍 多语言支持

## 快速开始

\`\`\`bash
# 安装
npm install

# 使用
/distill-mentor 张三 --affiliation "清华大学"

# 对话
/张三 你觉得我的论文怎么样？
\`\`\`

## 文档

- [使用指南](docs/USAGE.md)
- [API 文档](docs/API.md)
- [架构设计](docs/superpowers/specs/2026-03-31-mentor-supervisor-design.md)

## License

MIT
\`\`\`

- [ ] **Step 2: 创建使用文档**

- [ ] **Step 3: 提交文档**

```bash
git add README.md docs/
git commit -m "docs: add project documentation"
```

---

## Task 15: 最终集成测试

**Files:**
- Test: End-to-end testing

### 步骤

- [ ] **Step 1: 端到端测试**

使用真实的导师姓名测试完整流程：

\`\`\`bash
/distill-mentor Geoffrey Hinton --affiliation "University of Toronto"
\`\`\`

- [ ] **Step 2: 验证生成的 skill**

\`\`\`bash
/Geoffrey Hinton 请解释一下反向传播
\`\`\`

Expected: 得到符合 Hinton 风格的回答

- [ ] **Step 3: 性能测试**

测量完整流程的执行时间，确保在 2 分钟内完成。

- [ ] **Step 4: 提交最终版本**

```bash
git add .
git commit -m "chore: final integration test and polish"
git tag -a v1.0.0 -m "Release v1.0.0"
```

---

## 检查清单

在实施过程中，确保：

- [ ] 所有函数都有错误处理
- [ ] 所有异步操作都使用 await/async
- [ ] 所有文件操作都有路径验证
- [ ] 所有用户输入都有验证
- [ ] 所有 API 调用都有超时处理
- [ ] 所有测试都通过
- [ ] 文档完整且准确
- [ ] 代码符合 YAGNI 原则
- [ ] 没有硬编码的配置
- [ ] 使用了环境变量存储敏感信息

---

## 实施顺序建议

1. **Task 1-2**: 基础设施搭建
2. **Task 3-5**: 信息收集层
3. **Task 6-9**: 分析和生成层
4. **Task 10-11**: Skill 生成和主流程
5. **Task 12-15**: 测试和完善

每个任务完成后立即提交，保持小步快跑。
