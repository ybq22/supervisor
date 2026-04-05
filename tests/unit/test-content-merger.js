import { describe, it } from 'node:test';
import assert from 'node:assert';
import { mergeContent } from '../../tools/content-merger.mjs';

describe('Content Merger', () => {
  describe('mergeContent()', () => {
    it('should merge existing sources with parsed uploads', () => {
      const existingSources = {
        arxivPapers: [
          { id: 'arxiv1', title: 'Paper 1', summary: 'Summary 1' },
          { id: 'arxiv2', title: 'Paper 2', summary: 'Summary 2' }
        ],
        webSearch: [
          { url: 'https://example.com', title: 'Web Result 1' }
        ]
      };

      const parsedUploads = {
        pdfs: [
          {
            success: true,
            content: 'PDF content',
            metadata: { pages: 10 },
            confidence: 0.85
          }
        ],
        emails: [
          {
            success: true,
            content: 'Email content',
            metadata: { subject: 'Test Email' },
            confidence: 0.90
          }
        ],
        feishu: [],
        images: [
          {
            success: true,
            content: 'Image description',
            metadata: { width: 1920 },
            confidence: 0.75
          }
        ],
        markdown: [
          {
            success: true,
            content: '# Markdown content',
            metadata: { headings: ['Heading 1'] },
            confidence: 0.99
          }
        ],
        texts: [
          {
            success: true,
            content: 'Text content',
            metadata: { lines: 100 },
            confidence: 0.95
          }
        ]
      };

      const result = mergeContent(existingSources, parsedUploads);

      // Check that sources are merged correctly
      assert.ok(result.sources);
      assert.deepStrictEqual(result.sources.arxivPapers, existingSources.arxivPapers);
      assert.deepStrictEqual(result.sources.webSearch, existingSources.webSearch);
      assert.ok(result.sources.uploads);

      // Check that uploads contain all types
      assert.ok(result.sources.uploads.pdfs);
      assert.ok(result.sources.uploads.emails);
      assert.ok(result.sources.uploads.feishu);
      assert.ok(result.sources.uploads.images);
      assert.ok(result.sources.uploads.markdown);
      assert.ok(result.sources.uploads.texts);

      // Check that uploads have the parsed data
      assert.strictEqual(result.sources.uploads.pdfs.length, 1);
      assert.strictEqual(result.sources.uploads.emails.length, 1);
      assert.strictEqual(result.sources.uploads.feishu.length, 0);
      assert.strictEqual(result.sources.uploads.images.length, 1);
      assert.strictEqual(result.sources.uploads.markdown.length, 1);
      assert.strictEqual(result.sources.uploads.texts.length, 1);
    });

    it('should calculate quality metrics correctly', () => {
      const existingSources = {
        arxivPapers: [],
        webSearch: []
      };

      const parsedUploads = {
        pdfs: [
          { success: true, content: 'PDF 1', confidence: 0.85 },
          { success: true, content: 'PDF 2', confidence: 0.90 }
        ],
        emails: [
          { success: true, content: 'Email 1', confidence: 0.80 }
        ],
        feishu: [],
        images: [
          { success: true, content: 'Image 1', confidence: 0.75 },
          { success: true, content: 'Image 2', confidence: 0.70 },
          { success: true, content: 'Image 3', confidence: 0.80 }
        ],
        markdown: [
          { success: true, content: 'MD 1', confidence: 0.99 }
        ],
        texts: [
          { success: true, content: 'Text 1', confidence: 0.95 }
        ]
      };

      const result = mergeContent(existingSources, parsedUploads);

      // Check quality metrics
      assert.ok(result.qualityMetrics);
      assert.strictEqual(result.qualityMetrics.uploadCount, 8);

      // Calculate expected weighted average confidence
      const expectedConfidence = (
        (0.85 + 0.90 +  // pdfs
         0.80 +          // emails
         0.75 + 0.70 + 0.80 +  // images
         0.99 +          // markdown
         0.95)           // texts
      ) / 8;

      assert.strictEqual(
        result.qualityMetrics.totalConfidence,
        parseFloat(expectedConfidence.toFixed(3))
      );

      // Source diversity: 4 types present (pdfs, emails, images, markdown, texts) = 5/6
      assert.strictEqual(result.qualityMetrics.sourceDiversity, 5 / 6);
    });

    it('should handle empty uploads', () => {
      const existingSources = {
        arxivPapers: [
          { id: 'arxiv1', title: 'Paper 1' }
        ],
        webSearch: []
      };

      const parsedUploads = {
        pdfs: [],
        emails: [],
        feishu: [],
        images: [],
        markdown: [],
        texts: []
      };

      const result = mergeContent(existingSources, parsedUploads);

      // Check that sources still exist
      assert.ok(result.sources);
      assert.deepStrictEqual(result.sources.arxivPapers, existingSources.arxivPapers);
      assert.deepStrictEqual(result.sources.webSearch, existingSources.webSearch);
      assert.ok(result.sources.uploads);

      // Check that all upload types are empty arrays
      assert.strictEqual(result.sources.uploads.pdfs.length, 0);
      assert.strictEqual(result.sources.uploads.emails.length, 0);
      assert.strictEqual(result.sources.uploads.feishu.length, 0);
      assert.strictEqual(result.sources.uploads.images.length, 0);
      assert.strictEqual(result.sources.uploads.markdown.length, 0);
      assert.strictEqual(result.sources.uploads.texts.length, 0);

      // Check quality metrics with no uploads
      assert.strictEqual(result.qualityMetrics.uploadCount, 0);
      assert.strictEqual(result.qualityMetrics.totalConfidence, 0);
      assert.strictEqual(result.qualityMetrics.sourceDiversity, 0);
    });

    it('should handle uploads with failed parses', () => {
      const existingSources = {
        arxivPapers: [],
        webSearch: []
      };

      const parsedUploads = {
        pdfs: [
          { success: true, content: 'Valid PDF', confidence: 0.85 },
          { success: false, errors: ['Parse failed'], confidence: 0 }
        ],
        emails: [],
        feishu: [],
        images: [],
        markdown: [
          { success: true, content: 'Valid MD', confidence: 0.99 }
        ],
        texts: []
      };

      const result = mergeContent(existingSources, parsedUploads);

      // Should include all uploads, even failed ones
      assert.strictEqual(result.sources.uploads.pdfs.length, 2);
      assert.strictEqual(result.sources.uploads.markdown.length, 1);

      // Quality metrics should only count successful uploads
      assert.strictEqual(result.qualityMetrics.uploadCount, 2);

      // Confidence should only include successful uploads
      const expectedConfidence = (0.85 + 0.99) / 2;
      assert.strictEqual(
        result.qualityMetrics.totalConfidence,
        parseFloat(expectedConfidence.toFixed(3))
      );

      // Source diversity should only count types with successful uploads
      assert.strictEqual(result.qualityMetrics.sourceDiversity, 2 / 6);
    });

    it('should handle uploads without all types present', () => {
      const existingSources = {
        arxivPapers: [],
        webSearch: []
      };

      const parsedUploads = {
        pdfs: [
          { success: true, content: 'PDF', confidence: 0.85 }
        ]
        // Missing other types - should default to empty arrays
      };

      const result = mergeContent(existingSources, parsedUploads);

      // Check that missing types are handled gracefully
      assert.strictEqual(result.sources.uploads.pdfs.length, 1);
      assert.strictEqual(result.sources.uploads.emails.length, 0);
      assert.strictEqual(result.sources.uploads.feishu.length, 0);
      assert.strictEqual(result.sources.uploads.images.length, 0);
      assert.strictEqual(result.sources.uploads.markdown.length, 0);
      assert.strictEqual(result.sources.uploads.texts.length, 0);

      // Check quality metrics
      assert.strictEqual(result.qualityMetrics.uploadCount, 1);
      assert.strictEqual(result.qualityMetrics.totalConfidence, 0.85);
      assert.strictEqual(result.qualityMetrics.sourceDiversity, 1 / 6);
    });

    it('should preserve existing sources structure', () => {
      const existingSources = {
        arxivPapers: [
          { id: '1', title: 'Paper 1' }
        ],
        webSearch: [
          { url: 'https://example.com', title: 'Result 1' }
        ],
        customSource: [ // Custom additional sources should be preserved
          { id: 'custom1', data: 'Custom data' }
        ]
      };

      const parsedUploads = {
        pdfs: [
          { success: true, content: 'PDF', confidence: 0.85 }
        ],
        emails: [],
        feishu: [],
        images: [],
        markdown: [],
        texts: []
      };

      const result = mergeContent(existingSources, parsedUploads);

      // Check that all existing sources are preserved
      assert.deepStrictEqual(result.sources.arxivPapers, existingSources.arxivPapers);
      assert.deepStrictEqual(result.sources.webSearch, existingSources.webSearch);
      assert.deepStrictEqual(result.sources.customSource, existingSources.customSource);
    });
  });
});
