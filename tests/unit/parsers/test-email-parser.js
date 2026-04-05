import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import path from 'node:path';
import { parseEmail } from '../../../tools/parsers/email-parser.mjs';

describe('Email Parser', () => {
  const fixturePath = path.join(
    process.cwd(),
    'tests/fixtures/emails/simple.eml'
  );

  it('should parse .eml file successfully', async () => {
    const result = await parseEmail(fixturePath);

    assert.equal(result.success, true);
    assert.equal(result.confidence, 0.98);
    assert.equal(typeof result.content, 'string');
    assert.ok(result.content.length > 0);
  });

  it('should extract email metadata', async () => {
    const result = await parseEmail(fixturePath);

    assert.equal(result.metadata.subject, 'Test Email with HTML Content');
    assert.equal(result.metadata.from, 'sender@example.com');
    assert.ok(Array.isArray(result.metadata.to));
    assert.equal(result.metadata.to.length, 2);
    assert.ok(result.metadata.to.includes('recipient1@example.com'));
    assert.ok(result.metadata.to.includes('recipient2@example.com'));
    assert.ok(Array.isArray(result.metadata.cc));
    assert.equal(result.metadata.cc.length, 2);
    assert.ok(result.metadata.cc.includes('cc1@example.com'));
    assert.ok(result.metadata.cc.includes('cc2@example.com'));
    assert.equal(result.metadata.messageId, '<test123@example.com>');
    assert.equal(result.metadata.date, 'Mon, 05 Apr 2026 10:30:00 +0000');
  });

  it('should redact email addresses by default', async () => {
    const result = await parseEmail(fixturePath);

    assert.equal(result.content.includes('sender@example.com'), false);
    assert.equal(result.content.includes('recipient1@example.com'), false);
    assert.equal(result.content.includes('recipient2@example.com'), false);
    assert.equal(result.content.includes('cc1@example.com'), false);
    assert.equal(result.content.includes('cc2@example.com'), false);
    assert.equal(result.content.includes('support@example.com'), false);
    assert.ok(result.content.includes('[EMAIL REDACTED]'));
  });

  it('should preserve email addresses when includeEmails is true', async () => {
    const result = await parseEmail(fixturePath, { includeEmails: true });

    assert.ok(result.content.includes('support@example.com'));
  });

  it('should convert HTML to text and prefer text content', async () => {
    const result = await parseEmail(fixturePath);

    // Should have text content, not HTML tags
    assert.equal(result.content.includes('<html>'), false);
    assert.equal(result.content.includes('<h1>'), false);
    assert.equal(result.content.includes('</p>'), false);

    // Should have readable text
    assert.ok(result.content.length > 0);
  });

  it('should reject invalid file extensions', async () => {
    const result = await parseEmail('/path/to/file.txt');

    assert.equal(result.success, false);
    assert.ok(result.errors.some(e => e.includes('Invalid file extension')));
  });

  it('should handle .mbox format', async () => {
    // This tests that .mbox files are accepted (even if we don't have a fixture)
    const result = await parseEmail('/path/to/file.mbox');

    // Should fail because file doesn't exist, but not because of extension
    assert.equal(result.success, false);
    assert.ok(!result.errors.some(e => e.includes('Invalid file extension')));
  });

  it('should handle missing file gracefully', async () => {
    const result = await parseEmail('/nonexistent/path/email.eml');

    assert.equal(result.success, false);
    assert.ok(result.errors.length > 0);
  });

  it('should return high confidence for successfully parsed emails', async () => {
    const result = await parseEmail(fixturePath);

    assert.equal(result.success, true);
    assert.equal(result.confidence, 0.98);
  });
});
