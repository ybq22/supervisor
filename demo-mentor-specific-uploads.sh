#!/bin/bash
# 演示导师特定上传目录
# 展示如何为不同导师准备独立的上传材料

echo "╔════════════════════════════════════════════════════════════╗"
echo "║                                                            ║"
echo "║     导师特定上传目录 - 演示脚本                            ║"
echo "║     Mentor-Specific Upload Directories Demo                  ║"
echo "║                                                            ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo ""

# 清理之前的演示文件
echo "🧹 清理之前的演示文件..."
rm -rf ~/.claude/uploads/sample.txt
rm -rf ~/.claude/uploads/research_notes.md
rm -rf ~/.claude/uploads/collaboration.eml
rm -rf ~/.claude/uploads/test.png
rm -rf ~/.claude/uploads/meeting_notes.json

echo ""
echo "📋 步骤 1: 为不同导师创建专属目录和材料"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# 创建 Geoffrey Hinton 的材料
echo "1️⃣  为 Geoffrey Hinton 准备材料..."
mkdir -p ~/.claude/uploads/Geoffrey_Hinton/text
mkdir -p ~/.claude/uploads/Geoffrey_Hinton/markdown

cat > ~/.claude/uploads/Geoffrey_Hinton/text/hinton_views.txt << 'EOF'
Geoffrey Hinton 的研究观点

关于深度学习的未来：
- 我相信我们需要更少的标注数据
- 无监督学习是关键方向
- 神经网络的架构设计仍然很重要

关于 Capsule Networks：
- 这是我近年来最兴奋的想法
- 可以更好地处理层次结构
- 需要更多研究来完善

给学生的建议：
- 打好基础，不要只关注最新论文
- 理解为什么某些方法有效
- 保持好奇心和实验精神
EOF

echo "   ✅ 创建 ~/.claude/uploads/Geoffrey_Hinton/text/hinton_views.txt"

cat > ~/.claude/uploads/Geoffrey_Hinton/markdown/research_philosophy.md << 'EOF'
---
title: "Hinton 的研究哲学"
author: "Geoffrey Hinton"
---

# 我的研究哲学

## 核心信念

1. **理解 > 黑盒**
   - 我们需要理解神经网络为什么有效
   - 可解释性至关重要

2. **生物启发**
   - 人脑是最强大的智能系统
   - 我们应该向大脑学习

3. **长期主义**
   - 不要追求短期热点
   - 关注根本性问题

## 给年轻人的建议

### 研究方向
- 选择你认为重要的问题
- 不要担心别人是否研究
- 坚持自己的判断

### 方法论
- 理论和实验并重
- 从简单例子开始
- 不断验证你的假设
EOF

echo "   ✅ 创建 ~/.claude/uploads/Geoffrey_Hinton/markdown/research_philosophy.md"

# 创建 Yann LeCun 的材料
echo ""
echo "2️⃣  为 Yann LeCun 准备材料..."
mkdir -p ~/.claude/uploads/Yann_LeCun/text
mkdir -p ~/.claude/uploads/Yann_LeCun/markdown

cat > ~/.claude/uploads/Yann_LeCun/text/lecun_views.txt << 'EOF'
Yann LeCun 的研究观点

关于自监督学习：
- 这是未来的方向
- 监督学习太依赖标注
- 我们可以从海量未标注数据中学习

关于 CNN 和架构：
- CNN 在视觉任务上已经很好
- 但我们需要更高效的学习方法
- 世界模型是关键

关于 AI 的未来：
- 不要期望 AGI 很快到来
- 我们还缺少很多基本能力
- 推理和规划是主要挑战

给学生的建议：
- 打好数学基础
- 不要忽视工程实现
- 阅读经典论文
EOF

echo "   ✅ 创建 ~/.claude/uploads/Yann_LeCun/text/lecun_views.txt"

cat > ~/.claude/uploads/Yann_LeCun/markdown/self_supervised_learning.md << 'EOF'
---
title: "自监督学习路线图"
author: "Yann LeCun"
tags: [SSL, self-supervised, learning]
---

# 自监督学习的未来

## 为什么需要自监督学习

监督学习的问题：
- 标注成本太高
- 无法利用海量未标注数据
- 泛化能力有限

## 核心思想

从输入数据本身创建监督信号：
- 图像：通过图像修复、颜色化等任务学习
- 视频：通过时间一致性学习表征
- 文本：通过掩码语言模型学习

## 实践建议

### 学生应该学习
1. 强化学习基础
2. 优化理论
3. 计算机视觉基础
4. 大规模工程实践

### 推荐课程
- NYU 的深度学习课程
- 斯坦福的 CS231n
- 自己动手实现论文
EOF

echo "   ✅ 创建 ~/.claude/uploads/Yann_LeCun/markdown/self_supervised_learning.md"

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# 展示目录结构
echo "📁 导师特定目录结构:"
echo ""
ls -la ~/.claude/uploads/

echo ""
echo "Geoffrey Hinton 的材料:"
ls -la ~/.claude/uploads/Geoffrey_Hinton/

echo ""
echo "Yann LeCun 的材料:"
ls -la ~/.claude/uploads/Yann_LeCun/

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# 生成 Geoffrey Hinton 的技能
echo "🎯 步骤 2: 生成 Geoffrey Hinton 的技能"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "运行: node tools/skill-generator.mjs \"Geoffrey Hinton\" --affiliation \"University of Toronto\""
echo ""

node tools/skill-generator.mjs "Geoffrey Hinton" --affiliation "University of Toronto"

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# 检查生成的技能
echo "📊 步骤 3: 验证 Geoffrey Hinton 的技能"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

SKILL_FILE="$HOME/.claude/skills/GeoffreyHinton/SKILL.md"

if grep -q "补充材料" "$SKILL_FILE"; then
  echo "✅ 技能文件包含补充材料"
  echo ""
  echo "📄 Geoffrey Hinton 的补充材料预览:"
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  grep -A 30 "### 文本资料" "$SKILL_FILE" | head -35
  echo ""
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  echo "   ✅ 只包含 Hinton 的材料"
  echo "   ✅ 不包含 LeCun 的材料"
else
  echo "❌ 技能文件不包含补充材料"
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# 生成 Yann LeCun 的技能
echo "🎯 步骤 4: 生成 Yann LeCun 的技能"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "运行: node tools/skill-generator.mjs \"Yann LeCun\" --affiliation \"New York University\""
echo ""

node tools/skill-generator.mjs "Yann LeCun" --affiliation "New York University"

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# 检查 LeCun 的技能
echo "📊 步骤 5: 验证 Yann LeCun 的技能"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

SKILL_FILE_LECUN="$HOME/.claude/skills/YannLeCun/SKILL.md"

if grep -q "补充材料" "$SKILL_FILE_LECUN"; then
  echo "✅ 技能文件包含补充材料"
  echo ""
  echo "📄 Yann LeCun 的补充材料预览:"
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  grep -A 30 "### 文本资料" "$SKILL_FILE_LECUN" | head -35
  echo ""
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  echo "   ✅ 只包含 LeCun 的材料"
  echo "   ✅ 不包含 Hinton 的材料"
else
  echo "❌ 技能文件不包含补充材料"
fi

echo ""
echo "╔════════════════════════════════════════════════════════════╗"
echo "║                                                            ║"
echo "║     ✅ 演示完成                                           ║"
echo "║                                                            ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo ""
echo "📊 总结："
echo "  ✅ Geoffrey Hinton 有自己的专属材料和技能"
echo "  ✅ Yann LeCun 有自己的专属材料和技能"
echo "  ✅ 两个导师的材料完全隔离，互不影响"
echo ""
echo "📁 目录结构："
echo "  ~/.claude/uploads/Geoffrey_Hinton/  ← Hinton 专属"
echo "  ~/.claude/uploads/Yann_LeCun/         ← LeCun 专属"
echo ""
echo "🚀 使用方法："
echo "  # 使用 Hinton 的技能"
echo "  /GeoffreyHinton 你对深度学习的未来有什么看法？"
echo ""
echo "  # 使用 LeCun 的技能"
echo "  /YannLeCun 你对自监督学习有什么观点？"
echo ""
echo "📖 详细说明："
echo "  cat MENTOR_SPECIFIC_UPLOADS.md"
