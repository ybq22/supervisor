import { readFile } from 'fs/promises';
import { extname } from 'path';

/**
 * Parse YAML frontmatter from markdown content
 *
 * @param {string} content - Raw markdown content
 * @returns {Object} { frontmatter: object|null, content: string }
 */
function parseFrontmatter(content) {
  // Check if content starts with frontmatter delimiter
  if (!content.startsWith('---')) {
    return { frontmatter: null, content };
  }

  // Find the closing delimiter
  const firstLineEnd = content.indexOf('\n');
  const closingDelimiter = content.indexOf('\n---\n', firstLineEnd + 1);

  if (closingDelimiter === -1) {
    // Malformed frontmatter (no closing delimiter), treat entire file as content
    return { frontmatter: null, content };
  }

  const frontmatterText = content.substring(firstLineEnd + 1, closingDelimiter).trim();
  const remainingContent = content.substring(closingDelimiter + 5).trim();

  // Parse simple YAML key-value pairs
  const frontmatter = {};
  const lines = frontmatterText.split('\n');

  for (const line of lines) {
    // Skip empty lines and comments
    if (!line.trim() || line.trim().startsWith('#')) {
      continue;
    }

    // Parse key: value pairs
    const colonIndex = line.indexOf(':');
    if (colonIndex === -1) {
      continue; // Skip malformed lines
    }

    const key = line.substring(0, colonIndex).trim();
    let value = line.substring(colonIndex + 1).trim();

    if (!key) {
      continue; // Skip lines with empty keys
    }

    // Parse different value types
    if (value.startsWith('"') && value.endsWith('"')) {
      // Quoted string
      value = value.slice(1, -1);
    } else if (value === 'true') {
      value = true;
    } else if (value === 'false') {
      value = false;
    } else if (value === 'null') {
      value = null;
    } else if (value.startsWith('[') && value.endsWith(']')) {
      // Array (simple comma-separated values)
      const arrayContent = value.slice(1, -1);
      value = arrayContent
        .split(',')
        .map(item => item.trim())
        .filter(item => item.length > 0)
        .map(item => {
          // Remove quotes from array items if present
          if (item.startsWith('"') && item.endsWith('"')) {
            return item.slice(1, -1);
          }
          if (item.startsWith("'") && item.endsWith("'")) {
            return item.slice(1, -1);
          }
          return item;
        });
    }

    frontmatter[key] = value;
  }

  return { frontmatter, content: remainingContent };
}

/**
 * Extract headings from markdown content
 *
 * @param {string} content - Markdown content
 * @returns {string[]} Array of heading texts
 */
function extractHeadings(content) {
  const headings = [];
  const headingRegex = /^(#{1,3})\s+(.+)$/gm;
  let match;

  while ((match = headingRegex.exec(content)) !== null) {
    headings.push(match[2].trim());
  }

  return headings;
}

/**
 * Count fenced code blocks in markdown content
 *
 * @param {string} content - Markdown content
 * @returns {number} Number of code blocks
 */
function countCodeBlocks(content) {
  const codeBlockRegex = /```[\s\S]*?```/g;
  const matches = content.match(codeBlockRegex);
  return matches ? matches.length : 0;
}

/**
 * Parse markdown file with frontmatter and structure extraction
 *
 * @param {string} filePath - Path to the markdown file
 * @param {Object} options - Parser options
 * @returns {Promise<Object>} Parsed result with content, metadata, and confidence
 */
export async function parseMarkdown(filePath, options = {}) {
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
    if (ext !== '.md') {
      if (ext === '') {
        result.errors.push('Invalid file extension. Only .md files are supported');
      } else {
        result.errors.push(`Invalid file extension: ${ext}. Only .md files are supported`);
      }
      return result;
    }

    // Read file
    let content;
    try {
      content = await readFile(filePath, 'utf-8');
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
    if (!content || content.length === 0) {
      result.errors.push('File is empty');
      return result;
    }

    // Parse frontmatter
    let frontmatter = null;
    let mainContent = content;

    try {
      const parsed = parseFrontmatter(content);
      frontmatter = parsed.frontmatter;
      mainContent = parsed.content;
    } catch (frontmatterError) {
      // If frontmatter parsing fails, use original content
      mainContent = content;
      frontmatter = null;
    }

    // Normalize content
    mainContent = mainContent
      // Replace CRLF with LF
      .replace(/\r\n/g, '\n')
      // Replace remaining CR with LF
      .replace(/\r/g, '\n')
      // Trim leading and trailing whitespace
      .trim();

    // Validate minimum content length (50 characters)
    if (mainContent.length < 50) {
      result.errors.push('Insufficient content: File must contain at least 50 characters');
      return result;
    }

    // Extract structure
    const headings = extractHeadings(mainContent);
    const codeBlocks = countCodeBlocks(mainContent);

    // Calculate word count
    const words = mainContent.split(/\s+/).filter(w => w.length > 0).length;

    // Build metadata
    result.metadata = {
      headings,
      codeBlocks,
      frontmatter,
      wordCount: words
    };

    result.content = mainContent;
    result.success = true;
    result.confidence = 0.99;

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
