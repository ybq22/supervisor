import { readFile } from 'fs/promises';
import { extname } from 'path';
import { PDFParse } from 'pdf-parse';

/**
 * Parse PDF file and extract text content and metadata
 *
 * @param {string} filePath - Path to the PDF file
 * @param {Object} options - Parser options
 * @returns {Promise<Object>} Parsed result with content, metadata, and confidence
 */
export async function parsePDF(filePath, options = {}) {
  const result = {
    success: false,
    content: null,
    metadata: null,
    confidence: 0,
    errors: []
  };

  try {
    // Validate file extension
    const ext = extname(filePath).toLowerCase();
    if (ext !== '.pdf') {
      result.errors.push('Invalid file type. Expected .pdf');
      return result;
    }

    // Read file
    let dataBuffer;
    try {
      dataBuffer = await readFile(filePath);
    } catch (readError) {
      if (readError.code === 'ENOENT' || readError.code === 'EISDIR') {
        result.errors.push(`File not found: ${filePath}`);
      } else if (readError.code === 'EACCES') {
        result.errors.push(`Permission denied: ${filePath}`);
      } else {
        result.errors.push(`Error reading file: ${readError.message}`);
      }
      return result;
    }

    // Early validation for empty files
    if (dataBuffer.length === 0) {
      result.errors.push('File is empty');
      return result;
    }

    // Parse PDF using pdf-parse library
    let textResult;
    let infoResult;
    try {
      const parser = new PDFParse({ data: dataBuffer });

      // Extract text content
      textResult = await parser.getText();

      // Extract metadata
      infoResult = await parser.getInfo();

      // Clean up
      await parser.destroy();
    } catch (parseError) {
      // Check if it's a password-protected PDF
      if (parseError.message && parseError.message.includes('password')) {
        result.errors.push('Password-protected PDF');
        return result;
      }

      // Handle other parsing errors (corrupted PDFs, etc.)
      result.errors.push(parseError.message || 'Failed to parse PDF');
      return result;
    }

    // Extract and validate text content
    const content = textResult.text ? textResult.text.trim() : '';

    // Validate minimum content length (100 characters)
    if (content.length < 100) {
      result.errors.push(`Insufficient content (${content.length} < 100 chars)`);
      return result;
    }

    // Extract metadata
    const metadata = {
      pages: textResult.total || 0,
      title: null,
      author: null,
      createdAt: null,
      info: infoResult?.info || {}
    };

    // Extract optional metadata fields if available
    if (infoResult && infoResult.info) {
      metadata.title = infoResult.info.Title || null;
      metadata.author = infoResult.info.Author || null;
      metadata.createdAt = infoResult.info.CreationDate || null;
    }

    result.content = content;
    result.metadata = metadata;
    result.success = true;
    result.confidence = 0.95;

  } catch (error) {
    if (error.code === 'ENOENT' || error.code === 'EISDIR') {
      result.errors.push(`File not found: ${filePath}`);
    } else if (error.code === 'EACCES') {
      result.errors.push(`Permission denied: ${filePath}`);
    } else {
      result.errors.push(`Error reading file: ${error.message}`);
    }
  }

  return result;
}
