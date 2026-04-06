#!/bin/bash
# 多渠道上传系统 - 快速试用脚本
# 此脚本将创建示例文件并演示上传系统的使用

set -e  # 遇到错误立即退出

echo "╔════════════════════════════════════════════════════════════╗"
echo "║                                                            ║"
echo "║     多渠道上传系统 - 快速试用脚本                          ║"
echo "║     Multi-Channel Upload System - Quick Demo               ║"
echo "║                                                            ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo ""

# 颜色定义
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 步骤1: 创建目录结构
echo -e "${BLUE}步骤 1: 创建上传目录结构${NC}"
mkdir -p ~/.claude/uploads/{text,markdown,pdfs,emails,images,feishu}
echo -e "${GREEN}✅ 目录创建完成${NC}"
echo ""

# 步骤2: 创建文本文件
echo -e "${BLUE}步骤 2: 创建示例文本文件${NC}"
cat > ~/.claude/uploads/text/sample.txt << 'EOF'
Research Summary: Deep Learning in Computer Vision

This document summarizes key contributions to deep learning in computer vision.

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

This demonstrates the text upload capability with sufficient content length for testing.
EOF
echo -e "${GREEN}✅ 文本文件: ~/.claude/uploads/text/sample.txt${NC}"
echo ""

# 步骤3: 创建Markdown文件
echo -e "${BLUE}步骤 3: 创建示例Markdown文件${NC}"
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

## Conclusion

Following these methodologies ensures robust and reproducible research outcomes.
EOF
echo -e "${GREEN}✅ Markdown文件: ~/.claude/uploads/markdown/research_notes.md${NC}"
echo ""

# 步骤4: 创建PDF占位符
echo -e "${BLUE}步骤 4: 创建PDF占位符${NC}"
cat > ~/.claude/uploads/pdfs/paper_summary.txt << 'EOF'
[PDF Placeholder]

Note: This is a text placeholder for a PDF file.
In actual usage, place your PDF files (.pdf) in this directory.

Example PDF content:
- Title: "Deep Learning for Computer Vision"
- Authors: Zhang et al.
- Pages: 15
- Year: 2023

To test PDF parsing:
1. Place a real .pdf file in ~/.claude/uploads/pdfs/
2. Re-run the skill generator
3. The PDF parser will extract text and metadata
EOF
echo -e "${YELLOW}⚠️  注意: 请将实际的PDF文件放到此目录${NC}"
echo -e "${GREEN}✅ PDF目录: ~/.claude/uploads/pdfs/${NC}"
echo ""

# 步骤5: 创建示例邮件
echo -e "${BLUE}步骤 5: 创建示例邮件文件${NC}"
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
EOF
echo -e "${GREEN}✅ 邮件文件: ~/.claude/uploads/emails/collaboration.eml${NC}"
echo ""

# 步骤6: 创建测试图片
echo -e "${BLUE}步骤 6: 创建测试图片${NC}"
printf '\x89PNG\r\n\x1a\n\x00\x00\x00\rIHDR\x00\x00\x00\x01\x00\x00\x00\x01\x08\x02\x00\x00\x00\x90wS\xde\x00\x00\x00\x0cIDATx\x9cc\xf8\xcf\xc0\x00\x00\x00\x03\x00\x01\x00\x00\x00\x00IEND\xaeB`\x82' > ~/.claude/uploads/images/test.png
echo -e "${YELLOW}⚠️  注意: 这是一个测试PNG，实际使用时请放置真实的图片${NC}"
echo -e "${GREEN}✅ 图片文件: ~/.claude/uploads/images/test.png${NC}"
echo ""

# 步骤7: 创建飞书导出
echo -e "${BLUE}步骤 7: 创建飞书导出示例${NC}"
cat > ~/.claude/uploads/feishu/meeting_notes.json << 'EOF'
{
  "title": "AI Research Group Meeting - Weekly Sync",
  "content": "# Weekly Research Sync Meeting\n\n## Date: 2024-01-15\n\n## Attendees\n- Dr. Zhang (PI)\n- PhD Students: Alice, Bob, Charlie\n\n## Agenda\n\n### 1. Progress Updates\n\n**Alice:** Working on vision transformer architecture\n- Achieved 85% accuracy on ImageNet subset\n- Planning to explore attention visualization\n\n**Bob:** Investigating self-supervised learning\n- Implemented SimCLR framework\n- Preliminary results show promise\n\n### 2. Paper Discussion\n\nDiscussed recent paper on attention mechanisms.\nKey insight: Transformer architecture for vision tasks.\n\n### 3. Action Items\n\n- [ ] Alice to prepare experimental results by Friday\n- [ ] Bob to set up self-supervised learning pipeline\n- [ ] Charlie to review related literature\n\n### 4. Next Meeting\n\n**Time:** Next Monday, 10:00 AM\n**Location:** Room 305, Research Building",
  "creator": "Dr. Zhang",
  "created_at": "2024-01-15T10:00:00Z",
  "comments": [
    {
      "author": "Alice",
      "text": "Great progress on the transformer implementation!",
      "timestamp": "2024-01-15T10:30:00Z"
    }
  ]
}
EOF
echo -e "${GREEN}✅ 飞书文件: ~/.claude/uploads/feishu/meeting_notes.json${NC}"
echo ""

# 步骤8: 显示文件结构
echo -e "${BLUE}步骤 8: 文件结构概览${NC}"
echo "📁 上传目录结构:"
ls -la ~/.claude/uploads/ 2>/dev/null || echo "目录不存在或为空"
echo ""

echo "📊 文件统计:"
echo "  文本文件: $(ls ~/.claude/uploads/text/ 2>/dev/null | wc -l | tr -d ' ')"
echo "  Markdown文件: $(ls ~/.claude/uploads/markdown/ 2>/dev/null | wc -l | tr -d ' ')"
echo "  PDF文件: $(ls ~/.claude/uploads/pdfs/ 2>/dev/null | wc -l | tr -d ' ')"
echo "  邮件文件: $(ls ~/.claude/uploads/emails/ 2>/dev/null | wc -l | tr -d ' ')"
echo "  图片文件: $(ls ~/.claude/uploads/images/ 2>/dev/null | wc -l | tr -d ' ')"
echo "  飞书文件: $(ls ~/.claude/uploads/feishu/ 2>/dev/null | wc -l | tr -d ' ')"
echo ""

# 步骤9: 提供运行指令
echo -e "${BLUE}═══════════════════════════════════════════════════════════${NC}"
echo -e "${GREEN}✅ 示例文件创建完成！${NC}"
echo ""
echo -e "${YELLOW}下一步：运行技能生成器${NC}"
echo ""
echo "切换到项目目录："
echo "  cd /Users/yuebaoqing/Desktop/projects/distill-human/supervisor"
echo ""
echo "运行技能生成器（示例：Yann LeCun）："
echo "  node tools/skill-generator.mjs \"Yann LeCun\" --affiliation \"New York University\""
echo ""
echo "或使用其他导师："
echo "  node tools/skill-generator.mjs \"Geoffrey Hinton\" --affiliation \"University of Toronto\""
echo "  node tools/skill-generator.mjs \"Andrew Ng\" --affiliation \"Stanford University\""
echo ""
echo -e "${BLUE}═══════════════════════════════════════════════════════════${NC}"
echo ""
echo "查看详细说明："
echo "  cat UPLOAD_EXAMPLE.md"
echo ""
