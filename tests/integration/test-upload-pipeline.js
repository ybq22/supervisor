import { describe, it, before, after } from 'node:test';
import assert from 'node:assert';
import { writeFile, mkdir, rm, readFile } from 'fs/promises';
import { join } from 'path';
import { createHash } from 'crypto';
import { scanUploads, updateProcessedManifest } from '../../tools/upload-scanner.mjs';
import { parseText } from '../../tools/parsers/text-parser.mjs';
import { parseMarkdown } from '../../tools/parsers/markdown-parser.mjs';
import { mergeContent } from '../../tools/content-merger.mjs';

describe('Upload Pipeline Integration Tests', () => {
  const testUploadsDir = 'tests/fixtures/upload-pipeline-test';

  /**
   * Setup: Create test directory structure and files
   */
  before(async () => {
    // Clean up any existing test directory
    await cleanupTestDir();

    // Create directory structure
    await mkdir(join(testUploadsDir, 'text'), { recursive: true });
    await mkdir(join(testUploadsDir, 'markdown'), { recursive: true });
    await mkdir(join(testUploadsDir, 'processed'), { recursive: true });

    // Create test text file (>100 chars as required)
    const longTextContent = `This is a test text file that contains more than one hundred characters.
It has multiple lines and enough content to meet the minimum length requirement.
The text parser should successfully parse this file and return a high confidence score.
Integration tests verify that all components work together correctly.`;
    await writeFile(join(testUploadsDir, 'text', 'test.txt'), longTextContent);

    // Create test markdown file with frontmatter
    const markdownContent = `---
title: Test Document
author: Integration Test
tags: [test, upload, pipeline]
---

# Main Heading

This is a markdown file with frontmatter.
It contains headings, paragraphs, and enough content to be parsed successfully.

## Subheading

Additional content to meet the minimum length requirement.
The markdown parser should extract frontmatter and content correctly.`;
    await writeFile(join(testUploadsDir, 'markdown', 'test.md'), markdownContent);
  });

  /**
   * Cleanup: Remove test directory and all files
   */
  after(async () => {
    await cleanupTestDir();
  });

  /**
   * Helper function to clean up test directory
   */
  async function cleanupTestDir() {
    try {
      await rm(testUploadsDir, { recursive: true, force: true });
    } catch (error) {
      // Ignore if directory doesn't exist
    }
  }

  /**
   * Test 1: Scan uploads and verify it finds the correct files
   */
  it('should scan uploads and find 1 text file and 1 markdown file', async () => {
    const scanResult = await scanUploads(testUploadsDir);

    assert.ok(scanResult, 'Scan result should exist');
    assert.strictEqual(scanResult.texts.length, 1, 'Should find 1 text file');
    assert.strictEqual(scanResult.markdown.length, 1, 'Should find 1 markdown file');
    assert.strictEqual(scanResult.texts[0].filename, 'test.txt');
    assert.strictEqual(scanResult.markdown[0].filename, 'test.md');
  });

  /**
   * Test 2: Parse text file successfully
   */
  it('should parse text file with 0.95 confidence', async () => {
    const scanResult = await scanUploads(testUploadsDir);
    assert.ok(scanResult.texts.length > 0, 'Should have text files to parse');

    const textFile = scanResult.texts[0];
    const parseResult = await parseText(textFile.path);

    assert.ok(parseResult, 'Parse result should exist');
    assert.strictEqual(parseResult.success, true, 'Parse should succeed');
    assert.strictEqual(parseResult.confidence, 0.95, 'Confidence should be 0.95');
    assert.ok(parseResult.content, 'Should have parsed content');
    assert.ok(parseResult.content.length > 100, 'Content should be >100 characters');
    assert.ok(parseResult.metadata, 'Should have metadata');
    assert.ok(parseResult.metadata.words > 0, 'Metadata should have word count');
  });

  /**
   * Test 3: Parse markdown file successfully
   */
  it('should parse markdown file with 0.99 confidence', async () => {
    const scanResult = await scanUploads(testUploadsDir);
    assert.ok(scanResult.markdown.length > 0, 'Should have markdown files to parse');

    const markdownFile = scanResult.markdown[0];
    const parseResult = await parseMarkdown(markdownFile.path);

    assert.ok(parseResult, 'Parse result should exist');
    assert.strictEqual(parseResult.success, true, 'Parse should succeed');
    assert.strictEqual(parseResult.confidence, 0.99, 'Confidence should be 0.99');
    assert.ok(parseResult.content, 'Should have parsed content');
    assert.ok(parseResult.metadata, 'Should have metadata');
    assert.ok(parseResult.metadata.frontmatter, 'Should extract frontmatter');
    assert.strictEqual(parseResult.metadata.frontmatter.title, 'Test Document');
    assert.strictEqual(parseResult.metadata.frontmatter.author, 'Integration Test');
    assert.ok(Array.isArray(parseResult.metadata.headings), 'Should extract headings');
  });

  /**
   * Test 4: Merge content with existing sources
   */
  it('should merge parsed uploads with existing sources', async () => {
    const scanResult = await scanUploads(testUploadsDir);

    // Parse both files
    const textFile = scanResult.texts[0];
    const markdownFile = scanResult.markdown[0];
    const textParseResult = await parseText(textFile.path);
    const markdownParseResult = await parseMarkdown(markdownFile.path);

    // Prepare parsed uploads object
    const parsedUploads = {
      texts: [textParseResult],
      markdown: [markdownParseResult],
      pdfs: [],
      emails: [],
      feishu: [],
      images: []
    };

    // Prepare existing sources
    const existingSources = {
      arxivPapers: [
        { title: 'Existing ArXiv Paper', arxiv_id: '1234.5678' }
      ],
      webSearch: []
    };

    // Merge content
    const mergedResult = mergeContent(existingSources, parsedUploads);

    // Verify merged structure
    assert.ok(mergedResult, 'Merged result should exist');
    assert.ok(mergedResult.sources, 'Should have sources');
    assert.ok(mergedResult.sources.uploads, 'Should have uploads in sources');
    assert.ok(mergedResult.sources.arxivPapers, 'Should preserve existing sources');
    assert.strictEqual(mergedResult.sources.arxivPapers.length, 1, 'Should have existing ArXiv paper');

    // Verify uploads structure
    assert.ok(mergedResult.sources.uploads.texts, 'Should have texts array');
    assert.ok(mergedResult.sources.uploads.markdown, 'Should have markdown array');
    assert.strictEqual(mergedResult.sources.uploads.texts.length, 1, 'Should have 1 text upload');
    assert.strictEqual(mergedResult.sources.uploads.markdown.length, 1, 'Should have 1 markdown upload');
  });

  /**
   * Test 5: Verify quality metrics are calculated correctly
   */
  it('should calculate quality metrics with 2 uploads and high confidence', async () => {
    const scanResult = await scanUploads(testUploadsDir);

    // Parse both files
    const textFile = scanResult.texts[0];
    const markdownFile = scanResult.markdown[0];
    const textParseResult = await parseText(textFile.path);
    const markdownParseResult = await parseMarkdown(markdownFile.path);

    // Prepare parsed uploads object
    const parsedUploads = {
      texts: [textParseResult],
      markdown: [markdownParseResult],
      pdfs: [],
      emails: [],
      feishu: [],
      images: []
    };

    // Merge content
    const mergedResult = mergeContent({}, parsedUploads);

    // Verify quality metrics
    assert.ok(mergedResult.qualityMetrics, 'Should have quality metrics');
    assert.strictEqual(mergedResult.qualityMetrics.uploadCount, 2, 'Should have 2 uploads');
    assert.ok(mergedResult.qualityMetrics.totalConfidence > 0.9, 'Total confidence should be > 0.9');
    assert.ok(mergedResult.qualityMetrics.totalConfidence < 1.0, 'Total confidence should be < 1.0');

    // Calculate expected confidence: (0.95 + 0.99) / 2 = 0.97
    const expectedConfidence = (0.95 + 0.99) / 2;
    assert.strictEqual(
      mergedResult.qualityMetrics.totalConfidence,
      parseFloat(expectedConfidence.toFixed(3)),
      'Total confidence should be average of individual confidences'
    );

    // Verify source diversity (2 types out of 6 = 0.333)
    assert.ok(mergedResult.qualityMetrics.sourceDiversity, 'Should have source diversity');
    assert.strictEqual(
      mergedResult.qualityMetrics.sourceDiversity,
      2 / 6,
      'Source diversity should be 2/6 (texts and markdown)'
    );
  });

  /**
   * Test 6: Complete end-to-end pipeline flow
   */
  it('should run complete pipeline: scan -> parse -> merge with correct results', async () => {
    // Step 1: Scan uploads
    const scanResult = await scanUploads(testUploadsDir);
    assert.strictEqual(scanResult.texts.length, 1, 'Step 1: Scan should find 1 text file');
    assert.strictEqual(scanResult.markdown.length, 1, 'Step 1: Scan should find 1 markdown file');

    // Step 2: Parse all files
    const parsedUploads = {
      texts: [],
      markdown: [],
      pdfs: [],
      emails: [],
      feishu: [],
      images: []
    };

    for (const textFile of scanResult.texts) {
      const result = await parseText(textFile.path);
      parsedUploads.texts.push(result);
    }

    for (const markdownFile of scanResult.markdown) {
      const result = await parseMarkdown(markdownFile.path);
      parsedUploads.markdown.push(result);
    }

    // Verify parsing results
    assert.strictEqual(parsedUploads.texts.length, 1, 'Step 2: Should parse 1 text file');
    assert.strictEqual(parsedUploads.markdown.length, 1, 'Step 2: Should parse 1 markdown file');
    assert.strictEqual(parsedUploads.texts[0].success, true, 'Step 2: Text parsing should succeed');
    assert.strictEqual(parsedUploads.markdown[0].success, true, 'Step 2: Markdown parsing should succeed');

    // Step 3: Merge content
    const existingSources = {
      arxivPapers: [],
      webSearch: []
    };

    const mergedData = mergeContent(existingSources, parsedUploads);

    // Step 4: Verify merged structure
    assert.ok(mergedData.sources.uploads, 'Step 4: Should have uploads in sources');
    assert.strictEqual(
      mergedData.sources.uploads.texts.length + mergedData.sources.uploads.markdown.length,
      2,
      'Step 4: Should have 2 total items in uploads'
    );

    // Step 5: Verify quality metrics
    assert.strictEqual(mergedData.qualityMetrics.uploadCount, 2, 'Step 5: Upload count should be 2');
    assert.ok(mergedData.qualityMetrics.totalConfidence > 0.9, 'Step 5: Total confidence should be > 0.9');
    assert.ok(mergedData.qualityMetrics.sourceDiversity > 0, 'Step 5: Source diversity should be > 0');

    // Step 6: Verify manifest can be updated
    const processedFiles = [
      {
        filename: 'test.txt',
        hash: 'dummy-hash-1',
        processedAt: new Date().toISOString()
      },
      {
        filename: 'test.md',
        hash: 'dummy-hash-2',
        processedAt: new Date().toISOString()
      }
    ];

    await updateProcessedManifest(testUploadsDir, processedFiles);

    // Verify manifest was created
    const manifestPath = join(testUploadsDir, '.processed_manifest.json');
    const manifestContent = await readFile(manifestPath, 'utf-8');
    const manifest = JSON.parse(manifestContent);

    assert.ok(manifest, 'Step 6: Manifest should exist');
    assert.ok(manifest.lastProcessed, 'Step 6: Manifest should have lastProcessed timestamp');
    assert.ok(manifest.files, 'Step 6: Manifest should have files array');
    assert.strictEqual(manifest.files.length, 2, 'Step 6: Manifest should have 2 files');
  });

  /**
   * Test 7: Verify re-scanning skips already processed files
   */
  it('should skip already processed files on second scan', async () => {
    // First scan
    const firstScan = await scanUploads(testUploadsDir);
    assert.strictEqual(firstScan.texts.length, 1, 'First scan should find 1 text file');
    assert.strictEqual(firstScan.markdown.length, 1, 'First scan should find 1 markdown file');

    // Calculate actual hashes and mark files as processed
    const processedFiles = [];
    for (const file of firstScan.texts.concat(firstScan.markdown)) {
      const content = await readFile(file.path);
      const hash = createHash('sha256').update(content).digest('hex');
      processedFiles.push({
        filename: file.filename,
        hash: hash,
        processedAt: new Date().toISOString()
      });
    }

    await updateProcessedManifest(testUploadsDir, processedFiles);

    // Second scan should skip processed files
    const secondScan = await scanUploads(testUploadsDir);
    assert.strictEqual(secondScan.texts.length, 0, 'Second scan should find 0 text files (already processed)');
    assert.strictEqual(secondScan.markdown.length, 0, 'Second scan should find 0 markdown files (already processed)');
  });
});
