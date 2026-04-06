# Workspace System Documentation

## Overview

The workspace system provides a complete, organized directory structure for each mentor, containing all related content including:
- Original uploaded materials
- Processed and parsed content
- Web-scraped sources (ArXiv papers, web search results)
- Analysis results
- Final generated skill files

## Workspace Structure

Each mentor gets an auto-allocated workspace at:
```
~/.claude/mentors-workspace/{mentor_name}/
```

### Directory Layout

```
~/.claude/mentors-workspace/{mentor_name}/
├── workspace.json              # Workspace metadata and statistics
├── uploads/                    # Original uploaded files
│   ├── raw/                   # Raw uploaded files
│   └── temp/                  # Temporary files during processing
├── processed/                  # Processed/parsed content
│   ├── texts/                 # Parsed text content
│   ├── markdown/              # Parsed markdown content
│   ├── pdfs/                  # Parsed PDF content
│   ├── emails/                # Parsed email content
│   ├── images/                # Parsed image metadata
│   └── feishu/                # Parsed Feishu content
├── sources/                    # Web-scraped sources
│   ├── arxiv/                 # ArXiv papers
│   │   └── papers.json
│   └── web/                   # Web search results
│       └── results.json
├── analysis/                   # Analysis results
│   ├── papers/                # Paper analysis
│   └── reviews/               # Content reviews
├── skill/                      # Final generated skill
└── logs/                       # Log files
```

## Usage

### Basic Usage

Generate a mentor skill with auto-allocated workspace:
```bash
node tools/skill-generator.mjs "Geoffrey Hinton" --affiliation "University of Toronto"
```

This will:
1. Create workspace at `~/.claude/mentors-workspace/Geoffrey_Hinton/`
2. Search ArXiv and web for papers
3. Save sources to workspace
4. Generate skill file

### Single File Upload

Upload a single file to the workspace:
```bash
node tools/skill-generator.mjs "Geoffrey Hinton" --upload paper.pdf
```

This will:
1. Upload the file to `uploads/raw/`
2. Parse the file based on its type
3. Save processed content to `processed/{type}/`
4. Update workspace statistics
5. Generate skill with the new content

### Incremental Mode

Upload a file without regenerating the entire skill:
```bash
node tools/skill-generator.mjs "Geoffrey Hinton" --upload notes.txt --incremental
```

This will:
1. Upload and process the file
2. Save to workspace
3. **Skip** ArXiv/web search
4. **Skip** skill generation

Use this to add materials incrementally, then run without `--incremental` to regenerate.

### Complete Workflow

```bash
# 1. Create workspace with initial materials
node tools/skill-generator.mjs "Yann LeCun" --affiliation "New York University"

# 2. Add more materials incrementally
node tools/skill-generator.mjs "Yann LeCun" --upload lecture_notes.txt --incremental
node tools/skill-generator.mjs "Yann LeCun" --upload interview.pdf --incremental

# 3. Regenerate skill with all materials
node tools/skill-generator.mjs "Yann LeCun" --affiliation "New York University"
```

## Workspace Metadata

The `workspace.json` file contains:
```json
{
  "name": "Geoffrey Hinton",
  "slug": "Geoffrey_Hinton",
  "created_at": "2026-04-06T12:00:00.000Z",
  "updated_at": "2026-04-06T12:35:45.825Z",
  "version": "1.0",
  "statistics": {
    "uploads_count": 5,
    "processed_count": 5,
    "sources_count": 20,
    "last_analysis": null
  }
}
```

## Processed Content Format

Each processed file is saved as JSON with metadata:
```json
{
  "original_file": "research_notes.txt",
  "original_path": "/path/to/workspace/uploads/raw/research_notes.txt",
  "processed_at": "2026-04-06T12:35:45.826Z",
  "success": true,
  "content": "File content here...",
  "metadata": {
    "encoding": "utf-8",
    "lines": 10,
    "words": 150,
    "characters": 1200
  },
  "confidence": 0.95,
  "errors": []
}
```

## Supported File Types

| Type | Extensions | Target Directory |
|------|-----------|------------------|
| Text | .txt, .text | processed/texts/ |
| Markdown | .md | processed/markdown/ |
| PDF | .pdf | processed/pdfs/ |
| Email | .eml, .mbox | processed/emails/ |
| Images | .png, .jpg, .jpeg, .gif, .webp | processed/images/ |
| Feishu | .json | processed/feishu/ |

## Key Features

### Automatic Workspace Creation
Workspaces are created automatically when you first run the skill generator for a mentor.

### Incremental Uploads
Add materials one at a time without regenerating everything.

### Content Integration
Uploaded materials are automatically integrated into the generated skill, providing AI with additional context.

### Workspace Isolation
Each mentor has their own workspace with complete isolation from others.

### Statistics Tracking
Track uploads, processed files, and sources via workspace metadata.

## Benefits

1. **Organization**: All mentor-related content in one place
2. **Incremental Updates**: Add materials without full regeneration
3. **Transparency**: See exactly what content is used for skill generation
4. **Reproducibility**: Workspace contains everything needed to recreate the skill
5. **Flexibility**: Upload files individually or in batches

## Examples

### Example 1: Single Mentor with Multiple Files

```bash
# Create workspace
node tools/skill-generator.mjs "Fei-Fei Li" --affiliation "Stanford University"

# Add CV incrementally
node tools/skill-generator.mjs "Fei-Fei Li" --upload cv.pdf --incremental

# Add research statement
node tools/skill-generator.mjs "Fei-Fei Li" --upload research_statement.txt --incremental

# Add lecture notes
node tools/skill-generator.mjs "Fei-Fei Li" --upload lecture_notes.md --incremental

# Regenerate with all materials
node tools/skill-generator.mjs "Fei-Fei Li" --affiliation "Stanford University"
```

### Example 2: Quick Upload and Generate

```bash
# Upload and generate in one command
node tools/skill-generator.mjs "Andrew Ng" --upload deep_learning_notes.txt
```

### Example 3: Batch Upload

```bash
# Upload multiple files
for file in materials/*.txt; do
  node tools/skill-generator.mjs "Yann LeCun" --upload "$file" --incremental
done

# Generate final skill
node tools/skill-generator.mjs "Yann LeCun" --affiliation "New York University"
```

## Verification

Check workspace contents:
```bash
# List all files in workspace
find ~/.claude/mentors-workspace/{mentor_name} -type f

# View workspace metadata
cat ~/.claude/mentors-workspace/{mentor_name}/workspace.json

# Check processed content
ls -la ~/.claude/mentors-workspace/{mentor_name}/processed/
```

## Troubleshooting

### Issue: Files not being processed
**Solution**: Check file extensions match supported types. Ensure files meet minimum content requirements (e.g., 100 characters for text files).

### Issue: Incremental mode not working
**Solution**: Ensure you're using the same mentor name. Workspaces are mentor-specific.

### Issue: Old content still appearing
**Solution**: The workspace accumulates content. To start fresh, delete the workspace directory:
```bash
rm -rf ~/.claude/mentors-workspace/{mentor_name}
```

## Migration from Old System

If you were using the old `~/.claude/uploads/` system:

1. Old uploads are **not** automatically migrated
2. Each mentor now has their own workspace
3. Re-upload materials to the new workspace system

The new system provides better organization and isolation between mentors.

## API Integration

The workspace system is fully integrated with the skill generator:

```javascript
import {
  createWorkspace,
  getWorkspacePath,
  addUpload,
  saveProcessedContent,
  saveArxivPapers,
  saveWebResults,
  getWorkspaceMetadata
} from './workspace-manager.mjs';
```

These functions are used internally by `skill-generator.mjs` to manage all workspace operations.
