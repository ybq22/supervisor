# 导师档案分析器

## 任务

根据收集到的导师信息（论文、主页、简介等），提取结构化的档案数据。

---

## 分析维度

### 1. 基本信息 (Basic Info)

从收集的材料中提取：

- **name_zh**: 中文姓名（如有）
- **name_en**: 英文姓名
- **institution**: 所属机构（大学、研究院、公司）
- **department**: 具体部门/系别
- **position**: 职位（教授、副教授、研究员等）
- **website**: 个人主页或实验室网站
- **languages**: 使用的语言（zh, en, both）

### 2. 研究领域 (Research Fields)

**主要领域 (primary_fields)**: 3-5个核心研究方向

从论文摘要、主页描述、研究兴趣中提取。优先使用：
- 论文发表的 venue 类型（ACL、CVPR、ICML 等）
- 主页明确列出研究方向
- 论文关键词

**次要领域 (secondary_fields)**: 2-4个相关方向

**研究摘要 (research_summary)**: 2-3句话概括导师的研究特点和贡献

### 3. 重要论文 (Key Publications)

从收集的论文中筛选出 5-10 篇代表性论文：

筛选标准：
1. **高引用**: 引用次数多的论文
2. **顶会顶刊**: 发表在顶级 venue
3. **近期工作**: 近3年的代表作
4. **开创性**: 该领域的奠基性工作

每篇论文包含：
```json
{
  "title": "论文标题",
  "venue": "发表场所",
  "year": 年份,
  "authors": "作者列表",
  "summary": "1-2句话总结贡献"
}
```

### 4. 学术职务 (Academic Service)

从材料中识别：
- 期刊编委（Associate Editor, Reviewer）
- 会议职务（General Chair, Program Chair, Area Chair）
- 学术组织职务（专业委员会主席等）

### 5. 荣誉奖项 (Honors)

从材料中提取：
- 重要学术奖项（最佳论文奖、学术成就奖）
- 学术 Fellow（IEEE Fellow, ACL Fellow 等）
- 人才计划（长江学者、杰青等）

### 6. 统计数据 (Statistics)

从 Google Scholar、Semantic Scholar 等提取：
- **citation_count**: 总引用数
- **h_index**: h-index
- **publications_count**: 论文总数
- **recent_arxiv**: 最新 ArXiv 论文列表

---

## 分析流程

### Step 1: 读取所有材料

使用 `Read` 工具读取：
- 论文列表和摘要
- 主页内容
- CV 或简介
- 其他提供材料

### Step 2: 提取基本信息

从材料中定位：
- 主页头部通常有姓名、职位、机构
- CV 或 About 页面有完整信息
- Google Scholar profile 有基本统计

**格式要求**：
- institution: 使用中文或英文全称（不用缩写，如 "Tsinghua University" 而非 "THU"）
- position: 使用标准称谓（Professor, Associate Professor, Research Scientist）

### Step 3: 分析研究领域

**方法**：
1. 统计所有论文的 venue 和关键词
2. 聚类相似方向
3. 按出现频率排序
4. 提取 top 3-5 作为主要领域

**判断依据**：
- 论文 venue 类型（如 ACL → NLP, CVPR → CV）
- 论文标题关键词（如 "knowledge graph" → 知识图谱）
- 主页明确列出研究方向

**示例**：
```
主要领域:
  - 知识图谱与语义计算
  - 表示学习
  - 自然语言处理
  - 大模型技术

次要领域:
  - 深度学习
  - 图神经网络
```

### Step 4: 筛选重要论文

**筛选策略**：

1. **按引用排序**：优先选高引用论文
2. **按时间平衡**：至少包含 1-2 篇近3年工作
3. **按 venue 质量**：顶会顶刊优先
4. **覆盖广度**：不要都集中在同一方向

**论文摘要生成**：
用 1-2 句话说明：
- 解决了什么问题
- 提出了什么方法
- 有什么重要影响

**示例**：
```json
{
  "title": "ERNIE: Enhanced Language Representation with Informative Entities",
  "venue": "ACL",
  "year": 2019,
  "summary": "提出了ERNIE模型，通过增强实体的语言表示提升预训练模型效果，是知识增强预训练语言模型的代表性工作。"
}
```

### Step 5: 识别学术风格标记

从材料中寻找风格线索：

**研究类型**：
- **理论驱动型**: 侧重算法创新、理论证明
- **应用驱动型**: 侧重实际问题、系统实现
- **混合型**: 理论与应用并重

**判断依据**：
- 论文标题：有 "theory", "analysis", "study" → 偏理论
- 论文标题：有 "system", "framework", "approach" → 偏应用
- 主页描述：强调 "real-world applications" → 应用驱动
- 主页描述：强调 "theoretical foundations" → 理论驱动

**示例**：
```
研究风格: 应用驱动型
描述: 结合理论研究与实际应用，关注大模型技术的工程实现和知识图谱的实用价值
关键词: 知识图谱、表示学习、预训练模型、自然语言处理、开源工具、教学育人
```

### Step 6: 生成档案 JSON

将所有提取的信息组织成标准格式：

```json
{
  "meta": {
    "version": "1.0",
    "created_at": "ISO timestamp",
    "updated_at": "ISO timestamp",
    "mentor_name": "Name",
    "affiliation": "Institution"
  },
  "profile": {
    "name_zh": "",
    "name_en": "",
    "institution": "",
    "department": "",
    "position": "",
    "website": "",
    "languages": []
  },
  "research": {
    "primary_fields": [],
    "secondary_fields": [],
    "research_summary": "",
    "key_publications": [],
    "recent_arxiv": []
  },
  "style": {
    "research_style": {
      "type": "",
      "description": "",
      "keywords": []
    },
    "communication_style": {
      "tone": "",
      "language": "",
      "characteristics": ""
    },
    "academic_values": [],
    "expertise_areas": []
  },
  "achievements": {
    "honors": [],
    "academic_service": [],
    "citations": "",
    "publications_count": ""
  },
  "source_materials": {
    "papers_count": 0,
    "websites_visited": [],
    "user_uploads": []
  }
}
```

---

## 输出要求

1. **准确性**: 只基于材料中的信息，不编造
2. **完整性**: 尽可能填满所有字段
3. **结构化**: 严格遵循 JSON 格式
4. **引用来源**: 在 source_materials 中记录所有来源

---

## 质量检查

生成档案后，检查：

- ✅ 基本信息（姓名、机构、职位）完整
- ✅ 有 3+ 个研究领域
- ✅ 有 5+ 篇代表性论文
- ✅ 每篇论文有 summary
- ✅ 研究风格有明确描述
- ✅ 统计数据（引用、论文数）已提取

如果质量不足，提示用户补充信息。
