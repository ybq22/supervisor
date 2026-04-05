# Multi-Channel Data Upload System Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a comprehensive multi-channel data upload system that enables users to upload materials through six channels (Feishu, PDF, images, email, Markdown, text) and integrate them into the existing mentor analysis pipeline.

**Architecture:** Directory-based upload workflow where users drop files into type-specific subdirectories. An upload scanner detects new files, format-specific parsers extract content, a content merger combines results, and the existing AI analysis pipeline processes all sources together with quality-weighted scoring.

**Tech Stack:** Node.js 18+, pdf-parse, mailparser, marked, Claude Vision API, Feishu Open API (optional)

---

## File Structure Overview

### New Files to Create

**Core infrastructure:**
- `tools/upload-scanner.mjs` - Scan uploads directory, detect new files
- `tools/content-merger.mjs` - Merge parsed content from all sources

**Parsers:**
- `tools/parsers/index.mjs` - Export all parsers
- `tools/parsers/text-parser.mjs` - Parse .txt files
- `tools/parsers/markdown-parser.mjs` - Parse .md files
- `tools/parsers/pdf-parser.mjs` - Parse .pdf files
- `tools/parsers/email-parser.mjs` - Parse .eml/.mbox files
- `tools/parsers/feishu-parser.mjs` - Parse Feishu JSON exports
- `tools/parsers/image-parser.mjs` - Parse images via Vision API

**Tests:**
- `tests/unit/test-upload-scanner.js`
- `tests/unit/parsers/test-text-parser.js`
- `tests/unit/parsers/test-markdown-parser.js`
- `tests/unit/parsers/test-pdf-parser.js`
- `tests/unit/parsers/test-email-parser.js`
- `tests/unit/parsers/test-feishu-parser.js`
- `tests/unit/parsers/test-image-parser.js`
- `tests/unit/test-content-merger.js`
- `tests/integration/test-upload-pipeline.js`

**Test fixtures:**
- `tests/fixtures/pdfs/simple.pdf`
- `tests/fixtures/emails/simple.eml`
- `tests/fixtures/feishu/messages.json`
- `tests/fixtures/images/text.png`
- `tests/fixtures/markdown/sample.md`
- `tests/fixtures/text/sample.txt`

**Documentation:**
- `docs/UPLOAD_GUIDE.md` - User guide for upload features

### Files to Modify

- `tools/skill-generator.mjs` - Integrate upload scanning and processing
- `prompts/analyzer.md` - Add upload sources to analysis guidance
- `prompts/builder.md` - Add source attribution guidance
- `package.json` - Add dependencies (pdf-parse, mailparser, marked)
- `README.md` - Document upload features
- `.gitignore` - Ignore uploads directory

---

## Phase 1: Foundation (Text & Markdown Parsers)

**Duration:** Week 1
**Deliverable:** Working upload pipeline for text and markdown files

### Task 1: Create Directory Structure

**Files:**
- Create: `uploads/text/`, `uploads/markdown/`, `uploads/processed/`
- Create: `tools/parsers/`

- [ ] **Step 1: Create uploads directory structure**

```bash
mkdir -p uploads/text uploads/markdown uploads/processed uploads/pdfs uploads/emails uploads/feishu/json uploads/feishu/markdown uploads/images
```

- [ ] **Step 2: Create parsers directory**

```bash
mkdir -p tools/parsers
```

- [ ] **Step 3: Create test directories**

```bash
mkdir -p tests/unit/parsers tests/fixtures/pdfs tests/fixtures/emails tests/fixtures/feishu tests/fixtures/images tests/fixtures/markdown tests/fixtures/text tests/integration
```

- [ ] **Step 4: Commit directory structure**

```bash
git add uploads tools/parsers tests/unit/parsers tests/fixtures tests/integration
git commit -m "feat: create directory structure for upload system"
```

### Task 2: Implement Text Parser

**Files:**
- Create: `tools/parsers/text-parser.mjs`
- Create: `tests/unit/parsers/test-text-parser.js`
- Create: `tests/fixtures/text/sample.txt`

- [ ] **Step 1: Create test fixture**

```bash
cat > tests/fixtures/text/sample.txt << 'EOF'
This is a sample text file for testing.

It contains multiple lines and some Unicode characters: 你好世界

Line 1: Simple text
Line 2: More text

End of file.
EOF
```

- [ ] **Step 2: Write the failing test**

```javascript
// tests/unit/parsers/test-text-parser.js
import { describe, it, expect } from '@jest/globals';
import { parseText } from '../../../tools/parsers/text-parser.mjs';
import { readFileSync } from 'fs';
import { resolve } from 'path';

describe('Text Parser', () => {
  it('should extract text content from .txt files', async () => {
    const fixturePath = resolve('tests/fixtures/text/sample.txt');
    const result = await parseText(fixturePath);

    expect(result.success).toBe(true);
    expect(result.content).toContain('This is a sample text file');
    expect(result.content).toContain('你好世界');
    expect(result.metadata.encoding).toBeDefined();
    expect(result.metadata.lines).toBeGreaterThan(0);
    expect(result.confidence).toBeGreaterThan(0.8);
  });

  it('should handle empty files', async () => {
    const emptyPath = resolve('tests/fixtures/text/empty.txt');
    await expect(parseText(emptyPath)).rejects.toThrow('Insufficient content');
  });

  it('should handle UTF-8 encoding', async () => {
    const fixturePath = resolve('tests/fixtures/text/sample.txt');
    const result = await parseText(fixturePath);

    expect(result.content).toContain('你好世界');
    expect(result.metadata.encoding).toBe('utf-8');
  });
});
```

- [ ] **Step 3: Run test to verify it fails**

```bash
node --experimental-vm-modules $(which jest) tests/unit/parsers/test-text-parser.js
```

Expected: FAIL - "Cannot find module '../../../tools/parsers/text-parser.mjs'"

- [ ] **Step 4: Write minimal text parser implementation**

```javascript
// tools/parsers/text-parser.mjs
import { readFileSync } from 'fs';
import { extname } from 'path';

const MIN_CHARS = 100;

export async function parseText(filePath, options = {}) {
  try {
    // Validate file extension
    if (extname(filePath).toLowerCase() !== '.txt' && extname(filePath).toLowerCase() !== '.text') {
      return {
        success: false,
        content: '',
        metadata: {},
        confidence: 0,
        errors: ['Invalid file type. Expected .txt or .text']
      };
    }

    // Read file with UTF-8 encoding
    let content;
    try {
      content = readFileSync(filePath, 'utf-8');
    } catch (readError) {
      // Try alternative encodings
      const encodings = ['utf-16le', 'utf-16be', 'latin1'];
      for (const encoding of encodings) {
        try {
          const buffer = readFileSync(filePath);
          content = buffer.toString(encoding);
          break;
        } catch (e) {
          continue;
        }
      }
      if (!content) throw readError;
    }

    // Validate minimum content
    if (content.length < MIN_CHARS) {
      return {
        success: false,
        content: '',
        metadata: {},
        confidence: 0,
        errors: [`Insufficient content extracted (${content.length} < ${MIN_CHARS} chars)`]
      };
    }

    // Normalize content
    const normalized = content
      .trim()
      .replace(/\r\n/g, '\n')
      .replace(/[^\S\r\n]{3,}/g, '  '); // Reduce excessive whitespace

    // Calculate metadata
    const lines = normalized.split('\n');
    const words = normalized.split(/\s+/).filter(w => w.length > 0);

    return {
      success: true,
      content: normalized,
      metadata: {
        encoding: 'utf-8',
        lines: lines.length,
        words: words.length,
        characters: normalized.length
      },
      confidence: 0.95, // High confidence for text files
      errors: []
    };

  } catch (error) {
    return {
      success: false,
      content: '',
      metadata: {},
      confidence: 0,
      errors: [`Failed to parse text file: ${error.message}`]
    };
  }
}
```

- [ ] **Step 5: Run test to verify it passes**

```bash
node --experimental-vm-modules $(which jest) tests/unit/parsers/test-text-parser.js
```

Expected: PASS

- [ ] **Step 6: Create empty.txt fixture for edge case test**

```bash
touch tests/fixtures/text/empty.txt
```

- [ ] **Step 7: Commit text parser**

```bash
git add tools/parsers/text-parser.mjs tests/unit/parsers/test-text-parser.js tests/fixtures/text/
git commit -m "feat: implement text parser with encoding detection"
```

### Task 3: Implement Markdown Parser

**Files:**
- Create: `tools/parsers/markdown-parser.mjs`
- Create: `tests/unit/parsers/test-markdown-parser.js`
- Create: `tests/fixtures/markdown/sample.md`

- [ ] **Step 1: Create test fixture**

```bash
cat > tests/fixtures/markdown/sample.md << 'EOF'
# Sample Markdown Document

This is a **sample** markdown file with *formatting*.

## Section 1

Here's a code block:

```javascript
function hello() {
  console.log("Hello, world!");
}
```

## Section 2

- Item 1
- Item 2
- Item 3

A [link](https://example.com) and some `inline code`.

EOF
```

- [ ] **Step 2: Write the failing test**

```javascript
// tests/unit/parsers/test-markdown-parser.js
import { describe, it, expect } from '@jest/globals';
import { parseMarkdown } from '../../../tools/parsers/markdown-parser.mjs';
import { resolve } from 'path';

describe('Markdown Parser', () => {
  it('should parse markdown files and extract structure', async () => {
    const fixturePath = resolve('tests/fixtures/markdown/sample.md');
    const result = await parseMarkdown(fixturePath);

    expect(result.success).toBe(true);
    expect(result.content).toContain('# Sample Markdown Document');
    expect(result.metadata.headings).toContain('Sample Markdown Document');
    expect(result.metadata.headings).toContain('Section 1');
    expect(result.metadata.codeBlocks).toBe(1);
    expect(result.confidence).toBe(0.99);
  });

  it('should handle markdown with frontmatter', async () => {
    const frontmatterPath = resolve('tests/fixtures/markdown/with-frontmatter.md');
    const result = await parseMarkdown(frontmatterPath);

    expect(result.success).toBe(true);
    expect(result.metadata.frontmatter).toBeDefined();
    expect(result.metadata.frontmatter.title).toBeDefined();
  });
});
```

- [ ] **Step 3: Run test to verify it fails**

```bash
node --experimental-vm-modules $(which jest) tests/unit/parsers/test-markdown-parser.js
```

Expected: FAIL - "Cannot find module"

- [ ] **Step 4: Write minimal markdown parser implementation**

```javascript
// tools/parsers/markdown-parser.mjs
import { readFileSync } from 'fs';
import { extname } from 'path';
import { marked } from 'marked';

const MIN_CHARS = 50;

export async function parseMarkdown(filePath, options = {}) {
  try {
    // Validate file extension
    if (extname(filePath).toLowerCase() !== '.md') {
      return {
        success: false,
        content: '',
        metadata: {},
        confidence: 0,
        errors: ['Invalid file type. Expected .md']
      };
    }

    // Read file
    const content = readFileSync(filePath, 'utf-8');

    // Validate minimum content
    if (content.length < MIN_CHARS) {
      return {
        success: false,
        content: '',
        metadata: {},
        confidence: 0,
        errors: [`Insufficient content (${content.length} < ${MIN_CHARS} chars)`]
      };
    }

    // Extract frontmatter if present
    let frontmatter = null;
    let contentWithoutFrontmatter = content;
    const frontmatterRegex = /^---\n([\s\S]*?)\n---\n/;
    const frontmatterMatch = content.match(frontmatterRegex);

    if (frontmatterMatch) {
      try {
        // Simple YAML parsing (for basic key-value pairs)
        frontmatter = {};
        frontmatterMatch[1].split('\n').forEach(line => {
          const [key, ...valueParts] = line.split(':');
          if (key && valueParts.length > 0) {
            frontmatter[key.trim()] = valueParts.join(':').trim();
          }
        });
        contentWithoutFrontmatter = content.replace(frontmatterRegex, '');
      } catch (e) {
        // If frontmatter parsing fails, continue with original content
        contentWithoutFrontmatter = content;
      }
    }

    // Extract headings
    const headings = [];
    const headingRegex = /^(#{1,3})\s+(.+)$/gm;
    let headingMatch;
    while ((headingMatch = headingRegex.exec(content)) !== null) {
      headings.push(headingMatch[2]);
    }

    // Count code blocks
    const codeBlockRegex = /```/g;
    const codeBlockMatches = content.match(codeBlockRegex);
    const codeBlocks = codeBlockMatches ? codeBlockMatches.length / 2 : 0;

    // Count words
    const words = contentWithoutFrontmatter.split(/\s+/).filter(w => w.length > 0);

    return {
      success: true,
      content: contentWithoutFrontmatter,
      metadata: {
        headings,
        codeBlocks,
        frontmatter,
        wordCount: words.length
      },
      confidence: 0.99, // Very high confidence for markdown
      errors: []
    };

  } catch (error) {
    return {
      success: false,
      content: '',
      metadata: {},
      confidence: 0,
      errors: [`Failed to parse markdown file: ${error.message}`]
    };
  }
}
```

- [ ] **Step 5: Install marked dependency**

```bash
npm install marked --save
```

- [ ] **Step 6: Create frontmatter test fixture**

```bash
cat > tests/fixtures/markdown/with-frontmatter.md << 'EOF'
---
title: "Test Document"
author: "Test Author"
date: "2025-04-05"
---

# Content

This is content with frontmatter.
EOF
```

- [ ] **Step 7: Run test to verify it passes**

```bash
node --experimental-vm-modules $(which jest) tests/unit/parsers/test-markdown-parser.js
```

Expected: PASS

- [ ] **Step 8: Commit markdown parser**

```bash
git add tools/parsers/markdown-parser.mjs tests/unit/parsers/test-markdown-parser.js tests/fixtures/markdown/ package.json
git commit -m "feat: implement markdown parser with frontmatter and structure extraction"
```

### Task 4: Implement Upload Scanner

**Files:**
- Create: `tools/upload-scanner.mjs`
- Create: `tests/unit/test-upload-scanner.js`

- [ ] **Step 1: Write the failing test**

```javascript
// tests/unit/test-upload-scanner.js
import { describe, it, expect, beforeEach, afterEach } from '@jest/globals';
import { scanUploads } from '../../tools/upload-scanner.mjs';
import { mkdirSync, rmSync, writeFileSync } from 'fs';
import { resolve } from 'path';

describe('Upload Scanner', () => {
  const testUploadDir = resolve('tests/test-uploads');

  beforeEach(() => {
    // Create test upload directories
    mkdirSync(testUploadDir, { recursive: true });
    mkdirSync(resolve(testUploadDir, 'text'), { recursive: true });
    mkdirSync(resolve(testUploadDir, 'markdown'), { recursive: true });
    mkdirSync(resolve(testUploadDir, 'processed'), { recursive: true });
  });

  afterEach(() => {
    // Cleanup
    rmSync(testUploadDir, { recursive: true, force: true });
  });

  it('should scan and categorize files by type', async () => {
    // Create test files
    writeFileSync(resolve(testUploadDir, 'text/sample.txt'), 'Sample text content that is long enough to pass validation');
    writeFileSync(resolve(testUploadDir, 'markdown/sample.md'), '# Sample Markdown\n\nContent here.');

    const result = await scanUploads(testUploadDir);

    expect(result.texts).toHaveLength(1);
    expect(result.texts[0].path).toContain('sample.txt');
    expect(result.markdown).toHaveLength(1);
    expect(result.markdown[0].path).toContain('sample.md');
  });

  it('should skip already processed files', async () => {
    // Create test file
    const testFile = resolve(testUploadDir, 'text/sample.txt');
    writeFileSync(testFile, 'Sample text content that is long enough to pass validation');

    // Create processed manifest
    const manifestPath = resolve(testUploadDir, 'processed/.processed_manifest.json');
    writeFileSync(manifestPath, JSON.stringify({
      lastProcessed: new Date().toISOString(),
      files: {
        'sample.txt': {
          hash: 'test-hash',
          processedAt: new Date().toISOString(),
          status: 'success'
        }
      }
    }));

    const result = await scanUploads(testUploadDir);

    expect(result.texts).toHaveLength(0);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

```bash
node --experimental-vm-modules $(which jest) tests/unit/test-upload-scanner.js
```

Expected: FAIL - "Cannot find module"

- [ ] **Step 3: Write minimal upload scanner implementation**

```javascript
// tools/upload-scanner.mjs
import { readdir, stat, readFile } from 'fs/promises';
import { join, extname, basename } from 'path';
import { createHash } from 'crypto';

const FILE_TYPE_MAP = {
  '.pdf': 'pdfs',
  '.eml': 'emails',
  '.mbox': 'emails',
  '.png': 'images',
  '.jpg': 'images',
  '.jpeg': 'images',
  '.gif': 'images',
  '.webp': 'images',
  '.md': 'markdown',
  '.txt': 'text',
  '.text': 'text'
};

export async function scanUploads(uploadsDir) {
  const result = {
    pdfs: [],
    emails: [],
    feishu: [],
    images: [],
    markdown: [],
    text: []
  };

  try {
    // Load processed manifest
    let processedManifest = { files: {} };
    const manifestPath = join(uploadsDir, 'processed/.processed_manifest.json');

    try {
      const manifestContent = await readFile(manifestPath, 'utf-8');
      processedManifest = JSON.parse(manifestContent);
    } catch (e) {
      // Manifest doesn't exist or is invalid - start fresh
    }

    // Scan each subdirectory
    const subdirs = ['pdfs', 'emails', 'feishu', 'images', 'markdown', 'text'];

    for (const subdir of subdirs) {
      const dirPath = join(uploadsDir, subdir);

      try {
        const files = await readdir(dirPath);

        for (const file of files) {
          // Skip hidden files and manifest
          if (file.startsWith('.') || file === '.processed_manifest.json') {
            continue;
          }

          const filePath = join(dirPath, file);
          const stats = await stat(filePath);

          // Skip directories
          if (stats.isDirectory()) {
            continue;
          }

          // Calculate file hash
          const content = await readFile(filePath);
          const hash = createHash('sha256').update(content).digest('hex');

          // Check if already processed
          const processedFile = processedManifest.files[file];
          if (processedFile && processedFile.hash === `sha256:${hash}`) {
            continue;
          }

          // Categorize file
          const ext = extname(file).toLowerCase();
          const fileType = FILE_TYPE_MAP[ext];

          if (!fileType) {
            continue; // Unknown file type
          }

          // Add to appropriate category
          const fileInfo = {
            path: filePath,
            size: stats.size,
            timestamp: stats.mtime,
            filename: file
          };

          if (fileType === 'pdfs') {
            result.pdfs.push(fileInfo);
          } else if (fileType === 'emails') {
            result.emails.push(fileInfo);
          } else if (fileType === 'images') {
            result.images.push(fileInfo);
          } else if (fileType === 'markdown') {
            result.markdown.push(fileInfo);
          } else if (fileType === 'text') {
            result.texts.push(fileInfo);
          }
        }
      } catch (e) {
        // Directory doesn't exist - skip
        continue;
      }
    }

    return result;

  } catch (error) {
    throw new Error(`Upload scan failed: ${error.message}`);
  }
}

export async function updateProcessedManifest(uploadsDir, processedFiles) {
  const manifestPath = join(uploadsDir, 'processed/.processed_manifest.json');

  let manifest = { files: {} };

  // Load existing manifest
  try {
    const content = await readFile(manifestPath, 'utf-8');
    manifest = JSON.parse(content);
  } catch (e) {
    // Create new manifest
  }

  // Update with newly processed files
  manifest.lastProcessed = new Date().toISOString();

  for (const file of processedFiles) {
    manifest.files[file.filename] = {
      hash: file.hash,
      processedAt: new Date().toISOString(),
      status: 'success',
      parser: file.parser
    };
  }

  // Write updated manifest
  await writeFile(manifestPath, JSON.stringify(manifest, null, 2));
}
```

- [ ] **Step 4: Fix import statement in scanner**

```javascript
// Add this import at the top of upload-scanner.mjs
import { writeFile } from 'fs/promises';
```

- [ ] **Step 5: Run test to verify it passes**

```bash
node --experimental-vm-modules $(which jest) tests/unit/test-upload-scanner.js
```

Expected: PASS

- [ ] **Step 6: Commit upload scanner**

```bash
git add tools/upload-scanner.mjs tests/unit/test-upload-scanner.js
git commit -m "feat: implement upload scanner with manifest tracking"
```

### Task 5: Implement Content Merger

**Files:**
- Create: `tools/content-merger.mjs`
- Create: `tests/unit/test-content-merger.js`

- [ ] **Step 1: Write the failing test**

```javascript
// tests/unit/test-content-merger.js
import { describe, it, expect } from '@jest/globals';
import { mergeContent } from '../../tools/content-merger.mjs';

describe('Content Merger', () => {
  it('should merge parsed uploads with existing sources', () => {
    const existingSources = {
      arxivPapers: [
        { title: 'Paper 1', content: 'Paper content' }
      ],
      webSearch: [
        { url: 'https://example.com', content: 'Web content' }
      ]
    };

    const parsedUploads = {
      texts: [{
        content: 'Text content',
        metadata: { wordCount: 100 },
        confidence: 0.95,
        sourceFile: 'test.txt'
      }],
      markdown: [{
        content: 'Markdown content',
        metadata: { headings: ['Test'] },
        confidence: 0.99,
        sourceFile: 'test.md'
      }]
    };

    const result = mergeContent(existingSources, parsedUploads);

    expect(result.sources).toBeDefined();
    expect(result.sources.arxivPapers).toEqual(existingSources.arxivPapers);
    expect(result.sources.webSearch).toEqual(existingSources.webSearch);
    expect(result.sources.uploads).toBeDefined();
    expect(result.sources.uploads.texts).toHaveLength(1);
    expect(result.sources.uploads.markdown).toHaveLength(1);
    expect(result.qualityMetrics).toBeDefined();
    expect(result.qualityMetrics.uploadCount).toBe(2);
  });

  it('should calculate quality metrics', () => {
    const parsedUploads = {
      texts: [{
        content: 'Text content',
        metadata: { wordCount: 100 },
        confidence: 0.95,
        sourceFile: 'test.txt'
      }]
    };

    const result = mergeContent({}, parsedUploads);

    expect(result.qualityMetrics.totalConfidence).toBeGreaterThan(0);
    expect(result.qualityMetrics.totalConfidence).toBeLessThanOrEqual(1);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

```bash
node --experimental-vm-modules $(which jest) tests/unit/test-content-merger.js
```

Expected: FAIL - "Cannot find module"

- [ ] **Step 3: Write minimal content merger implementation**

```javascript
// tools/content-merger.mjs
export function mergeContent(existingSources, parsedUploads) {
  const uploads = {
    pdfs: parsedUploads.pdfs || [],
    emails: parsedUploads.emails || [],
    feishu: parsedUploads.feishu || [],
    images: parsedUploads.images || [],
    markdown: parsedUploads.markdown || [],
    texts: parsedUploads.texts || []
  };

  // Calculate quality metrics
  const uploadCount = Object.values(uploads).reduce((sum, arr) => sum + arr.length, 0);

  let totalConfidence = 0;
  let weightedSum = 0;

  Object.values(uploads).flat().forEach(upload => {
    weightedSum += upload.confidence;
  });

  totalConfidence = uploadCount > 0 ? weightedSum / uploadCount : 0;

  // Calculate source diversity
  const sourceTypes = Object.keys(uploads).filter(type => uploads[type].length > 0);
  const sourceDiversity = sourceTypes.length / 6; // 6 total types

  return {
    sources: {
      ...existingSources,
      uploads
    },
    qualityMetrics: {
      uploadCount,
      totalConfidence,
      sourceDiversity: sourceDiversity
    }
  };
}
```

- [ ] **Step 4: Run test to verify it passes**

```bash
node --experimental-vm-modules $(which jest) tests/unit/test-content-merger.js
```

Expected: PASS

- [ ] **Step 5: Commit content merger**

```bash
git add tools/content-merger.mjs tests/unit/test-content-merger.js
git commit -m "feat: implement content merger with quality metrics"
```

### Task 6: Create Parser Index

**Files:**
- Create: `tools/parsers/index.mjs`

- [ ] **Step 1: Create parser index**

```javascript
// tools/parsers/index.mjs
export { parseText } from './text-parser.mjs';
export { parseMarkdown } from './markdown-parser.mjs';
```

- [ ] **Step 2: Commit parser index**

```bash
git add tools/parsers/index.mjs
git commit -m "feat: create parser index for easy imports"
```

### Task 7: Integrate Upload Pipeline into Skill Generator

**Files:**
- Modify: `tools/skill-generator.mjs`

- [ ] **Step 1: Read current skill generator structure**

```bash
head -100 tools/skill-generator.mjs
```

- [ ] **Step 2: Add upload scanning to skill generator**

Find the `generateMentorSkill` function and add upload scanning at the beginning:

```javascript
// In tools/skill-generator.mjs, after the imports section:

import { scanUploads, updateProcessedManifest } from './upload-scanner.mjs';
import { parseText, parseMarkdown } from './parsers/index.mjs';
import { mergeContent } from './content-merger.mjs';
import { createHash } from 'crypto';

// In generateMentorSkill function, after console.log for "Starting mentor distillation":

async function generateMentorSkill(options) {
  const {
    name,
    affiliation = '',
    deepAnalyze = false,
    arxivLimit = 20,
    browserSearch = true
  } = options;

  console.log(`\n🎓 Starting mentor distillation: ${name}`);

  // NEW: Scan uploads directory
  console.log('\n[Upload Scanner] Scanning uploads directory...');
  const uploadsDir = path.join(__dirname, '../uploads');
  let uploads = { pdfs: [], emails: [], feishu: [], images: [], markdown: [], texts: [] };

  try {
    uploads = await scanUploads(uploadsDir);

    const totalFiles = Object.values(uploads).reduce((sum, arr) => sum + arr.length, 0);

    if (totalFiles > 0) {
      console.log(`[Upload Scanner] Found ${totalFiles} files to process`);

      // Process text files
      if (uploads.texts.length > 0) {
        console.log(`[Upload Scanner] Processing ${uploads.texts.length} text file(s)...`);
        for (const file of uploads.texts) {
          const result = await parseText(file.path);
          if (result.success) {
            uploads.texts[uploads.texts.indexOf(file)] = {
              ...result,
              sourceFile: file.filename
            };
            console.log(`[Text Parser] ✓ ${file.filename} (${result.metadata.words} words)`);
          } else {
            console.log(`[Text Parser] ✗ ${file.filename}: ${result.errors.join(', ')}`);
          }
        }
      }

      // Process markdown files
      if (uploads.markdown.length > 0) {
        console.log(`[Upload Scanner] Processing ${uploads.markdown.length} markdown file(s)...`);
        for (const file of uploads.markdown) {
          const result = await parseMarkdown(file.path);
          if (result.success) {
            uploads.markdown[uploads.markdown.indexOf(file)] = {
              ...result,
              sourceFile: file.filename
            };
            console.log(`[Markdown Parser] ✓ ${file.filename} (${result.metadata.wordCount} words)`);
          } else {
            console.log(`[Markdown Parser] ✗ ${file.filename}: ${result.errors.join(', ')}`);
          }
        }
      }

      // Update processed manifest
      const processedFiles = [];
      Object.values(uploads).flat().forEach(file => {
        if (file.success !== false && file.content) {
          const filePath = file.path || file.sourceFile;
          const content = await readFile(filePath);
          const hash = createHash('sha256').update(content).digest('hex');
          processedFiles.push({
            filename: file.sourceFile || path.basename(filePath),
            hash: `sha256:${hash}`,
            parser: file.metadata?.parser || 'unknown'
          });
        }
      });

      if (processedFiles.length > 0) {
        await updateProcessedManifest(uploadsDir, processedFiles);
        console.log(`[Upload Scanner] ✓ Processed ${processedFiles.length} file(s)`);
      }
    } else {
      console.log('[Upload Scanner] No new files found');
    }
  } catch (error) {
    console.log(`[Upload Scanner] Warning: ${error.message}`);
    console.log('[Upload Scanner] Continuing with web search only...');
  }

  // Continue with existing ArXiv and web search...
  console.log('\n[ArXiv Search] Searching for papers...');

  // ... rest of existing code ...

  // Before merging data for AI analysis, add the uploads:
  // After collecting arxivPapers and webSearch results:

  const mergedData = mergeContent(
    {
      arxivPapers: papers || [],
      webSearch: webResults || []
    },
    uploads
  );

  console.log(`\n[Quality Assessment] Total sources: ${mergedData.qualityMetrics.uploadCount} uploads`);
  console.log(`[Quality Assessment] Upload quality: ${(mergedData.qualityMetrics.totalConfidence * 100).toFixed(1)}%`);

  // Pass mergedData to AI analysis instead of just papers + webResults
}
```

- [ ] **Step 3: Add missing import**

```javascript
import { readFile } from 'fs/promises';
```

- [ ] **Step 4: Test integration with sample files**

```bash
# Create test files
echo "This is a test text file with enough content to pass the minimum character requirement for processing by the text parser." > uploads/text/test.txt
echo "# Test Markdown File

This is a test markdown file with sufficient content to demonstrate the markdown parser functionality." > uploads/markdown/test.md

# Run skill generator (will need API key)
export ANTHROPIC_API_KEY="your-key"
node tools/skill-generator.mjs "Test Mentor" --affiliation "Test University"
```

- [ ] **Step 5: Commit skill generator integration**

```bash
git add tools/skill-generator.mjs
git commit -m "feat: integrate upload pipeline into skill generator"
```

### Task 8: Write Integration Test

**Files:**
- Create: `tests/integration/test-upload-pipeline.js`

- [ ] **Step 1: Write integration test**

```javascript
// tests/integration/test-upload-pipeline.js
import { describe, it, expect, beforeAll, afterAll } from '@jest/globals';
import { scanUploads } from '../../tools/upload-scanner.mjs';
import { parseText, parseMarkdown } from '../../tools/parsers/index.mjs';
import { mergeContent } from '../../tools/content-merger.mjs';
import { mkdirSync, rmSync, writeFileSync } from 'fs';
import { resolve } from 'path';

describe('Upload Pipeline Integration', () => {
  const testUploadDir = resolve('tests/test-integration-uploads');

  beforeAll(() => {
    // Create test structure
    mkdirSync(testUploadDir, { recursive: true });
    mkdirSync(resolve(testUploadDir, 'text'), { recursive: true });
    mkdirSync(resolve(testUploadDir, 'markdown'), { recursive: true });
    mkdirSync(resolve(testUploadDir, 'processed'), { recursive: true });

    // Create test files
    const longText = 'This is a test file. '.repeat(20); // 360 chars
    writeFileSync(resolve(testUploadDir, 'text/test.txt'), longText);

    const longMarkdown = '# Test\n\n' + 'Content here. '.repeat(20);
    writeFileSync(resolve(testUploadDir, 'markdown/test.md'), longMarkdown);
  });

  afterAll(() => {
    // Cleanup
    rmSync(testUploadDir, { recursive: true, force: true });
  });

  it('should process complete upload pipeline end-to-end', async () => {
    // Step 1: Scan uploads
    const scanned = await scanUploads(testUploadDir);
    expect(scanned.texts).toHaveLength(1);
    expect(scanned.markdown).toHaveLength(1);

    // Step 2: Parse files
    const textResult = await parseText(scanned.texts[0].path);
    expect(textResult.success).toBe(true);
    expect(textResult.content.length).toBeGreaterThan(0);

    const mdResult = await parseMarkdown(scanned.markdown[0].path);
    expect(mdResult.success).toBe(true);
    expect(mdResult.content.length).toBeGreaterThan(0);

    // Step 3: Merge content
    const merged = mergeContent({}, {
      texts: [{ ...textResult, sourceFile: 'test.txt' }],
      markdown: [{ ...mdResult, sourceFile: 'test.md' }]
    });

    expect(merged.sources.uploads).toBeDefined();
    expect(merged.sources.uploads.texts).toHaveLength(1);
    expect(merged.sources.uploads.markdown).toHaveLength(1);
    expect(merged.qualityMetrics.uploadCount).toBe(2);
    expect(merged.qualityMetrics.totalConfidence).toBeGreaterThan(0.9);
  });
});
```

- [ ] **Step 2: Run integration test**

```bash
node --experimental-vm-modules $(which jest) tests/integration/test-upload-pipeline.js
```

Expected: PASS

- [ ] **Step 3: Commit integration test**

```bash
git add tests/integration/test-upload-pipeline.js
git commit -m "test: add end-to-end integration test for upload pipeline"
```

### Task 9: Update Documentation

**Files:**
- Create: `docs/UPLOAD_GUIDE.md`
- Modify: `README.md`

- [ ] **Step 1: Create upload guide**

```markdown
# Upload Guide for distill-mentor

## Overview

The upload system allows you to provide additional materials about your mentor through simple file uploads. These materials are analyzed together with papers and web search results to create more comprehensive mentor skills.

## Supported File Types

### 1. Text Files (.txt, .text)

Plain text files with any content.

**Use for:** Transcripts, notes, correspondence, text documentation

**Example:**
```bash
cp interview_transcript.txt uploads/text/
```

### 2. Markdown Files (.md)

Markdown documents with structure and formatting.

**Use for:** Notes, documentation, structured text

**Example:**
```bash
cp research_notes.md uploads/markdown/
```

## Quick Start

1. **Place files in appropriate directories:**
   ```bash
   cp myfile.txt uploads/text/
   cp notes.md uploads/markdown/
   ```

2. **Generate mentor skill:**
   ```bash
   node tools/skill-generator.mjs "Mentor Name" --affiliation "Institution"
   ```

3. **View results:**
   - Uploads are processed automatically
   - Quality report shows what was analyzed
   - Mentor skill includes insights from uploads

## Directory Structure

```
uploads/
├── text/           # Plain text files
├── markdown/       # Markdown documents
├── pdfs/           # PDF files (coming soon)
├── emails/         # Email files (coming soon)
├── feishu/         # Feishu exports (coming soon)
├── images/         # Images and screenshots (coming soon)
└── processed/      # Tracking manifest (auto-generated)
```

## Quality Tips

1. **Provide sufficient content:** Files should have >100 characters for text, >50 for markdown
2. **Use appropriate encoding:** UTF-8 works best
3. **Organize by type:** Put files in correct subdirectories
4. **Check quality report:** Review feedback after generation

## Troubleshooting

**File not processed?**
- Check file is in correct directory
- Ensure file has correct extension
- Verify file meets minimum content length

**Encoding issues?**
- Use UTF-8 encoding when possible
- System attempts fallback encodings automatically

**Already processed?**
- Files are tracked and not re-processed
- Delete `uploads/processed/.processed_manifest.json` to force re-processing
