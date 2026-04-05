# Troubleshooting Guide

This guide covers common issues and solutions when using the distill-mentor upload system.

## Table of Contents

- [Upload Issues](#upload-issues)
- [Parser Issues](#parser-issues)
- [Quality Assessment Issues](#quality-assessment-issues)
- [Performance Issues](#performance-issues)
- [API Issues](#api-issues)

---

## Upload Issues

### Files Not Detected

**Symptom:** Files placed in `uploads/` directory are not being processed.

**Possible Causes:**
1. **File in wrong subdirectory**
   - Files must be in type-specific subdirectories (e.g., `uploads/pdfs/`, not `uploads/`)
   - Solution: Move files to correct subdirectory

2. **File extension not recognized**
   - Only specific extensions are supported for each type
   - Solution: Check supported extensions in [UPLOAD_GUIDE.md](UPLOAD_GUIDE.md)

3. **File already processed**
   - Files are tracked by SHA256 hash and not re-processed
   - Solution: Delete `~/.claude/uploads/processed/.processed_manifest.json` to force re-processing

4. **Hidden file**
   - Files starting with `.` are ignored
   - Solution: Rename file without leading dot

### Files Detected But Not Processed

**Symptom:** Scanner finds files but parser fails.

**Possible Causes:**
1. **Invalid file format**
   - File has correct extension but invalid content
   - Solution: Verify file is valid (e.g., PDF can be opened, JSON is valid)

2. **Corrupted file**
   - File data is corrupted
   - Solution: Re-export or re-create the file

3. **Insufficient content**
   - Text/Markdown files below minimum length (100/50 chars)
   - Solution: Add more content to the file

---

## Parser Issues

### PDF Parser

**"Password-protected PDF"**
- PDF has a password that prevents parsing
- Solution: Remove password protection before uploading

**"No text extracted"**
- PDF is image-based (scanned document) without OCR text
- Solution: Use OCR tool or provide text-based PDF

**"Insufficient content"**
- PDF has less than 100 characters of text
- Solution: Ensure PDF has sufficient text content

### Email Parser

**"Failed to parse email"**
- Invalid .eml or .mbox format
- Solution: Ensure file is valid email export

**"Missing headers"**
- Corrupted or incomplete email file
- Solution: Re-export email from mail client

**Privacy Notice**
- Email addresses are redacted by default as `[email]`
- This is intentional for privacy protection

### Image Parser

**"Vision API integration pending"**
- Currently only extracts metadata (format, size)
- Full OCR and visual description coming in future update
- Solution: For now, images provide basic metadata only

### Feishu Parser

**"Unknown Feishu JSON structure"**
- JSON export doesn't match expected format
- System attempts generic extraction (may have lower confidence)
- Solution: Ensure export is standard Feishu JSON format

**"Failed to parse JSON"**
- Malformed JSON syntax
- Solution: Validate JSON with a JSON validator before uploading

---

## Quality Assessment Issues

### Low Quality Rating

**Symptom:** Quality assessment shows POOR or LIMITED rating.

**Common Causes:**
1. **Few uploads** (< 3 files)
   - Add more materials for better coverage

2. **Low diversity** (only 1-2 source types)
   - Add different file types (PDF, email, Markdown, etc.)

3. **Low confidence scores**
   - Some files may have parsing issues
   - Check error messages for specific files

4. **Short content**
   - Average content length is low
   - Provide more detailed materials

5. **No existing sources**
   - No ArXiv papers or web search results
   - Ensure mentor name and affiliation are correct

### Imbalanced Sources

**Symptom:** Assessment shows "Over-reliance on [type]"

**Solution:** Add other source types to create better balance

---

## Performance Issues

### Slow Processing

**Possible Causes:**
1. **Large files** (> 10MB)
   - Large PDFs or email archives take longer
   - Solution: Split into smaller files if possible

2. **Many files** (> 20)
   - More files = more processing time
   - This is expected behavior

3. **Slow disk I/O**
   - Network drives or slow storage
   - Solution: Use local storage if possible

### Memory Issues

**Symptom:** Process runs out of memory

**Solution:**
- Process uploads in smaller batches
- Reduce file sizes if possible

---

## API Issues

### API Key Not Set

**Symptom:** Error about missing API key

**Solution:**
```bash
# For Anthropic Claude
export ANTHROPIC_API_KEY="sk-ant-..."

# Or for OpenAI
export LLM_API="openai"
export OPENAI_API_KEY="sk-..."
```

### API Rate Limits

**Symptom:** API calls fail with rate limit errors

**Solution:**
- Wait a few minutes and try again
- Use `--deep-analyze` flag selectively

### No Papers Found

**Symptom:** ArXiv search returns 0 papers

**Possible Causes:**
1. **Mentor name spelling**
   - Check spelling of mentor name

2. **Not on ArXiv**
   - Many mentors don't publish on ArXiv
   - Solution: Use uploads to provide materials

3. **Common name**
   - Name matches many authors
   - Solution: Use `--affiliation` to disambiguate

---

## Getting Help

If none of these solutions work:

1. **Check error messages carefully**
   - Error messages often contain specific guidance

2. **Review logs**
   - Check console output for detailed error information

3. **Search existing issues**
   - Check [GitHub Issues](https://github.com/ybq22/supervisor/issues)

4. **Create a new issue**
   - Include: error message, steps to reproduce, system info
   - Attach: Sample files (if non-sensitive)

---

## Common Error Messages

| Error | Cause | Solution |
|-------|-------|----------|
| `File not found` | File path incorrect | Check file exists at path |
| `Permission denied` | File not readable | Check file permissions |
| `Invalid file extension` | Wrong file type | Use correct extension |
| `File is empty` | Empty file | Add content to file |
| `Insufficient content` | Too short | Add more content |
| `Failed to parse JSON` | Invalid JSON | Validate JSON syntax |
| `Password-protected PDF` | Encrypted PDF | Remove password |
| `No text extracted` | Image-based PDF | Use OCR or text-based PDF |

---

**Last Updated:** 2025-04-05
