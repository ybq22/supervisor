# 多渠道上传系统 - 试用示例流程

## 📝 完整试用流程

本指南将带您完成一次完整的上传流程，使用示例材料测试所有6个上传渠道。

---

## 步骤 1: 准备示例文件

让我们创建一些示例文件来测试上传系统。

### 1.1 创建文本文件

```bash
# 创建文本文件
mkdir -p ~/.claude/uploads/text

cat > ~/.claude/uploads/text/sample.txt << 'EOF'
Research Summary: Deep Learning in Computer Vision

This document summarizes the key contributions to deep learning in computer vision over the past decade.

Major Breakthroughs:
1. Convolutional Neural Networks (CNNs) - Revolutionized image classification
2. ResNet architecture - Enabled training of very deep networks
3. Attention mechanisms - Improved model interpretability
4. Vision Transformers - Applied transformer architecture to vision tasks

Key Papers:
- "AlexNet" (2012) - Started the deep learning boom
- "VGG Net" (2014) - Demonstrated the power of depth
- "ResNet" (2015) - Residual connections for deep networks
- "Attention Is All You Need" (2017) - Transformer architecture

Current Trends:
- Self-supervised learning
- Multi-modal learning
- Efficient model architectures
- Foundation models for vision

This text file demonstrates the text upload capability of the system.
EOF

echo "✅ 文本文件创建成功: ~/.claude/uploads/text/sample.txt"
```

### 1.2 创建Markdown文件

```bash
# 创建Markdown文件
mkdir -p ~/.claude/uploads/markdown

cat > ~/.claude/uploads/markdown/research_notes.md << 'EOF'
---
title: "Advanced Research Methodologies"
author: "Research Team"
date: "2024-01-15"
tags: [research, methodology, AI]
---

# Advanced Research Methodologies in AI

## Introduction

This document outlines best practices for conducting AI research in academic settings.

## Key Principles

### 1. Rigorous Experimentation
- Always use proper baselines
- Conduct ablation studies
- Report statistical significance

### 2. Reproducibility
- Share code and datasets
- Document experimental setup
- Use version control

### 3. Ethical Considerations
- Consider bias in datasets
- Address potential misuse
- Ensure transparent reporting

## Common Methodologies

### Experimental Design
1. Define clear hypotheses
2. Choose appropriate metrics
3. Control for confounding variables
4. Use cross-validation

### Data Collection
- Ensure data quality
- Document data sources
- Handle missing values appropriately
- Respect privacy regulations

```python
# Example: Cross-validation code
from sklearn.model_selection import cross_val_score

scores = cross_val_score(model, X, y, cv=5)
print(f"Mean accuracy: {scores.mean():.2f} (+/- {scores.std() * 2:.2f})")
```

## Conclusion

Following these methodologies ensures robust and reproducible research outcomes.
EOF

echo "✅ Markdown文件创建成功: ~/.claude/uploads/markdown/research_notes.md"
```

### 1.3 创建PDF文件（需要实际PDF）

```bash
# 创建PDF文件目录
mkdir -p ~/.claude/uploads/pdfs

# 注意：这里我们创建一个简单的文本文件作为PDF的替代
# 实际使用时，您应该放置真实的PDF文件

cat > ~/.claude/uploads/pdfs/paper_summary.txt << 'EOF'
[PDF Placeholder: Research Paper Summary]

Title: "Deep Learning for Computer Vision: A Comprehensive Review"
Authors: Zhang et al.
Year: 2023
Pages: 15

Abstract:
This paper provides a comprehensive review of deep learning techniques in computer vision.
We cover architectures from early CNNs to modern vision transformers.

Key Contributions:
1. Systematic comparison of CNN architectures
2. Analysis of attention mechanisms in vision models
3. Discussion of future research directions

Main Findings:
- ResNet architectures remain competitive
- Vision Transformers show promising results
- Multi-modal approaches are gaining traction

Note: This is a placeholder. In production, place actual PDF files here.
EOF

echo "✅ PDF目录创建成功: ~/.claude/uploads/pdfs/"
echo "⚠️  注意: 请将实际的PDF文件放到此目录"
```

### 1.4 创建示例邮件

```bash
# 创建邮件文件
mkdir -p ~/.claude/uploads/emails

cat > ~/.claude/uploads/emails/collaboration.eml << 'EOF'
From: professor@university.edu
To: researcher@lab.org
Subject: Re: Research Collaboration Proposal
Date: Mon, 15 Jan 2024 10:30:00 +0000
Message-ID: <collab-2024-01-15@university.edu>

Dear Colleague,

Thank you for your interest in our research collaboration.

Regarding your proposal on "Multi-modal Learning in Computer Vision":

1. Research Scope
   - We are excited about the potential collaboration
   - Our lab has extensive experience in vision-language models
   - We can provide computational resources and datasets

2. Timeline
   - Q1 2024: Literature review and experimental design
   - Q2 2024: Data collection and preprocessing
   - Q3 2024: Model development and training
   - Q4 2024: Evaluation and paper writing

3. Next Steps
   - Schedule a video call to discuss details
   - Prepare a formal research proposal
   - Identify key milestones and deliverables

Please let us know your availability for a meeting next week.

Best regards,
Prof. Smith
Department of Computer Science
University of Technology

---
This email contains confidential information intended solely for the addressee.
EOF

echo "✅ 邮件文件创建成功: ~/.claude/uploads/emails/collaboration.eml"
```

### 1.5 创建示例图片（测试用）

```bash
# 创建图片文件目录
mkdir -p ~/.claude/uploads/images

# 创建一个简单的PNG文件（最小化PNG头部）
printf '\x89PNG\r\n\x1a\n\x00\x00\x00\rIHDR\x00\x00\x00\x01\x00\x00\x00\x01\x08\x02\x00\x00\x00\x90wS\xde\x00\x00\x00\x0cIDATx\x9cc\xf8\xcf\xc0\x00\x00\x00\x03\x00\x01\x00\x00\x00\x00IEND\xaeB`\x82' > ~/.claude/uploads/images/test.png

echo "✅ 图片文件创建成功: ~/.claude/uploads/images/test.png"
echo "⚠️  注意: 这是一个测试图片，实际使用时请放置真实的截图或图片"
```

### 1.6 创建飞书导出示例

```bash
# 创建飞书导出文件
mkdir -p ~/.claude/uploads/feishu

cat > ~/.claude/uploads/feishu/meeting_notes.json << 'EOF'
{
  "title": "AI Research Group Meeting - Weekly Sync",
  "content": "# Weekly Research Sync Meeting\n\n## Date: 2024-01-15\n\n## Attendees\n- Dr. Zhang (PI)\n- PhD Students: Alice, Bob, Charlie\n\n## Agenda\n\n### 1. Progress Updates\n\n**Alice:** Working on vision transformer architecture\n- Achieved 85% accuracy on ImageNet subset\n- Planning to explore attention visualization\n\n**Bob:** Investigating self-supervised learning\n- Implemented SimCLR framework\n- Preliminary results show promise\n\n### 2. Paper Discussion\n\nDiscussed recent paper: \"Attention Is All You Need\"\n- Key insight: Transformer architecture for vision\n- Potential application to our current project\n\n### 3. Action Items\n\n- [ ] Alice to prepare experimental results by Friday\n- [ ] Bob to set up self-supervised learning pipeline\n- [ ] Charlie to review related literature\n\n### 4. Next Meeting\n\n**Time:** Next Monday, 10:00 AM\n**Location:** Room 305, Research Building\n\n---\n\n*Meeting notes generated from Feishu export*",
  "creator": "Dr. Zhang",
  "created_at": "2024-01-15T10:00:00Z",
  "comments": [
    {
      "author": "Alice",
      "text": "Great progress on the transformer implementation!",
      "timestamp": "2024-01-15T10:30:00Z"
    },
    {
      "author": "Bob",
      "text": "Looking forward to the self-supervised learning experiments.",
      "timestamp": "2024-01-15T10:35:00Z"
    }
  ]
}
EOF

echo "✅ 飞书导出文件创建成功: ~/.claude/uploads/feishu/meeting_notes.json"
```

---

## 步骤 2: 验证文件结构

```bash
# 查看上传目录结构
echo "📁 上传目录结构:"
ls -la ~/.claude/uploads/

echo -e "\n📊 文件统计:"
echo "文本文件: $(ls ~/.claude/uploads/text/ 2>/dev/null | wc -l)"
echo "Markdown文件: $(ls ~/.claude/uploads/markdown/ 2>/dev/null | wc -l)"
echo "PDF文件: $(ls ~/.claude/uploads/pdfs/ 2>/dev/null | wc -l)"
echo "邮件文件: $(ls ~/.claude/uploads/emails/ 2>/dev/null | wc -l)"
echo "图片文件: $(ls ~/.claude/uploads/images/ 2>/dev/null | wc -l)"
echo "飞书文件: $(ls ~/.claude/uploads/feishu/ 2>/dev/null | wc -l)"
```

---

## 步骤 3: 运行技能生成器

```bash
# 确保在正确的目录
cd /Users/yuebaoqing/Desktop/projects/distill-human/supervisor

# 运行技能生成器（使用示例导师）
node tools/skill-generator.mjs "Yann LeCun" --affiliation "New York University" --deep-analyze
```

### 预期输出示例

```
🎓 Starting mentor distillation: Yann LeCun

Step 0: Scanning uploads directory...
  ✓ Found 6 new upload(s) to process
  Processing 1 text file(s)...
    ✓ sample.txt (658 chars)
  Processing 1 markdown file(s)...
    ✓ research_notes.md (1245 chars, 4 headings)
  Processing 0 pdf file(s)...
  Processing 1 email file(s)...
    ✓ collaboration.eml (Research Collaboration Proposal)
  Processing 1 image file(s)...
    ✓ test.png (png, 1KB)
  Processing 1 feishu file(s)...
    ✓ meeting_notes.json (document, 1 items)
  ✓ Processed 6/6 files successfully

[Quality Assessment]
  Overall Quality: GOOD (78.5%)
  Uploads: 6 files
  Confidence: 91.3%
  Diversity: 83.3% (5/6 types)
  Content: 3,245 chars total (541 avg)
  Completeness: 85/100

[Suggestions]
  💡 Add PDF documents for better coverage (0 PDFs uploaded)
  ⚠️  Average content length is moderate. Provide more detailed materials for better analysis.

Step 1: Collecting information...
  ✓ Found 142 papers on ArXiv
  ✓ Found 8 websites

Step 2: Deep paper analysis...
  ✓ Deep analysis complete

Step 3: Building profile...
  ✓ Profile generated successfully

Step 4: Generating mentor skill...
  ✓ Skill generated successfully

🎉 Mentor skill generated successfully!

📁 Output files:
  - Profile: ~/.claude/mentors/YannLeCun.json
  - Skill:   ~/.claude/skills/YannLeCun/SKILL.md
```

---

## 步骤 4: 查看生成的结果

```bash
# 查看生成的技能文件
echo "📄 生成的技能文件:"
cat ~/.claude/skills/YannLeCun/SKILL.md | head -50

# 查看配置文件
echo -e "\n⚙️  导师配置:"
cat ~/.claude/mentors/YannLeCun.json | jq '.'
```

---

## 步骤 5: 清理（可选）

如果需要重新测试，可以清理已处理的文件清单：

```bash
# 删除处理清单，强制重新处理所有文件
rm ~/.claude/uploads/processed/.processed_manifest.json

# 或者清理所有上传文件
rm -rf ~/.claude/uploads/*
```

---

## 🔍 故障排除

### 问题1: 文件未被检测

**症状:** 运行后显示 "Found 0 new upload(s)"

**解决方案:**
```bash
# 检查文件是否在正确的子目录
ls -la ~/.claude/uploads/text/
ls -la ~/.claude/uploads/markdown/
# 等等...

# 确保文件扩展名正确
file ~/.claude/uploads/text/*
```

### 问题2: 解析失败

**症状:** 显示 "✗ filename: error message"

**解决方案:**
```bash
# 手动测试单个文件
node -e "import('./tools/parsers/text-parser.mjs').then(m => m.parseText('~/.claude/uploads/text/sample.txt').then(console.log))"
```

### 问题3: 权限问题

**症状:** "Permission denied" 错误

**解决方案:**
```bash
# 检查目录权限
ls -la ~/.claude/

# 确保有写入权限
chmod -R 755 ~/.claude/uploads/
```

---

## 📊 质量评估说明

### 质量等级

- **EXCELLENT (90-100%):** 所有指标优秀，材料丰富多样
- **GOOD (75-89%):** 大部分指标良好，有改进空间
- **FAIR (60-74%):** 基本达标，建议添加更多材料
- **LIMITED (40-59%):** 材料有限，影响分析质量
- **POOR (0-39%):** 材料不足，无法进行有效分析

### 指标说明

1. **Confidence (置信度):** 所有文件的平均解析质量
2. **Diversity (多样性):** 使用的上传类型数量 (0-6)
3. **Content Density (内容密度):** 平均内容长度
4. **Balance (平衡性):** 各类型文件的分布均匀度
5. **Completeness (完整性):** 综合评分 (0-100)

---

## ✅ 成功标志

如果看到以下输出，说明上传系统工作正常：

```
✓ Processed N/N files successfully
[Quality Assessment]
  Overall Quality: GOOD/EXCELLENT
```

祝您使用愉快！🎉
