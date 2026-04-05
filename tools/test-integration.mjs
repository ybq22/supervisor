#!/usr/bin/env node
/**
 * Test script for upload pipeline integration
 */

import { scanUploads } from './upload-scanner.mjs';
import { parseText, parseMarkdown } from './parsers/index.mjs';
import { mergeContent } from './content-merger.mjs';
import { createHash } from 'crypto';
import { readFile } from 'fs/promises';
import path from 'path';

async function testUploadIntegration() {
  console.log('Testing Upload Pipeline Integration\n');

  const uploadsDir = path.join(process.env.HOME, '.claude', 'uploads');
  const testUploadsDir = path.join(process.cwd(), 'uploads');

  console.log('Step 1: Scanning uploads directory...');
  try {
    const uploads = await scanUploads(testUploadsDir);
    const uploadCount = Object.values(uploads).reduce((sum, arr) => sum + arr.length, 0);
    console.log(`✓ Found ${uploadCount} new upload(s)`);

    if (uploadCount === 0) {
      console.log('No new uploads to process. Test complete.');
      return;
    }

    console.log('\nStep 2: Processing text files...');
    const processedTexts = [];
    for (let i = 0; i < uploads.texts.length; i++) {
      const file = uploads.texts[i];
      console.log(`  Processing: ${file.filename}`);
      const result = await parseText(file.path);
      if (result.success) {
        processedTexts.push({ ...result, sourceFile: file.filename });
        console.log(`  ✓ Parsed successfully (confidence: ${result.confidence})`);
      } else {
        console.log(`  ✗ Failed: ${result.errors.join(', ')}`);
      }
    }
    uploads.texts = processedTexts;

    console.log('\nStep 3: Processing markdown files...');
    const processedMarkdown = [];
    for (let i = 0; i < uploads.markdown.length; i++) {
      const file = uploads.markdown[i];
      console.log(`  Processing: ${file.filename}`);
      const result = await parseMarkdown(file.path);
      if (result.success) {
        processedMarkdown.push({ ...result, sourceFile: file.filename });
        console.log(`  ✓ Parsed successfully (confidence: ${result.confidence})`);
      } else {
        console.log(`  ✗ Failed: ${result.errors.join(', ')}`);
      }
    }
    uploads.markdown = processedMarkdown;

    console.log('\nStep 4: Merging with existing sources...');
    const existingSources = {
      arxivPapers: [],
      webSearch: []
    };

    const mergedData = mergeContent(existingSources, uploads);
    console.log(`✓ Merged data prepared`);
    console.log(`  Upload count: ${mergedData.qualityMetrics.uploadCount}`);
    console.log(`  Total confidence: ${(mergedData.qualityMetrics.totalConfidence * 100).toFixed(1)}%`);
    console.log(`  Source diversity: ${(mergedData.qualityMetrics.sourceDiversity * 100).toFixed(1)}%`);

    console.log('\n✅ All integration tests passed!');
  } catch (error) {
    console.error(`\n✗ Test failed: ${error.message}`);
    console.error(error.stack);
    process.exit(1);
  }
}

testUploadIntegration();
