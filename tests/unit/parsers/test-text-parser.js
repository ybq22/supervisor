import { describe, it } from 'node:test';
import assert from 'node:assert';
import { writeFile, unlink } from 'fs/promises';
import { parseText } from '../../../tools/parsers/text-parser.mjs';

describe('Text Parser', () => {
  const sampleFixturePath = 'tests/fixtures/text/sample.txt';

  describe('Successful text extraction', () => {
    it('should extract text content from a valid file', async () => {
      const result = await parseText(sampleFixturePath);

      assert.strictEqual(result.success, true);
      assert.ok(result.content);
      assert.ok(result.content.includes('sample text file'));
      assert.ok(result.content.includes('你好世界'));
      assert.strictEqual(result.errors.length, 0);
    });

    it('should return metadata with correct statistics', async () => {
      const result = await parseText(sampleFixturePath);

      assert.ok(result.metadata);
      assert.ok(result.metadata.encoding);
      assert.strictEqual(typeof result.metadata.lines, 'number');
      assert.strictEqual(typeof result.metadata.words, 'number');
      assert.strictEqual(typeof result.metadata.characters, 'number');

      // Verify metadata is reasonably accurate
      assert.ok(result.metadata.lines > 0);
      assert.ok(result.metadata.words > 0);
      assert.ok(result.metadata.characters > 100);
    });

    it('should return confidence score of 0.95 for successful parsing', async () => {
      const result = await parseText(sampleFixturePath);

      assert.strictEqual(result.confidence, 0.95);
    });

    it('should normalize line endings (\\r\\n to \\n)', async () => {
      // Create a temp file with CRLF line endings and sufficient content
      const testContent = 'Line 1\r\nLine 2\r\nLine 3\r\n' + 'A'.repeat(100);
      const testPath = 'tests/fixtures/text/crlf-test.txt';
      await writeFile(testPath, testContent);

      const result = await parseText(testPath);

      assert.strictEqual(result.success, true);
      assert.ok(!result.content.includes('\r\n'));
      assert.ok(result.content.includes('\n'));

      // Cleanup
      await unlink(testPath).catch(() => {});
    });

    it('should normalize excessive whitespace to 2 spaces', async () => {
      // Create a file with excessive whitespace and sufficient content
      const testContent = 'Word1     Word2    Word3\n' + 'A'.repeat(100);
      const testPath = 'tests/fixtures/text/whitespace-test.txt';
      await writeFile(testPath, testContent);

      const result = await parseText(testPath);

      assert.strictEqual(result.success, true);
      assert.ok(result.content.match(/Word1  Word2  Word3/));

      // Cleanup
      await unlink(testPath).catch(() => {});
    });

    it('should trim leading and trailing whitespace', async () => {
      const testContent = '   \n\n  Text content  \n\n   ' + '\n' + 'A'.repeat(100);
      const testPath = 'tests/fixtures/text/trim-test.txt';
      await writeFile(testPath, testContent);

      const result = await parseText(testPath);

      assert.strictEqual(result.success, true);
      assert.ok(!result.content.match(/^\s/));
      assert.ok(!result.content.match(/\s$/));

      // Cleanup
      await unlink(testPath).catch(() => {});
    });
  });

  describe('UTF-8 encoding with Unicode characters', () => {
    it('should handle UTF-8 encoding with Chinese characters', async () => {
      const result = await parseText(sampleFixturePath);

      assert.strictEqual(result.success, true);
      assert.ok(result.content.includes('你好世界'));
      assert.strictEqual(result.metadata.encoding, 'utf-8');
    });

    it('should handle mixed ASCII and Unicode content', async () => {
      const testContent = 'English text 日本語 한국어 中文\n' + 'A'.repeat(100);
      const testPath = 'tests/fixtures/text/mixed-unicode.txt';
      await writeFile(testPath, testContent);

      const result = await parseText(testPath);

      assert.strictEqual(result.success, true);
      assert.ok(result.content.includes('English text'));
      assert.ok(result.content.includes('日本語'));
      assert.ok(result.content.includes('한국어'));
      assert.ok(result.content.includes('中文'));

      // Cleanup
      await unlink(testPath).catch(() => {});
    });
  });

  describe('Empty file handling', () => {
    it('should reject files with less than 100 characters', async () => {
      const testContent = 'Short content';
      const testPath = 'tests/fixtures/text/too-short.txt';
      await writeFile(testPath, testContent);

      const result = await parseText(testPath);

      assert.strictEqual(result.success, false);
      assert.ok(
        result.errors.includes('Insufficient content: File must contain at least 100 characters') ||
        result.errors.some(e => e.includes('Insufficient content'))
      );

      // Cleanup
      await unlink(testPath).catch(() => {});
    });

    it('should reject completely empty files', async () => {
      const testPath = 'tests/fixtures/text/empty.txt';
      await writeFile(testPath, '');

      const result = await parseText(testPath);

      assert.strictEqual(result.success, false);
      assert.ok(
        result.errors.includes('Insufficient content: File must contain at least 100 characters') ||
        result.errors.some(e => e.includes('Insufficient content'))
      );

      // Cleanup
      await unlink(testPath).catch(() => {});
    });
  });

  describe('File validation', () => {
    it('should reject non-text file extensions', async () => {
      const testPath = 'tests/fixtures/text/sample.pdf';
      await writeFile(testPath, 'Some content');

      const result = await parseText(testPath);

      assert.strictEqual(result.success, false);
      assert.ok(
        result.errors.includes('Invalid file extension: .pdf. Only .txt and .text files are supported') ||
        result.errors.some(e => e.includes('Invalid file extension'))
      );

      // Cleanup
      await unlink(testPath).catch(() => {});
    });

    it('should reject files without extension', async () => {
      const testPath = 'tests/fixtures/text/no-extension';
      await writeFile(testPath, 'Some content');

      const result = await parseText(testPath);

      assert.strictEqual(result.success, false);
      assert.ok(
        result.errors.includes('Invalid file extension. Only .txt and .text files are supported') ||
        result.errors.some(e => e.includes('Invalid file extension'))
      );

      // Cleanup
      await unlink(testPath).catch(() => {});
    });

    it('should accept .text extension', async () => {
      const testContent = 'A'.repeat(100);
      const testPath = 'tests/fixtures/text/sample.text';
      await writeFile(testPath, testContent);

      const result = await parseText(testPath);

      assert.strictEqual(result.success, true);

      // Cleanup
      await unlink(testPath).catch(() => {});
    });
  });

  describe('Error handling', () => {
    it('should handle non-existent files gracefully', async () => {
      const result = await parseText('tests/fixtures/text/nonexistent.txt');

      assert.strictEqual(result.success, false);
      assert.ok(result.errors.length > 0);
      assert.ok(result.errors[0].includes('not found') || result.errors[0].includes('ENOENT'));
    });

    it('should handle file system errors', async () => {
      // This test verifies error handling for permission issues, etc.
      const result = await parseText('/root/inaccessible.txt');

      assert.strictEqual(result.success, false);
      assert.ok(result.errors.length > 0);
    });
  });
});
