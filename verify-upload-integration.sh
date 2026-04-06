#!/bin/bash
# 验证上传材料是否被真正整合到导师技能中

echo "╔════════════════════════════════════════════════════════════╗"
echo "║                                                            ║"
echo "║     验证上传材料整合到导师蒸馏系统                          ║"
echo "║     Verify Upload Materials Integration                     ║"
echo "║                                                            ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo ""

MENTOR_NAME="Yann LeCun"
MENTOR_AFFILIATION="New York University"

echo "📋 步骤 1: 生成导师技能（包含上传材料）"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
cd /Users/yuebaoqing/Desktop/projects/distill-human/supervisor

# 删除旧的处理记录
rm -f ~/.claude/uploads/processed/.processed_manifest.json

# 生成技能
echo "运行：node tools/skill-generator.mjs \"$MENTOR_NAME\" --affiliation \"$MENTOR_AFFILIATION\""
echo ""

node tools/skill-generator.mjs "$MENTOR_NAME" --affiliation "$MENTOR_AFFILIATION"

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# 检查生成的技能文件
SKILL_FILE="$HOME/.claude/skills/${MENTOR_NAME// /}/SKILL.md"

if [ -f "$SKILL_FILE" ]; then
    echo "✅ 技能文件已生成: $SKILL_FILE"
    echo ""

    # 检查是否包含"补充材料"部分
    if grep -q "补充材料" "$SKILL_FILE"; then
        echo "✅ 技能文件包含'补充材料'部分"
        echo ""

        # 显示补充材料部分
        echo "📄 补充材料部分预览："
        echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
        grep -A 50 "## 补充材料" "$SKILL_FILE" | head -60
        echo ""
        echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

        # 检查是否包含具体内容
        if grep -q "Deep Learning in Computer Vision" "$SKILL_FILE"; then
            echo "✅ 文本资料内容已整合"
        fi

        if grep -q "Advanced Research Methodologies" "$SKILL_FILE"; then
            echo "✅ Markdown笔记内容已整合"
        fi

        if grep -q "collaboration.eml" "$SKILL_FILE"; then
            echo "✅ 邮件记录内容已整合"
        fi

        if grep -q "meeting_notes.json" "$SKILL_FILE"; then
            echo "✅ 飞书文档内容已整合"
        fi

        echo ""
        echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
        echo "🎉 上传材料已成功整合到导师技能中！"
        echo ""
        echo "📖 查看完整技能文件："
        echo "   cat $SKILL_FILE | less"
        echo ""
        echo "🔍 搜索'补充材料'部分："
        echo "   grep -A 100 '补充材料' $SKILL_FILE"
        echo ""
        echo "🤖 使用技能提问（上传材料会被AI参考）："
        echo "   /${MENTOR_NAME// /} 你对计算机视觉的发展有什么看法？"

    else
        echo "❌ 技能文件不包含'补充材料'部分"
        echo "   上传材料可能没有被正确整合"
    fi
else
    echo "❌ 技能文件未找到: $SKILL_FILE"
    echo "   生成过程可能失败"
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# 检查配置文件
PROFILE_FILE="$HOME/.claude/mentors/${MENTOR_NAME}.json"

if [ -f "$PROFILE_FILE" ]; then
    echo "📊 配置文件检查:"
    echo "   文件: $PROFILE_FILE"

    # 检查是否包含upload_contents
    if grep -q "upload_contents" "$PROFILE_FILE"; then
        echo "   ✅ 包含 upload_contents（材料内容）"

        # 统计上传内容
        TEXT_COUNT=$(grep -o '"texts"' "$PROFILE_FILE" | wc -l | tr -d ' ')
        MD_COUNT=$(grep -o '"markdown"' "$PROFILE_FILE" | wc -l | tr -d ' ')
        PDF_COUNT=$(grep -o '"pdfs"' "$PROFILE_FILE" | wc -l | tr -d ' ')
        EMAIL_COUNT=$(grep -o '"emails"' "$PROFILE_FILE" | wc -l | tr -d ' ')

        echo "   📁 上传材料统计："
        echo "      文本: $TEXT_COUNT"
        echo "      Markdown: $MD_COUNT"
        echo "      PDF: $PDF_COUNT"
        echo "      邮件: $EMAIL_COUNT"
    else
        echo "   ⚠️  不包含 upload_contents"
    fi
else
    echo "⚠️  配置文件未找到"
fi

echo ""
echo "╔════════════════════════════════════════════════════════════╗"
echo "║                                                            ║"
echo "║     ✅ 验证完成                                           ║"
echo "║                                                            ║"
echo "╚════════════════════════════════════════════════════════════╝"
