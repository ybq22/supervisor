/**
 * Content Merger with Enhanced Quality Assessment
 *
 * Merges parsed uploads with existing data sources and provides comprehensive
 * quality assessment with actionable feedback.
 *
 * @param {Object} existingSources - Existing sources (arxivPapers, webSearch, etc.)
 * @param {Object} parsedUploads - Parsed upload results by type
 * @returns {Object} Merged content with enhanced quality metrics
 */
export function mergeContent(existingSources, parsedUploads) {
  // Initialize uploads object with all types, defaulting to empty arrays
  const uploads = {
    pdfs: parsedUploads.pdfs || [],
    emails: parsedUploads.emails || [],
    feishu: parsedUploads.feishu || [],
    images: parsedUploads.images || [],
    markdown: parsedUploads.markdown || [],
    texts: parsedUploads.texts || []
  };

  // Calculate enhanced quality metrics
  const qualityMetrics = calculateQualityMetrics(uploads, existingSources);

  // Return merged structure
  return {
    sources: {
      ...existingSources,
      uploads
    },
    qualityMetrics
  };
}

/**
 * Calculate enhanced quality metrics from parsed uploads
 *
 * @param {Object} uploads - Parsed upload results by type
 * @param {Object} existingSources - Existing data sources
 * @returns {Object} Enhanced quality metrics with suggestions
 */
function calculateQualityMetrics(uploads, existingSources) {
  // Collect all successful uploads across all types
  const allUploads = [
    ...(uploads.pdfs || []),
    ...(uploads.emails || []),
    ...(uploads.feishu || []),
    ...(uploads.images || []),
    ...(uploads.markdown || []),
    ...(uploads.texts || [])
  ];

  // Filter to only successful uploads
  const successfulUploads = allUploads.filter(upload => upload.success);

  // Basic metrics
  const uploadCount = successfulUploads.length;

  // Calculate weighted average confidence
  let totalConfidence = 0;
  if (uploadCount > 0) {
    const confidenceSum = successfulUploads.reduce(
      (sum, upload) => sum + (upload.confidence || 0),
      0
    );
    totalConfidence = parseFloat((confidenceSum / uploadCount).toFixed(3));
  }

  // Calculate source diversity
  const typeCounts = {
    pdfs: (uploads.pdfs || []).filter(p => p.success).length,
    emails: (uploads.emails || []).filter(p => p.success).length,
    feishu: (uploads.feishu || []).filter(p => p.success).length,
    images: (uploads.images || []).filter(p => p.success).length,
    markdown: (uploads.markdown || []).filter(p => p.success).length,
    texts: (uploads.texts || []).filter(p => p.success).length
  };

  const typesWithUploads = Object.values(typeCounts).filter(count => count > 0).length;
  const sourceDiversity = parseFloat((typesWithUploads / 6).toFixed(3));

  // Enhanced metrics
  const contentMetrics = calculateContentMetrics(successfulUploads);
  const balanceMetrics = calculateBalanceMetrics(typeCounts, uploadCount);
  const completenessScore = calculateCompletenessScore(uploads, existingSources);

  // Calculate overall quality score
  const overallQuality = calculateOverallQuality({
    uploadCount,
    totalConfidence,
    sourceDiversity,
    contentDensity: contentMetrics.avgContentLength,
    balanceScore: balanceMetrics.balanceScore,
    completenessScore
  });

  // Generate actionable suggestions
  const suggestions = generateSuggestions({
    uploadCount,
    totalConfidence,
    sourceDiversity,
    typeCounts,
    overallQuality,
    contentMetrics,
    balanceMetrics,
    completenessScore
  });

  return {
    // Basic metrics (backward compatibility)
    uploadCount,
    totalConfidence,
    sourceDiversity,

    // Enhanced metrics
    overallQuality,
    qualityRating: getQualityRating(overallQuality),

    // Content metrics
    contentMetrics: {
      avgContentLength: contentMetrics.avgContentLength,
      totalContentLength: contentMetrics.totalContentLength,
      minContentLength: contentMetrics.minContentLength,
      maxContentLength: contentMetrics.maxContentLength
    },

    // Balance metrics
    balanceMetrics: {
      balanceScore: balanceMetrics.balanceScore,
      typeDistribution: typeCounts,
      dominantType: balanceMetrics.dominantType,
      underrepresentedTypes: balanceMetrics.underrepresentedTypes
    },

    // Completeness
    completenessScore,

    // Actionable feedback
    suggestions
  };
}

/**
 * Calculate content density metrics
 */
function calculateContentMetrics(successfulUploads) {
  if (successfulUploads.length === 0) {
    return {
      avgContentLength: 0,
      totalContentLength: 0,
      minContentLength: 0,
      maxContentLength: 0
    };
  }

  const contentLengths = successfulUploads.map(u => (u.content || '').length);
  const totalContentLength = contentLengths.reduce((sum, len) => sum + len, 0);
  const avgContentLength = Math.round(totalContentLength / contentLengths.length);
  const minContentLength = Math.min(...contentLengths);
  const maxContentLength = Math.max(...contentLengths);

  return {
    avgContentLength,
    totalContentLength,
    minContentLength,
    maxContentLength
  };
}

/**
 * Calculate source balance metrics
 */
function calculateBalanceMetrics(typeCounts, totalCount) {
  if (totalCount === 0) {
    return {
      balanceScore: 0,
      dominantType: null,
      underrepresentedTypes: []
    };
  }

  // Calculate balance score using coefficient of variation
  const proportions = Object.values(typeCounts).map(count => count / totalCount);
  const meanProportion = 1 / 6; // Ideal is equal distribution
  const variance = proportions.reduce((sum, p) => sum + Math.pow(p - meanProportion, 2), 0);
  const stdDev = Math.sqrt(variance / 6);
  const balanceScore = parseFloat(Math.max(0, 1 - stdDev * 2).toFixed(3)); // Scale to 0-1

  // Find dominant type (>50% of uploads)
  const dominantType = Object.entries(typeCounts).find(([type, count]) => count > totalCount / 2)?.[0] || null;

  // Find underrepresented types (0 uploads)
  const underrepresentedTypes = Object.entries(typeCounts)
    .filter(([type, count]) => count === 0)
    .map(([type]) => type);

  return {
    balanceScore,
    dominantType,
    underrepresentedTypes
  };
}

/**
 * Calculate completeness score based on multiple factors
 */
function calculateCompletenessScore(uploads, existingSources) {
  let score = 0;
  const maxScore = 100;

  // Has uploads (20 points)
  const hasUploads = Object.values(uploads).some(arr => arr.length > 0);
  if (hasUploads) score += 20;

  // Multiple types represented (30 points)
  const typesPresent = Object.values(uploads).filter(arr => arr.some(u => u.success)).length;
  score += (typesPresent / 6) * 30;

  // Has existing sources (ArXiv or web search) (20 points)
  const hasArxiv = existingSources.arxivPapers && existingSources.arxivPapers.length > 0;
  const hasWebSearch = existingSources.webSearch && existingSources.webSearch.length > 0;
  if (hasArxiv || hasWebSearch) score += 20;

  // High confidence uploads (10 points)
  const allUploads = Object.values(uploads).flat();
  const avgConfidence = allUploads.length > 0
    ? allUploads.reduce((sum, u) => sum + (u.confidence || 0), 0) / allUploads.length
    : 0;
  if (avgConfidence > 0.8) score += 10;

  return Math.round(score);
}

/**
 * Calculate overall quality score (0-1)
 */
function calculateOverallQuality(metrics) {
  const weights = {
    confidence: 0.3,
    diversity: 0.2,
    contentDensity: 0.2,
    balance: 0.15,
    completeness: 0.15
  };

  // Normalize content density (log scale, assume 10000 chars is excellent)
  const normalizedDensity = Math.min(1, Math.log10(metrics.contentDensity + 1) / 4);

  const score =
    (metrics.totalConfidence * weights.confidence) +
    (metrics.sourceDiversity * weights.diversity) +
    (normalizedDensity * weights.contentDensity) +
    (metrics.balanceScore * weights.balance) +
    (metrics.completenessScore / 100 * weights.completeness);

  return parseFloat(score.toFixed(3));
}

/**
 * Get quality rating label
 */
function getQualityRating(overallQuality) {
  if (overallQuality >= 0.9) return 'EXCELLENT';
  if (overallQuality >= 0.75) return 'GOOD';
  if (overallQuality >= 0.6) return 'FAIR';
  if (overallQuality >= 0.4) return 'LIMITED';
  return 'POOR';
}

/**
 * Generate actionable suggestions
 */
function generateSuggestions(metrics) {
  const suggestions = [];

  // Upload count suggestions
  if (metrics.uploadCount === 0) {
    suggestions.push({
      type: 'critical',
      category: 'uploads',
      message: 'No uploads provided. Add materials to enhance mentor skill accuracy.'
    });
  } else if (metrics.uploadCount < 3) {
    suggestions.push({
      type: 'warning',
      category: 'uploads',
      message: `Only ${metrics.uploadCount} upload(s) provided. Add more materials for better coverage.`
    });
  }

  // Confidence suggestions
  if (metrics.totalConfidence < 0.7) {
    suggestions.push({
      type: 'warning',
      category: 'quality',
      message: 'Average extraction quality is low. Some files may have parsing issues. Check file formats and content.'
    });
  }

  // Diversity suggestions
  if (metrics.sourceDiversity < 0.5) {
    const missingTypes = Object.entries(metrics.typeCounts)
      .filter(([type, count]) => count === 0)
      .map(([type]) => type.replace('pdfs', 'PDF')
                         .replace('emails', 'email')
                         .replace('feishu', 'Feishu')
                         .replace('images', 'image')
                         .replace('markdown', 'Markdown')
                         .replace('texts', 'text'));
    suggestions.push({
      type: 'info',
      category: 'diversity',
      message: `Limited source diversity. Consider adding: ${missingTypes.join(', ')}`
    });
  }

  // Balance suggestions
  if (metrics.balanceMetrics.dominantType) {
    const dominantTypeName = metrics.balanceMetrics.dominantType.replace('pdfs', 'PDF')
                                                        .replace('emails', 'email')
                                                        .replace('feishu', 'Feishu')
                                                        .replace('images', 'image')
                                                        .replace('markdown', 'Markdown')
                                                        .replace('texts', 'text');
    suggestions.push({
      type: 'info',
      category: 'balance',
      message: `Over-reliance on ${dominantTypeName}. Add other source types for better balance.`
    });
  }

  // Content density suggestions
  if (metrics.contentMetrics.avgContentLength < 500) {
    suggestions.push({
      type: 'warning',
      category: 'content',
      message: 'Average content length is short. Provide more detailed materials for better analysis.'
    });
  }

  // Image-specific suggestions
  if (metrics.typeCounts.images > 0 && metrics.totalConfidence < 0.8) {
    suggestions.push({
      type: 'info',
      category: 'images',
      message: 'Images currently processed with metadata only. Full Vision API integration coming soon.'
    });
  }

  // Completeness suggestions
  if (metrics.completenessScore < 60) {
    suggestions.push({
      type: 'warning',
      category: 'completeness',
      message: 'Profile completeness is low. Combine uploads with ArXiv papers and web search for best results.'
    });
  }

  return suggestions;
}

export default { mergeContent };
