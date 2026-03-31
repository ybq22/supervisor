# 论文深度分析功能指南

## 功能概述

论文深度分析功能通过API对导师的论文进行详细分析，帮助您更全面地了解导师的研究方向、方法特点和学术影响力。

## 功能特点

### 1. 多数据源整合
- **Semantic Scholar API**: 获取论文的引用次数、发表 venue 等详细信息
- **ArXiv API**: 补充最新预印本论文信息
- **自动去重**: 合并多个数据源，避免重复

### 2. 智能筛选策略
- **近三年论文**: 获取导师最近的研究动向
- **Top 10 引用论文**: 识别导师最具影响力的工作
- **并集分析**: 对两类论文取并集，确保全面覆盖

### 3. AI 深度分析
使用 Claude API 对论文进行多维度分析：
- 研究方向演进
- 核心研究主题
- 方法论特点
- 学术影响力
- 合作模式

## 使用方法

### 基础用法

```bash
# 启用深度分析
node distill-mentor-cli.mjs "Geoffrey Hinton" --deep-analyze

# 指定机构 + 深度分析
node distill-mentor-cli.mjs "Geoffrey Hinton" --affiliation "University of Toronto" --deep-analyze

# 完整示例
node distill-mentor-cli.mjs "Geoffrey Hinton" --affiliation "University of Montreal" --deep-analyze
```

### 测试功能

```bash
# 运行测试脚本
node test-paper-analysis.js
```

## 执行流程

### 步骤 1: 数据收集
```
🔍 搜索 Semantic Scholar: [导师姓名]
✓ 找到 X 篇论文
```

### 步骤 2: 论文筛选
```
📊 论文统计:
   近 3 年: X 篇
   Top 10 引用: X 篇
   并集总计: X 篇
```

### 步骤 3: 深度分析
```
🧠 深度分析 X 篇论文...
✓ 深度分析完成
```

### 步骤 4: 保存报告
```
📄 分析报告已保存: reports/[导师名]_analysis.json
```

## 分析输出

### JSON 报告结构

```json
{
  "total_papers": 150,
  "recent_papers": 25,
  "top_cited_papers": 10,
  "analyzed_papers": 30,
  "papers": [
    {
      "title": "论文标题",
      "year": 2024,
      "citationCount": 150,
      "venue": "SIGIR"
    }
  ],
  "deep_analysis": {
    "research_evolution": {
      "early_focus": ["早期主题"],
      "recent_focus": ["近期主题"],
      "trend": "研究演进趋势"
    },
    "core_research_areas": [
      {
        "area": "研究领域",
        "description": "领域描述",
        "key_papers": ["代表性论文"]
      }
    ],
    "methodology": {
      "type": "混合型",
      "techniques": ["技术方法"],
      "experimental_style": "实验风格"
    },
    "impact_analysis": {
      "highly_cited_characteristics": "高引用特点",
      "application_domains": ["应用领域"]
    },
    "collaboration_pattern": {
      "frequent_collaborators": ["合作者"],
      "interdisciplinary": true,
      "collaboration_style": "合作风格"
    }
  }
}
```

## API 限制说明

### Semantic Scholar API
- **速率限制**: 100 requests / 5 minutes
- **最佳实践**: 在批量论文信息获取时添加延迟（100ms）
- **免费额度**: 足够学术研究使用

### Claude API
- **需要 API Key**: 设置 `ANTHROPIC_API_KEY` 环境变量
- **Token 消耗**: 每次分析约消耗 2000-4000 tokens
- **超时设置**: 建议设置合理的 timeout

## 性能对比

| 模式 | 时间 | 论文数量 | 数据质量 | API 消耗 |
|------|------|---------|---------|---------|
| 基础模式 | ~10秒 | 5-10篇 | 0.5-0.7/1.0 | 仅 ArXiv |
| 浏览器搜索 | ~25秒 | 20-30篇 | 0.8-0.9/1.0 | 无 API |
| **深度分析** | **~60秒** | **30-50篇** | **0.9-1.0/1.0** | **Claude + SS** |

## 适用场景

### 推荐使用深度分析的情况

1. **深入了解导师**: 需要全面了解导师的研究历程和特点
2. **学术规划**: 为读博/博后选择导师做决策参考
3. **研究合作**: 寻找特定研究方向的潜在合作者
4. **文献调研**: 快速了解某个领域的重要工作和趋势

### 不需要深度分析的情况

1. **快速了解**: 只需要基本信息的快速查询
2. **API 限制**: 不想消耗 Claude API 额度
3. **时间紧迫**: 需要在几秒内获得结果

## 配置选项

### 调整筛选参数

在代码中可以调整以下参数：

```javascript
{
  recentYears: 3,      // 近多少年（默认3年）
  topCited: 10,        // Top引用数（默认10篇）
  useSemanticScholar: true  // 是否使用SS API
}
```

### 自定义分析维度

可以修改 `paper-analysis.js` 中的 `analysisPrompt` 来调整分析维度。

## 故障排查

### 问题 1: Semantic Scholar API 限流
```
错误: API Error: 429
解决:
- 减少请求频率
- 增加延迟时间
- 使用缓存结果
```

### 问题 2: Claude API 超时
```
错误: Deep analysis failed: timeout
解决:
- 检查网络连接
- 减少 analyzePapersDeeply 的 max_tokens
- 分批分析论文
```

### 问题 3: 未找到作者
```
错误: 未找到作者: [Name]
解决:
- 使用英文名字
- 添加机构信息
- 尝试变体（如缩写、全名）
```

## 示例输出

### Geoffrey Hinton 分析示例

```
🎓 开始论文深度分析: Geoffrey Hinton
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🔍 搜索 Semantic Scholar: Geoffrey Hinton
✓ 找到 850+ 篇论文

📊 论文统计:
   近 3 年: 125 篇
   Top 10 引用: 10 篇
   并集总计: 130 篇

✓ 引用最多的 Top 10 论文:
   1. Deep Learning (2015)... (50000+ 引用)
   2. Learning deep architectures for AI... (8000+ 引用)
   ...

🧠 深度分析 130 篇论文...
✓ 深度分析完成

✅ 论文分析完成！
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📄 分析报告已保存: reports/Yoshua_Bengio_analysis.json
```

## 进阶使用

### 集成到工作流

```bash
# 1. 生成基础档案
node distill-mentor-cli.mjs "导师名"

# 2. 深度分析论文
node test-paper-analysis.js

# 3. 查看报告
cat reports/[导师名]_analysis.json | jq
```

### 批量分析多个导师

创建脚本批量处理：

```javascript
const mentors = ["导师1", "导师2", "导师3"];
for (const name of mentors) {
  await analyzeAuthorPapers(name);
  await saveAnalysisReport(name);
}
```

## 未来改进

- [ ] 添加图表可视化
- [ ] 支持导出 Markdown 报告
- [ ] 添加时间序列分析
- [ ] 支持自定义分析维度
- [ ] 缓存机制减少 API 调用

## 反馈与支持

如有问题或建议，请提交 issue 或 PR。
