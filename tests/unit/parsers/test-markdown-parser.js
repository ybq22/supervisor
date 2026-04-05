import { describe, it } from 'node:test';
import assert from 'node:assert';
import { writeFile, unlink } from 'fs/promises';
import { parseMarkdown } from '../../../tools/parsers/markdown-parser.mjs';

describe('Markdown Parser', () => {
  const sampleFixturePath = 'tests/fixtures/markdown/sample.md';
  const frontmatterFixturePath = 'tests/fixtures/markdown/with-frontmatter.md';

  describe('Successful markdown parsing', () => {
    it('should extract content from a valid markdown file', async () => {
      const result = await parseMarkdown(sampleFixturePath);

      assert.strictEqual(result.success, true);
      assert.ok(result.content);
      assert.ok(result.content.includes('Sample Markdown Document'));
      assert.strictEqual(result.errors.length, 0);
    });

    it('should extract H1, H2, and H3 headings', async () => {
      const result = await parseMarkdown(sampleFixturePath);

      assert.ok(result.metadata);
      assert.ok(Array.isArray(result.metadata.headings));
      assert.ok(result.metadata.headings.length > 0);

      // Check for expected headings
      assert.ok(result.metadata.headings.some(h => h.includes('Sample Markdown Document')));
      assert.ok(result.metadata.headings.some(h => h.includes('Introduction')));
      assert.ok(result.metadata.headings.some(h => h.includes('Features')));
      assert.ok(result.metadata.headings.some(h => h.includes('Code Examples')));
    });

    it('should count code blocks correctly', async () => {
      const result = await parseMarkdown(sampleFixturePath);

      assert.ok(result.metadata);
      assert.strictEqual(typeof result.metadata.codeBlocks, 'number');
      assert.strictEqual(result.metadata.codeBlocks, 2); // sample.md has 2 code blocks
    });

    it('should return word count in metadata', async () => {
      const result = await parseMarkdown(sampleFixturePath);

      assert.ok(result.metadata);
      assert.strictEqual(typeof result.metadata.wordCount, 'number');
      assert.ok(result.metadata.wordCount > 0);
    });

    it('should return confidence score of 0.99 for successful parsing', async () => {
      const result = await parseMarkdown(sampleFixturePath);

      assert.strictEqual(result.confidence, 0.99);
    });
  });

  describe('Frontmatter handling', () => {
    it('should parse YAML frontmatter from markdown files', async () => {
      const result = await parseMarkdown(frontmatterFixturePath);

      assert.strictEqual(result.success, true);
      assert.ok(result.metadata);
      assert.ok(result.metadata.frontmatter);

      // Check frontmatter properties
      assert.strictEqual(result.metadata.frontmatter.title, 'Advanced Markdown Guide');
      assert.strictEqual(result.metadata.frontmatter.author, 'John Doe');
      assert.strictEqual(result.metadata.frontmatter.date, '2026-04-05');
      assert.strictEqual(result.metadata.frontmatter.published, true);
    });

    it('should extract content without frontmatter', async () => {
      const result = await parseMarkdown(frontmatterFixturePath);

      assert.ok(result.content);
      // Check that frontmatter YAML keys are not in content
      assert.ok(!result.content.includes('title:'));
      assert.ok(!result.content.includes('author:'));
      assert.ok(!result.content.includes('date:'));
      assert.ok(!result.content.includes('tags:'));
      // But actual content should be there
      assert.ok(result.content.includes('Advanced Markdown Guide'));
      // Content should start with heading, not frontmatter
      assert.ok(result.content.trim().startsWith('#'));
    });

    it('should parse array values in frontmatter', async () => {
      const result = await parseMarkdown(frontmatterFixturePath);

      assert.ok(result.metadata.frontmatter);
      assert.ok(Array.isArray(result.metadata.frontmatter.tags));
      assert.ok(result.metadata.frontmatter.tags.includes('markdown'));
      assert.ok(result.metadata.frontmatter.tags.includes('documentation'));
    });

    it('should handle files without frontmatter', async () => {
      const result = await parseMarkdown(sampleFixturePath);

      assert.strictEqual(result.success, true);
      assert.ok(result.metadata);
      assert.strictEqual(result.metadata.frontmatter, null);
    });
  });

  describe('Code block counting', () => {
    it('should count multiple code blocks in frontmatter file', async () => {
      const result = await parseMarkdown(frontmatterFixturePath);

      assert.strictEqual(result.metadata.codeBlocks, 3); // 3 code blocks in with-frontmatter.md
    });

    it('should not count inline code as code blocks', async () => {
      const result = await parseMarkdown(sampleFixturePath);

      // sample.md has inline `code` but only 2 fenced blocks
      assert.strictEqual(result.metadata.codeBlocks, 2);
    });
  });

  describe('File validation', () => {
    it('should reject non-markdown file extensions', async () => {
      const testPath = 'tests/fixtures/markdown/sample.txt';
      await writeFile(testPath, 'Some content');

      const result = await parseMarkdown(testPath);

      assert.strictEqual(result.success, false);
      assert.ok(
        result.errors.includes('Invalid file extension: .txt. Only .md files are supported') ||
        result.errors.some(e => e.includes('Invalid file extension'))
      );

      // Cleanup
      await unlink(testPath).catch(() => {});
    });

    it('should reject files without extension', async () => {
      const testPath = 'tests/fixtures/markdown/no-extension';
      await writeFile(testPath, 'Some content');

      const result = await parseMarkdown(testPath);

      assert.strictEqual(result.success, false);
      assert.ok(
        result.errors.includes('Invalid file extension. Only .md files are supported') ||
        result.errors.some(e => e.includes('Invalid file extension'))
      );

      // Cleanup
      await unlink(testPath).catch(() => {});
    });

    it('should reject files with less than 50 characters', async () => {
      const testContent = '# Short\n\nToo brief.';
      const testPath = 'tests/fixtures/markdown/too-short.md';
      await writeFile(testPath, testContent);

      const result = await parseMarkdown(testPath);

      assert.strictEqual(result.success, false);
      assert.ok(
        result.errors.includes('Insufficient content: File must contain at least 50 characters') ||
        result.errors.some(e => e.includes('Insufficient content'))
      );

      // Cleanup
      await unlink(testPath).catch(() => {});
    });

    it('should reject empty files', async () => {
      const testPath = 'tests/fixtures/markdown/empty.md';
      await writeFile(testPath, '');

      const result = await parseMarkdown(testPath);

      assert.strictEqual(result.success, false);
      assert.ok(
        result.errors.includes('File is empty') ||
        result.errors.some(e => e.includes('empty'))
      );

      // Cleanup
      await unlink(testPath).catch(() => {});
    });
  });

  describe('Error handling', () => {
    it('should handle non-existent files gracefully', async () => {
      const result = await parseMarkdown('tests/fixtures/markdown/nonexistent.md');

      assert.strictEqual(result.success, false);
      assert.ok(result.errors.length > 0);
      assert.ok(result.errors[0].includes('not found') || result.errors[0].includes('ENOENT'));
    });

    it('should handle file system errors', async () => {
      const result = await parseMarkdown('/root/inaccessible.md');

      assert.strictEqual(result.success, false);
      assert.ok(result.errors.length > 0);
    });

    it('should handle malformed frontmatter gracefully', async () => {
      const testContent = `---
title: "Unclosed frontmatter
# Heading
${'A'.repeat(50)}`;
      const testPath = 'tests/fixtures/markdown/malformed-frontmatter.md';
      await writeFile(testPath, testContent);

      const result = await parseMarkdown(testPath);

      // Should still succeed but frontmatter should be null
      assert.strictEqual(result.success, true);
      assert.strictEqual(result.metadata.frontmatter, null);
      assert.ok(result.content.includes('Heading'));

      // Cleanup
      await unlink(testPath).catch(() => {});
    });
  });

  describe('Content extraction', () => {
    it('should preserve markdown structure in content', async () => {
      const result = await parseMarkdown(sampleFixturePath);

      assert.ok(result.content.includes('# Sample Markdown Document'));
      assert.ok(result.content.includes('## Introduction'));
      assert.ok(result.content.includes('### Code Examples'));
    });

    it('should handle various markdown elements', async () => {
      const result = await parseMarkdown(sampleFixturePath);

      // Check for bold, italic, inline code
      assert.ok(result.content.includes('**Bold text**'));
      assert.ok(result.content.includes('*Italic text*'));
      assert.ok(result.content.includes('`inline code`'));
    });
  });
});
