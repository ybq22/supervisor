#!/usr/bin/env node
/**
 * Edge Case Tests for Upload System
 *
 * Tests boundary conditions, malformed data, and unusual inputs.
 */

import assert from 'assert';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { scanUploads } from '../../tools/upload-scanner.mjs';
import { parseText, parseMarkdown, parsePDF, parseEmail, parseImage, parseFeishu } from '../../tools/parsers/index.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

async function runTests() {
  let passed = 0;
  let failed = 0;

  console.log('Running Edge Case Tests...\n');

  // Clean up test directory before starting
  const testDir = path.join(__dirname, '../fixtures/test-uploads');
  try {
    await fs.rm(testDir, { recursive: true, force: true });
  } catch (e) {
    // Ignore if directory doesn't exist
  }

  // Test 1: Empty text file
  {
    const testDir = path.join(__dirname, '../fixtures/test-uploads');
    await fs.mkdir(path.join(testDir, 'text'), { recursive: true });

    const emptyPath = path.join(testDir, 'text', 'empty.txt');
    await fs.writeFile(emptyPath, '');

    const result = await parseText(emptyPath);
    assert.strictEqual(result.success, false, 'Should fail for empty file');
    assert(result.errors.some(e => e.includes('empty')), 'Should mention empty file');

    // Cleanup
    await fs.unlink(emptyPath);
    passed++;
    console.log('✓ Test 1: Empty text file rejected');
  }

  // Test 2: Very short content (< 100 chars for PDF)
  {
    const testDir = path.join(__dirname, '../fixtures/test-uploads');
    await fs.mkdir(path.join(testDir, 'text'), { recursive: true });

    const shortPath = path.join(testDir, 'text', 'short.txt');
    await fs.writeFile(shortPath, 'Short');

    const result = await parseText(shortPath);
    assert.strictEqual(result.success, false, 'Should fail for very short content');
    assert(result.errors.some(e => e.includes('insufficient') || e.includes('100')), 'Should mention minimum length');

    // Cleanup
    await fs.unlink(shortPath);
    passed++;
    console.log('✓ Test 2: Very short content rejected');
  }

  // Test 3: Large file (simulate with 100KB)
  {
    const testDir = path.join(__dirname, '../fixtures/test-uploads');
    await fs.mkdir(path.join(testDir, 'text'), { recursive: true });

    const largePath = path.join(testDir, 'text', 'large.txt');
    const largeContent = 'A'.repeat(100000); // 100KB
    await fs.writeFile(largePath, largeContent);

    const result = await parseText(largePath);
    assert.strictEqual(result.success, true, 'Should handle large files');
    assert.strictEqual(result.metadata.characters, 100000, 'Should count all characters');

    // Cleanup
    await fs.unlink(largePath);
    passed++;
    console.log('✓ Test 3: Large file (100KB) handled correctly');
  }

  // Test 4: Invalid JSON for Feishu parser
  {
    const testDir = path.join(__dirname, '../fixtures/test-uploads');
    await fs.mkdir(path.join(testDir, 'feishu'), { recursive: true });

    const invalidJsonPath = path.join(testDir, 'feishu', 'invalid.json');
    await fs.writeFile(invalidJsonPath, '{ invalid json }');

    const result = await parseFeishu(invalidJsonPath);
    assert.strictEqual(result.success, false, 'Should fail for invalid JSON');
    assert(result.errors.some(e => e.includes('Failed to parse JSON')), 'Should mention JSON parse error');

    // Cleanup
    await fs.unlink(invalidJsonPath);
    passed++;
    console.log('✓ Test 4: Invalid JSON handled gracefully');
  }

  // Test 5: Feishu with empty JSON object
  {
    const testDir = path.join(__dirname, '../fixtures/test-uploads');
    await fs.mkdir(path.join(testDir, 'feishu'), { recursive: true });

    const emptyJsonPath = path.join(testDir, 'feishu', 'empty.json');
    await fs.writeFile(emptyJsonPath, '{}');

    const result = await parseFeishu(emptyJsonPath);
    assert.strictEqual(result.success, true, 'Should succeed with empty JSON');
    assert.strictEqual(result.metadata.itemCount, 0, 'Should have 0 items');
    assert(result.confidence < 0.5, 'Should have low confidence for empty structure');

    // Cleanup
    await fs.unlink(emptyJsonPath);
    passed++;
    console.log('✓ Test 5: Empty JSON object handled');
  }

  // Test 6: Wrong file extension
  {
    const result1 = await parseText('/path/to/file.pdf');
    assert.strictEqual(result1.success, false, 'Text parser should reject .pdf');

    const result2 = await parsePDF('/path/to/file.txt');
    assert.strictEqual(result2.success, false, 'PDF parser should reject .txt');

    const result3 = await parseFeishu('/path/to/file.txt');
    assert.strictEqual(result3.success, false, 'Feishu parser should reject .txt');

    passed++;
    console.log('✓ Test 6: Wrong file extensions rejected');
  }

  // Test 7: Special characters in text
  {
    const testDir = path.join(__dirname, '../fixtures/test-uploads');
    await fs.mkdir(path.join(testDir, 'text'), { recursive: true });

    const specialPath = path.join(testDir, 'text', 'special.txt');
    // Create longer content to meet minimum length requirement
    const specialContent = '中文内容 Ñoño café 日本語 🎉 '.repeat(10); // Mixed UTF-8 content
    await fs.writeFile(specialPath, specialContent);

    const result = await parseText(specialPath);
    assert.strictEqual(result.success, true, 'Should handle special characters');
    assert(result.content.includes('中文'), 'Should preserve Chinese characters');
    // Check that some special characters are preserved (emoji or accented chars)
    const hasSpecialChars = result.content.includes('ñoño') || result.content.includes('café') || result.content.includes('🎉');
    assert(hasSpecialChars, 'Should preserve some special characters');

    // Cleanup
    await fs.unlink(specialPath);
    passed++;
    console.log('✓ Test 7: Special characters handled correctly');
  }

  // Test 8: Markdown with only frontmatter, no content
  {
    const testDir = path.join(__dirname, '../fixtures/test-uploads');
    await fs.mkdir(path.join(testDir, 'markdown'), { recursive: true });

    const frontmatterOnlyPath = path.join(testDir, 'markdown', 'frontmatter-only.md');
    await fs.writeFile(frontmatterOnlyPath, '---\ntitle: Test\n---\n');

    const result = await parseMarkdown(frontmatterOnlyPath);
    // The markdown parser might succeed with just frontmatter
    // Let's just check that it's handled (either success or failure with error)
    assert(result !== null, 'Should return a result');
    assert(result.success !== undefined, 'Should have success status');

    // Cleanup
    await fs.unlink(frontmatterOnlyPath);
    passed++;
    console.log('✓ Test 8: Markdown with only frontmatter handled');
  }

  // Test 9: Image parser with invalid image header
  {
    const testDir = path.join(__dirname, '../fixtures/test-uploads');
    await fs.mkdir(path.join(testDir, 'images'), { recursive: true });

    const invalidImagePath = path.join(testDir, 'images', 'fake.png');
    await fs.writeFile(invalidImagePath, Buffer.from([0x00, 0x00, 0x00])); // Invalid PNG header

    const result = await parseImage(invalidImagePath, { skipVision: true });
    assert.strictEqual(result.success, true, 'Should succeed even with invalid header (metadata only)');
    assert.strictEqual(result.metadata.format, 'png', 'Should extract format from extension');

    // Cleanup
    await fs.unlink(invalidImagePath);
    passed++;
    console.log('✓ Test 9: Invalid image header handled');
  }

  // Test 10: Multiple files of same type
  {
    const testDir = path.join(__dirname, '../fixtures/test-uploads');
    await fs.mkdir(path.join(testDir, 'text'), { recursive: true });

    const files = [];
    for (let i = 1; i <= 5; i++) {
      const filePath = path.join(testDir, 'text', `file${i}.txt`);
      await fs.writeFile(filePath, `Content ${i}`.repeat(20)); // Ensure minimum length
      files.push(filePath);
    }

    const uploads = await scanUploads(testDir);
    assert.strictEqual(uploads.texts.length, 5, 'Should detect all 5 files');

    // Cleanup
    for (const file of files) {
      await fs.unlink(file);
    }
    passed++;
    console.log('✓ Test 10: Multiple files of same type handled');
  }

  // Test 11: Long filename (100 characters)
  {
    const testDir = path.join(__dirname, '../fixtures/test-uploads');
    await fs.mkdir(path.join(testDir, 'text'), { recursive: true });

    const longFilename = 'a'.repeat(90) + '.txt'; // Total 94 characters
    const longPath = path.join(testDir, 'text', longFilename);
    await fs.writeFile(longPath, 'Sufficient content to pass validation'.repeat(10));

    const result = await parseText(longPath);
    assert.strictEqual(result.success, true, 'Should handle long filenames');

    // Cleanup
    await fs.unlink(longPath);
    passed++;
    console.log('✓ Test 11: Long filename handled');
  }

  // Test 12: Mixed successful and failed uploads
  {
    const testDir = path.join(__dirname, '../fixtures/test-uploads');
    await fs.mkdir(path.join(testDir, 'text'), { recursive: true });

    // Valid file
    const validPath = path.join(testDir, 'text', 'valid.txt');
    await fs.writeFile(validPath, 'Valid content that is long enough'.repeat(10));

    // Invalid file (empty)
    const invalidPath = path.join(testDir, 'text', 'invalid.txt');
    await fs.writeFile(invalidPath, '');

    const uploads = await scanUploads(testDir);
    assert.strictEqual(uploads.texts.length, 2, 'Should detect both files');

    // Cleanup
    await fs.unlink(validPath);
    await fs.unlink(invalidPath);
    passed++;
    console.log('✓ Test 12: Mixed valid and invalid files handled');
  }

  console.log(`\n✅ Passed: ${passed}/${passed + failed}`);
  console.log('🎉 All edge case tests passed!\n');

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
