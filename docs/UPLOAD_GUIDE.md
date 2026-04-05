# Upload Guide for distill-mentor

## Overview

The upload system allows you to provide additional materials about your mentor through simple file uploads. These materials are analyzed together with papers and web search results to create more comprehensive mentor skills.

## Supported File Types

### 1. Text Files (.txt, .text)

Plain text files with any content.

**Use for:** Transcripts, notes, correspondence, text documentation

**Example:**
```bash
cp interview_transcript.txt uploads/text/
```

### 2. Markdown Files (.md)

Markdown documents with structure and formatting.

**Use for:** Notes, documentation, structured text

**Example:**
```bash
cp research_notes.md uploads/markdown/
```

## Quick Start

1. **Place files in appropriate directories:**
   ```bash
   cp myfile.txt uploads/text/
   cp notes.md uploads/markdown/
   ```

2. **Generate mentor skill:**
   ```bash
   node tools/skill-generator.mjs "Mentor Name" --affiliation "Institution"
   ```

3. **View results:**
   - Uploads are processed automatically
   - Quality report shows what was analyzed
   - Mentor skill includes insights from uploads

## Directory Structure

```
uploads/
├── text/           # Plain text files
├── markdown/       # Markdown documents
├── pdfs/           # PDF files (coming in Phase 2)
├── emails/         # Email files (coming in Phase 2)
├── feishu/         # Feishu exports (coming in Phase 3)
├── images/         # Images and screenshots (coming in Phase 3)
└── processed/      # Tracking manifest (auto-generated)
```

## Quality Tips

1. **Provide sufficient content:** Files should have >100 characters for text, >50 for markdown
2. **Use appropriate encoding:** UTF-8 works best
3. **Organize by type:** Put files in correct subdirectories
4. **Check quality report:** Review feedback after generation

## Troubleshooting

**File not processed?**
- Check file is in correct directory
- Ensure file has correct extension
- Verify file meets minimum content length

**Encoding issues?**
- Use UTF-8 encoding when possible
- System attempts fallback encodings automatically

**Already processed?**
- Files are tracked and not re-processed
- Delete `uploads/processed/.processed_manifest.json` to force re-processing