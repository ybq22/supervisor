#!/usr/bin/env node
/**
 * 导师蒸馏系统 CLI
 * 自动收集学术导师信息并生成可对话的数字导师
 */

import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ============================================================================
// ArXiv 搜索
// ============================================================================

async function searchArxiv(authorName, maxResults = 10) {
  const searchQuery = `au:${authorName.replace(/\s+/g, '+')}`;
  const url = `http://export.arxiv.org/api/query?search_query=${searchQuery}&start=0&max_results=${maxResults}`;

  try {
    console.log(`🔍 搜索 ArXiv: ${authorName}`);
    const response = await fetch(url);
    const text = await response.text();

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

// ============================================================================
// 浏览器搜索（调用 Puppeteer 模块）
// ============================================================================

async function searchWithBrowser(query, maxResults = 10) {
  try {
    // 动态导入 Puppeteer 模块
    const puppeteerModule = await import('./puppeteer-search.js');
    return await puppeteerModule.searchWithBrowser(query, maxResults);
  } catch (error) {
    console.error(`浏览器搜索失败: ${error.message}`);
    return [];
  }
}

// ============================================================================
// DuckDuckGo 搜索（备用）
// ============================================================================

async function searchDuckDuckGo(query) {
  const url = `https://duckduckgo.com/html/?q=${encodeURIComponent(query)}`;

  try {
    const response = await fetch(url);
    const html = await response.text();

    const results = html.match(/<a[^>]*class="result__url"[^>]*>(.*?)<\/a>/g) || [];

    return results.slice(0, 5).map(result => {
      const urlMatch = result.match(/href="([^"]*)"/);
      const title = result.replace(/<[^>]*>/g, '').trim();

      return {
        url: urlMatch ? urlMatch[1] : '',
        title: title,
        snippet: ''
      };
    }).filter(r => r.url && !r.url.includes('duckduckgo'));
  } catch (error) {
    console.error(`DuckDuckGo search failed: ${error.message}`);
    return [];
  }
}

// ============================================================================
// 风格分析（使用 Claude API）
// ============================================================================

async function analyzeStyle(info) {
  console.log("🧠 分析研究风格...");

  const context = {
    name: info.name,
    affiliation: info.affiliation,
    paper_count: info.papers.length,
    paper_summaries: info.papers.slice(0, 5).map(p =>
      `Title: ${p.title}\nSummary: ${p.summary.substring(0, 500)}...`
    ).join('\n\n'),
    websites: info.websites.map(w => w.title).join(', ')
  };

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

// ============================================================================
// 数据质量评估
// ============================================================================

function assessDataQuality(info) {
  let score = 0;
  const missing = [];

  // 论文数量评分
  if (info.papers.length >= 5) score += 0.4;
  else if (info.papers.length >= 3) score += 0.3;
  else if (info.papers.length >= 1) score += 0.2;
  else missing.push("papers");

  // 网页数量评分
  if (info.websites.length >= 20) score += 0.4;
  else if (info.websites.length >= 10) score += 0.3;
  else if (info.websites.length >= 5) score += 0.2;
  else if (info.websites.length > 0) score += 0.1;
  else missing.push("websites");

  // 数据源多样性
  const sourceCount = info.sources.length;
  if (sourceCount >= 3) score += 0.2;
  else if (sourceCount >= 2) score += 0.1;

  return {
    score: Math.min(score, 1.0),
    missing,
    data_sources: info.sources,
    papers_count: info.papers.length,
    websites_count: info.websites.length
  };
}

// ============================================================================
// 档案生成
// ============================================================================

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

// ============================================================================
// System Prompt 生成
// ============================================================================

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

// ============================================================================
// 文件保存
// ============================================================================

async function saveProfile(profile) {
  const mentorsDir = path.join(process.env.HOME, '.claude', 'mentors');
  await fs.mkdir(mentorsDir, { recursive: true });

  const fileName = profile.meta.mentor_name
    .replace(/[^a-zA-Z0-9\u4e00-\u9fa5]/g, '_')
    + '.json';

  const filePath = path.join(mentorsDir, fileName);
  await fs.writeFile(filePath, JSON.stringify(profile, null, 2), 'utf8');

  console.log(`✓ 档案已保存: ${filePath}`);
  return filePath;
}

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

  const skillDirName = mentorName.replace(/[^a-zA-Z0-9\u4e00-\u9fa5]/g, '-').toLowerCase();
  const skillsDir = path.join(process.env.HOME, '.claude', 'skills');
  const skillDir = path.join(skillsDir, skillDirName);

  await fs.mkdir(skillDir, { recursive: true });

  const filePath = path.join(skillDir, 'SKILL.md');
  await fs.writeFile(filePath, skillContent, 'utf8');

  console.log(`✓ Mentor skill 已生成: ${filePath}`);
  return filePath;
}

// ============================================================================
// 信息收集协调器
// ============================================================================

async function collectMentorInfo(name, affiliation, useBrowser = true) {
  console.log(`🔍 收集导师信息: ${name}`);

  const info = {
    name: name,
    affiliation: affiliation,
    papers: [],
    websites: [],
    sources: []
  };

  // 1. 搜索 ArXiv
  console.log("\n[1/5] 正在搜索 ArXiv 论文...");
  const arxivPapers = await searchArxiv(name);
  if (arxivPapers.length > 0) {
    info.papers = arxivPapers;
    info.sources.push("arxiv");
    console.log(`✓ 找到 ${arxivPapers.length} 篇论文`);
  } else {
    console.log("✗ 未找到 ArXiv 论文");
  }

  // 2. 浏览器搜索（全面收集）
  if (useBrowser) {
    console.log("\n[2/5] 浏览器搜索模式：全面收集信息...");

    let allResults = [];

    // 搜索 1：个人主页和学术信息
    console.log("   🔍 搜索 1/4: 个人主页和学术信息...");
    const basicQuery = affiliation
      ? `${name} ${affiliation} professor computer science`
      : `${name} professor university computer science`;
    const basicResults = await searchWithBrowser(basicQuery, 15);
    allResults = allResults.concat(basicResults);
    console.log(`      ✓ 找到 ${basicResults.length} 个结果`);

    // 搜索 2：论文和出版物
    console.log("   🔍 搜索 2/4: 论文和出版物...");
    const papersQuery = `${name} papers publications research articles`;
    const papersResults = await searchWithBrowser(papersQuery, 10);
    allResults = allResults.concat(papersResults);
    console.log(`      ✓ 找到 ${papersResults.length} 个结果`);

    // 搜索 3：演讲和访谈
    console.log("   🔍 搜索 3/4: 演讲、访谈和观点...");
    const talksQuery = `${name} talks interviews lectures presentation`;
    const talksResults = await searchWithBrowser(talksQuery, 8);
    allResults = allResults.concat(talksResults);
    console.log(`      ✓ 找到 ${talksResults.length} 个结果`);

    // 搜索 4：Wikipedia 和百科信息
    console.log("   🔍 搜索 4/4: Wikipedia 和百科信息...");
    const wikiQuery = `${name} Wikipedia biography`;
    const wikiResults = await searchWithBrowser(wikiQuery, 5);
    allResults = allResults.concat(wikiResults);
    console.log(`      ✓ 找到 ${wikiResults.length} 个结果`);

    // 去重
    const uniqueResults = [];
    const seenUrls = new Set();
    for (const result of allResults) {
      if (!seenUrls.has(result.url)) {
        seenUrls.add(result.url);
        uniqueResults.push(result);
      }
    }

    if (uniqueResults.length > 0) {
      info.websites = uniqueResults;
      info.sources.push("browser-search");
      console.log(`\n   📊 浏览器搜索总计: ${uniqueResults.length} 个唯一结果`);
    } else {
      console.log("\n   ⚠️  浏览器搜索无结果，回退到 DuckDuckGo...");
      const fallbackResults = await searchDuckDuckGo(name);
      if (fallbackResults.length > 0) {
        info.websites = fallbackResults;
        info.sources.push("duckduckgo");
        console.log(`   ✓ 找到 ${fallbackResults.length} 个结果`);
      }
    }
  } else {
    // 快速模式：仅使用 DuckDuckGo
    console.log("\n[2/5] 快速模式：DuckDuckGo 搜索...");
    const websites = await searchDuckDuckGo(name);
    if (websites.length > 0) {
      info.websites = websites;
      info.sources.push("duckduckgo");
      console.log(`✓ 找到 ${websites.length} 个相关网页`);
    } else {
      console.log("✗ 未找到个人主页");
    }
  }

  // 3. 数据质量检查
  console.log("\n[3/5] 验证数据质量...");
  const quality = assessDataQuality(info);
  console.log(`数据质量评分: ${quality.score}/1.0`);
  console.log(`数据来源: ${quality.data_sources.join(", ")}`);

  if (quality.score < 0.3) {
    console.warn("⚠️  数据不足，建议提供补充材料");
  } else if (quality.score >= 0.8) {
    console.log("✅ 数据质量优秀！");
  }

  return { info, quality };
}

// ============================================================================
// 主工作流程
// ============================================================================

async function main(name, affiliation, useBrowser) {
  console.log(`🎓 开始蒸馏导师: ${name}${affiliation ? ` (${affiliation})` : ''}`);
  if (useBrowser) {
    console.log(`🌐 使用浏览器搜索模式（全面收集信息，推荐）`);
  } else {
    console.log(`⚡ 使用快速模式（仅 ArXiv + DuckDuckGo API）`);
  }
  console.log(`📋 工作流程:\n`);

  try {
    // 1. 收集信息
    console.log(`📚 [1/5] 收集导师信息...`);
    const { info, quality } = await collectMentorInfo(name, affiliation, useBrowser);

    // 2. 分析风格
    console.log(`\n🧠 [2/5] 分析研究风格...`);
    let style;
    try {
      style = await analyzeStyle(info);
      console.log(`✓ 风格分析完成: ${style.research_style.type}\n`);
    } catch (styleError) {
      console.error(`✗ 风格分析失败: ${styleError.message}`);
      console.log(`  使用默认风格配置...\n`);
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
    const profile = generateProfile(name, info, style);
    console.log(`✓ 档案生成完成\n`);

    // 4. 保存档案
    console.log(`💾 [4/5] 保存档案文件...`);
    const profilePath = await saveProfile(profile);

    // 5. 生成 skill
    console.log(`🤖 [5/5] 生成对话 Skill...`);
    const skillPath = await generateMentorSkill(profile);

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
    const skillName = name.replace(/[^a-zA-Z0-9\u4e00-\u9fa5]/g, '-').toLowerCase();
    console.log(`   /${skillName} 你的问题\n`);

    // 质量提醒
    if (quality.score < 0.6) {
      console.log(`💡 提示: 数据质量评分 ${quality.score.toFixed(2)} 较低`);
      console.log(`   建议: 上传更多论文、演讲视频等材料来提升效果\n`);
    }

  } catch (error) {
    console.error(`\n${'='.repeat(60)}`);
    console.error(`❌ 执行失败`);
    console.error(`${'='.repeat(60)}`);

    console.error(`\n错误信息: ${error.message}`);
    console.error(`\n💡 建议: 检查网络连接或稍后重试\n`);

    throw error;
  }
}

// ============================================================================
// 命令行入口
// ============================================================================

const args = process.argv.slice(2);

if (args.length === 0) {
  console.log("❌ 错误: 请提供导师姓名");
  console.log("\n使用方法:");
  console.log("  node distill-mentor-cli.mjs <导师姓名> [--affiliation \"机构名称\"] [--no-browser]");
  console.log("\n示例:");
  console.log("  node distill-mentor-cli.mjs \"Yoshua Bengio\"");
  console.log("  node distill-mentor-cli.mjs \"Yoshua Bengio\" --affiliation \"University of Montreal\"");
  console.log("  node distill-mentor-cli.mjs \"John Smith\" --no-browser");
  process.exit(1);
}

const name = args[0];
const affiliationIndex = args.indexOf('--affiliation');
const affiliation = affiliationIndex !== -1 && args[affiliationIndex + 1]
  ? args[affiliationIndex + 1]
  : null;

const useBrowser = !args.includes('--no-browser');

main(name, affiliation, useBrowser).catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
