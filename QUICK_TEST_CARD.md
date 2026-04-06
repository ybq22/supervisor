# 🚀 快速测试卡片

## 一键运行测试

```bash
# 切换到项目目录
cd /Users/yuebaoqing/Desktop/projects/distill-human/supervisor

# 测试上传系统（推荐）
node tools/skill-generator.mjs "Yann LeCun" --affiliation "New York University"
```

## 预期结果

✅ 应该看到：
- `[Upload Scanner] Found 5 new upload(s) to process`
- 每个文件的处理状态
- 质量评估报告
- 技能生成成功消息

## 查看结果

```bash
# 查看生成的技能
cat ~/.claude/skills/YannLeCun/SKILL.md | less

# 查看配置文件
cat ~/.claude/mentors/YannLeCun.json | jq '.'
```

## 其他测试选项

```bash
# Geoffrey Hinton
node tools/skill-generator.mjs "Geoffrey Hinton" --affiliation "University of Toronto"

# Andrew Ng  
node tools/skill-generator.mjs "Andrew Ng" --affiliation "Stanford University"

# 李飞飞
node tools/skill-generator.mjs "Fei-Fei Li" --affiliation "Stanford University"
```

## 重置测试

```bash
# 清理处理记录
rm ~/.claude/uploads/processed/.processed_manifest.json

# 重新创建示例文件
./setup-upload-example.sh
```

## 故障排除

| 问题 | 解决方案 |
|------|---------|
| 文件未被检测 | 检查文件在正确的子目录 |
| 解析失败 | 验证文件格式正确 |
| API错误 | 设置 ANTHROPIC_API_KEY |

详细帮助：`cat docs/TROUBLESHOOTING.md`
