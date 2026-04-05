#!/usr/bin/env node
/**
 * Tests for Enhanced Content Merger
 */

import assert from 'assert';
import { mergeContent } from '../../tools/content-merger.mjs';

async function runTests() {
  let passed = 0;
  let failed = 0;

  console.log('Running Enhanced Content Merger Tests...\n');

  // Test 1: Merge with no uploads
  {
    const result = mergeContent({ arxivPapers: [], webSearch: [] }, {});
    assert.strictEqual(result.qualityMetrics.uploadCount, 0, 'Should have 0 uploads');
    assert.strictEqual(result.qualityMetrics.totalConfidence, 0, 'Should have 0 confidence');
    assert.strictEqual(result.qualityMetrics.sourceDiversity, 0, 'Should have 0 diversity');
    assert.strictEqual(result.qualityMetrics.overallQuality, 0, 'Should have 0 overall quality');
    passed++;
    console.log('✓ Test 1: Handle no uploads');
  }

  // Test 2: Merge with successful uploads
  {
    const uploads = {
      texts: [{ success: true, content: 'Sample text content here', confidence: 0.95 }],
      pdfs: [{ success: true, content: 'PDF content', confidence: 0.9 }],
      emails: [{ success: true, content: 'Email body', confidence: 0.85 }]
    };
    const result = mergeContent({ arxivPapers: [] }, uploads);
    assert.strictEqual(result.qualityMetrics.uploadCount, 3, 'Should count 3 uploads');
    assert(result.qualityMetrics.totalConfidence > 0.8, 'Should have good confidence');
    assert.strictEqual(result.qualityMetrics.sourceDiversity, 0.5, 'Should have 3/6 diversity');
    passed++;
    console.log('✓ Test 2: Count successful uploads');
  }

  // Test 3: Content metrics calculation
  {
    const uploads = {
      texts: [
        { success: true, content: 'Short', confidence: 0.9 },
        { success: true, content: 'A'.repeat(1000), confidence: 0.9 }
      ]
    };
    const result = mergeContent({}, uploads);
    assert(result.qualityMetrics.contentMetrics.totalContentLength > 0, 'Should calculate total length');
    assert(result.qualityMetrics.contentMetrics.avgContentLength > 0, 'Should calculate average length');
    assert.strictEqual(result.qualityMetrics.contentMetrics.minContentLength, 5, 'Should find minimum');
    assert.strictEqual(result.qualityMetrics.contentMetrics.maxContentLength, 1000, 'Should find maximum');
    passed++;
    console.log('✓ Test 3: Calculate content metrics');
  }

  // Test 4: Balance metrics
  {
    const uploads = {
      texts: Array(10).fill({ success: true, content: 'Text', confidence: 0.9 }),
      pdfs: Array(2).fill({ success: true, content: 'PDF', confidence: 0.9 })
    };
    const result = mergeContent({}, uploads);
    assert(result.qualityMetrics.balanceMetrics.balanceScore < 0.8, 'Should detect imbalance');
    assert.strictEqual(result.qualityMetrics.balanceMetrics.dominantType, 'texts', 'Should identify dominant type');
    assert(result.qualityMetrics.balanceMetrics.underrepresentedTypes.length > 0, 'Should find underrepresented types');
    passed++;
    console.log('✓ Test 4: Calculate balance metrics');
  }

  // Test 5: Completeness score with existing sources
  {
    const uploads = {
      texts: [{ success: true, content: 'Content', confidence: 0.9 }]
    };
    const result = mergeContent({ arxivPapers: [{ title: 'Paper' }], webSearch: [] }, uploads);
    assert(result.qualityMetrics.completenessScore > 40, 'Should have decent completeness with ArXiv');
    passed++;
    console.log('✓ Test 5: Calculate completeness with existing sources');
  }

  // Test 6: Completeness score without existing sources
  {
    const uploads = {
      texts: [{ success: true, content: 'Content', confidence: 0.9 }]
    };
    const result = mergeContent({ arxivPapers: [], webSearch: [] }, uploads);
    assert(result.qualityMetrics.completenessScore < 60, 'Should have lower completeness without ArXiv');
    passed++;
    console.log('✓ Test 6: Calculate completeness without existing sources');
  }

  // Test 7: Overall quality calculation
  {
    const uploads = {
      texts: [{ success: true, content: 'High quality content with substantial text', confidence: 0.95 }],
      pdfs: [{ success: true, content: 'PDF content here', confidence: 0.9 }],
      emails: [{ success: true, content: 'Email content', confidence: 0.85 }],
      markdown: [{ success: true, content: 'Markdown content', confidence: 0.99 }],
      feishu: [{ success: true, content: 'Feishu content', confidence: 0.8 }]
    };
    const result = mergeContent({ arxivPapers: [{ title: 'Paper' }], webSearch: [] }, uploads);
    assert(result.qualityMetrics.overallQuality > 0.6, 'Should have good overall quality');
    assert(['GOOD', 'EXCELLENT', 'FAIR'].includes(result.qualityMetrics.qualityRating), 'Should have valid rating');
    passed++;
    console.log('✓ Test 7: Calculate overall quality score');
  }

  // Test 8: Quality rating labels
  {
    const uploads = {
      texts: [{ success: true, content: 'A'.repeat(5000), confidence: 0.95 }]
    };
    const result = mergeContent({ arxivPapers: [], webSearch: [] }, uploads);
    assert(typeof result.qualityMetrics.qualityRating === 'string', 'Should return string rating');
    passed++;
    console.log('✓ Test 8: Generate quality rating label');
  }

  // Test 9: Suggestions for no uploads
  {
    const result = mergeContent({ arxivPapers: [], webSearch: [] }, {});
    assert(result.qualityMetrics.suggestions.length > 0, 'Should have suggestions');
    const criticalSuggestion = result.qualityMetrics.suggestions.find(s => s.type === 'critical');
    assert(criticalSuggestion, 'Should have critical suggestion for no uploads');
    passed++;
    console.log('✓ Test 9: Generate suggestions for no uploads');
  }

  // Test 10: Suggestions for low diversity
  {
    const uploads = {
      texts: [{ success: true, content: 'Content', confidence: 0.9 }]
    };
    const result = mergeContent({}, uploads);
    const diversitySuggestion = result.qualityMetrics.suggestions.find(s => s.category === 'diversity');
    assert(diversitySuggestion, 'Should suggest adding more source types');
    passed++;
    console.log('✓ Test 10: Generate suggestions for low diversity');
  }

  // Test 11: Suggestions for imbalanced sources
  {
    const uploads = {
      texts: Array(10).fill({ success: true, content: 'Text', confidence: 0.9 })
    };
    const result = mergeContent({}, uploads);
    const balanceSuggestion = result.qualityMetrics.suggestions.find(s => s.category === 'balance');
    assert(balanceSuggestion, 'Should suggest better source balance');
    passed++;
    console.log('✓ Test 11: Generate suggestions for imbalanced sources');
  }

  // Test 12: Suggestions for low confidence
  {
    const uploads = {
      texts: [{ success: true, content: 'Content', confidence: 0.5 }]
    };
    const result = mergeContent({}, uploads);
    const qualitySuggestion = result.qualityMetrics.suggestions.find(s => s.category === 'quality');
    assert(qualitySuggestion, 'Should warn about low confidence');
    passed++;
    console.log('✓ Test 12: Generate suggestions for low confidence');
  }

  // Test 13: Merge structure preserves existing sources
  {
    const existingSources = {
      arxivPapers: [{ title: 'Paper 1', arxiv_id: '1234.5678' }],
      webSearch: [{ url: 'https://example.com', title: 'Example' }]
    };
    const uploads = {
      texts: [{ success: true, content: 'Text', confidence: 0.9 }]
    };
    const result = mergeContent(existingSources, uploads);
    assert.deepStrictEqual(result.sources.arxivPapers, existingSources.arxivPapers, 'Should preserve ArXiv papers');
    assert.deepStrictEqual(result.sources.webSearch, existingSources.webSearch, 'Should preserve web search');
    assert.deepStrictEqual(result.sources.uploads.texts, uploads.texts, 'Should include uploads');
    passed++;
    console.log('✓ Test 13: Preserve existing sources in merge');
  }

  // Test 14: Failed uploads don't count toward quality
  {
    const uploads = {
      texts: [
        { success: true, content: 'Good content', confidence: 0.9 },
        { success: false, content: '', confidence: 0, errors: ['Failed'] }
      ]
    };
    const result = mergeContent({}, uploads);
    assert.strictEqual(result.qualityMetrics.uploadCount, 1, 'Should only count successful uploads');
    assert.strictEqual(result.qualityMetrics.totalConfidence, 0.9, 'Should only average successful uploads');
    passed++;
    console.log('✓ Test 14: Failed uploads excluded from metrics');
  }

  console.log(`\n✅ Passed: ${passed}/${passed + failed}`);
  console.log('🎉 All enhanced content merger tests passed!\n');

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
