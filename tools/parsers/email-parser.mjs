import fs from 'fs/promises';
import path from 'path';
import { simpleParser } from 'mailparser';

/**
 * Parse email file and extract content and metadata
 *
 * @param {string} filePath - Path to email file
 * @param {Object} options - Parser options
 * @param {boolean} options.includeEmails - Whether to preserve email addresses in content (default: false)
 * @returns {Promise<Object>} Parsed email result
 */
export async function parseEmail(filePath, options = {}) {
  const { includeEmails = false } = options;
  const errors = [];

  // Validate file extension
  const ext = path.extname(filePath).toLowerCase();
  const validExtensions = ['.eml', '.mbox'];

  if (!validExtensions.includes(ext)) {
    return {
      success: false,
      content: '',
      metadata: {},
      confidence: 0,
      errors: [`Invalid file extension: ${ext}. Supported: .eml, .mbox`]
    };
  }

  try {
    // Read file content
    const emailContent = await fs.readFile(filePath, 'utf-8');

    // Extract raw date header before parsing
    const dateMatch = emailContent.match(/^Date:\s*(.+)$/m);
    const rawDate = dateMatch ? dateMatch[1].trim() : '';

    // Parse email using mailparser
    const parsed = await simpleParser(emailContent);

    // Extract metadata
    const metadata = {
      subject: parsed.subject || '',
      from: parsed.from?.text || '',
      to: parsed.to?.value?.map(addr => addr.address) || [],
      cc: parsed.cc?.value?.map(addr => addr.address) || [],
      date: rawDate,
      messageId: parsed.messageId || ''
    };

    // Extract body content (prefer text over HTML)
    let body = '';
    if (parsed.text) {
      body = parsed.text;
    } else if (parsed.html) {
      // Convert HTML to text
      body = convertHtmlToText(parsed.html);
    }

    // Redact email addresses if needed
    let content = body;
    if (!includeEmails) {
      content = redactEmailAddresses(content);
    }

    return {
      success: true,
      content,
      metadata,
      confidence: 0.98,
      errors: []
    };
  } catch (error) {
    return {
      success: false,
      content: '',
      metadata: {},
      confidence: 0,
      errors: [`Failed to parse email: ${error.message}`]
    };
  }
}

/**
 * Convert HTML to plain text
 *
 * @param {string} html - HTML content
 * @returns {string} Plain text content
 */
function convertHtmlToText(html) {
  let text = html;

  // Remove HTML tags
  text = text.replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '');
  text = text.replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '');
  text = text.replace(/<[^>]+>/g, '');

  // Convert HTML entities
  text = text.replace(/&amp;/g, '&');
  text = text.replace(/&lt;/g, '<');
  text = text.replace(/&gt;/g, '>');
  text = text.replace(/&quot;/g, '"');
  text = text.replace(/&#39;/g, "'");
  text = text.replace(/&nbsp;/g, ' ');

  // Clean up whitespace
  text = text.replace(/\s+/g, ' ');
  text = text.trim();

  return text;
}

/**
 * Redact email addresses from text
 *
 * @param {string} text - Text content
 * @returns {string} Text with email addresses redacted
 */
function redactEmailAddresses(text) {
  // Match email addresses with pattern for local@domain.tld
  const emailPattern = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g;

  return text.replace(emailPattern, '[EMAIL REDACTED]');
}
