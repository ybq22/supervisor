# Multi-Channel Data Upload System Design

**Project:** distill-mentor (导师.skill)
**Date:** 2025-04-05
**Status:** Design Approved
**Author:** Claude Code + Human Collaboration

---

## Executive Summary

This document describes the design for adding multi-channel data upload capabilities to the distill-mentor project. The system enables users to upload materials through six channels: Feishu (飞书), PDF, images/screenshots, email, Markdown, and direct text paste. These uploads are integrated into the existing mentor analysis pipeline to create more comprehensive and accurate mentor skills.

### Goals

1. Support multiple data upload channels alongside existing web search
2. Maintain compatibility with existing analysis pipeline
3. Provide simple drop-and-go user experience
4. Ensure high-quality data extraction and analysis
5. Handle errors gracefully and provide clear feedback

### Scope

**In scope:**
- Manual file upload via directory-based system
- Feishu JSON export parsing + basic API integration
- PDF, email, image, Markdown, and text parsing
- Quality assessment and source weighting
- Incremental updates

**Out of scope:**
- Real-time sync (future enhancement)
- Web UI (CLI only)
- Video/audio processing (future enhancement)
- Advanced Feishu API features (Phase 5)

---

## 1. System Architecture

### 1.1 High-Level Architecture

```
User uploads files
    ↓
Upload Scanner (detects & categorizes)
    ↓
Format-Specific Parsers (extract content)
    ↓
Content Merger (combines parsed data)
    ↓
Existing Analysis Pipeline (ArXiv + web + uploads)
    ↓
AI Analysis (all sources together)
    ↓
Skill Generation (comprehensive mentor skill)
```

### 1.2 Design Principles

1. **Non-breaking change** - Uploads augment, don't replace existing data sources
2. **Type safety** - Each parser validates input before processing
3. **Graceful degradation** - If one upload fails, others still process
4. **Quality awareness** - Uploads scored and weighted in final analysis
5. **User-friendly** - Simple drop-and-go workflow
6. **Maintainable** - Clear separation of concerns
7. **Extensible** - Easy to add new formats later

---

## 2. Directory Structure

```
distill-mentor/
├── uploads/                         # User upload directory (gitignored)
│   ├── pdfs/                       # PDF documents
│   ├── emails/                     # Email files (.eml, .mbox)
│   ├── feishu/                     # Feishu exports and data
│   │   ├── json/                   # JSON exports
│   │   └── markdown/               # Markdown exports
│   ├── images/                     # Screenshots and images
│   ├── markdown/                   # Markdown files
│   ├── text/                       # Plain text files
│   └── processed/                  # Successfully processed files
│       └── .processed_manifest.json  # Processing tracking
│
├── tools/
│   ├── upload-scanner.mjs          # Detects and categorizes uploads
│   ├── parsers/
│   │   ├── pdf-parser.mjs          # PDF text extraction
│   │   ├── email-parser.mjs        # Email parsing
│   │   ├── feishu-parser.mjs       # Feishu JSON/API parsing
│   │   ├── image-parser.mjs        # Vision API for images
│   │   ├── markdown-parser.mjs     # Markdown parsing
│   │   └── text-parser.mjs         # Text normalization
│   ├── content-merger.mjs          # Merges parsed uploads
│   ├── arxiv-search.mjs            # Existing
│   ├── puppeteer-search.mjs        # Existing
│   ├── paper-analysis.mjs          # Existing
│   └── skill-generator.mjs         # Modified to call upload scanner
│
├── prompts/                         # Existing prompts (updated)
├── tests/
│   ├── unit/
│   ├── fixtures/
│   └── integration/
│
└── docs/superpowers/specs/         # This document
```

---

## 3. Core Components

### 3.1 Upload Scanner (`upload-scanner.mjs`)

**Purpose:** Detect, categorize, and queue uploaded files for processing

**Interface:**
```javascript
async function scanUploads(uploadsDir) {
  // Returns:
  // {
  //   pdfs: [{path, size, timestamp}],
  //   emails: [{path, size, timestamp}],
  //   feishu: [{path, type, size, timestamp}],
  //   images: [{path, size, timestamp}],
  //   markdown: [{path, size, timestamp}],
  //   text: [{path, size, timestamp}]
  // }
}
```

**Responsibilities:**
- Scan `uploads/` directory recursively
- Categorize files by type (extension-based)
- Check against `.processed_manifest.json` to skip already-processed files
- Return manifest of new files to process

### 3.2 Format-Specific Parsers

Each parser follows a consistent interface:

```javascript
async function parse(filePath, options) {
  // Returns:
  // {
  //   success: boolean,
  //   content: string,           // Extracted text/content
  //   metadata: {},              // Format-specific metadata
  //   confidence: number,        // 0-1 quality score
  //   errors: string[]           // Any warnings/errors
  // }
}
```

**Parser Specifications:**

| Parser | Input | Output | Dependencies |
|--------|-------|--------|--------------|
| `pdf-parser.mjs` | `.pdf` files | Text content, page count, title, author | `pdf-parse` |
| `email-parser.mjs` | `.eml`, `.mbox` | Subject, sender, recipients, body, date, thread structure | `mailparser` |
| `feishu-parser.mjs` | JSON exports, API data | Messages, documents, metadata | Native JS |
| `image-parser.mjs` | `.png`, `.jpg`, `.jpeg` | OCR text, visual description, context | Claude Vision API |
| `markdown-parser.mjs` | `.md` files | Structured sections, headings, code blocks | `marked` |
| `text-parser.mjs` | `.txt` files | Cleaned, normalized text | Native JS |

### 3.3 Content Merger (`content-merger.mjs`)

**Purpose:** Combine parsed uploads into unified data structure for AI analysis

**Responsibilities:**
- Take parsed outputs from all parsers
- Merge into structured format compatible with existing analysis pipeline
- Calculate aggregate quality score
- Handle conflicts (e.g., duplicate content)
- Generate source attribution map

**Output Structure:**
```javascript
{
  sources: {
    arxivPapers: [...],       // Existing
    webSearch: [...],         // Existing
    uploads: {                // NEW
      pdfs: [{content, metadata, confidence, sourceFile}],
      emails: [{content, metadata, confidence, sourceFile}],
      feishu: [{content, metadata, confidence, sourceFile}],
      images: [{content, metadata, confidence, sourceFile}],
      markdown: [{content, metadata, confidence, sourceFile}],
      text: [{content, metadata, confidence, sourceFile}]
    }
  },
  qualityMetrics: {
    uploadCount: number,
    totalConfidence: number,
    sourceDiversity: number
  }
}
```

### 3.4 Modified Skill Generator

**Changes to `skill-generator.mjs`:**
1. Call `upload-scanner.mjs` at startup
2. If uploads found, run parsers
3. Call `content-merger.mjs` to combine results
4. Pass merged data to existing `paper-analysis.mjs` and public info analysis
5. Update prompts to include upload sources in analysis

---

## 4. Data Flow

### 4.1 User Journey

1. **Preparation:** User copies files to appropriate `uploads/` subdirectories
2. **Execution:** User runs `skill-generator.mjs` command
3. **Scanning:** Upload scanner detects and categorizes files
4. **Parsing:** Each file type processed by its parser
5. **Merging:** Content merger combines all parsed data
6. **Analysis:** AI analyzes all sources together (papers + web + uploads)
7. **Generation:** Mentor skill generated with comprehensive data
8. **Reporting:** Quality report provided to user

### 4.2 Processing Manifest

The `.processed_manifest.json` file tracks what's been processed:

```json
{
  "lastProcessed": "2025-04-05T10:30:00Z",
  "files": {
    "lecture_notes.pdf": {
      "hash": "sha256:abc123...",
      "processedAt": "2025-04-05T10:28:00Z",
      "status": "success",
      "parser": "pdf-parser"
    }
  }
}
```

---

## 5. File Type Specifications

### 5.1 PDF Documents

- **Formats:** `.pdf` files (all versions)
- **Extraction:** Text content, metadata (title, author, pages), structure
- **Error handling:** Password-protected, corrupted files
- **Library:** `pdf-parse`

### 5.2 Email Files

- **Formats:** `.eml`, `.mbox`
- **Extraction:** Headers, body, thread structure, attachments
- **Privacy:** Redact email addresses by default
- **Library:** `mailparser`

### 5.3 Feishu Data

- **Manual upload:** JSON/Markdown exports
- **API integration:** Feishu Open API (basic support in Phase 3, full in Phase 5)
- **Extraction:** Messages, documents, metadata, comments

### 5.4 Images

- **Formats:** `.png`, `.jpg`, `.jpeg`, `.gif`, `.webp`
- **Extraction:** OCR text, diagram descriptions, context
- **API:** Claude Vision API with rate limiting
- **Cost control:** `--skip-images` flag available

### 5.5 Markdown

- **Formats:** `.md` files (CommonMark, GitHub Flavored)
- **Extraction:** Structured content, headings, code blocks, metadata
- **Library:** `marked`

### 5.6 Text Files

- **Formats:** `.txt`, `.text`
- **Extraction:** Cleaned, normalized text
- **Features:** Encoding detection, conversion

---

## 6. Error Handling

### 6.1 Parser-Level Errors

Each parser returns consistent error responses:
```javascript
{
  success: false,
  content: "",
  metadata: {},
  confidence: 0,
  errors: ["Error message", "Partial extraction: 3/5 pages"]
}
```

### 6.2 Error Categories

| Error Type | Action | Example |
|------------|--------|---------|
| File not found | Skip, log warning | User deleted file |
| Invalid format | Skip, log error | Wrong file extension |
| Corrupted data | Extract what's possible | Damaged PDF |
| API failure | Retry, then skip | Vision API rate limit |
| Timeout | Skip with timeout error | Large file processing |

### 6.3 Graceful Degradation

- Never let one bad file break the entire pipeline
- Log all errors with context
- Continue processing other files
- Report summary: "Processed 6/7 files successfully"

### 6.4 User Communication

Provide clear progress reporting and error summaries:
```bash
[Upload Scanner] Found 7 files to process...
[PDF Parser] ✓ lecture_notes.pdf (15 pages, 42KB)
[Email Parser] ✓ correspondence.eml (47 emails, 128KB)
[Email Parser] ⚠ discussions.mbox (3 emails failed to parse)
✓ Processed 6/7 files successfully
```

---

## 7. Quality Assessment

### 7.1 Multi-Dimensional Quality Scoring

Each source scored on:
- **Confidence:** Parser extraction quality (0-1)
- **Authoritativeness:** Source credibility (0-1)
- **Uniqueness:** Unique information value (0-1)
- **Recency:** How recent the data is (0-1)
- **Richness:** Content density (0-1)

### 7.2 Source Weightings

| Source Type | Authoritativeness | Uniqueness | Recency | Richness | Weight |
|-------------|-------------------|------------|---------|----------|--------|
| ArXiv papers | 0.9 | 0.8 | 0.7 | 0.9 | High |
| Upload PDFs | 0.7 | 0.9 | 0.8 | 0.8 | Medium-High |
| Upload emails | 0.6 | 0.95 | 0.9 | 0.7 | Medium-High |
| Feishu messages | 0.5 | 0.9 | 0.95 | 0.6 | Medium |
| Upload images | 0.4 | 0.7 | 0.8 | 0.5 | Low-Medium |
| Web search | 0.5 | 0.6 | 0.9 | 0.5 | Medium |

### 7.3 Quality Reports

Users receive detailed quality feedback:
```bash
[Quality Assessment]
Overall Profile Quality: HIGH (0.87)

Strengths:
✓ Strong paper collection (15 papers, high citation count)
✓ Excellent email coverage (47 threads, shows communication style)
✓ Recent materials (average age: 2.3 years)

Suggestions for improvement:
→ Add 2-3 more recent papers (last 6 months)
→ Include lecture videos or slides for teaching style
```

---

## 8. Testing Strategy

### 8.1 Test Structure

```
tests/
├── unit/
│   ├── parsers/              # Tests for each parser
│   ├── test-upload-scanner.js
│   └── test-content-merger.js
├── fixtures/
│   ├── pdfs/                 # Test PDF files
│   ├── emails/               # Test email files
│   ├── feishu/               # Test Feishu data
│   ├── images/               # Test images
│   ├── markdown/             # Test Markdown files
│   └── text/                 # Test text files
└── integration/
    ├── test-full-pipeline.js
    └── test-error-recovery.js
```

### 8.2 Test Coverage Goals

- Each parser: >90% code coverage
- Include: happy path, error cases, edge cases
- Mock external APIs (Vision API, Feishu API)
- Integration tests for full pipeline
- Performance tests for large files

### 8.3 Manual Testing Scenarios

| Scenario | Files | Expected Result |
|----------|-------|-----------------|
| Empty uploads | No files | Proceed with web search only |
| Single file | 1 PDF | Process + merge with web data |
| Mixed types | 1 of each type | All processed, merged |
| Duplicate content | Same content in PDF + MD | Deduplicated |
| Corrupted file | 1 bad + 5 good | 5 succeed, 1 fails gracefully |

---

## 9. Implementation Phases

### Phase 1: Foundation (Week 1)

**Goal:** Core infrastructure and simple parsers

**Tasks:**
1. Create directory structure
2. Implement `upload-scanner.mjs`
3. Implement `text-parser.mjs`
4. Implement `markdown-parser.mjs`
5. Basic `content-merger.mjs`
6. Update `skill-generator.mjs`
7. Unit tests
8. Integration test

**Deliverables:**
- Upload scanner detects files
- Text and markdown files parse correctly
- Merged data passes to analysis pipeline

### Phase 2: Document Parsers (Week 2)

**Goal:** Add PDF and email support

**Tasks:**
1. Implement `pdf-parser.mjs`
2. Implement `email-parser.mjs`
3. Add PDF extraction
4. Add email parsing
5. Enhance content merger
6. Error handling
7. Performance optimization
8. Tests and fixtures

**Deliverables:**
- PDF text extraction working
- Email thread reconstruction
- Graceful error handling

### Phase 3: Image & Feishu (Week 3)

**Goal:** Add Vision API and Feishu support

**Tasks:**
1. Implement `image-parser.mjs` with Vision API
2. Implement `feishu-parser.mjs` for JSON
3. Basic Feishu API integration
4. Rate limiting
5. Enhanced merger
6. Tests and mocks

**Deliverables:**
- Images processed with Vision API
- Feishu JSON exports parsed
- Basic Feishu API integration

### Phase 4: Quality & Polish (Week 4)

**Goal:** Production-ready quality

**Tasks:**
1. Quality assessment system
2. Update AI prompts
3. Comprehensive error handling
4. Performance optimization
5. Documentation
6. Full test suite
7. Bug fixes

**Deliverables:**
- Complete test coverage
- Comprehensive documentation
- Quality reports working
- Performance optimized

### Phase 5: Advanced Features (Optional, Week 5+)

**Goal:** Power-user features

**Tasks:**
1. Incremental updates
2. Advanced Feishu features
3. Enhanced UX
4. Export/import tools

---

## 10. Dependencies

### 10.1 New npm Packages

```json
{
  "dependencies": {
    "pdf-parse": "^1.1.1",
    "mailparser": "^3.6.0",
    "marked": "^9.0.0"
  }
}
```

### 10.2 External APIs

- **Claude Vision API:** For image/screenshot analysis
- **Feishu Open API:** For automatic data retrieval (optional)

### 10.3 Existing Dependencies

- `puppeteer`: Already in use for web search
- Existing AI APIs (Anthropic/OpenAI): Already in use

---

## 11. Success Criteria

### 11.1 Functional Requirements

- ✅ All six file types (PDF, email, Feishu, images, Markdown, text) parse correctly
- ✅ Parsed data integrates with existing analysis pipeline
- ✅ Quality assessment provides actionable feedback
- ✅ Error handling is robust and user-friendly
- ✅ Performance is acceptable (< 2 min for typical use)

### 11.2 Quality Requirements

- ✅ >90% test coverage for new code
- ✅ Zero critical bugs in production
- ✅ Clear documentation for all features
- ✅ Backward compatibility maintained

### 11.3 User Experience Requirements

- ✅ Simple drop-and-go workflow
- ✅ Clear progress feedback
- ✅ Helpful error messages
- ✅ Comprehensive quality reports

---

## 12. Risks and Mitigations

### 12.1 Technical Risks

| Risk | Impact | Mitigation |
|------|--------|------------|
| Vision API rate limits | Medium | Implement batching, provide skip flag |
| Feishu API changes | Medium | Version-specific clients, fallback to manual |
| Large file performance | Medium | Streaming processing, size limits |
| Memory leaks | Low | Performance testing, monitoring |

### 12.2 User Experience Risks

| Risk | Impact | Mitigation |
|------|--------|------------|
| Confusing directory structure | Medium | Clear documentation, examples |
| Poor quality uploads | Low | Quality feedback, recommendations |
| Cost concerns (Vision API) | Low | Cost tracking, skip option |

### 12.3 Project Risks

| Risk | Impact | Mitigation |
|------|--------|------------|
| Scope creep | Medium | Phased implementation, clear priorities |
| Delayed dependencies | Low | Mock external APIs for testing |
| Breaking changes | Low | Comprehensive testing, backward compat checks |

---

## 13. Documentation Requirements

### 13.1 User Documentation

1. **UPLOAD_GUIDE.md:** How to use upload features
   - Directory structure explanation
   - Supported file types
   - Examples for each type
   - Troubleshooting

2. **Updated README.md:** Add upload section
   - Feature overview
   - Quick start examples
   - Link to UPLOAD_GUIDE.md

3. **Updated QUICKSTART.md:** Include uploads in examples

### 13.2 Developer Documentation

1. **PARSER_API.md:** Parser interface specification
2. **TESTING.md:** How to run and write tests
3. **ARCHITECTURE.md:** System architecture overview

### 13.3 Examples

Create example files for each type in `examples/uploads/`:
- `examples/uploads/pdfs/sample.pdf`
- `examples/uploads/emails/sample.eml`
- `examples/uploads/feishu/json/sample.json`
- `examples/uploads/images/sample.png`
- `examples/uploads/markdown/sample.md`
- `examples/uploads/text/sample.txt`

---

## 14. Future Enhancements

### 14.1 Potential Features

1. **Real-time sync:** Continuous monitoring of uploads directory
2. **Web UI:** Browser-based upload interface
3. **Video/audio:** Transcription and analysis
4. **Advanced Feishu:** Webhook support, real-time updates
5. **Batch processing:** Process multiple mentors at once
6. **Export/import:** Share upload configurations

### 14.2 Extensibility Points

1. **New file types:** Easy to add new parsers
2. **New data sources:** Plugin system for external APIs
3. **Custom quality metrics:** User-defined scoring
4. **Alternative AI models:** Support for other vision models

---

## 15. Conclusion

This design provides a comprehensive, user-friendly system for multi-channel data uploads in the distill-mentor project. The phased implementation ensures incremental value delivery while maintaining quality and manageability.

**Key strengths:**
- Simple user experience (drop-and-go)
- Comprehensive file type support
- Robust error handling
- Quality-aware analysis
- Extensible architecture
- Backward compatible

**Next steps:**
1. Review and approve this design document
2. Begin Phase 1 implementation
3. Set up continuous integration
4. Create initial documentation
5. Start with foundation components

---

**Document Version:** 1.0
**Last Updated:** 2025-04-05
**Status:** Ready for Implementation
