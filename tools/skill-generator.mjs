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
import { scanUploads, updateProcessedManifest } from './upload-scanner.mjs';
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
    uploadsDir = null  // New: allow custom uploads directory
  } = options;

  console.log(`\n🎓 Starting mentor distillation: ${name}`);
  if (affiliation) {
    console.log(`🏢 Affiliation: ${affiliation}`);
  }
  console.log('');

  // Step 0: Scan uploads directory
  console.log('Step 0: Scanning uploads directory...');

  // Determine uploads directory:
  // 1. Use provided directory if specified
  // 2. Otherwise, use mentor-specific directory: ~/.claude/uploads/{mentor_name}/
  let actualUploadsDir;
  if (uploadsDir) {
    actualUploadsDir = uploadsDir;
    console.log(`  Using custom uploads directory: ${uploadsDir}`);
  } else {
    // Create mentor-specific directory
    const mentorSlug = name.replace(/[^a-zA-Z0-9\u4e00-\u9fa5]/g, '_');
    actualUploadsDir = path.join(process.env.HOME, '.claude', 'uploads', mentorSlug);
    console.log(`  Using mentor-specific directory: ~/.claude/uploads/${mentorSlug}/`);
  }

  let uploads = { pdfs: [], emails: [], feishu: [], images: [], markdown: [], texts: [] };
  let parsedUploads = { pdfs: [], emails: [], feishu: [], images: [], markdown: [], texts: [] };
  const processingErrors = [];

  try {
    uploads = await scanUploads(actualUploadsDir);
    const uploadCount = Object.values(uploads).reduce((sum, arr) => sum + arr.length, 0);
    console.log(`  ✓ Found ${uploadCount} new upload(s) to process`);

    // Process text files with safe iteration
    const processedTexts = [];
    for (let i = 0; i < uploads.texts.length; i++) {
      const file = uploads.texts[i];
      console.log(`    - Processing text file: ${file.filename}`);
      const result = await parseText(file.path);
      if (result.success) {
        processedTexts.push({ ...result, sourceFile: file.filename });
        console.log(`    ✓ ${file.filename} (${result.metadata.characters} chars)`);
      } else {
        processingErrors.push({ file: file.filename, type: 'text', errors: result.errors });
        console.log(`    ✗ ${file.filename}: ${result.errors[0] || 'failed to parse'}`);
      }
    }
    uploads.texts = processedTexts;

    // Process markdown files with safe iteration
    const processedMarkdown = [];
    for (let i = 0; i < uploads.markdown.length; i++) {
      const file = uploads.markdown[i];
      console.log(`    - Processing markdown file: ${file.filename}`);
      const result = await parseMarkdown(file.path);
      if (result.success) {
        processedMarkdown.push({ ...result, sourceFile: file.filename });
        console.log(`    ✓ ${file.filename} (${result.metadata.wordCount} words, ${result.metadata.headings.length} headings)`);
      } else {
        processingErrors.push({ file: file.filename, type: 'markdown', errors: result.errors });
        console.log(`    ✗ ${file.filename}: ${result.errors[0] || 'failed to parse'}`);
      }
    }
    uploads.markdown = processedMarkdown;

    // Process PDF files with safe iteration
    if (uploads.pdfs.length > 0) {
      console.log(`  Processing ${uploads.pdfs.length} pdf file(s)...`);
      const processedPdfs = [];
      for (let i = 0; i < uploads.pdfs.length; i++) {
        const file = uploads.pdfs[i];
        const result = await parsePDF(file.path);
        if (result.success) {
          console.log(`    ✓ ${file.filename} (${result.metadata?.pageCount || 'unknown'} pages)`);
          processedPdfs.push({ ...result, sourceFile: file.filename });
        } else {
          processingErrors.push({ file: file.filename, type: 'pdf', errors: result.errors });
          console.log(`    ✗ ${file.filename}: ${result.errors[0] || 'failed to parse'}`);
        }
      }
      uploads.pdfs = processedPdfs;
    }

    // Process email files with safe iteration
    if (uploads.emails.length > 0) {
      console.log(`  Processing ${uploads.emails.length} email file(s)...`);
      const processedEmails = [];
      for (let i = 0; i < uploads.emails.length; i++) {
        const file = uploads.emails[i];
        const result = await parseEmail(file.path);
        if (result.success) {
          console.log(`    ✓ ${file.filename} (${result.metadata?.subject || 'no subject'})`);
          processedEmails.push({ ...result, sourceFile: file.filename });
        } else {
          processingErrors.push({ file: file.filename, type: 'email', errors: result.errors });
          console.log(`    ✗ ${file.filename}: ${result.errors[0] || 'failed to parse'}`);
        }
      }
      uploads.emails = processedEmails;
    }

    // Process image files with safe iteration
    if (uploads.images.length > 0) {
      console.log(`  Processing ${uploads.images.length} image file(s)...`);
      const processedImages = [];
      for (let i = 0; i < uploads.images.length; i++) {
        const file = uploads.images[i];
        const result = await parseImage(file.path, { skipVision: true }); // Skip Vision API for now
        if (result.success) {
          console.log(`    ✓ ${file.filename} (${result.metadata?.format || 'unknown'}, ${result.metadata?.fileSizeKB || 0}KB)`);
          processedImages.push({ ...result, sourceFile: file.filename });
        } else {
          processingErrors.push({ file: file.filename, type: 'image', errors: result.errors });
          console.log(`    ✗ ${file.filename}: ${result.errors[0] || 'failed to parse'}`);
        }
      }
      uploads.images = processedImages;
    }

    // Process feishu files with safe iteration
    if (uploads.feishu.length > 0) {
      console.log(`  Processing ${uploads.feishu.length} feishu file(s)...`);
      const processedFeishu = [];
      for (let i = 0; i < uploads.feishu.length; i++) {
        const file = uploads.feishu[i];
        const result = await parseFeishu(file.path);
        if (result.success) {
          console.log(`    ✓ ${file.filename} (${result.metadata?.type || 'unknown'}, ${result.metadata?.itemCount || 0} items)`);
          processedFeishu.push({ ...result, sourceFile: file.filename });
        } else {
          processingErrors.push({ file: file.filename, type: 'feishu', errors: result.errors });
          console.log(`    ✗ ${file.filename}: ${result.errors[0] || 'failed to parse'}`);
        }
      }
      uploads.feishu = processedFeishu;
    }

    // Print error summary if there were any errors
    if (processingErrors.length > 0) {
      const successCount = uploadCount - processingErrors.length;
      console.log(`\n  ⚠️  Processed ${successCount}/${uploadCount} files successfully`);
      console.log(`  ${processingErrors.length} file(s) failed to process:`);

      // Group errors by type
      const errorsByType = {};
      processingErrors.forEach(err => {
        if (!errorsByType[err.type]) errorsByType[err.type] = [];
        errorsByType[err.type].push(err);
      });

      Object.entries(errorsByType).forEach(([type, errors]) => {
        console.log(`    ${type.toUpperCase()} (${errors.length}):`);
        errors.forEach(err => {
          console.log(`      - ${err.file}: ${err.errors[0]}`);
        });
      });
      console.log('');
    } else {
      console.log(`  ✓ All ${uploadCount} file(s) processed successfully\n`);
    }

    // Store parsed uploads for merging
    parsedUploads = uploads;

    // Update processed manifest with SHA256 hashes
    const processedFiles = [];
    for (const type of ['texts', 'markdown', 'pdfs', 'emails', 'images', 'feishu']) {
      for (let i = 0; i < uploads[type].length; i++) {
        const file = uploads[type][i];
        const fileBuffer = await readFile(file.path);
        const hash = createHash('sha256').update(fileBuffer).digest('hex');
        processedFiles.push({
          filename: file.sourceFile,
          hash,
          processedAt: new Date().toISOString()
        });
      }
    }

    if (processedFiles.length > 0) {
      await updateProcessedManifest(actualUploadsDir, processedFiles);
      console.log(`  ✓ Updated processed manifest with ${processedFiles.length} file(s)`);
    }
  } catch (error) {
    console.log(`  ⚠️  Upload scanning failed: ${error.message}`);
  }

  // Step 1: Collect information
  console.log('\nStep 1: Collecting information...');
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
    console.log('Usage: node skill-generator.mjs "<name>" [--affiliation "<institution>"] [--deep-analyze] [--uploads "<directory>"]');
    console.log('');
    console.log('Options:');
    console.log('  --affiliation  Specify mentor affiliation');
    console.log('  --deep-analyze Enable deep paper analysis');
    console.log('  --uploads     Specify custom uploads directory (default: ~/.claude/uploads/{mentor_name}/)');
    console.log('');
    console.log('Examples:');
    console.log('  # Basic usage (uses mentor-specific uploads)');
    console.log('  node skill-generator.mjs "Geoffrey Hinton" --affiliation "University of Toronto"');
    console.log('');
    console.log('  # With custom uploads directory');
    console.log('  node skill-generator.mjs "Geoffrey Hinton" --uploads ./my-uploads/');
    console.log('');
    console.log('  # Upload directory structure:');
    console.log('  ~/.claude/uploads/Geoffrey_Hinton/');
    console.log('    ├── text/');
    console.log('    ├── markdown/');
    console.log('    ├── pdfs/');
    console.log('    ├── emails/');
    console.log('    ├── images/');
    console.log('    └── feishu/');
    process.exit(1);
  }

  const name = args[0];
  const affiliationIndex = args.indexOf('--affiliation');
  const affiliation = affiliationIndex !== -1 ? args[affiliationIndex + 1] : '';
  const uploadsIndex = args.indexOf('--uploads');
  const uploadsDir = uploadsIndex !== -1 ? args[uploadsIndex + 1] : null;
  const deepAnalyze = args.includes('--deep-analyze');

  try {
    await generateMentorSkill({ name, affiliation, deepAnalyze, uploadsDir });
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export { generateMentorSkill };
