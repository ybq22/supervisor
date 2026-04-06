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
import { readFile } from 'fs/promises';
import { createHash } from 'crypto';
import {
  createWorkspace,
  getWorkspacePath,
  addUpload,
  saveProcessedContent,
  saveArxivPapers,
  saveWebResults,
  getWorkspaceMetadata
} from './workspace-manager.mjs';
import { scanUploads } from './upload-scanner.mjs';
import { parseText, parseMarkdown, parsePDF, parseEmail, parseImage, parseFeishu } from './parsers/index.mjs';
import { mergeContent } from './content-merger.mjs';

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
    browserSearch = true,
    upload = null,        // Single file to upload
    incremental = false,   // Incremental mode (don't regenerate everything)
    useArxiv = false      // Use ArXiv search (disabled by default due to author collision issues)
  } = options;

  console.log(`\n🎓 Starting mentor distillation: ${name}`);
  if (affiliation) {
    console.log(`🏢 Affiliation: ${affiliation}`);
  }
  if (upload) {
    console.log(`📤 Upload: ${upload}`);
  }
  if (incremental) {
    console.log(`🔄 Incremental mode: updating existing workspace`);
  }
  console.log('');

  // Create or get workspace
  const workspacePath = await createWorkspace(name);
  console.log(`📁 Workspace: ${workspacePath}`);
  console.log('');

  // Handle single file upload
  if (upload) {
    console.log('Step 0: Processing uploaded file...');
    try {
      const uploadResult = await addUpload(name, upload);
      console.log(`  ✓ Uploaded: ${uploadResult.filename}`);

      // Parse the uploaded file
      const ext = uploadResult.ext;
      let parsedResult;

      switch (ext) {
        case '.txt':
        case '.text':
          parsedResult = await parseText(uploadResult.storedPath);
          break;
        case '.md':
          parsedResult = await parseMarkdown(uploadResult.storedPath);
          break;
        case '.pdf':
          parsedResult = await parsePDF(uploadResult.storedPath);
          break;
        case '.eml':
        case '.mbox':
          parsedResult = await parseEmail(uploadResult.storedPath);
          break;
        case '.json':
          parsedResult = await parseFeishu(uploadResult.storedPath);
          break;
        default:
          console.log(`  ⚠️  Unsupported file type: ${ext}`);
          parsedResult = { success: false };
      }

      if (parsedResult.success) {
        await saveProcessedContent(name, uploadResult.storedPath, parsedResult);
        console.log(`  ✓ Processed and saved to workspace`);
      } else {
        console.log(`  ✗ Processing failed: ${parsedResult.errors.join(', ')}`);
      }

      // If only uploading and incremental mode, skip the rest
      if (incremental) {
        console.log('\n✅ Upload and incremental processing complete!');
        console.log(`\n💡 Tip: Run without --incremental to generate full skill`);
        return;
      }
    } catch (error) {
      console.error(`  ❌ Upload failed: ${error.message}`);
      return;
    }
  }

  // Load processed content from workspace
  let parsedUploads = {
    texts: [],
    markdown: [],
    pdfs: [],
    emails: [],
    images: [],
    feishu: []
  };

  try {
    const processedDir = path.join(workspacePath, 'processed');

    // Load processed texts
    const textsPath = path.join(processedDir, 'texts');
    try {
      const textFiles = await fs.readdir(textsPath);
      for (const file of textFiles) {
        if (file.endsWith('.json')) {
          const content = JSON.parse(await fs.readFile(path.join(textsPath, file), 'utf8'));
          parsedUploads.texts.push(content);
        }
      }
    } catch {}

    // Load processed markdown
    const markdownPath = path.join(processedDir, 'markdown');
    try {
      const mdFiles = await fs.readdir(markdownPath);
      for (const file of mdFiles) {
        if (file.endsWith('.json')) {
          const content = JSON.parse(await fs.readFile(path.join(markdownPath, file), 'utf8'));
          parsedUploads.markdown.push(content);
        }
      }
    } catch {}

    // Load processed PDFs
    const pdfsPath = path.join(processedDir, 'pdfs');
    try {
      const pdfFiles = await fs.readdir(pdfsPath);
      for (const file of pdfFiles) {
        if (file.endsWith('.json')) {
          const content = JSON.parse(await fs.readFile(path.join(pdfsPath, file), 'utf8'));
          parsedUploads.pdfs.push(content);
        }
      }
    } catch {}

    // Load processed emails
    const emailsPath = path.join(processedDir, 'emails');
    try {
      const emailFiles = await fs.readdir(emailsPath);
      for (const file of emailFiles) {
        if (file.endsWith('.json')) {
          const content = JSON.parse(await fs.readFile(path.join(emailsPath, file), 'utf8'));
          parsedUploads.emails.push(content);
        }
      }
    } catch {}

    // Load processed images
    const imagesPath = path.join(processedDir, 'images');
    try {
      const imageFiles = await fs.readdir(imagesPath);
      for (const file of imageFiles) {
        if (file.endsWith('.json')) {
          const content = JSON.parse(await fs.readFile(path.join(imagesPath, file), 'utf8'));
          parsedUploads.images.push(content);
        }
      }
    } catch {}

    // Load processed Feishu
    const feishuPath = path.join(processedDir, 'feishu');
    try {
      const feishuFiles = await fs.readdir(feishuPath);
      for (const file of feishuFiles) {
        if (file.endsWith('.json')) {
          const content = JSON.parse(await fs.readFile(path.join(feishuPath, file), 'utf8'));
          parsedUploads.feishu.push(content);
        }
      }
    } catch {}

    const totalUploads = parsedUploads.texts.length + parsedUploads.markdown.length +
                        parsedUploads.pdfs.length + parsedUploads.emails.length +
                        parsedUploads.images.length + parsedUploads.feishu.length;

    if (totalUploads > 0) {
      console.log(`  ✓ Loaded ${totalUploads} processed file(s) from workspace`);
    }
  } catch (error) {
    console.log(`  ⚠️  Failed to load processed content: ${error.message}`);
  }

  // Step 1: Collect information
  console.log('\nStep 1: Collecting information...');
  const arxivTool = await loadTool('arxiv-search');
  const puppeteerTool = await loadTool('puppeteer-search');

  let papers = [];
  let websites = [];

  // ArXiv search (disabled by default, use --use-arxiv to enable)
  if (useArxiv && arxivTool) {
    papers = await arxivTool.searchArxiv(name, arxivLimit);
    console.log(`  ✓ Found ${papers.length} papers on ArXiv`);

    // Save to workspace
    await saveArxivPapers(name, papers);
    console.log(`  ✓ Saved papers to workspace`);
  } else {
    console.log(`  ⏭️  ArXiv search disabled (using Google Search instead)`);
  }

  // Enhanced Google Search for comprehensive information
  if (browserSearch && puppeteerTool) {
    // Search 1: General search with affiliation
    let generalQuery = affiliation ? `${name} ${affiliation}` : name;
    console.log(`  🔍 Searching: "${generalQuery}"`);
    const generalResults = await puppeteerTool.searchWithBrowser(generalQuery, 5);
    websites = websites.concat(generalResults);
    console.log(`  ✓ Found ${generalResults.length} general websites`);

    // Search 2: Wikipedia
    console.log(`  🔍 Searching: "${name} Wikipedia"`);
    const wikiQuery = `${name} Wikipedia`;
    const wikiResults = await puppeteerTool.searchWithBrowser(wikiQuery, 3);
    websites = websites.concat(wikiResults);
    console.log(`  ✓ Found ${wikiResults.length} Wikipedia results`);

    // Search 3: Google Scholar
    console.log(`  🔍 Searching: "${name} Google Scholar"`);
    const scholarQuery = `${name} site:scholar.google.com`;
    const scholarResults = await puppeteerTool.searchWithBrowser(scholarQuery, 3);
    websites = websites.concat(scholarResults);
    console.log(`  ✓ Found ${scholarResults.length} Google Scholar results`);

    // Search 4: Personal homepage (if affiliation provided)
    if (affiliation) {
      console.log(`  🔍 Searching: "${name} ${affiliation} homepage"`);
      const homepageQuery = `${name} ${affiliation} homepage profile`;
      const homepageResults = await puppeteerTool.searchWithBrowser(homepageQuery, 3);
      websites = websites.concat(homepageResults);
      console.log(`  ✓ Found ${homepageResults.length} homepage results`);
    }

    // Deduplicate websites by URL
    const uniqueWebsites = [];
    const seenUrls = new Set();
    for (const site of websites) {
      if (!seenUrls.has(site.url)) {
        seenUrls.add(site.url);
        uniqueWebsites.push(site);
      }
    }
    websites = uniqueWebsites;

    console.log(`  ✓ Total unique websites: ${websites.length}`);

    // Save to workspace
    await saveWebResults(name, websites);
    console.log(`  ✓ Saved web results to workspace`);
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

  // Merge uploads with existing sources using content merger
  const existingSources = {
    arxivPapers: papers,
    webSearch: websites
  };

  const mergedData = mergeContent(existingSources, parsedUploads);

  // Log enhanced quality assessment
  const qm = mergedData.qualityMetrics;
  console.log(`\n[Quality Assessment]`);
  console.log(`  Overall Quality: ${qm.qualityRating} (${(qm.overallQuality * 100).toFixed(1)}%)`);
  console.log(`  Uploads: ${qm.uploadCount} files`);
  console.log(`  Confidence: ${(qm.totalConfidence * 100).toFixed(1)}%`);
  console.log(`  Diversity: ${(qm.sourceDiversity * 100).toFixed(1)}% (${Object.values(qm.balanceMetrics.typeDistribution).filter(v => v > 0).length}/6 types)`);
  console.log(`  Content: ${qm.contentMetrics.totalContentLength} chars total (${qm.contentMetrics.avgContentLength} avg)`);
  console.log(`  Completeness: ${qm.completenessScore}/100`);

  // Display suggestions if any
  if (qm.suggestions && qm.suggestions.length > 0) {
    console.log(`\n[Suggestions]`);
    qm.suggestions.forEach(suggestion => {
      const icon = {
        critical: '❌',
        warning: '⚠️ ',
        info: '💡 '
      }[suggestion.type] || '• ';
      console.log(`  ${icon} ${suggestion.message}`);
    });
  }

  const profile = await buildProfile({
    name,
    affiliation,
    papers,
    websites,
    mergedData
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

  // Extract merged data if available
  const uploads = info.mergedData?.sources?.uploads || {
    pdfs: [],
    emails: [],
    feishu: [],
    images: [],
    markdown: [],
    texts: []
  };

  // Extract content from uploads for AI to use
  const uploadContents = {
    texts: uploads.texts.map(t => t.content || '').filter(c => c.length > 0),
    markdown: uploads.markdown.map(m => m.content || '').filter(c => c.length > 0),
    pdfs: uploads.pdfs.map(p => p.content || '').filter(c => c.length > 0),
    emails: uploads.emails.map(e => e.content || '').filter(c => c.length > 0),
    feishu: uploads.feishu.map(f => f.content || '').filter(c => c.length > 0),
    images: uploads.images.map(i => i.content || '').filter(c => c.length > 0)
  };

  // Extract quality metrics if available
  const qualityMetrics = info.mergedData?.qualityMetrics || {
    uploadCount: 0,
    totalConfidence: 0,
    sourceDiversity: 0
  };

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
      user_uploads: {
        texts: uploads.texts.map(t => t.sourceFile),
        markdown: uploads.markdown.map(m => m.sourceFile),
        pdfs: uploads.pdfs.map(p => p.filename),
        emails: uploads.emails.map(e => e.filename),
        images: uploads.images.map(i => i.filename),
        feishu: uploads.feishu.map(f => f.filename)
      },
      upload_contents: uploadContents, // Add actual content for AI
      quality_metrics: {
        upload_count: qualityMetrics.uploadCount,
        total_confidence: qualityMetrics.totalConfidence,
        source_diversity: qualityMetrics.sourceDiversity
      }
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

  // Generate slug without spaces for files and skill name
  const mentorSlug = profile.meta.mentor_name
    .replace(/[^a-zA-Z0-9\u4e00-\u9fa5]/g, '')  // Remove special chars
    .replace(/\s+/g, '');                      // Remove spaces
  const mentorName = profile.meta.mentor_name.replace(/[^a-zA-Z0-9\u4e00-\u9fa5]/g, '_');

  // Save profile JSON (uses readable name with underscores)
  const profilePath = path.join(mentorsDir, `${mentorName}.json`);
  await fs.writeFile(profilePath, JSON.stringify(profile, null, 2), 'utf8');
  console.log(`  ✓ Profile saved: ${profilePath}`);

  // Generate and save SKILL.md (uses slug without spaces)
  const skillContent = generateSkillContent(profile, mentorSlug);
  const skillDir = path.join(skillsDir, mentorSlug);
  await fs.mkdir(skillDir, { recursive: true });
  const skillPath = path.join(skillDir, 'SKILL.md');
  await fs.writeFile(skillPath, skillContent, 'utf8');
  console.log(`  ✓ Skill saved: ${skillPath}`);

  console.log(`\n  🚀 Usage: /${mentorSlug} <question>\n`);
}

/**
 * Generate skill content from profile
 */
function generateSkillContent(profile, mentorSlug) {
  const { profile: p, research: r, style: s } = profile;
  const uploadContents = profile.source_materials?.upload_contents || {};
  const qualityMetrics = profile.source_materials?.quality_metrics || {};

  // Build uploaded materials section for context
  let uploadedMaterialsSection = '';
  const hasUploads = qualityMetrics.upload_count > 0;

  if (hasUploads) {
    uploadedMaterialsSection = `
## 补充材料（Upload Materials）

以下材料由用户上传，提供关于 ${p.name_zh} 的额外信息和背景：

`;

    // Add text contents
    if (uploadContents.texts && uploadContents.texts.length > 0) {
      uploadedMaterialsSection += `### 文本资料\n\n`;
      uploadContents.texts.forEach((content, i) => {
        uploadedMaterialsSection += `#### 文本 ${i + 1}\n${content.substring(0, 500)}${content.length > 500 ? '...' : ''}\n\n`;
      });
    }

    // Add markdown contents
    if (uploadContents.markdown && uploadContents.markdown.length > 0) {
      uploadedMaterialsSection += `### Markdown 笔记\n\n`;
      uploadContents.markdown.forEach((content, i) => {
        uploadedMaterialsSection += `#### 笔记 ${i + 1}\n${content.substring(0, 500)}${content.length > 500 ? '...' : ''}\n\n`;
      });
    }

    // Add PDF contents
    if (uploadContents.pdfs && uploadContents.pdfs.length > 0) {
      uploadedMaterialsSection += `### PDF 文档内容\n\n`;
      uploadContents.pdfs.forEach((content, i) => {
        uploadedMaterialsSection += `#### PDF ${i + 1}\n${content.substring(0, 500)}${content.length > 500 ? '...' : ''}\n\n`;
      });
    }

    // Add email contents
    if (uploadContents.emails && uploadContents.emails.length > 0) {
      uploadedMaterialsSection += `### 邮件记录\n\n`;
      uploadContents.emails.forEach((content, i) => {
        uploadedMaterialsSection += `#### 邮件 ${i + 1}\n${content.substring(0, 500)}${content.length > 500 ? '...' : ''}\n\n`;
      });
    }

    // Add Feishu contents
    if (uploadContents.feishu && uploadContents.feishu.length > 0) {
      uploadedMaterialsSection += `### 飞书文档\n\n`;
      uploadContents.feishu.forEach((content, i) => {
        uploadedMaterialsSection += `#### 文档 ${i + 1}\n${content.substring(0, 500)}${content.length > 500 ? '...' : ''}\n\n`;
      });
    }

    uploadedMaterialsSection += `**重要提示**：在回答问题时，请参考以上补充材料中的信息。这些材料提供了关于 ${p.name_zh} 的研究工作、沟通风格和学术观点的额外背景。\n`;
  }

  return `---
name: ${mentorSlug}
description: AI mentor emulating ${p.name_zh} - ${r.primary_fields.slice(0, 3).join(', ')} expert from ${p.institution}
author: Auto-generated by distill-mentor
version: 1.0.0
---

# ${p.name_zh} AI Mentor

This is an AI mentor skill auto-generated by distill-mentor, emulating the research style and academic perspectives of ${p.name_zh}.

Generated: ${profile.meta.created_at.split('T')[0]}
Papers analyzed: ${profile.source_materials.papers_count}
Uploads incorporated: ${qualityMetrics.upload_count || 0} files
Quality score: ${((qualityMetrics.total_confidence || 0) * 100).toFixed(1)}%

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

${uploadedMaterialsSection}

## 对话原则

1. **基于真实研究**：只依据导师的真实论文和观点，不编造
2. **风格一致性**：保持导师的表达方式和学术观点
3. **建设性反馈**：提供具体、可操作的建议
4. **承认不确定性**：超出导师专业领域时，明确说明
${hasUploads ? `5. **利用补充材料**：优先参考用户上传的补充材料来回答问题\n` : ''}

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
    console.log('Usage: node skill-generator.mjs "<name>" [options]');
    console.log('');
    console.log('Options:');
    console.log('  --affiliation  Specify mentor affiliation');
    console.log('  --deep-analyze Enable deep paper analysis');
    console.log('  --upload       Single file to upload (incremental mode)');
    console.log('  --incremental  Incremental mode (only process upload, skip skill generation)');
    console.log('  --use-arxiv   Enable ArXiv search (default: disabled, uses Google Search)');
    console.log('');
    console.log('Information Sources (default):');
    console.log('  ✅ Google Search (general information)');
    console.log('  ✅ Wikipedia (biography)');
    console.log('  ✅ Google Scholar (publications)');
    console.log('  ✅ Personal homepages (profile pages)');
    console.log('  ⏭️  ArXiv (disabled due to author name collisions)');
    console.log('');
    console.log('Workspace:');
    console.log('  Each mentor gets an auto-allocated workspace at:');
    console.log('  ~/.claude/mentors-workspace/{mentor_name}/');
    console.log('');
    console.log('  The workspace contains:');
    console.log('    - uploads/raw/      Original uploaded files');
    console.log('    - processed/        Parsed and processed content');
    console.log('    - sources/web/      Web search results (Google, Wikipedia, Scholar)');
    console.log('    - sources/arxiv/    ArXiv papers (if --use-arxiv enabled)');
    console.log('    - analysis/         Analysis results');
    console.log('    - skill/            Final generated skill');
    console.log('');
    console.log('Examples:');
    console.log('  # Basic usage (Google Search + Wikipedia + Scholar)');
    console.log('  node skill-generator.mjs "Fei-Fei Li" --affiliation "Stanford University"');
    console.log('');
    console.log('  # With ArXiv search (use with caution for common names)');
    console.log('  node skill-generator.mjs "Geoffrey Hinton" --use-arxiv');
    console.log('');
    console.log('  # Upload materials for better accuracy');
    console.log('  node skill-generator.mjs "Yann LeCun" --upload bio.pdf --incremental');
    console.log('  node skill-generator.mjs "Yann LeCun" --upload paper.pdf --incremental');
    console.log('  node skill-generator.mjs "Yann LeCun" --affiliation "NYU"');
    console.log('');
    console.log('  # Deep analysis with uploaded materials');
    console.log('  node skill-generator.mjs "Mentor Name" --deep-analyze');
    process.exit(1);
  }

  const name = args[0];
  const affiliationIndex = args.indexOf('--affiliation');
  const affiliation = affiliationIndex !== -1 ? args[affiliationIndex + 1] : '';
  const uploadIndex = args.indexOf('--upload');
  const upload = uploadIndex !== -1 ? args[uploadIndex + 1] : null;
  const incremental = args.includes('--incremental');
  const deepAnalyze = args.includes('--deep-analyze');
  const useArxiv = args.includes('--use-arxiv');

  try {
    await generateMentorSkill({ name, affiliation, deepAnalyze, upload, incremental });
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export { generateMentorSkill };
