# 导师特定上传目录 - 设计说明

## 问题诊断

之前的设计存在问题：**所有导师共享同一个上传目录** `~/.claude/uploads/`，这意味着：
- 为导师A上传的材料会被导师B使用
- 无法为不同导师准备不同的材料
- 材料组织和隔离性差

## 解决方案

**导师特定的上传目录**：每个导师都有自己独立的上传空间。

### 目录结构

```
~/.claude/uploads/
├── Geoffrey_Hinton/       # Geoffrey Hinton 专属
│   ├── text/
│   ├── markdown/
│   ├── pdfs/
│   ├── emails/
│   ├── images/
│   └── feishu/
├── Yann_LeCun/            # Yann LeCun 专属
│   ├── text/
│   ├── markdown/
│   ├── pdfs/
│   ├── emails/
│   ├── images/
│   └── feishu/
└── Fei_Fei_Li/            # Fei-Fei Li 专属
    ├── text/
    ├── markdown/
    ├── pdfs/
    ├── emails/
    ├── images/
    └── feishu/
```

## 使用方式

### 方式 1: 自动使用导师特定目录（推荐）

```bash
# 系统自动使用 ~/.claude/uploads/{mentor_name}/
node tools/skill-generator.mjs "Geoffrey Hinton" --affiliation "University of Toronto"

# 自动扫描 ~/.claude/uploads/Geoffrey_Hinton/
node tools/skill-generator.mjs "Yann LeCun" --affiliation "New York University"

# 自动扫描 ~/.claude/uploads/Yann_LeCun/
```

### 方式 2: 使用自定义上传目录

```bash
# 使用当前目录的 uploads 文件夹
node tools/skill-generator.mjs "Geoffrey Hinton" --uploads ./uploads

# 使用绝对路径
node tools/skill-generator.mjs "Yann LeCun" --uploads /path/to/lecun-uploads

# 使用相对路径
node tools/skill-generator.mjs "Fei-Fei Li" --uploads ../feifei-materials
```

## 优势

1. **隔离性**: 每个导师的材料完全独立
2. **组织性**: 清晰的目录结构，易于管理
3. **灵活性**: 可以为不同导师准备不同的材料
4. **默认友好**: 不指定目录时自动使用导师特定目录
5. **自定义支持**: 支持自定义路径，适合各种工作流程

## 工作流程示例

### 场景 1: 为单个导师准备材料

```bash
# 1. 创建导师特定目录
mkdir -p ~/.claude/uploads/Geoffrey_Hinton/{text,markdown,pdfs,emails,images,feishu}

# 2. 放置该导师的材料
cp hinton_research.txt ~/.claude/uploads/Geoffrey_Hinton/text/
cp hinton_interview.md ~/.claude/uploads/Geoffrey_Hinton/markdown/
cp hinton_paper.pdf ~/.claude/uploads/Geoffrey_Hinton/pdfs/

# 3. 生成技能（自动使用该目录）
node tools/skill-generator.mjs "Geoffrey Hinton" --affiliation "University of Toronto"
```

### 场景 2: 批量为多个导师准备材料

```bash
# 为 Geoffrey Hinton 准备材料
mkdir -p ~/.claude/uploads/Geoffrey_Hinton/text
echo "Hinton's research views..." > ~/.claude/uploads/Geoffrey_Hinton/text/views.txt

# 为 Yann LeCun 准备材料
mkdir -p ~/.claude/uploads/Yann_LeCun/text
echo "LeCun's research views..." > ~/.claude/uploads/Yann_LeCun/text/views.txt

# 为 Fei-Fei Li 准备材料
mkdir -p ~/.claude/uploads/Fei_Fei_Li/text
echo "Li's research views..." > ~/.claude/uploads/Fei_Fei_Li/text/views.txt

# 分别生成技能
node tools/skill-generator.mjs "Geoffrey Hinton" --affiliation "University of Toronto"
node tools/skill-generator.mjs "Yann LeCun" --affiliation "New York University"
node tools/skill-generator.mjs "Fei-Fei Li" --affiliation "Stanford University"
```

### 场景 3: 使用项目目录组织材料

```bash
# 项目目录结构
my-mentors-project/
├── uploads/
│   ├── hinton/
│   │   ├── text/
│   │   └── pdfs/
│   └── lecun/
│       ├── text/
│       └── pdfs/
└── generate_skills.sh

# 使用自定义目录
cd my-mentors-project
node ../supervisor/tools/skill-generator.mjs "Geoffrey Hinton" --uploads ./uploads/hinton
node ../supervisor/tools/skill-generator.mjs "Yann LeCun" --uploads ./uploads/lecun
```

## 迁移指南

如果您之前使用了全局上传目录 `~/.claude/uploads/`，需要迁移：

```bash
# 1. 查看现有的上传
ls -la ~/.claude/uploads/

# 2. 为每个导师创建专属目录
# 假设您之前有这些文件：
# ~/.claude/uploads/text/paper1.txt  (for Hinton)
# ~/.claude/uploads/text/paper2.txt  (for LeCun)

# 3. 迁移到导师特定目录
mkdir -p ~/.claude/uploads/Geoffrey_Hinton/text
mkdir -p ~/.claude/uploads/Yann_LeCun/text

# 根据文件名或内容判断归属
mv ~/.claude/uploads/text/paper1.txt ~/.claude/uploads/Geoffrey_Hinton/text/
mv ~/.claude/uploads/text/paper2.txt ~/.claude/uploads/Yann_LeCun/text/

# 4. 删除处理清单以重新处理
rm ~/.claude/uploads/processed/.processed_manifest.json

# 5. 重新生成技能
node tools/skill-generator.mjs "Geoffrey Hinton"
node tools/skill-generator.mjs "Yann LeCun"
```

## 配置示例

### 为特定导师准备材料的脚本

```bash
#!/bin/bash
# setup-mentor-uploads.sh

MENTOR_NAME="Geoffrey Hinton"
MENTOR_SLUG="Geoffrey_Hinton"

# 创建导师特定目录
mkdir -p ~/.claude/uploads/${MENTOR_SLUG}/{text,markdown,pdfs,emails,images,feishu}

# 复制该导师的材料
cp materials/${MENTOR_NAME}/*.txt ~/.claude/uploads/${MENTOR_SLUG}/text/
cp materials/${MENTOR_NAME}/*.md ~/.claude/uploads/${MENTOR_SLUG}/markdown/
cp materials/${MENTOR_NAME}/*.pdf ~/.claude/uploads/${MENTOR_SLUG}/pdfs/

echo "✅ ${MENTOR_NAME} 的材料已准备完毕"
echo "📁 目录: ~/.claude/uploads/${MENTOR_SLUG}/"
```

## 技术实现

修改了 `tools/skill-generator.mjs`：

```javascript
// 新增 uploadsDir 参数
const {
  name,
  uploadsDir = null  // 支持自定义上传目录
} = options;

// 自动使用导师特定目录
let actualUploadsDir;
if (uploadsDir) {
  actualUploadsDir = uploadsDir;
} else {
  // 创建导师特定目录
  const mentorSlug = name.replace(/[^a-zA-Z0-9\u4e00-\u9fa5]/g, '_');
  actualUploadsDir = path.join(process.env.HOME, '.claude', 'uploads', mentorSlug);
}
```

## 总结

✅ **问题解决**: 每个导师现在有自己独立的上传空间
✅ **自动组织**: 系统自动按导师名称组织目录
✅ **灵活配置**: 支持自定义路径，适合各种工作流程
✅ **向后兼容**: 通过 --uploads 参数保持灵活性

---

**现在每个导师都有自己专属的上传材料，不会混淆！** 🎯
