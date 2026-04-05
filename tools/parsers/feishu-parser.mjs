#!/usr/bin/env node
/**
 * Feishu Parser
 *
 * Parses Feishu JSON exports to extract messages, documents, and metadata.
 * Supports both single document exports and batch exports.
 *
 * Usage:
 *   await parseFeishu(filePath, options)
 */

import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/**
 * Parse a Feishu JSON export file
 *
 * @param {string} filePath - Path to the Feishu JSON file
 * @param {Object} options - Parser options
 * @returns {Promise<Object>} Parse result with success, content, metadata, confidence, errors
 */
export async function parseFeishu(filePath, options = {}) {
  // Validate file extension
  const ext = path.extname(filePath).toLowerCase();

  if (ext !== '.json') {
    return {
      success: false,
      content: '',
      metadata: {},
      confidence: 0,
      errors: [`Invalid file extension: ${ext}. Expected: .json`]
    };
  }

  try {
    // Read and parse JSON file
    const jsonContent = await fs.readFile(filePath, 'utf-8');
    let data;

    try {
      data = JSON.parse(jsonContent);
    } catch (parseError) {
      return {
        success: false,
        content: '',
        metadata: {},
        confidence: 0,
        errors: [`Failed to parse JSON: ${parseError.message}`]
      };
    }

    // Extract content based on Feishu JSON structure
    const extraction = extractFeishuContent(data);

    // Build combined content
    const combinedContent = buildCombinedContent(extraction);

    return {
      success: true,
      content: combinedContent,
      metadata: {
        ...extraction.metadata,
        extractedAt: new Date().toISOString()
      },
      confidence: calculateConfidence(extraction),
      errors: extraction.warnings || []
    };

  } catch (error) {
    return {
      success: false,
      content: '',
      metadata: {},
      confidence: 0,
      errors: [`Failed to parse Feishu file: ${error.message}`]
    };
  }
}

/**
 * Extract content from Feishu JSON structure
 *
 * Feishu exports can have various structures:
 * - Single document: { title, content, creator, ... }
 * - Batch export: { documents: [], ... }
 * - Messages export: { messages: [], ... }
 *
 * @param {Object} data - Parsed JSON data
 * @returns {Object} Extracted content with metadata
 */
function extractFeishuContent(data) {
  const extraction = {
    messages: [],
    documents: [],
    comments: [],
    metadata: {
      type: 'unknown',
      title: '',
      itemCount: 0
    },
    warnings: []
  };

  // Detect structure type
  if (data.documents && Array.isArray(data.documents)) {
    // Batch export
    extraction.metadata.type = 'batch';
    extraction.metadata.itemCount = data.documents.length;

    data.documents.forEach((doc, index) => {
      if (doc.title) {
        extraction.documents.push(`[Document ${index + 1}] ${doc.title}`);
      }
      if (doc.content) {
        extraction.documents.push(doc.content);
      }
      if (doc.comments && Array.isArray(doc.comments)) {
        extraction.comments.push(...doc.comments.map(c => c.text || c.content || ''));
      }
    });

  } else if (data.messages && Array.isArray(data.messages)) {
    // Messages export
    extraction.metadata.type = 'messages';
    extraction.metadata.itemCount = data.messages.length;

    data.messages.forEach(msg => {
      if (msg.content || msg.text) {
        const sender = msg.sender || msg.author || msg.user_name || 'Unknown';
        const timestamp = msg.create_time || msg.timestamp || '';
        extraction.messages.push(`[${sender}] ${msg.content || msg.text}`);
      }
    });

  } else if (data.title || data.content || data.body) {
    // Single document
    extraction.metadata.type = 'document';
    extraction.metadata.itemCount = 1;
    extraction.metadata.title = data.title || '';

    if (data.content) {
      extraction.documents.push(data.content);
    }
    if (data.body) {
      extraction.documents.push(data.body);
    }
    if (data.comments && Array.isArray(data.comments)) {
      extraction.comments.push(...data.comments.map(c => c.text || c.content || ''));
    }

  } else {
    // Unknown structure - try to extract any text content
    extraction.warnings.push('Unknown Feishu JSON structure, attempting generic extraction');
    extraction.metadata.type = 'unknown';
    extraction.metadata.itemCount = 0;

    // Try to extract any string fields
    const strings = extractAllStrings(data);
    if (strings.length > 0) {
      extraction.documents.push(strings.join('\n'));
      extraction.metadata.itemCount = strings.length;
    }
  }

  return extraction;
}

/**
 * Extract all string values from an object recursively
 *
 * @param {Object} obj - Object to extract strings from
 * @returns {Array<string>} Array of string values
 */
function extractAllStrings(obj) {
  const strings = [];

  function traverse(value) {
    if (typeof value === 'string' && value.length > 10) {
      strings.push(value);
    } else if (Array.isArray(value)) {
      value.forEach(traverse);
    } else if (typeof value === 'object' && value !== null) {
      Object.values(value).forEach(traverse);
    }
  }

  traverse(obj);
  return strings;
}

/**
 * Build combined content from extracted data
 *
 * @param {Object} extraction - Extracted content
 * @returns {string} Combined content
 */
function buildCombinedContent(extraction) {
  const parts = [];

  if (extraction.metadata.title) {
    parts.push(`# ${extraction.metadata.title}`);
  }

  if (extraction.messages.length > 0) {
    parts.push('\n## Messages\n');
    parts.push(extraction.messages.join('\n'));
  }

  if (extraction.documents.length > 0) {
    parts.push('\n## Documents\n');
    parts.push(extraction.documents.join('\n\n'));
  }

  if (extraction.comments.length > 0) {
    parts.push('\n## Comments\n');
    parts.push(extraction.comments.join('\n'));
  }

  return parts.join('\n').trim();
}

/**
 * Calculate confidence score based on extraction quality
 *
 * @param {Object} extraction - Extracted content
 * @returns {number} Confidence score (0-1)
 */
function calculateConfidence(extraction) {
  let confidence = 0.7; // Base confidence

  const totalItems = extraction.messages.length +
                     extraction.documents.length +
                     extraction.comments.length;

  if (totalItems === 0) {
    confidence = 0.3;
  } else if (totalItems >= 5) {
    confidence = 0.95;
  } else if (totalItems >= 2) {
    confidence = 0.85;
  }

  // Reduce confidence for unknown structures
  if (extraction.metadata.type === 'unknown') {
    confidence *= 0.7;
  }

  // Reduce confidence if there are warnings
  if (extraction.warnings.length > 0) {
    confidence *= 0.9;
  }

  return Math.max(0, Math.min(1, confidence));
}

export default { parseFeishu };
