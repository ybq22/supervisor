# Workspace System - Quick Start Guide

## What is the Workspace System?

Each mentor now gets their **own dedicated workspace** that contains:
- ✅ Original files you upload
- ✅ Processed content (parsed and analyzed)
- ✅ ArXiv papers and web search results
- ✅ Final generated skill files

**Everything in one place, fully organized!**

## 30-Second Quick Start

### 1. Basic Usage (No Uploads)
```bash
node tools/skill-generator.mjs "Geoffrey Hinton" --affiliation "University of Toronto"
```

### 2. Upload a File
```bash
node tools/skill-generator.mjs "Geoffrey Hinton" --upload my_paper.pdf
```

### 3. Add More Files (Incremental)
```bash
node tools/skill-generator.mjs "Geoffrey Hinton" --upload notes.txt --incremental
```

### 4. Generate Final Skill
```bash
node tools/skill-generator.mjs "Geoffrey Hinton"
```

## Complete Example Workflow

```bash
# Step 1: Create workspace and generate initial skill
node tools/skill-generator.mjs "Yann LeCun" --affiliation "New York University"

# Step 2: Add CV (incremental - doesn't regenerate skill)
node tools/skill-generator.mjs "Yann LeCun" --upload cv.pdf --incremental

# Step 3: Add research notes (incremental)
node tools/skill-generator.mjs "Yann LeCun" --upload research.txt --incremental

# Step 4: Add lecture notes (incremental)
node tools/skill-generator.mjs "Yann LeCun" --upload lectures.md --incremental

# Step 5: Regenerate skill with all materials
node tools/skill-generator.mjs "Yann LeCun" --affiliation "New York University"
```

## Where is My Workspace?

Your workspace is at:
```
~/.claude/mentors-workspace/{mentor_name}/
```

For example:
```bash
~/.claude/mentors-workspace/Yann_LeCun/
├── workspace.json              # Metadata
├── uploads/raw/               # Your original files
├── processed/                 # Parsed content
├── sources/                   # ArXiv papers, web results
└── skill/                     # Final skill
```

## Key Parameters

| Parameter | Purpose | Example |
|-----------|---------|---------|
| `--upload <file>` | Upload a single file | `--upload paper.pdf` |
| `--incremental` | Only upload, skip generation | Use with `--upload` |
| `--affiliation` | Specify institution | `--affiliation "Stanford"` |
| `--deep-analyze` | Deep paper analysis | Add flag for detailed analysis |

## Real-World Examples

### Example 1: Creating a Complete Mentor Profile

```bash
# Start with basic info
node tools/skill-generator.mjs "Fei-Fei Li" --affiliation "Stanford University"

# Add CV
node tools/skill-generator.mjs "Fei-Fei Li" --upload feifei_cv.pdf --incremental

# Add research statement
node tools/skill-generator.mjs "Fei-Fei Li" --upload research_statement.txt --incremental

# Add interview notes
node tools/skill-generator.mjs "Fei-Fei Li" --upload interview_notes.md --incremental

# Regenerate with everything
node tools/skill-generator.mjs "Fei-Fei Li" --affiliation "Stanford University"
```

### Example 2: Quick Upload and Generate

```bash
# Upload and generate in one step
node tools/skill-generator.mjs "Andrew Ng" --upload deep_learning_specialization.txt
```

### Example 3: Batch Upload Multiple Files

```bash
# Upload all text files incrementally
for file in ~/research_notes/*.txt; do
  node tools/skill-generator.mjs "My Mentor" --upload "$file" --incremental
done

# Generate final skill
node tools/skill-generator.mjs "My Mentor"
```

## Supported File Types

- **Text**: `.txt`, `.text`
- **Markdown**: `.md`
- **PDF**: `.pdf`
- **Email**: `.eml`, `.mbox`
- **Images**: `.png`, `.jpg`, `.jpeg`, `.gif`, `.webp`
- **Feishu**: `.json`

## Checking Your Workspace

```bash
# See workspace structure
find ~/.claude/mentors-workspace/{mentor_name} -type f

# View workspace metadata
cat ~/.claude/mentors-workspace/{mentor_name}/workspace.json

# Check processed files
ls -la ~/.claude/mentors-workspace/{mentor_name}/processed/
```

## Common Use Cases

### Use Case 1: Building from Scratch

```bash
# 1. Start with name and affiliation
node tools/skill-generator.mjs "New Mentor" --affiliation "University"

# 2. Add materials as you find them
node tools/skill-generator.mjs "New Mentor" --upload paper1.pdf --incremental
node tools/skill-generator.mjs "New Mentor" --upload notes.txt --incremental

# 3. Final generation
node tools/skill-generator.mjs "New Mentor"
```

### Use Case 2: Adding to Existing Mentor

```bash
# Just add a new file to existing mentor
node tools/skill-generator.mjs "Existing Mentor" --upload new_file.pdf --incremental

# Regenerate to include new file
node tools/skill-generator.mjs "Existing Mentor"
```

### Use Case 3: Quick One-Shot Generation

```bash
# Generate with one file, no incremental
node tools/skill-generator.mjs "Quick Mentor" --upload notes.txt
```

## Benefits Over Old System

| Old System | New System |
|------------|------------|
| Global uploads for all mentors | Individual workspace per mentor |
| Manual file management | Automatic organization |
| No incremental updates | Incremental uploads supported |
| Mixed content | Complete isolation |
| Hard to track sources | Full provenance tracking |

## FAQ

**Q: Can I upload multiple files at once?**
A: Use a loop or script to upload files one by one with `--incremental`.

**Q: Do I need to specify the workspace path?**
A: No, workspaces are auto-allocated at `~/.claude/mentors-workspace/{mentor_name}/`.

**Q: What happens if I upload the same file twice?**
A: Files are copied to the workspace with unique names. No deduplication yet.

**Q: Can I delete files from the workspace?**
A: Yes, manually delete files from `uploads/raw/` and `processed/` directories.

**Q: How do I start completely fresh?**
A: Delete the entire workspace directory:
```bash
rm -rf ~/.claude/mentors-workspace/{mentor_name}
```

## Next Steps

1. Try the basic workflow with a test mentor
2. Upload different file types to see how they're processed
3. Check the workspace structure to understand organization
4. Read the full documentation: `WORKSPACE_SYSTEM.md`

## Getting Help

```bash
# See all options
node tools/skill-generator.mjs

# Check workspace contents
ls -la ~/.claude/mentors-workspace/{mentor_name}/

# View generated skill
cat ~/.claude/skills/{mentor_name}/SKILL.md
```
