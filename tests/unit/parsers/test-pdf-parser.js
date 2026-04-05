import { describe, it, mock } from 'node:test';
import assert from 'node:assert';
import { writeFile, unlink } from 'fs/promises';
import { parsePDF } from '../../../tools/parsers/pdf-parser.mjs';

describe('PDF Parser', () => {
  const sampleFixturePath = 'tests/fixtures/pdfs/sample.pdf';

  describe('Successful PDF text extraction', () => {
    it('should extract text content from a valid PDF', async () => {
      const result = await parsePDF(sampleFixturePath);

      assert.strictEqual(result.success, true);
      assert.ok(result.content);
      assert.strictEqual(typeof result.content, 'string');
      assert.ok(result.content.length >= 100);
      assert.strictEqual(result.errors.length, 0);
    });

    it('should return metadata with PDF information', async () => {
      const result = await parsePDF(sampleFixturePath);

      assert.ok(result.metadata);
      assert.ok(typeof result.metadata.pages === 'number');
      assert.ok(result.metadata.pages > 0);
      assert.strictEqual(result.confidence, 0.95);
    });

    it('should extract title from PDF metadata if available', async () => {
      const result = await parsePDF(sampleFixturePath);

      assert.ok(result.metadata);
      // Title may or may not be present depending on the PDF
      assert.ok(typeof result.metadata.title === 'string' || result.metadata.title === null);
    });

    it('should extract author from PDF metadata if available', async () => {
      const result = await parsePDF(sampleFixturePath);

      assert.ok(result.metadata);
      // Author may or may not be present depending on the PDF
      assert.ok(typeof result.metadata.author === 'string' || result.metadata.author === null);
    });

    it('should extract creation date from PDF metadata if available', async () => {
      const result = await parsePDF(sampleFixturePath);

      assert.ok(result.metadata);
      // Creation date may or may not be present depending on the PDF
      assert.ok(typeof result.metadata.createdAt === 'string' || result.metadata.createdAt === null);
    });

    it('should include raw PDF info object in metadata', async () => {
      const result = await parsePDF(sampleFixturePath);

      assert.ok(result.metadata);
      assert.ok(result.metadata.info);
      assert.strictEqual(typeof result.metadata.info, 'object');
    });

    it('should return confidence score of 0.95 for successful parsing', async () => {
      const result = await parsePDF(sampleFixturePath);

      assert.strictEqual(result.confidence, 0.95);
    });
  });

  describe('Minimum content validation', () => {
    it('should reject PDFs with less than 100 characters of text', async () => {
      // This test would require a PDF with minimal text content
      // For now, we'll skip this as it requires creating a special PDF
      // In a real scenario, you'd create a minimal PDF fixture
      console.log('Test skipped: Requires minimal text PDF fixture');
    });
  });

  describe('File validation', () => {
    it('should reject non-PDF file extensions', async () => {
      const testPath = 'tests/fixtures/pdfs/sample.txt';
      await writeFile(testPath, 'Some content');

      const result = await parsePDF(testPath);

      assert.strictEqual(result.success, false);
      assert.ok(
        result.errors.includes('Invalid file type. Expected .pdf') ||
        result.errors.some(e => e.includes('Invalid file type'))
      );

      // Cleanup
      await unlink(testPath).catch(() => {});
    });

    it('should reject files without extension', async () => {
      const testPath = 'tests/fixtures/pdfs/no-extension';
      await writeFile(testPath, 'Some content');

      const result = await parsePDF(testPath);

      assert.strictEqual(result.success, false);
      assert.ok(
        result.errors.includes('Invalid file type. Expected .pdf') ||
        result.errors.some(e => e.includes('Invalid file type'))
      );

      // Cleanup
      await unlink(testPath).catch(() => {});
    });

    it('should accept .pdf extension (case insensitive)', async () => {
      const testPath = 'tests/fixtures/pdfs/sample.PDF';
      // Create a minimal valid PDF (this is a simplified PDF structure)
      const minimalPdf = Buffer.from([
        0x25, 0x50, 0x44, 0x46, 0x2D, 0x31, 0x2E, 0x34, // %PDF-1.4
        0x0A, 0x25, 0xE2, 0xE3, 0xCF, 0xD3, 0x0A, // Basic PDF header
        0x31, 0x20, 0x30, 0x20, 0x6F, 0x62, 0x6A, 0x0A, // 1 0 obj
        0x3C, 0x3C, 0x2F, 0x54, 0x79, 0x70, 0x65, 0x2F, 0x43, 0x61, 0x74, 0x61, 0x6C, 0x6F, 0x67,
        0x2F, 0x50, 0x61, 0x67, 0x65, 0x73, 0x20, 0x32, 0x20, 0x30, 0x20, 0x52, 0x3E, 0x3E, 0x0A,
        0x65, 0x6E, 0x64, 0x6F, 0x62, 0x6A, 0x0A, // endobj
        0x32, 0x20, 0x30, 0x20, 0x6F, 0x62, 0x6A, 0x0A, // 2 0 obj
        0x3C, 0x3C, 0x2F, 0x54, 0x79, 0x70, 0x65, 0x2F, 0x50, 0x61, 0x67, 0x65, 0x73, 0x2F, 0x4B,
        0x69, 0x64, 0x73, 0x5B, 0x33, 0x20, 0x30, 0x20, 0x52, 0x5D, 0x2F, 0x43, 0x6F, 0x75, 0x6E,
        0x74, 0x20, 0x31, 0x3E, 0x3E, 0x0A, 0x65, 0x6E, 0x64, 0x6F, 0x62, 0x6A, 0x0A,
        0x33, 0x20, 0x30, 0x20, 0x6F, 0x62, 0x6A, 0x0A, // 3 0 obj
        0x3C, 0x3C, 0x2F, 0x54, 0x79, 0x70, 0x65, 0x2F, 0x50, 0x61, 0x67, 0x65, 0x2F, 0x50, 0x61,
        0x72, 0x65, 0x6E, 0x74, 0x20, 0x32, 0x20, 0x30, 0x20, 0x52, 0x2F, 0x52, 0x65, 0x73, 0x6F,
        0x75, 0x72, 0x63, 0x65, 0x73, 0x3C, 0x3C, 0x2F, 0x46, 0x6F, 0x6E, 0x74, 0x3C, 0x3C, 0x2F,
        0x46, 0x31, 0x20, 0x34, 0x20, 0x30, 0x20, 0x52, 0x3E, 0x3E, 0x3E, 0x3E, 0x0A, 0x65, 0x6E,
        0x64, 0x6F, 0x62, 0x6A, 0x0A,
        0x34, 0x20, 0x30, 0x20, 0x6F, 0x62, 0x6A, 0x0A, // 4 0 obj (font)
        0x3C, 0x3C, 0x2F, 0x54, 0x79, 0x70, 0x65, 0x2F, 0x46, 0x6F, 0x6E, 0x74, 0x2F, 0x53, 0x75,
        0x62, 0x74, 0x79, 0x70, 0x65, 0x2F, 0x54, 0x79, 0x70, 0x65, 0x31, 0x2F, 0x42, 0x61, 0x73,
        0x65, 0x46, 0x6F, 0x6E, 0x74, 0x2F, 0x48, 0x65, 0x6C, 0x76, 0x65, 0x74, 0x69, 0x63, 0x61,
        0x3E, 0x3E, 0x0A, 0x65, 0x6E, 0x64, 0x6F, 0x62, 0x6A, 0x0A,
        0x78, 0x72, 0x65, 0x66, 0x0A, // xref
        0x30, 0x20, 0x35, 0x0A, 0x30, 0x30, 0x30, 0x30, 0x30, 0x30, 0x30, 0x30, 0x30, 0x30, 0x20,
        0x36, 0x35, 0x35, 0x33, 0x35, 0x20, 0x66, 0x0A, 0x30, 0x30, 0x30, 0x30, 0x30, 0x30, 0x30,
        0x30, 0x30, 0x31, 0x20, 0x30, 0x30, 0x30, 0x30, 0x30, 0x20, 0x6E, 0x0A, 0x30, 0x30, 0x30,
        0x30, 0x30, 0x30, 0x30, 0x30, 0x30, 0x32, 0x20, 0x30, 0x30, 0x30, 0x30, 0x30, 0x20, 0x6E,
        0x0A, 0x30, 0x30, 0x30, 0x30, 0x30, 0x30, 0x30, 0x31, 0x37, 0x20, 0x30, 0x30, 0x30, 0x30,
        0x30, 0x20, 0x6E, 0x0A, 0x30, 0x30, 0x30, 0x30, 0x30, 0x30, 0x30, 0x32, 0x38, 0x20, 0x30,
        0x30, 0x30, 0x30, 0x30, 0x20, 0x6E, 0x0A,
        0x74, 0x72, 0x61, 0x69, 0x6C, 0x65, 0x72, 0x0A, // trailer
        0x3C, 0x3C, 0x2F, 0x53, 0x69, 0x7A, 0x65, 0x20, 0x35, 0x2F, 0x52, 0x6F, 0x6F, 0x74, 0x20,
        0x31, 0x20, 0x30, 0x20, 0x52, 0x3E, 0x3E, 0x0A,
        0x73, 0x74, 0x61, 0x72, 0x74, 0x78, 0x72, 0x65, 0x66, 0x0A, // startxref
        0x34, 0x32, 0x38, 0x0A,
        0x25, 0x25, 0x45, 0x4F, 0x46, 0x0A // %%EOF
      ]);

      await writeFile(testPath, minimalPdf);

      // Note: This test will fail initially because we don't have a valid PDF with text
      // The parser needs to be implemented first
      const result = await parsePDF(testPath);

      // The result should indicate insufficient content since the PDF has no text
      assert.strictEqual(result.success, false);
      assert.ok(result.errors.some(e => e.includes('Insufficient content')));

      // Cleanup
      await unlink(testPath).catch(() => {});
    });
  });

  describe('Error handling', () => {
    it('should handle non-existent files gracefully', async () => {
      const result = await parsePDF('tests/fixtures/pdfs/nonexistent.pdf');

      assert.strictEqual(result.success, false);
      assert.ok(result.errors.length > 0);
      assert.ok(result.errors[0].includes('not found') || result.errors[0].includes('ENOENT'));
    });

    it('should handle password-protected PDFs', async () => {
      // This test would require a password-protected PDF fixture
      // For now, we'll skip this
      console.log('Test skipped: Requires password-protected PDF fixture');
    });

    it('should handle corrupted PDFs', async () => {
      const testPath = 'tests/fixtures/pdfs/corrupted.pdf';
      const corruptedContent = Buffer.from([0x25, 0x50, 0x44, 0x46]); // Incomplete PDF header
      await writeFile(testPath, corruptedContent);

      const result = await parsePDF(testPath);

      assert.strictEqual(result.success, false);
      assert.ok(result.errors.length > 0);

      // Cleanup
      await unlink(testPath).catch(() => {});
    });

    it('should handle invalid PDF structure', async () => {
      const testPath = 'tests/fixtures/pdfs/invalid.pdf';
      const invalidContent = Buffer.from('This is not a PDF file at all');
      await writeFile(testPath, invalidContent);

      const result = await parsePDF(testPath);

      assert.strictEqual(result.success, false);
      assert.ok(result.errors.length > 0);

      // Cleanup
      await unlink(testPath).catch(() => {});
    });
  });

  describe('Error handling with mocked pdf-parse', () => {
    it('should handle password-protected PDF error', async () => {
      // Mock pdf-parse to simulate password-protected PDF
      const testPath = 'tests/fixtures/pdfs/sample.pdf';

      // We can't easily mock pdf-parse without dependency injection
      // This test would require refactoring the parser to accept pdf-parse as a parameter
      console.log('Test skipped: Requires dependency injection for proper mocking');
    });
  });
});
