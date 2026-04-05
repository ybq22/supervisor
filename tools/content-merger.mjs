/**
 * Merge parsed uploads with existing data sources
 *
 * @param {Object} existingSources - Existing sources (arxivPapers, webSearch, etc.)
 * @param {Object} parsedUploads - Parsed upload results by type
 * @returns {Object} Merged content with quality metrics
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

  // Calculate quality metrics
  const qualityMetrics = calculateQualityMetrics(uploads);

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
 * Calculate quality metrics from parsed uploads
 *
 * @param {Object} uploads - Parsed upload results by type
 * @returns {Object} Quality metrics (uploadCount, totalConfidence, sourceDiversity)
 */
function calculateQualityMetrics(uploads) {
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

  // Calculate total upload count (only successful ones)
  const uploadCount = successfulUploads.length;

  // Calculate weighted average confidence (only for successful uploads)
  let totalConfidence = 0;
  if (uploadCount > 0) {
    const confidenceSum = successfulUploads.reduce(
      (sum, upload) => sum + (upload.confidence || 0),
      0
    );
    totalConfidence = parseFloat((confidenceSum / uploadCount).toFixed(3));
  }

  // Calculate source diversity (number of types with successful uploads / 6)
  const typesWithUploads = [
    uploads.pdfs?.some(p => p.success) ? 1 : 0,
    uploads.emails?.some(p => p.success) ? 1 : 0,
    uploads.feishu?.some(p => p.success) ? 1 : 0,
    uploads.images?.some(p => p.success) ? 1 : 0,
    uploads.markdown?.some(p => p.success) ? 1 : 0,
    uploads.texts?.some(p => p.success) ? 1 : 0
  ].reduce((sum, count) => sum + count, 0);

  const sourceDiversity = typesWithUploads / 6;

  return {
    uploadCount,
    totalConfidence,
    sourceDiversity
  };
}
