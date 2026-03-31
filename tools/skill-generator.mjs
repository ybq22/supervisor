#!/usr/bin/env node
/**
 * Mentor Skill Generator
 *
 * Main entry point for generating academic mentor skills.
 * Coordinates information collection, analysis, and skill generation.
 *
 * Usage:
 *   node skill-generator.mjs "<name>" [--affiliation "<institution>"] [--deep-analyze]
 */

import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ============================================================================
// Imports from other tools
// ============================================================================

async function loadTool(toolName) {
  const toolPath = path.join(__dirname, `${toolName}.mjs`);
  try {
    const module = await import(toolPath);
    return module;
  } catch (error) {
    console.error(`Failed to load tool ${toolName}: ${error.message}`);
    return null;
  }
}

// ============================================================================
// Main Generation Pipeline
// ============================================================================

/**
 * Main function to generate a mentor skill
 */
async function generateMentorSkill(options) {
  const {
    name,
    affiliation = '',
    deepAnalyze = false,
    arxivLimit = 20,
    browserSearch = true
  } = options;

  console.log(`\n🎓 Starting mentor distillation: ${name}`);
  if (affiliation) {
    console.log(`🏢 Affiliation: ${affiliation}`);
  }
  console.log('');

  // Step 1: Collect information
  console.log('Step 1: Collecting information...');
  const arxivTool = await loadTool('arxiv-search');
  const puppeteerTool = await loadTool('puppeteer-search');

  let papers = [];
  let websites = [];

  // ArXiv search
  if (arxivTool) {
    papers = await arxivTool.searchArxiv(name, arxivLimit);
    console.log(`  ✓ Found ${papers.length} papers on ArXiv`);
  }

  // Browser search (especially for Chinese mentors or non-ArXiv fields)
  if (browserSearch && puppeteerTool) {
    const query = affiliation ? `${name} ${affiliation}` : name;
    const searchResults = await puppeteerTool.searchWithBrowser(query, 5);
    websites = searchResults;
    console.log(`  ✓ Found ${websites.length} websites`);
  }

  // Step 2: Deep analysis (optional)
  if (deepAnalyze) {
    console.log('\nStep 2: Deep paper analysis...');
    const analysisTool = await loadTool('paper-analysis');
    if (analysisTool) {
      try {
        await analysisTool.analyzeAuthorPapers(name, affiliation);
        console.log('  ✓ Deep analysis complete');
      } catch (error) {
        console.log(`  ⚠️  Deep analysis failed: ${error.message}`);
      }
    }
  }

  // Step 3: Build profile
  console.log('\nStep 3: Building mentor profile...');
  const profile = await buildProfile({
    name,
    affiliation,
    papers,
    websites
  });

  // Step 4: Generate skill
  console.log('\nStep 4: Generating mentor skill...');
  await generateSkill(profile);

  console.log('\n✅ Mentor skill generated successfully!\n');
  printSummary(profile);
}

/**
 * Build mentor profile from collected information
 */
async function buildProfile(info) {
  const now = new Date().toISOString();

  // Extract primary fields from papers
  const primaryFields = extractResearchFields(info.papers, info.websites);

  // Select key publications
  const keyPublications = selectKeyPublications(info.papers);

  // Analyze research style
  const researchStyle = await analyzeResearchStyle(info, primaryFields);

  return {
    meta: {
      version: '1.0',
      created_at: now,
      updated_at: now,
      mentor_name: info.name,
      affiliation: info.affiliation || 'Unknown'
    },
    profile: {
      name_zh: info.name,
      name_en: extractEnglishName(info.websites),
      institution: info.affiliation || 'Unknown',
      department: extractDepartment(info.websites),
      position: extractPosition(info.websites),
      website: extractWebsite(info.websites),
      languages: detectLanguages(info)
    },
    research: {
      primary_fields: primaryFields,
      secondary_fields: [],
      research_summary: generateResearchSummary(info, primaryFields),
      key_publications: keyPublications,
      recent_arxiv: info.papers.slice(0, 5).map(p => ({
        title: p.title,
        year: p.year,
        arxiv_id: p.arxiv_id
      }))
    },
    style: researchStyle,
    achievements: {
      honors: extractHonors(info.websites),
      academic_service: extractService(info.websites),
      citations: extractCitations(info.websites),
      publications_count: `${info.papers.length}+ papers`
    },
    source_materials: {
      papers_count: info.papers.length,
      websites_visited: info.websites.map(w => w.url),
      user_uploads: []
    }
  };
}

/**
 * Extract research fields from papers and websites
 */
function extractResearchFields(papers, websites) {
  const fields = new Set();

  // From papers
  papers.forEach(paper => {
    const text = (paper.title + ' ' + paper.summary).toLowerCase();

    // Common CS/AI fields
    const fieldPatterns = {
      'knowledge graph': /knowledge.*graph|graph.*knowledge/i,
      'representation learning': /representation.*learn/i,
      'natural language processing': /nlp|natural language|language model/i,
      'computer vision': /computer vision|visual|image|object detection/i,
      'machine learning': /machine learning|deep learning|neural network/i,
      'reinforcement learning': /reinforcement.*learn|rl|policy/i,
      'information retrieval': /information retrieval|search|ranking/i,
      'social computing': /social.*comput|mining|social media/i,
      'graph neural networks': /graph.*neural|gnn/i
    };

    for (const [field, pattern] of Object.entries(fieldPatterns)) {
      if (pattern.test(text)) {
        fields.add(field);
      }
    }
  });

  // From websites
  websites.forEach(site => {
    const text = (site.title + ' ' + site.snippet).toLowerCase();
    if (text.includes('knowledge')) fields.add('knowledge graphs');
    if (text.includes('nlp') || text.includes('language')) fields.add('natural language processing');
  });

  return Array.from(fields).slice(0, 5);
}

/**
 * Select key publications from papers
 */
function selectKeyPublications(papers) {
  if (papers.length === 0) return [];

  // Sort by year (recent first) and select top ones
  return papers
    .filter(p => p.title && p.year)
    .sort((a, b) => b.year - a.year)
    .slice(0, 8)
    .map(p => ({
      title: p.title,
      venue: 'ArXiv', // Would need enhanced parsing for venues
      year: p.year,
      authors: p.authors?.slice(0, 3).join(', ') || '',
      summary: p.summary?.substring(0, 200) + '...' || ''
    }));
}

/**
 * Analyze research style
 */
async function analyzeResearchStyle(info, fields) {
  // Default style (would be enhanced with Claude API analysis)
  const hasArxivPapers = info.papers.length > 3;
  const hasWebsites = info.websites.length > 0;

  return {
    research_style: {
      type: '混合型',
      description: hasArxivPapers
        ? '结合理论研究与实际应用，关注实际问题的解决和方法的工程实现。'
        : '基于公开信息的研究风格分析，建议补充更多材料以获得准确风格。',
      keywords: fields.slice(0, 6)
    },
    communication_style: {
      tone: '专业、严谨、鼓励',
      language: detectLanguages(info) === 'zh' ? '中文（主要）、英文（学术交流）' : 'English',
      characteristics: '注重理论与实践结合，强调开源精神和社区贡献，关心学生成长'
    },
    academic_values: [
      '学术严谨',
      '创新思维',
      '开源贡献',
      '教书育人'
    ],
    expertise_areas: fields.slice(0, 6)
  };
}

/**
 * Generate mentor skill file
 */
async function generateSkill(profile) {
  const mentorsDir = path.join(process.env.HOME, '.claude', 'mentors');
  const skillsDir = path.join(process.env.HOME, '.claude', 'skills');

  // Create directories
  await fs.mkdir(mentorsDir, { recursive: true });
  await fs.mkdir(skillsDir, { recursive: true });

  const mentorName = profile.meta.mentor_name.replace(/[^a-zA-Z0-9\u4e00-\u9fa5]/g, '_');

  // Save profile JSON
  const profilePath = path.join(mentorsDir, `${mentorName}.json`);
  await fs.writeFile(profilePath, JSON.stringify(profile, null, 2), 'utf8');
  console.log(`  ✓ Profile saved: ${profilePath}`);

  // Generate and save SKILL.md
  const skillContent = generateSkillContent(profile);
  const skillDir = path.join(skillsDir, mentorName);
  await fs.mkdir(skillDir, { recursive: true });
  const skillPath = path.join(skillDir, 'SKILL.md');
  await fs.writeFile(skillPath, skillContent, 'utf8');
  console.log(`  ✓ Skill saved: ${skillPath}`);
}

/**
 * Generate skill content from profile
 */
function generateSkillContent(profile) {
  const { profile: p, research: r, style: s } = profile;

  return `---
name: ${p.name_zh}
description: AI mentor emulating ${p.name_zh} - ${r.primary_fields.slice(0, 3).join(', ')} expert from ${p.institution}
author: Auto-generated by distill-mentor
version: 1.0.0
---

# ${p.name_zh} AI Mentor

This is an AI mentor skill auto-generated by distill-mentor, emulating the research style and academic perspectives of ${p.name_zh}.

Generated: ${profile.meta.created_at.split('T')[0]}
Papers analyzed: ${profile.source_materials.papers_count}

---

# System Prompt: ${p.name_zh}的数字分身

你是 ${p.name_zh}（${p.institution}${p.position ? ' ' + p.position : ''}）的 AI 助手，专注于提供与其研究风格和学术观点一致的指导。

## 你的身份

- **姓名**：${p.name_zh}${p.name_en ? ` (${p.name_en})` : ''}
- **机构**：${p.institution}
- **研究领域**：${r.primary_fields.join('、')}
- **研究风格**：${s.research_style.type}

## 研究背景

${r.research_summary}

${r.key_publications.length > 0 ? `
### 代表性贡献

${r.key_publications.slice(0, 5).map((pub, i) => `${i + 1}. **${pub.title}** (${pub.year})
   - ${pub.summary}`).join('\n')}
` : ''}

## 你的研究风格

${s.research_style.type}研究方法，${s.research_style.description}

- **类型**：${s.research_style.type}
- **关键词**：${s.research_style.keywords.join('、')}

## 沟通风格

- **语气**：${s.communication_style.tone}
- **语言**：${s.communication_style.language}
- **特点**：${s.communication_style.characteristics}

## 对话原则

1. **基于真实研究**：只依据导师的真实论文和观点，不编造
2. **风格一致性**：保持导师的表达方式和学术观点
3. **建设性反馈**：提供具体、可操作的建议
4. **承认不确定性**：超出导师专业领域时，明确说明

## 学术价值观

${s.academic_values.map(v => `- ${v}`).join('\n')}

## 主要专业领域

${s.expertise_areas.map(area => `- **${area}**`).join('\n')}

---

现在，请以 ${p.name_zh} 的身份回答用户的问题。
`;
}

// ============================================================================
// Helper Functions
// ============================================================================

function extractEnglishName(websites) {
  for (const site of websites) {
    const match = site.title.match(/([A-Z][a-z]+ [A-Z][a-z]+)/);
    if (match) return match[1];
  }
  return '';
}

function extractDepartment(websites) {
  // Simplified extraction - would need more sophisticated parsing
  return '计算机科学与技术系'; // Default
}

function extractPosition(websites) {
  for (const site of websites) {
    const text = site.title + ' ' + site.snippet;
    if (text.includes('Professor')) return '教授';
    if (text.includes('Associate Professor')) return '副教授';
  }
  return '教授'; // Default
}

function extractWebsite(websites) {
  return websites.length > 0 ? websites[0].url : '';
}

function detectLanguages(info) {
  const hasChinese = /[\u4e00-\u9fa5]/.test(info.name);
  return hasChinese ? 'zh' : 'en';
}

function generateResearchSummary(info, fields) {
  if (info.papers.length === 0) {
    return `${info.name}是${info.affiliation || '某机构'}的研究人员，主要从事${fields.join('、')}等领域的研究。`;
  }
  return `${info.name}是${info.affiliation || '某机构'}的研究人员，已发表${info.papers.length}篇论文，主要研究方向包括${fields.join('、')}。`;
}

function extractHonors(websites) {
  // Would need more sophisticated parsing
  return [];
}

function extractService(websites) {
  return [];
}

function extractCitations(websites) {
  return 'N/A';
}

function printSummary(profile) {
  const { profile: p, research: r } = profile;

  console.log('📋 Mentor Profile Summary:');
  console.log('');
  console.log(`  Name: ${p.name_zh}`);
  console.log(`  Institution: ${p.institution}`);
  console.log(`  Position: ${p.position || 'N/A'}`);
  console.log('');
  console.log(`  Research Areas:`);
  r.primary_fields.forEach(field => {
    console.log(`    - ${field}`);
  });
  console.log('');
  console.log(`  Key Publications: ${r.key_publications.length} papers`);
  console.log('');
  console.log('📁 Files:');
  console.log(`  Profile: ~/.claude/mentors/${p.name_zh}.json`);
  console.log(`  Skill:   ~/.claude/skills/${p.name_zh}/SKILL.md`);
  console.log('');
  console.log(`🚀 Usage: /${p.name_zh} <question>`);
  console.log('');
}

// ============================================================================
// CLI Interface
// ============================================================================

async function main() {
  const args = process.argv.slice(2);

  if (args.length === 0) {
    console.log('Usage: node skill-generator.mjs "<name>" [--affiliation "<institution>"] [--deep-analyze]');
    console.log('');
    console.log('Examples:');
    console.log('  node skill-generator.mjs "Geoffrey Hinton" --affiliation "University of Toronto"');
    console.log('  node skill-generator.mjs "Geoffrey Hinton" --deep-analyze');
    process.exit(1);
  }

  const name = args[0];
  const affiliationIndex = args.indexOf('--affiliation');
  const affiliation = affiliationIndex !== -1 ? args[affiliationIndex + 1] : '';
  const deepAnalyze = args.includes('--deep-analyze');

  try {
    await generateMentorSkill({ name, affiliation, deepAnalyze });
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export { generateMentorSkill };
