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

```
/distill-mentor <导师姓名> [--affiliation "机构名称"]
```

### 示例

```
/distill-mentor 张三 --affiliation "清华大学"
/distill-mentor John Smith
```

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

## 核心函数

### ArXiv 搜索

```javascript
async function searchArxiv(authorName, maxResults = 10) {
  const searchQuery = `au:${authorName.replace(/\s+/g, '+')}`;
  const url = `http://export.arxiv.org/api/query?search_query=${searchQuery}&start=0&max_results=${maxResults}`;

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
    console.error(`ArXiv search failed: ${error.message}`);
    return [];
  }
}
```

### Google 搜索 (DuckDuckGo)

```javascript
async function searchGoogle(name, affiliation) {
  const query = affiliation
    ? `${name} ${affiliation} computer science`
    : `${name} professor university`;

  const url = `https://duckduckgo.com/html/?q=${encodeURIComponent(query)}`;

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
    console.error(`Google search failed: ${error.message}`);
    return [];
  }
}
```

### 信息收集协调器

```javascript
async function collectMentorInfo(name, affiliation) {
  console.log(`🔍 收集导师信息: ${name}`);

  const info = {
    name: name,
    affiliation: affiliation,
    papers: [],
    websites: [],
    sources: []
  };

  // 1. 搜索 ArXiv
  console.log("[1/3] 正在搜索 ArXiv...");
  const arxivPapers = await searchArxiv(name);
  if (arxivPapers.length > 0) {
    info.papers = arxivPapers;
    info.sources.push("arxiv");
    console.log(`✓ 找到 ${arxivPapers.length} 篇论文`);
  } else {
    console.log("✗ 未找到 ArXiv 论文");
  }

  // 2. 搜索个人主页
  console.log("[2/3] 正在搜索个人主页...");
  const websites = await searchGoogle(name, affiliation);
  if (websites.length > 0) {
    info.websites = websites;
    info.sources.push("google");
    console.log(`✓ 找到 ${websites.length} 个相关网页`);
  } else {
    console.log("✗ 未找到个人主页");
  }

  // 3. 数据质量检查
  console.log("[3/3] 验证数据质量...");
  const quality = assessDataQuality(info);
  console.log(`数据质量评分: ${quality.score}/1.0`);

  if (quality.score < 0.3) {
    console.warn("⚠️  数据不足，建议提供补充材料");
  }

  return { info, quality };
}
```

### 数据质量评估

```javascript
function assessDataQuality(info) {
  let score = 0;
  const missing = [];

  if (info.papers.length >= 3) score += 0.5;
  else missing.push("papers");

  if (info.websites.length > 0) score += 0.3;
  else missing.push("websites");

  if (info.papers.length > 0) score += 0.2;

  return {
    score: Math.min(score, 1.0),
    missing,
    data_sources: info.sources
  };
}
```

### 风格分析器

```javascript
async function analyzeStyle(info) {
  console.log("🧠 分析研究风格...");

  // 准备分析上下文
  const context = {
    name: info.name,
    affiliation: info.affiliation,
    paper_count: info.papers.length,
    paper_summaries: info.papers.slice(0, 5).map(p =>
      `Title: ${p.title}\nSummary: ${p.summary.substring(0, 500)}...`
    ).join('\n\n'),
    websites: info.websites.map(w => w.title).join(', ')
  };

  // 使用 Claude API 分析风格
  const analysisPrompt = `你是一位学术风格分析专家。基于以下信息，分析这位导师的研究风格。

## 导师信息
- 姓名: ${context.name}
- 机构: ${context.affiliation || '未知'}

## 论文（${context.paper_count}篇）
${context.paper_summaries}

## 网页
${context.websites}

请分析并返回 JSON 格式：
{
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
}`;

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
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
  } catch (error) {
    console.error(`Style analysis failed: ${error.message}`);
  }

  // 降级：返回默认风格
  return {
    research_style: {
      type: "混合型",
      description: "基于公开研究的综合风格",
      keywords: ["学术", "研究"]
    },
    communication_style: {
      tone: "专业",
      language: "英文"
    },
    academic_values: ["学术严谨", "创新思维"],
    expertise_areas: info.papers.slice(0, 3).map(p =>
      p.title.split(/\s+/).slice(0, 3).join(' ')
    )
  };
}
```

---
