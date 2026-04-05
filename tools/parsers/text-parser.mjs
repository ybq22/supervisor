import { readFile } from 'fs/promises';
import { extname } from 'path';

/**
 * Parse text file with encoding detection and content normalization
 *
 * @param {string} filePath - Path to the text file
 * @param {Object} options - Parser options
 * @returns {Promise<Object>} Parsed result with content, metadata, and confidence
 */
export async function parseText(filePath, options = {}) {
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
    if (ext !== '.txt' && ext !== '.text') {
      if (ext === '') {
        result.errors.push('Invalid file extension. Only .txt and .text files are supported');
      } else {
        result.errors.push(`Invalid file extension: ${ext}. Only .txt and .text files are supported`);
      }
      return result;
    }

    // Read file once, then try different encodings
    let buffer;
    try {
      buffer = await readFile(filePath);
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
    if (buffer.length === 0) {
      result.errors.push('File is empty');
      return result;
    }

    // Try different encodings
    let content = null;
    let encoding = 'utf-8';
    const encodings = ['utf-8', 'utf-16le', 'utf-16be', 'latin1'];

    for (const enc of encodings) {
      content = buffer.toString(enc);

      // Validate that content is readable text
      // Check for excessive null bytes or control characters (except common whitespace)
      const nullByteCount = (content.match(/\x00/g) || []).length;
      const controlCharCount = (content.match(/[\x01-\x08\x0B\x0C\x0E-\x1F\x7F]/g) || []).length;

      // If more than 5% of characters are null bytes or control characters, encoding is likely wrong
      if ((nullByteCount + controlCharCount) / content.length < 0.05) {
        encoding = enc;
        break;
      }

      content = null;
    }

    if (content === null) {
      result.errors.push('Failed to decode file with supported encodings: UTF-8, UTF-16LE, UTF-16BE, Latin-1');
      return result;
    }

    // Normalize content
    content = content
      // Replace CRLF with LF
      .replace(/\r\n/g, '\n')
      // Replace remaining CR with LF
      .replace(/\r/g, '\n')
      // Trim leading and trailing whitespace
      .trim()
      // Reduce excessive whitespace (more than 2 spaces) to 2 spaces
      .replace(/ {3,}/g, '  ');

    // Validate minimum content length
    if (content.length < 100) {
      result.errors.push('Insufficient content: File must contain at least 100 characters');
      return result;
    }

    // Calculate metadata
    const lines = content.split('\n').length;
    const words = content.split(/\s+/).filter(w => w.length > 0).length;
    const characters = content.length;

    result.metadata = {
      encoding,
      lines,
      words,
      characters
    };

    result.content = content;
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
