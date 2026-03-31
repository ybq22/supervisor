# 导师蒸馏系统 (Mentor Supervisor) 设计文档

**日期**: 2026-03-31
**版本**: 1.0
**状态**: 设计阶段

---

## 1. 项目概述

### 1.1 目标

创建一个兼容 Claude Code 格式的 skill 系统，能够"蒸馏"学术导师的风格和知识，让用户可以通过自然语言与"数字导师"进行实时对话，获得符合导师风格的学术指导。

### 1.2 核心价值

- **学术指导辅助**：模拟导师对论文、研究想法的反馈风格
- **个性化对话**：保持导师的真实研究观点和表达习惯
- **易于使用**：最小化输入，自动收集信息
- **可分享**：生成的导师 skill 可以分享给他人

### 1.3 适用场景

- 论文审阅前的预评估
- 研究方向讨论
- 学术写作风格指导
- 研究方法论咨询

---

## 2. 系统架构

### 2.1 整体架构

```
┌─────────────────────────────────────────────────────────────┐
│                    Claude Code Environment                   │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌──────────────────┐      ┌─────────────────────────┐     │
│  │ distill-mentor   │      │  mentor-张三 (auto-gen)  │     │
│  │   (Skill)        │      │    (Skill)              │     │
│  ├──────────────────┤      ├─────────────────────────┤     │
│  │ • 收集导师信息    │      │ • 加载张三.json        │     │
│  │ • 调用搜索 API    │ ───► │ • 加载系统 Prompt      │     │
│  │ • LLM 分析风格    │      │ • 实时对话             │     │
│  │ • 生成档案        │      │                        │     │
│  │ • 生成 mentor     │      │                        │     │
│  │   skill 文件      │      │                        │     │
│  └──────────────────┘      └─────────────────────────┘     │
│           │                                                   │
│           ▼                                                   │
│  ┌─────────────────────────────────────────────────────┐   │
│  │           ~/.claude/mentors/                         │   │
│  │  ├── 张三.json                                       │   │
│  │  ├── 李四.json                                       │   │
│  │  └── ...                                            │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

### 2.2 核心组件

1. **distill-mentor Skill**
   - 入口：`/distill-mentor 张三 --affiliation "清华大学"`
   - 职责：信息收集 → 分析 → 生成档案 → 生成 mentor skill

2. **mentor-{name} Skills**
   - 自动生成的导师对话 skill
   - 入口：`/张三`
   - 职责：加载档案 + 提供对话界面

3. **导师档案存储**
   - 位置：`~/.claude/mentors/`
   - 格式：JSON
   - 内容：结构化的导师信息

4. **外部服务**
   - ArXiv API（论文搜索）
   - Google Search（个人主页）
   - Google Scholar（论文引用，需辅助）

---

## 3. 数据结构设计

### 3.1 导师档案 JSON 结构

```json
{
  "meta": {
    "version": "1.0",
    "created_at": "2026-03-31T10:00:00Z",
    "updated_at": "2026-03-31T10:00:00Z",
    "mentor_name": "张三",
    "affiliation": "清华大学计算机系"
  },
  "profile": {
    "name_zh": "张三",
    "name_en": "San Zhang",
    "institution": "清华大学",
    "department": "计算机科学与技术系",
    "position": "教授",
    "website": "https://example.com/~zhangsan",
    "google_scholar": "https://scholar.google.com/citations?user=XXXXX",
    "languages": ["zh", "en"]
  },
  "research": {
    "primary_fields": ["机器学习", "深度学习"],
    "secondary_fields": ["计算机视觉", "自然语言处理"],
    "research_summary": "专注于深度学习的理论基础和高效算法设计...",
    "key_publications": [
      {
        "title": "Attention Is All You Need",
        "year": 2017,
        "venue": "NeurIPS",
        "citations": 50000,
        "summary": "提出了Transformer架构..."
      }
    ],
    "recent_arxiv": [
      {
        "title": "Scaling Laws for Neural Language Models",
        "arxiv_id": "2001.08361",
        "year": 2020,
        "summary": "研究了模型规模、数据集大小和计算资源..."
      }
    ]
  },
  "style": {
    "research_style": {
      "type": "理论+实验并重",
      "description": "注重数学严谨性，同时强调实验验证",
      "keywords": ["数学化", "可解释性", "系统性"]
    },
    "communication_style": {
      "tone": "严谨但不失亲和",
      "language_preference": "中英混合，专业术语用英文",
      "question_approach": "善于用类比解释复杂概念",
      "feedback_pattern": "先肯定亮点，再指出问题，最后给具体建议"
    },
    "academic_philosophy": {
      "core_beliefs": [
        "研究应该解决真实问题",
        "理论深度和实用性同样重要",
        "重视代码质量和可复现性"
      ],
      "pet_peeves": [
        "缺乏实验细节",
        "数学推导不严谨",
        "过度claim贡献"
      ]
    }
  },
  "system_prompt_template": "你是张三教授的数字分身...\n\n## 研究背景\n{research_summary}\n\n## 研究风格\n{style_description}\n\n## 对话原则\n1. ...\n\n## 模拟指南\n当审阅论文时，你会：\n- ...\n\n",
  "source_materials": {
    "papers_count": 15,
    "websites_visited": ["主页", "Google Scholar", "实验室网站"],
    "user_uploads": []
  }
}
```

### 3.2 数据流程

```
用户输入: /distill-mentor 张三
            ↓
    ┌───────────────────────┐
    │  1. 参数解析           │
    │  - name: 张三          │
    │  - affiliation: (可选) │
    └───────────────────────┘
            ↓
    ┌───────────────────────┐
    │  2. 信息收集           │
    │  ├─ ArXiv API        │ → 论文列表、摘要
    │  ├─ Google Search    │ → 个人主页、机构
    │  └─ (可选) 用户上传   │ → PDF、视频链接
    └───────────────────────┘
            ↓
    ┌───────────────────────┐
    │  3. LLM 风格分析       │
    │  - 阅读论文摘要        │
    │  - 分析主页描述        │
    │  - 提取研究风格        │
    │  - 生成 system prompt │
    └───────────────────────┘
            ↓
    ┌───────────────────────┐
    │  4. 生成 JSON 档案     │
    │  ~/.claude/mentors/   │
    │      张三.json        │
    └───────────────────────┘
            ↓
    ┌───────────────────────┐
    │  5. 生成 mentor skill │
    │  ~/.claude/skills/    │
    │      mentor-张三.md   │
    └───────────────────────┘
            ↓
    ┌───────────────────────┐
    │  6. 用户审阅           │
    │  - 展示档案摘要        │
    │  - 询问是否满意        │
    │  - 允许手动修正        │
    └───────────────────────┘
            ↓
         完成！
```

---

## 4. System Prompt 生成策略

### 4.1 风格分析提示词

使用专门的分析 prompt 让 Claude 深度提取导师风格：

```
你是一位学术风格分析专家。请基于以下导师信息，深度分析并提取其研究风格、沟通特点和学术观点。

## 导师信息

### 基本信息
- 姓名：{name}
- 机构：{affiliation}
- 领域：{field}

### 代表性论文（摘要）
{paper_summaries}

### 个人主页/实验室描述
{website_content}

### 最新研究（ArXiv）
{arxiv_summaries}

---

## 分析任务

请从以下维度进行分析（每个维度给出具体例证）：

### 1. 研究风格
- 理论型 vs 实验型 vs 系统型
- 数学严谨程度（高/中/低）
- 创新倾向（突破性 vs 渐进性）
- 跨学科倾向

### 2. 学术价值观
- 最看重的研究特质（3-5个）
- 常强调的研究原则
- 在论文中经常提到的"好研究"标准

### 3. 沟通风格
- 语言偏好（中英混合、全英文等）
- 语气特征（严厉/温和/幽默等）
- 解释复杂概念的方式（类比/形式化/举例）
- 反馈模式（直接/委婉/三明治法）

### 4. 审稿/反馈偏好
- 看重的论文要素
- 常见的批评点
- 给学生建议的模式

### 5. 专业关键词和表达
- 常用术语（中文+英文）
- 特殊表达习惯

---

## 输出格式

请以 JSON 格式输出：
```json
{
  "research_style": {...},
  "communication_style": {...},
  "academic_philosophy": {...},
  "example_phrases": [...],
  "system_prompt_suggestion": "..."
}
```

其中 `system_prompt_suggestion` 是一段 200-300 字的文字，描述如何在对话中模拟这位导师。
```

### 4.2 System Prompt 模板

生成的 mentor skill 使用的 system prompt：

```markdown
# System Prompt: {mentor_name}的数字分身

你是 {mentor_name}（{institution} {position}）的 AI 助手，专注于提供与其研究风格和学术观点一致的指导。

## 你的身份

- **姓名**：{mentor_name}
- **机构**：{institution}
- **研究领域**：{primary_fields}
- **研究风格**：{research_style_description}

## 研究背景

{research_summary}

### 代表性贡献
{key_contributions}

## 你的研究风格

{style_analysis}

- **方法论偏好**：{methodology_preference}
- **学术价值观**：{academic_values}
- **常用的论证方式**：{argumentation_style}

## 沟通风格

{communication_style}

- **语言**：{language_preference}
- **语气**：{tone_description}
- **解释方式**：{explanation_style}

## 对话原则

1. **基于真实研究**：只依据导师的真实论文和观点，不编造
2. **风格一致性**：保持导师的表达方式和学术观点
3. **建设性反馈**：提供具体、可操作的建议
4. **承认不确定性**：超出导师专业领域时，明确说明

## 典型回复模式

### 当审阅论文时：
1. 先总结论文核心贡献
2. 指出亮点（使用导师的常用表达）
3. 提出改进建议（引用导师的研究标准）
4. 给出具体行动建议

### 当讨论研究想法时：
1. 评估可行性（基于导师的研究风格）
2. 指出潜在问题（使用导师关注的维度）
3. 提供相关论文建议（基于导师的真实研究）
4. 给出下一步建议

### 当回答问题时：
- 使用导师擅长的解释方式
- 结合导师的研究经历举例
- 保持导师的语言习惯

## 约束条件

- 不编造导师未发表的观点
- 超出专业领域时明确说明
- 保持学术严谨性
- 优先引用导师的真实研究

---

现在，请以 {mentor_name} 的身份回答用户的问题。
```

---

## 5. API 集成与错误处理

### 5.1 数据源策略

**主要数据源（基础组合）：**

1. **ArXiv API**（最可靠）
   - 直接调用，无需 API key
   - 获取论文列表和摘要
   - 支持作者和领域搜索

2. **Google Search**（个人主页）
   - 使用 DuckDuckGo（免费）或 SerpAPI
   - 搜索导师个人主页、实验室网站
   - 获取研究描述和团队信息

3. **Google Scholar**（手动辅助）
   - 需要用户提供链接或手动输入
   - 获取论文引用数、h-index
   - 收集代表性工作

**可选补充材料：**
- 用户上传的 PDF 论文
- 讲座视频链接
- 课程讲义

### 5.2 API 调用示例

```bash
# ArXiv API
curl "http://export.arxiv.org/api/query?search_query=au:San+Zhang&start=0&max_results=10"

# DuckDuckGo Search
curl "https://duckduckgo.com/html/?q=Zhang+San+Tsinghua+University"
```

### 5.3 错误处理与降级

```python
def collect_mentor_info(name, affiliation):
    results = {}

    # 步骤 1: ArXiv（最可靠）
    try:
        results['arxiv'] = search_arxiv(name)
    except:
        logger.warning("ArXiv search failed")

    # 步骤 2: Google Search（个人主页）
    try:
        results['website'] = search_google(name, affiliation)
    except:
        logger.warning("Google search failed")

    # 步骤 3: Google Scholar（需要手动）
    if not results.get('papers'):
        results['manual_input'] = prompt_user(
            "未能自动找到论文信息。请提供：\n"
            "1. Google Scholar 链接，或\n"
            "2. 上传论文列表文件"
        )

    # 步骤 4: 验证数据质量
    if is_data_insufficient(results):
        results = manual_fallback(results)

    return results
```

### 5.4 数据质量检查

**最低要求数据：**
- ✅ 至少 3 篇论文（有摘要）
- ✅ 个人主页或机构介绍
- ✅ 研究领域信息

**质量评估：**
```json
{
  "quality_score": 0.85,
  "data_sources": ["arxiv", "website"],
  "confidence": "high",
  "missing": ["google_scholar_citations"],
  "warnings": []
}
```

### 5.5 用户交互流程

```
distill-mentor 开始
       ↓
[1/5] 正在搜索 ArXiv 论文... ✓ 找到 12 篇
[2/5] 正在查找个人主页... ✓ 找到 tsinghua.edu.cn/~zhangsan
[3/5] 正在分析 Google Scholar... ✗ 需要帮助
       ↓
    未能自动获取 Google Scholar 数据。
    请选择：
    A. 输入 Google Scholar 链接
    B. 跳过（基于现有数据生成）
    C. 取消
       ↓
    用户选择 A
       ↓
[4/5] 正在生成风格分析...
[5/5] 正在生成导师档案...
       ↓
    ✓ 完成！档案已保存到：~/.claude/mentors/张三.json

    预览：
    - 研究领域：机器学习、深度学习
    - 论文数量：15 篇
    - 风格标签：理论+实验、数学严谨、可解释性

    是否满意？
    [Y] 是，生成 skill  [N] 修改档案  [V] 查看详细内容
```

---

## 6. Skill 文件结构

### 6.1 distill-mentor Skill

```
~/.claude/skills/distill-mentor.md
├── metadata (YAML frontmatter)
│   ├── name: distill-mentor
│   ├── description: 蒸馏学术导师的数字分身
│   ├── author: ...
│   └── version: 1.0.0
│
├── 使用说明
│   ├── 功能介绍
│   ├── 使用方法
│   └── 示例
│
└── 实现代码 (JavaScript)
    ├── main() - 入口函数
    ├── collectInfo() - 信息收集
    ├── analyzeStyle() - 风格分析
    ├── generateProfile() - 生成档案
    ├── generateMentorSkill() - 生成 mentor skill
    └── helpers
        ├── searchArxiv()
        ├── searchGoogle()
        ├── fetchData()
        └── saveJSON()
```

### 6.2 自动生成的 mentor-{name} Skill

```markdown
---
name: mentor-{name}
description: {name}教授的数字分身 - {institution} - {fields}
author: Auto-generated by distill-mentor
version: 1.0.0
---

# {name}的数字分身

这是基于 distill-mentor 自动生成的导师对话 skill。

## 使用方法

直接输入：`/{name} 你的问题`

例如：
- `/{name} 你觉得我论文的这个方法怎么样？`
- `/{name} 这个研究方向有前景吗？`

## 导师信息

- **姓名**：{name}
- **机构**：{institution}
- **领域**：{fields}
- **生成时间**：{created_at}

---

{system_prompt_content}
```

### 6.3 目录结构

```
~/.claude/
├── mentors/
│   ├── 张三.json
│   ├── 李四.json
│   └── README.md (使用说明)
│
└── skills/
    ├── distill-mentor.md (手动创建)
    ├── mentor-张三.md (自动生成)
    ├── mentor-李四.md (自动生成)
    └── ...
```

---

## 7. 多语言支持

### 7.1 语言检测

```
检测逻辑：
1. 从机构名称判断国家/地区
2. 从搜索结果内容判断语言
3. 默认使用中英双语
```

### 7.2 System Prompt 生成

- **中国导师**：中文为主，英文术语
- **国际导师**：英文为主
- **混合环境**：根据实际材料调整

---

## 8. 实现优先级

### Phase 1: MVP（最小可行产品）
- ✅ ArXiv API 集成
- ✅ 基础风格分析
- ✅ JSON 档案生成
- ✅ mentor skill 自动生成
- ✅ 简单对话功能

### Phase 2: 增强功能
- ✅ Google Search 集成
- ✅ 用户补充材料上传
- ✅ 档案编辑和修正
- ✅ 多语言支持

### Phase 3: 高级功能
- ✅ Google Scholar 集成（需解决 API 问题）
- ✅ 上下文记忆优化
- ✅ 批量论文分析
- ✅ 导师风格对比

---

## 9. 技术栈

- **Language**: JavaScript (Claude Code Skill)
- **APIs**:
  - ArXiv API (公开)
  - DuckDuckGo Search (免费)
  - Claude API (风格分析)
- **Storage**: 本地 JSON 文件
- **Format**: Claude Code Skill (Markdown + YAML frontmatter)

---

## 10. 成功标准

1. **功能完整**：
   - 能成功收集导师信息
   - 能生成合理的风格分析
   - 能进行有导师特色的对话

2. **数据质量**：
   - 至少 80% 的测试案例能自动收集足够信息
   - 生成的 system prompt 能准确反映导师风格

3. **用户体验**：
   - 从输入到生成不超过 2 分钟
   - 交互流程清晰，错误处理友好
   - 生成的对话质量符合预期

---

## 11. 风险与限制

### 11.1 已知风险

1. **信息收集不完整**
   - 缓解：多数据源 + 用户补充
   - 降级：手动输入模式

2. **风格分析偏差**
   - 缓解：用户审阅和修正
   - 迭代：持续优化 prompt

3. **Google Scholar API 限制**
   - 缓解：使用替代方案（Semantic Scholar）
   - 降级：手动提供链接

### 11.2 使用限制

- 依赖公开可获得的学术信息
- 不适用于没有公开资料的导师
- 对话质量取决于数据完整性

---

## 12. 未来扩展

- **支持更多数据源**：DBLP、Semantic Scholar、知网
- **Web UI**：可视化的导师管理和编辑界面
- **导出功能**：支持导出为其他格式（如 Obsidian 插件）
- **社区分享**：导师档案市场
- **持续学习**：根据用户反馈优化风格模型

---

**文档版本**: 1.0
**最后更新**: 2026-03-31
