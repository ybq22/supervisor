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

### 文件保存

```javascript
const fs = require('fs').promises;
const path = require('path');

async function saveProfile(profile) {
  // Save to user directory for consistency with skills
  const mentorsDir = path.join(process.env.HOME, '.claude', 'mentors');

  // 确保目录存在
  await fs.mkdir(mentorsDir, { recursive: true });

  // 生成文件名（处理特殊字符）
  const fileName = profile.meta.mentor_name
    .replace(/[^a-zA-Z0-9\u4e00-\u9fa5]/g, '_')
    + '.json';

  const filePath = path.join(mentorsDir, fileName);

  // 保存文件
  await fs.writeFile(
    filePath,
    JSON.stringify(profile, null, 2),
    'utf8'
  );

  console.log(`✓ 档案已保存: ${filePath}`);
  return filePath;
}
```

### System Prompt 生成器

```javascript
function generateSystemPrompt(profile) {
  const { profile: p, research: r, style: s } = profile;

  return `# System Prompt: ${p.name_zh}的数字分身

你是 ${p.name_zh}（${p.institution} ${p.position}）的 AI 助手，专注于提供与其研究风格和学术观点一致的指导。

## 你的身份

- **姓名**：${p.name_zh}
- **机构**：${p.institution}
- **研究领域**：${r.primary_fields.join(", ")}
- **研究风格**：${s.research_style.type}

## 研究背景

${r.research_summary}

### 代表性贡献
${r.key_publications.slice(0, 3).map(pub =>
  `- **${pub.title}** (${pub.year}): ${pub.summary.substring(0, 100)}...`
).join('\n')}

## 你的研究风格

${s.research_style.description}

- **类型**：${s.research_style.type}
- **关键词**：${s.research_style.keywords.join(", ")}

## 沟通风格

- **语气**：${s.communication_style.tone}
- **语言**：${s.communication_style.language}

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

${s.academic_values.map(v => `- ${v}`).join('\n')}

## 约束条件

- 不编造导师未发表的观点
- 超出专业领域时明确说明
- 保持学术严谨性
- 优先引用导师的真实研究

---

现在，请以 ${p.name_zh} 的身份回答用户的问题。`;
}
```

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

### 档案生成器

```javascript
function generateProfile(name, info, style) {
  const now = new Date().toISOString();

  return {
    meta: {
      version: "1.0",
      created_at: now,
      updated_at: now,
      mentor_name: name,
      affiliation: info.affiliation || "Unknown"
    },
    profile: {
      name_zh: name,
      name_en: name,
      institution: info.affiliation || "Unknown",
      department: "",
      position: "Professor",
      website: info.websites[0]?.url || "",
      languages: ["en", "zh"]
    },
    research: {
      primary_fields: style.expertise_areas.slice(0, 2),
      secondary_fields: [],
      research_summary: `Researcher in ${style.expertise_areas.join(", ")}.`,
      key_publications: info.papers.slice(0, 5).map(p => ({
        title: p.title,
        year: p.year,
        venue: "arXiv",
        arxiv_id: p.arxiv_id,
        summary: p.summary.substring(0, 200) + "..."
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
```

### Mentor Skill 生成器

```javascript
async function generateMentorSkill(profile) {
  const systemPrompt = generateSystemPrompt(profile);
  const mentorName = profile.meta.mentor_name;
  const now = new Date().toISOString().split('T')[0];

  const skillContent = `---
name: ${mentorName.replace(/[^a-zA-Z0-9\u4e00-\u9fa5]/g, '-').toLowerCase()}
description: AI mentor emulating ${mentorName} - ${profile.research.primary_fields.join(", ")} expert from ${profile.profile.institution}
author: Auto-generated by distill-mentor
version: 1.0.0
---

# ${mentorName} AI Mentor

This is an AI mentor skill auto-generated by distill-mentor, emulating the research style and academic perspectives of ${mentorName}.

Generated: ${now}
Papers analyzed: ${profile.research.key_publications.length}

---

${systemPrompt}
`;

  // IMPORTANT: Skills must use directory structure: ~/.claude/skills/<skill-name>/SKILL.md
  const skillDirName = mentorName.replace(/[^a-zA-Z0-9\u4e00-\u9fa5]/g, '-').toLowerCase();
  const skillsDir = path.join(process.env.HOME, '.claude', 'skills');
  const skillDir = path.join(skillsDir, skillDirName);

  await fs.mkdir(skillDir, { recursive: true });

  const filePath = path.join(skillDir, 'SKILL.md');
  await fs.writeFile(filePath, skillContent, 'utf8');

  console.log(`✓ Mentor skill 已生成: ${filePath}`);
  return filePath;
}
```

### 主工作流程

```javascript
async function main(args) {
  // 解析参数
  const name = args[0];
  const affiliation = args['--affiliation'] || null;

  // 输入验证
  if (!name) {
    console.log("❌ 错误: 请提供导师姓名");
    console.log("\n使用方法:");
    console.log("  /distill-mentor <导师姓名> [--affiliation \"机构名称\"]");
    console.log("\n示例:");
    console.log("  /distill-mentor 张三 --affiliation \"清华大学\"");
    console.log("  /distill-mentor John Smith");
    return;
  }

  if (name.trim().length === 0) {
    console.log("❌ 错误: 导师姓名不能为空");
    return;
  }

  console.log(`🎓 开始蒸馏导师: ${name}${affiliation ? ` (${affiliation})` : ''}`);
  console.log(`📋 工作流程:\n`);

  try {
    // 1. 收集信息
    console.log(`📚 [1/5] 收集导师信息...`);
    const { info, quality } = await collectMentorInfo(name, affiliation);

    // 数据质量检查和用户确认
    if (quality.score < 0.3) {
      console.log(`\n⚠️  数据质量较低 (score: ${quality.score.toFixed(2)})`);
      console.log(`缺失: ${quality.missing.join(', ') || '无'}`);
      console.log(`数据源: ${quality.data_sources.join(', ') || '无'}`);
      console.log(`\n💡 建议:`);
      if (quality.missing.includes('papers')) {
        console.log(`   - 提供导师的 ArXiv 主页或论文列表`);
      }
      if (quality.missing.includes('websites')) {
        console.log(`   - 提供导师的个人主页或机构页面`);
      }
      console.log(`\n❓ 数据质量较低，是否继续生成？[Y/n]`);

      // 注意: 在实际使用中，这里需要等待用户输入
      // 由于 skill 是自动执行的，我们使用环境变量或默认继续
      const shouldContinue = process.env.DISTILL_MENTOR_FORCE_CONTINUE === 'true';
      if (!shouldContinue) {
        console.log(`⏸️  已取消。设置 DISTILL_MENTOR_FORCE_CONTINUE=true 来强制继续`);
        return;
      }
      console.log(`✓ 继续生成...\n`);
    } else if (quality.score < 0.6) {
      console.log(`\n⚡ 数据质量中等 (score: ${quality.score.toFixed(2)})`);
      console.log(`   建议补充更多材料以获得更好的效果\n`);
    } else {
      console.log(`✓ 数据质量良好 (score: ${quality.score.toFixed(2)})\n`);
    }

    // 2. 分析风格
    console.log(`🧠 [2/5] 分析研究风格...`);
    let style;
    try {
      style = await analyzeStyle(info);
      console.log(`✓ 风格分析完成: ${style.research_style.type}\n`);
    } catch (styleError) {
      console.error(`✗ 风格分析失败: ${styleError.message}`);
      console.log(`  使用默认风格配置...\n`);
      // 降级到默认风格
      style = {
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

    // 3. 生成档案
    console.log(`📝 [3/5] 生成导师档案...`);
    let profile;
    try {
      profile = generateProfile(name, info, style);
      console.log(`✓ 档案生成完成\n`);
    } catch (profileError) {
      throw new Error(`档案生成失败: ${profileError.message}`);
    }

    // 4. 保存档案
    console.log(`💾 [4/5] 保存档案文件...`);
    let profilePath;
    try {
      profilePath = await saveProfile(profile);
    } catch (saveError) {
      throw new Error(`档案保存失败: ${saveError.message} (检查目录权限)`);
    }

    // 5. 生成 skill
    console.log(`🤖 [5/5] 生成对话 Skill...`);
    let skillPath;
    try {
      skillPath = await generateMentorSkill(profile);
    } catch (skillError) {
      throw new Error(`Skill 生成失败: ${skillError.message} (检查目录权限)`);
    }

    // 6. 完成预览
    console.log(`\n${'='.repeat(60)}`);
    console.log(`✅ 蒸馏完成！`);
    console.log(`${'='.repeat(60)}\n`);

    console.log(`📊 生成统计:`);
    console.log(`   论文数量: ${profile.research.key_publications.length} 篇`);
    console.log(`   研究领域: ${profile.research.primary_fields.join(', ')}`);
    console.log(`   研究风格: ${profile.style.research_style.type}`);
    console.log(`   交流风格: ${profile.style.communication_style.tone}\n`);

    console.log(`📁 输出文件:`);
    console.log(`   档案: ${profilePath}`);
    console.log(`   Skill: ${skillPath}\n`);

    console.log(`🚀 使用方法:`);
    console.log(`   /${name.replace(/[^a-zA-Z0-9\u4e00-\u9fa5]/g, '-').toLowerCase()} 你的问题\n`);

    // 质量提醒
    if (quality.score < 0.6) {
      console.log(`💡 提示: 数据质量评分 ${quality.score.toFixed(2)} 较低`);
      console.log(`   建议: 上传更多论文、演讲视频等材料来提升效果\n`);
    }

  } catch (error) {
    console.error(`\n${'='.repeat(60)}`);
    console.error(`❌ 执行失败`);
    console.error(`${'='.repeat(60)}`);

    // 错误类型识别
    let errorType = '未知错误';
    let suggestion = '请检查输入参数后重试';

    if (error.message.includes('fetch') || error.message.includes('network')) {
      errorType = '网络错误';
      suggestion = '请检查网络连接或稍后重试';
    } else if (error.message.includes('parse') || error.message.includes('JSON')) {
      errorType = '数据解析错误';
      suggestion = '可能是数据格式异常，请尝试其他导师';
    } else if (error.message.includes('permission') || error.message.includes('EACCES')) {
      errorType = '权限错误';
      suggestion = '请检查 ~/.claude 目录的写入权限';
    } else if (error.message.includes('ENOSPC')) {
      errorType = '磁盘空间不足';
      suggestion = '请清理磁盘空间后重试';
    } else if (error.message.includes('API') || error.message.includes('anthropic')) {
      errorType = 'API 调用失败';
      suggestion = '请检查 ANTHROPIC_API_KEY 环境变量';
    }

    console.error(`\n错误类型: ${errorType}`);
    console.error(`错误信息: ${error.message}`);
    console.error(`\n💡 建议: ${suggestion}\n`);

    throw error;
  }
}

// 导出 main 函数
module.exports = { main };
```

---
