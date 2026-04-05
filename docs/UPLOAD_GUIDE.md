# Upload Guide for distill-mentor

## Overview

The upload system allows you to provide additional materials about your mentor through simple file uploads. These materials are analyzed together with papers and web search results to create more comprehensive mentor skills.

## Supported File Types

### 1. Text Files (.txt, .text)

Plain text files with any content.

**Use for:** Transcripts, notes, correspondence, text documentation

**Format:** Plain text, UTF-8 encoding recommended (auto-detects UTF-16LE, UTF-16BE, Latin-1)

**Example:**
```bash
cp interview_transcript.txt uploads/text/
```

### 2. Markdown Files (.md)

Markdown documents with structure and formatting.

**Use for:** Notes, documentation, structured text with YAML frontmatter

**Format:** CommonMark or GitHub Flavored Markdown, UTF-8 encoding

**Features:** Extracts headings (H1-H3), code blocks, YAML frontmatter

**Example:**
```bash
cp research_notes.md uploads/markdown/
```

### 3. PDF Documents (.pdf)

PDF files containing research papers, lecture notes, or documentation.

**Use for:** Academic papers, lecture slides, course materials, technical documentation

**Format:** Standard PDF format (all versions supported)

**Extraction:** Text content, metadata (title, author, page count, creation date)

**Limitations:**
- Image-based PDFs require OCR (limited extraction)
- Password-protected PDFs will fail
- Very complex layouts may have extraction errors

**Example:**
```bash
cp research_paper.pdf uploads/pdfs/
cp lecture_notes.pdf uploads/pdfs/
```

**Privacy:** No special privacy concerns - text is extracted as-is

### 4. Email Files (.eml, .mbox)

Email files containing correspondence with or about the mentor.

**Use for:** Email threads, correspondence archives, communication records

**Format:** Standard email format (.eml for single email, .mbox for multiple)

**Extraction:** Subject, sender, recipients, date, message body, thread structure

**Privacy:** Email addresses are **redacted by default** ([email]) to protect privacy

**Limitations:**
- Attachments are not extracted
- HTML emails are converted to plain text
- Very large .mbox files may take time to process

**Example:**
```bash
cp correspondence.eml uploads/emails/
cp mailing_list.mbox uploads/emails/
```

**Privacy Options:**
- Default: Email addresses redacted as `[email]`
- To preserve addresses: Set `includeEmails: true` option (not yet exposed in CLI)

### 5. Images and Screenshots (.png, .jpg, .jpeg, .gif, .webp)

Image files containing screenshots, diagrams, or visual content.

**Use for:** Screenshots of websites, diagrams, handwritten notes, photos of documents

**Format:** Common image formats

**Extraction:** (Current implementation: Basic metadata only)
- Format (png, jpg, etc.)
- File size
- Extraction timestamp

**Limitations:**
- **Vision API integration pending** - OCR and visual description not yet implemented
- Currently only extracts basic metadata
- Full image analysis requires MCP Vision API tool

**Future capabilities:**
- OCR text extraction from images
- Visual description of diagrams and charts
- Context understanding of screenshots

**Example:**
```bash
cp screenshot.png uploads/images/
cp diagram.jpg uploads/images/
```

**Note:** For now, images are processed with metadata only. Full Vision API integration will be added in a future update.

### 6. Feishu Exports (.json)

JSON exports from Feishu (飞书), a collaborative workspace platform.

**Use for:** Feishu documents, messages, wikis, and collaborative content

**Format:** JSON export files

**Extraction:** Messages, documents, metadata, comments

**Supported structures:**
- **Single document:** `{ title, content, creator, comments[] }`
- **Batch export:** `{ documents: [{ title, content }, ...] }`
- **Messages export:** `{ messages: [{ sender, content, timestamp }, ...] }`

**Features:**
- Automatically detects structure type
- Extracts messages with sender information
- Preserves document hierarchy
- Handles comments and metadata

**Limitations:**
- Feishu Open API integration not yet implemented (manual export required)
- Nested subdirectories (e.g., `feishu/json/`) not scanned - place files directly in `uploads/feishu/`
- Complex nested structures may use generic extraction

**Example:**
```bash
# Export from Feishu web interface -> JSON
cp feishu_export.json uploads/feishu/
cp meeting_notes.json uploads/feishu/
```

**Exporting from Feishu:**
1. Open Feishu web interface
2. Navigate to document or message
3. Use export feature to save as JSON
4. Place exported file in `uploads/feishu/`

**Note:** Currently supports JSON exports only. Markdown exports from Feishu should be placed in `uploads/markdown/` instead.

## Quick Start

1. **Place files in appropriate directories:**
   ```bash
   cp interview.txt uploads/text/
   cp research_notes.md uploads/markdown/
   cp lecture_slides.pdf uploads/pdfs/
   cp correspondence.eml uploads/emails/
   cp screenshot.png uploads/images/
   cp feishu_export.json uploads/feishu/
   ```

2. **Generate mentor skill:**
   ```bash
   node tools/skill-generator.mjs "Mentor Name" --affiliation "Institution"
   ```

3. **View results:**
   - Uploads are processed automatically
   - Quality report shows what was analyzed
   - Mentor skill includes insights from uploads

**Example with uploads:**
```bash
# Add materials
cp professor_paper.pdf uploads/pdfs/
cp email_thread.eml uploads/emails/
cp diagram.png uploads/images/
cp meeting_notes.json uploads/feishu/

# Generate skill
node tools/skill-generator.mjs "Geoffrey Hinton" --affiliation "University of Toronto"

# Output includes:
# [Upload Scanner] Found 4 new upload(s) to process
# [PDF Parser] ✓ professor_paper.pdf (15 pages, 42KB)
# [Email Parser] ✓ email_thread.eml (Research collaboration discussion)
# [Image Parser] ✓ diagram.png (png, 156KB)
# [Feishu Parser] ✓ meeting_notes.json (document, 1 items)
# ✓ Processed 4/4 files successfully
```

## Directory Structure

```
uploads/
├── text/           # Plain text files (.txt, .text)
├── markdown/       # Markdown documents (.md)
├── pdfs/           # PDF documents (.pdf)
├── emails/         # Email files (.eml, .mbox)
├── feishu/         # Feishu JSON exports (.json)
├── images/         # Images and screenshots (.png, .jpg, .jpeg, .gif, .webp)
└── processed/      # Tracking manifest (auto-generated)
                    # .processed_manifest.json
```

**Note:** Place files directly in the type-specific subdirectories (e.g., `uploads/feishu/file.json`, not `uploads/feishu/json/file.json`). The scanner processes one level deep only.

## Quality Tips

1. **Provide sufficient content:**
   - Text files: >100 characters
   - Markdown files: >50 characters
   - PDF files: Text-based (not scanned images)
   - Email files: Complete threads with substantive content

2. **Use appropriate encoding:** UTF-8 works best for all formats

3. **Organize by type:** Put files in correct subdirectories

4. **Check quality report:** Review feedback after generation

5. **PDF-specific:**
   - Use text-based PDFs when possible (better extraction)
   - Avoid password-protected PDFs
   - Large PDFs (>50 pages) may take longer to process

6. **Email-specific:**
   - Complete email threads provide better context
   - .eml files for single emails, .mbox for archives
   - Email addresses are redacted by default for privacy

7. **Image-specific:**
   - Clear, high-resolution images work best
   - **Vision API integration pending** - currently metadata only
   - Screenshots should capture visible text clearly
   - Diagrams should be high contrast for better OCR

8. **Feishu-specific:**
   - Export as JSON from Feishu web interface
   - Complete documents provide better context
   - Batch exports work well for multiple documents
   - Messages exports show communication patterns
   - Place files directly in `uploads/feishu/` (not in nested subdirectories)

## Troubleshooting

**File not processed?**
- Check file is in correct directory
- Ensure file has correct extension (.txt, .md, .pdf, .eml, .mbox)
- Verify file meets minimum content length

**PDF extraction issues?**
- **"Failed to parse PDF"**: File may be corrupted or password-protected
- **"No text extracted"**: PDF may be image-based (scanned document)
- **"Partial extraction"**: Complex layout or embedded fonts
- Solution: Use text-based PDFs when possible

**Email parsing issues?**
- **"Failed to parse email"**: Invalid .eml or .mbox format
- **"No content found"**: Empty email body or HTML-only content
- **"Missing headers"**: Corrupted email file
- Solution: Ensure standard email format

**Encoding issues?**
- Use UTF-8 encoding when possible
- System attempts fallback encodings automatically (UTF-16LE, UTF-16BE, Latin-1)

**Already processed?**
- Files are tracked by SHA256 hash and not re-processed
- Delete `uploads/processed/.processed_manifest.json` to force re-processing
- Modified files with new content will be processed automatically

**Privacy concerns with emails?**
- Email addresses are redacted by default ([email])
- Only the message body and headers are extracted
- Attachments are not extracted or stored

**Image processing issues?**
- **"Vision API integration pending"**: Expected - currently only metadata extraction
- **"Invalid file extension"**: Check file has supported extension (.png, .jpg, .jpeg, .gif, .webp)
- **"Failed to read image"**: File may be corrupted
- Solution: Ensure images are valid and not corrupted
- **Note:** Full OCR and visual description coming in future update

**Feishu parsing issues?**
- **"Invalid file extension"**: Must be .json file
- **"Failed to parse JSON"**: Malformed JSON syntax
- **"Unknown Feishu JSON structure"**: Unrecognized export format
  - System will attempt generic text extraction
  - May have lower confidence score
- **"File not detected"**: Check file is directly in `uploads/feishu/`, not in nested subdirectories
- Solution: Export as JSON from Feishu, place directly in feishu directory