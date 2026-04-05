#!/usr/bin/env node
/**
 * Integration tests for Phase 3 parsers (Image and Feishu)
 */

import assert from 'assert';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { scanUploads } from '../../tools/upload-scanner.mjs';
import { parseImage, parseFeishu } from '../../tools/parsers/index.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

async function runTests() {
  let passed = 0;
  let failed = 0;

  console.log('Running Phase 3 Integration Tests...\n');

  // Test 1: Upload scanner detects image files
  {
    const testUploadsDir = path.join(__dirname, '../fixtures/test-uploads');
    await fs.mkdir(path.join(testUploadsDir, 'images'), { recursive: true });

    // Create test image
    const testImagePath = path.join(testUploadsDir, 'images', 'test.png');
    await fs.writeFile(testImagePath, Buffer.from([0x89, 0x50, 0x4E, 0x47])); // PNG header

    const uploads = await scanUploads(testUploadsDir);
    assert.strictEqual(uploads.images.length, 1, 'Should detect 1 image file');
    assert.strictEqual(uploads.images[0].filename, 'test.png', 'Should have correct filename');

    // Cleanup
    await fs.unlink(testImagePath);
    await fs.rmdir(path.join(testUploadsDir, 'images'));
    passed++;
    console.log('✓ Test 1: Upload scanner detects image files');
  }

  // Test 2: Upload scanner detects feishu files
  {
    const testUploadsDir = path.join(__dirname, '../fixtures/test-uploads');
    await fs.mkdir(path.join(testUploadsDir, 'feishu'), { recursive: true });

    // Create test Feishu JSON
    const testFeishuPath = path.join(testUploadsDir, 'feishu', 'export.json');
    await fs.writeFile(testFeishuPath, JSON.stringify({ title: 'Test', content: 'Content' }));

    const uploads = await scanUploads(testUploadsDir);
    assert.strictEqual(uploads.feishu.length, 1, 'Should detect 1 feishu file');
    assert.strictEqual(uploads.feishu[0].filename, 'export.json', 'Should have correct filename');

    // Cleanup
    await fs.unlink(testFeishuPath);
    await fs.rmdir(path.join(testUploadsDir, 'feishu'));
    passed++;
    console.log('✓ Test 2: Upload scanner detects feishu files');
  }

  // Test 3: Parse image from upload scanner result
  {
    const testUploadsDir = path.join(__dirname, '../fixtures/test-uploads');
    await fs.mkdir(path.join(testUploadsDir, 'images'), { recursive: true });

    const testImagePath = path.join(testUploadsDir, 'images', 'screenshot.png');
    await fs.writeFile(testImagePath, Buffer.from([0x89, 0x50, 0x4E, 0x47]));

    const uploads = await scanUploads(testUploadsDir);
    const result = await parseImage(uploads.images[0].path, { skipVision: true });

    assert.strictEqual(result.success, true, 'Should parse image successfully');
    assert.strictEqual(result.metadata.format, 'png', 'Should extract format');
    assert(result.metadata.fileSizeKB >= 0, 'Should have file size');

    // Cleanup
    await fs.unlink(testImagePath);
    await fs.rmdir(path.join(testUploadsDir, 'images'));
    passed++;
    console.log('✓ Test 3: Parse image from upload scanner result');
  }

  // Test 4: Parse feishu from upload scanner result
  {
    const testUploadsDir = path.join(__dirname, '../fixtures/test-uploads');
    await fs.mkdir(path.join(testUploadsDir, 'feishu'), { recursive: true });

    const testFeishuPath = path.join(testUploadsDir, 'feishu', 'doc.json');
    const testData = {
      title: 'Meeting Notes',
      content: 'Discussed project roadmap and milestones.',
      creator: 'Team Lead'
    };
    await fs.writeFile(testFeishuPath, JSON.stringify(testData, null, 2));

    const uploads = await scanUploads(testUploadsDir);
    const result = await parseFeishu(uploads.feishu[0].path);

    assert.strictEqual(result.success, true, 'Should parse feishu successfully');
    assert.strictEqual(result.metadata.type, 'document', 'Should detect document type');
    assert(result.content.includes('Meeting Notes'), 'Should include title');
    assert(result.content.includes('project roadmap'), 'Should include content');

    // Cleanup
    await fs.unlink(testFeishuPath);
    await fs.rmdir(path.join(testUploadsDir, 'feishu'));
    passed++;
    console.log('✓ Test 4: Parse feishu from upload scanner result');
  }

  // Test 5: Parser index exports both parsers
  {
    const parsers = await import('../../tools/parsers/index.mjs');
    assert(typeof parsers.parseImage === 'function', 'Should export parseImage');
    assert(typeof parsers.parseFeishu === 'function', 'Should export parseFeishu');
    passed++;
    console.log('✓ Test 5: Parser index exports image and feishu parsers');
  }

  // Test 6: Image parser with skipVision option
  {
    const testUploadsDir = path.join(__dirname, '../fixtures/test-uploads');
    await fs.mkdir(path.join(testUploadsDir, 'images'), { recursive: true });

    const testImagePath = path.join(testUploadsDir, 'images', 'photo.jpg');
    await fs.writeFile(testImagePath, Buffer.from([0xFF, 0xD8, 0xFF])); // JPEG header

    const result = await parseImage(testImagePath, { skipVision: true });
    assert.strictEqual(result.success, true, 'Should succeed with skipVision');
    assert(result.content.includes('Vision API skipped'), 'Should indicate Vision API skipped');
    assert.strictEqual(result.confidence, 0.3, 'Should have lower confidence without Vision API');

    // Cleanup
    await fs.unlink(testImagePath);
    await fs.rmdir(path.join(testUploadsDir, 'images'));
    passed++;
    console.log('✓ Test 6: Image parser with skipVision option');
  }

  // Test 7: Feishu parser handles batch exports
  {
    const testUploadsDir = path.join(__dirname, '../fixtures/test-uploads');
    await fs.mkdir(path.join(testUploadsDir, 'feishu'), { recursive: true });

    const testFeishuPath = path.join(testUploadsDir, 'feishu', 'batch.json');
    const batchData = {
      documents: [
        { title: 'Doc A', content: 'Content A' },
        { title: 'Doc B', content: 'Content B' }
      ]
    };
    await fs.writeFile(testFeishuPath, JSON.stringify(batchData, null, 2));

    const result = await parseFeishu(testFeishuPath);
    assert.strictEqual(result.success, true, 'Should parse batch export');
    assert.strictEqual(result.metadata.type, 'batch', 'Should detect batch type');
    assert.strictEqual(result.metadata.itemCount, 2, 'Should have 2 documents');

    // Cleanup
    await fs.unlink(testFeishuPath);
    await fs.rmdir(path.join(testUploadsDir, 'feishu'));
    passed++;
    console.log('✓ Test 7: Feishu parser handles batch exports');
  }

  console.log(`\n✅ Passed: ${passed}/${passed + failed}`);
  console.log('🎉 All Phase 3 integration tests passed!\n');

  return { passed, failed };
}

// Run tests
runTests().then(({ passed, failed }) => {
  if (failed > 0) {
    process.exit(1);
  }
}).catch(error => {
  console.error('Test error:', error);
  process.exit(1);
});
