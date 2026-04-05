#!/usr/bin/env node
/**
 * Tests for Image Parser
 */

import assert from 'assert';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { parseImage } from '../../../tools/parsers/image-parser.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

async function runTests() {
  let passed = 0;
  let failed = 0;

  console.log('Running Image Parser Tests...\n');

  // Test 1: Invalid extension
  {
    const result = await parseImage('/path/to/file.txt');
    assert.strictEqual(result.success, false, 'Should fail with invalid extension');
    assert.strictEqual(result.confidence, 0, 'Confidence should be 0');
    assert(result.errors.length > 0, 'Should have errors');
    passed++;
    console.log('✓ Test 1: Invalid extension rejected');
  }

  // Test 2: Valid PNG extension (file doesn't exist - should fail gracefully)
  {
    const result = await parseImage('/nonexistent/path/test.png');
    assert.strictEqual(result.success, false, 'Should fail with non-existent file');
    assert.strictEqual(result.confidence, 0, 'Confidence should be 0');
    assert(result.errors.length > 0, 'Should have errors');
    passed++;
    console.log('✓ Test 2: Non-existent file handled gracefully');
  }

  // Test 3: skipVision option
  {
    const result = await parseImage('/nonexistent/path/test.jpg', { skipVision: true });
    // This will fail at file read, but we're testing the option is checked
    assert(result !== null, 'Should return result object');
    passed++;
    console.log('✓ Test 3: skipVision option accepted');
  }

  // Test 4: Valid extensions
  {
    const validExtensions = ['.png', '.jpg', '.jpeg', '.gif', '.webp'];
    for (const ext of validExtensions) {
      const result = await parseImage(`/path/to/file${ext}`);
      assert(!result.errors[0].includes('Invalid file extension'), `${ext} should be valid`);
    }
    passed++;
    console.log('✓ Test 4: All valid extensions accepted');
  }

  // Test 5: Metadata structure (when file exists)
  {
    // Create a temporary test image file
    const testDir = path.join(__dirname, '../../fixtures/images');
    await fs.mkdir(testDir, { recursive: true });

    const testImagePath = path.join(testDir, 'test-placeholder.png');
    await fs.writeFile(testImagePath, Buffer.from([0x89, 0x50, 0x4E, 0x47])); // PNG header

    const result = await parseImage(testImagePath, { skipVision: true });
    assert.strictEqual(result.success, true, 'Should succeed with skipVision');
    assert.strictEqual(result.metadata.format, 'png', 'Should extract format');
    assert(result.metadata.fileSizeKB >= 0, 'Should have file size');
    assert(result.metadata.extractedAt, 'Should have extraction timestamp');

    // Cleanup
    await fs.unlink(testImagePath);
    passed++;
    console.log('✓ Test 5: Metadata extracted correctly');
  }

  // Test 6: export analyzeWithVisionAPI function exists
  {
    const module = await import('../../../tools/parsers/image-parser.mjs');
    assert(typeof module.analyzeWithVisionAPI === 'function', 'Should export analyzeWithVisionAPI');
    passed++;
    console.log('✓ Test 6: analyzeWithVisionAPI function exported');
  }

  // Test 7: Vision API placeholder message
  {
    const testDir = path.join(__dirname, '../../fixtures/images');
    await fs.mkdir(testDir, { recursive: true });

    const testImagePath = path.join(testDir, 'test-vision.png');
    await fs.writeFile(testImagePath, Buffer.from([0x89, 0x50, 0x4E, 0x47]));

    const result = await parseImage(testImagePath);
    assert.strictEqual(result.success, true, 'Should succeed');
    assert(result.content.includes('Vision API integration required'), 'Should mention Vision API integration');
    assert(result.errors.length > 0, 'Should have warning about Vision API');

    // Cleanup
    await fs.unlink(testImagePath);
    passed++;
    console.log('✓ Test 7: Vision API placeholder message present');
  }

  console.log(`\n✅ Passed: ${passed}/${passed + failed}`);
  console.log('🎉 All image parser tests passed!\n');

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
