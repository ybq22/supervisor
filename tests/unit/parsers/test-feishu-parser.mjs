#!/usr/bin/env node
/**
 * Tests for Feishu Parser
 */

import assert from 'assert';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { parseFeishu } from '../../../tools/parsers/feishu-parser.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

async function runTests() {
  let passed = 0;
  let failed = 0;

  console.log('Running Feishu Parser Tests...\n');

  // Test 1: Invalid extension
  {
    const result = await parseFeishu('/path/to/file.txt');
    assert.strictEqual(result.success, false, 'Should fail with invalid extension');
    assert.strictEqual(result.confidence, 0, 'Confidence should be 0');
    assert(result.errors.length > 0, 'Should have errors');
    passed++;
    console.log('✓ Test 1: Invalid extension rejected');
  }

  // Test 2: Non-existent file
  {
    const result = await parseFeishu('/nonexistent/path/test.json');
    assert.strictEqual(result.success, false, 'Should fail with non-existent file');
    assert.strictEqual(result.confidence, 0, 'Confidence should be 0');
    assert(result.errors.length > 0, 'Should have errors');
    passed++;
    console.log('✓ Test 2: Non-existent file handled gracefully');
  }

  // Test 3: Invalid JSON
  {
    const testDir = path.join(__dirname, '../../fixtures/feishu');
    await fs.mkdir(testDir, { recursive: true });

    const invalidJsonPath = path.join(testDir, 'invalid.json');
    await fs.writeFile(invalidJsonPath, '{ invalid json }');

    const result = await parseFeishu(invalidJsonPath);
    assert.strictEqual(result.success, false, 'Should fail with invalid JSON');
    assert(result.errors.some(e => e.includes('Failed to parse JSON')), 'Should have JSON parse error');

    // Cleanup
    await fs.unlink(invalidJsonPath);
    passed++;
    console.log('✓ Test 3: Invalid JSON handled');
  }

  // Test 4: Single document export
  {
    const testDir = path.join(__dirname, '../../fixtures/feishu');
    await fs.mkdir(testDir, { recursive: true });

    const docPath = path.join(testDir, 'document.json');
    const docData = {
      title: 'Research Notes',
      content: 'This is the main content of the document.',
      creator: 'John Doe',
      comments: [
        { text: 'Great insight!' },
        { text: 'Please elaborate on section 2.' }
      ]
    };
    await fs.writeFile(docPath, JSON.stringify(docData, null, 2));

    const result = await parseFeishu(docPath);
    assert.strictEqual(result.success, true, 'Should succeed');
    assert.strictEqual(result.metadata.type, 'document', 'Should detect document type');
    assert.strictEqual(result.metadata.itemCount, 1, 'Should have 1 document');
    assert(result.content.includes('Research Notes'), 'Should include title');
    assert(result.content.includes('This is the main content'), 'Should include content');
    assert(result.content.includes('Great insight!'), 'Should include comments');

    // Cleanup
    await fs.unlink(docPath);
    passed++;
    console.log('✓ Test 4: Single document export parsed');
  }

  // Test 5: Batch export with multiple documents
  {
    const testDir = path.join(__dirname, '../../fixtures/feishu');
    await fs.mkdir(testDir, { recursive: true });

    const batchPath = path.join(testDir, 'batch.json');
    const batchData = {
      documents: [
        { title: 'Doc 1', content: 'Content 1' },
        { title: 'Doc 2', content: 'Content 2' },
        { title: 'Doc 3', content: 'Content 3' }
      ]
    };
    await fs.writeFile(batchPath, JSON.stringify(batchData, null, 2));

    const result = await parseFeishu(batchPath);
    assert.strictEqual(result.success, true, 'Should succeed');
    assert.strictEqual(result.metadata.type, 'batch', 'Should detect batch type');
    assert.strictEqual(result.metadata.itemCount, 3, 'Should have 3 documents');
    assert(result.content.includes('Doc 1'), 'Should include Doc 1');
    assert(result.content.includes('Doc 2'), 'Should include Doc 2');
    assert(result.content.includes('Doc 3'), 'Should include Doc 3');

    // Cleanup
    await fs.unlink(batchPath);
    passed++;
    console.log('✓ Test 5: Batch export parsed');
  }

  // Test 6: Messages export
  {
    const testDir = path.join(__dirname, '../../fixtures/feishu');
    await fs.mkdir(testDir, { recursive: true });

    const messagesPath = path.join(testDir, 'messages.json');
    const messagesData = {
      messages: [
        { sender: 'Alice', content: 'Hello team!', timestamp: '2024-01-01T10:00:00Z' },
        { sender: 'Bob', content: 'Hi Alice, how are you?', timestamp: '2024-01-01T10:05:00Z' },
        { sender: 'Alice', content: 'Doing great, thanks!', timestamp: '2024-01-01T10:10:00Z' }
      ]
    };
    await fs.writeFile(messagesPath, JSON.stringify(messagesData, null, 2));

    const result = await parseFeishu(messagesPath);
    assert.strictEqual(result.success, true, 'Should succeed');
    assert.strictEqual(result.metadata.type, 'messages', 'Should detect messages type');
    assert.strictEqual(result.metadata.itemCount, 3, 'Should have 3 messages');
    assert(result.content.includes('[Alice] Hello team!'), 'Should include Alice message');
    assert(result.content.includes('[Bob] Hi Alice'), 'Should include Bob message');

    // Cleanup
    await fs.unlink(messagesPath);
    passed++;
    console.log('✓ Test 6: Messages export parsed');
  }

  // Test 7: Unknown structure with generic extraction
  {
    const testDir = path.join(__dirname, '../../fixtures/feishu');
    await fs.mkdir(testDir, { recursive: true });

    const unknownPath = path.join(testDir, 'unknown.json');
    const unknownData = {
      someField: 'Some text content here',
      nested: {
        moreText: 'More text content that is long enough'
      }
    };
    await fs.writeFile(unknownPath, JSON.stringify(unknownData, null, 2));

    const result = await parseFeishu(unknownPath);
    assert.strictEqual(result.success, true, 'Should succeed');
    assert.strictEqual(result.metadata.type, 'unknown', 'Should detect unknown type');
    assert(result.errors.length > 0, 'Should have errors about unknown structure');
    assert(result.content.includes('Some text content'), 'Should extract text content');

    // Cleanup
    await fs.unlink(unknownPath);
    passed++;
    console.log('✓ Test 7: Unknown structure handled with generic extraction');
  }

  // Test 8: Confidence calculation
  {
    const testDir = path.join(__dirname, '../../fixtures/feishu');
    await fs.mkdir(testDir, { recursive: true });

    // Low confidence (unknown structure)
    const unknownPath = path.join(testDir, 'low-conf.json');
    await fs.writeFile(unknownPath, JSON.stringify({ field: 'text' }));
    const unknownResult = await parseFeishu(unknownPath);
    assert(unknownResult.confidence < 0.5, 'Should have low confidence for unknown structure');
    await fs.unlink(unknownPath);

    // High confidence (batch with many items)
    const batchPath = path.join(testDir, 'high-conf.json');
    const batchData = {
      documents: Array.from({ length: 5 }, (_, i) => ({
        title: `Doc ${i}`,
        content: `Content ${i}`
      }))
    };
    await fs.writeFile(batchPath, JSON.stringify(batchData, null, 2));
    const batchResult = await parseFeishu(batchPath);
    assert(batchResult.confidence > 0.9, 'Should have high confidence for batch export');
    await fs.unlink(batchPath);

    passed++;
    console.log('✓ Test 8: Confidence calculation varies with structure');
  }

  console.log(`\n✅ Passed: ${passed}/${passed + failed}`);
  console.log('🎉 All Feishu parser tests passed!\n');

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
