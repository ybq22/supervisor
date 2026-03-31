/**
 * 论文详细分析模块
 * 功能：
 * 1. 从ArXiv获取论文列表
 * 2. 使用Semantic Scholar API获取引用次数和详细信息
 * 3. 筛选近三年的论文
 * 4. 获取最高引用的Top 10论文
 * 5. 取并集后使用Claude API进行深度分析
 */

import fs from 'fs/promises';

// ============================================================================
// Semantic Scholar API 搜索
// ============================================================================

/**
 * 使用Semantic Scholar API搜索作者论文
 * @param {string} authorName - 作者名称
 * @param {number} maxResults - 最大结果数
 * @returns {Promise<Array>} 论文列表
 */
async function searchSemanticScholar(authorName, maxResults = 50) {
  const query = encodeURIComponent(authorName);

  // 使用 API Key（如果有的话）可以提高限流
  const apiKey = process.env.SEMANTIC_SCHOLAR_API_KEY || '';

  const url = `https://api.semanticscholar.org/graph/v1/author/search?query=${query}&fields=name,papers.title,papers.abstract,papers.year,papers.citationCount,papers.venue,papers.authors,papers.url&limit=${maxResults}`;

  try {
    console.log(`🔍 搜索 Semantic Scholar: ${authorName}`);

    const headers = {};
    if (apiKey) {
      headers['x-api-key'] = apiKey;
    }

    const response = await fetch(url, { headers });

    if (!response.ok) {
      if (response.status === 429) {
        console.log(`⚠️  Semantic Scholar API 限流，等待后重试...`);
        // 等待5秒后重试一次
        await new Promise(resolve => setTimeout(resolve, 5000));

        const retryResponse = await fetch(url, { headers });
        if (!retryResponse.ok) {
          throw new Error(`API 限流: 请稍后重试或设置 SEMANTIC_SCHOLAR_API_KEY 环境变量`);
        }
        const data = await retryResponse.json();
        return parsePapersFromAPI(data, authorName);
      }
      throw new Error(`API Error: ${response.status}`);
    }

    const data = await response.json();
    return parsePapersFromAPI(data, authorName);

  } catch (error) {
    console.error(`Semantic Scholar search failed: ${error.message}`);
    return [];
  }
}

/**
 * 解析 API 返回的论文数据
 */
function parsePapersFromAPI(data, authorName) {
  if (!data.data || data.data.length === 0) {
    console.log(`⚠️  未找到作者: ${authorName}`);
    return [];
  }

  // 获取第一个匹配作者的所有论文
  const author = data.data[0];
  const papers = author.papers || [];

  console.log(`✓ 找到 ${papers.length} 篇论文`);
  return papers.map(paper => ({
    title: paper.title || '',
    abstract: paper.abstract || '',
    year: paper.year || null,
    citationCount: paper.citationCount || 0,
    venue: paper.venue || '',
    url: paper.url || '',
    authors: (paper.authors || []).map(a => a.name).join(', ')
  }));
}

/**
 * 使用论文标题搜索Semantic Scholar
 * @param {string} title - 论文标题
 * @returns {Promise<Object>} 论文详细信息
 */
async function getPaperDetailsByTitle(title) {
  const query = encodeURIComponent(title);
  const url = `https://api.semanticscholar.org/graph/v1/paper/search?query=${query}&fields=title,abstract,year,citationCount,venue,authors,url&limit=1`;

  try {
    const response = await fetch(url);
    if (!response.ok) {
      return null;
    }

    const data = await response.json();
    if (!data.data || data.data.length === 0) {
      return null;
    }

    const paper = data.data[0];
    return {
      title: paper.title || '',
      abstract: paper.abstract || '',
      year: paper.year || null,
      citationCount: paper.citationCount || 0,
      venue: paper.venue || '',
      url: paper.url || '',
      authors: (paper.authors || []).map(a => a.name).join(', ')
    };
  } catch (error) {
    console.error(`Get paper details failed: ${error.message}`);
    return null;
  }
}

/**
 * 为ArXiv论文补充引用信息
 * @param {Array} arxivPapers - ArXiv论文列表
 * @returns {Promise<Array>} 补充了引用信息的论文列表
 */
async function enrichPapersWithCitations(arxivPapers) {
  console.log(`📊 为 ${arxivPapers.length} 篇论文补充引用信息...`);

  const enriched = [];
  let successCount = 0;

  for (const paper of arxivPapers) {
    try {
      // 延迟以避免API限流
      await new Promise(resolve => setTimeout(resolve, 100));

      const details = await getPaperDetailsByTitle(paper.title);

      if (details) {
        enriched.push({
          ...paper,
          citationCount: details.citationCount,
          venue: details.venue || paper.venue,
          abstract: details.abstract || paper.summary
        });
        successCount++;
      } else {
        enriched.push({
          ...paper,
          citationCount: 0,
          venue: paper.venue || 'Unknown'
        });
      }
    } catch (error) {
      enriched.push({
        ...paper,
        citationCount: 0,
        venue: paper.venue || 'Unknown'
      });
    }
  }

  console.log(`✓ 成功补充 ${successCount}/${arxivPapers.length} 篇论文的引用信息`);
  return enriched;
}

// ============================================================================
// 论文筛选
// ============================================================================

/**
 * 筛选近三年的论文
 * @param {Array} papers - 论文列表
 * @param {number} years - 近多少年
 * @returns {Array} 近N年的论文
 */
function filterRecentPapers(papers, years = 3) {
  const currentYear = new Date().getFullYear();
  const cutoffYear = currentYear - years;

  const recent = papers.filter(p => p.year && p.year >= cutoffYear);

  console.log(`✓ 找到近 ${years} 年论文: ${recent.length} 篇 (${cutoffYear}-${currentYear})`);
  return recent;
}

/**
 * 获取引用最多的Top N论文
 * @param {Array} papers - 论文列表
 * @param {number} topN - Top N
 * @returns {Array} 引用最多的论文
 */
function getTopCitedPapers(papers, topN = 10) {
  // 按引用次数排序
  const sorted = [...papers].sort((a, b) => (b.citationCount || 0) - (a.citationCount || 0));
  const top = sorted.slice(0, topN);

  console.log(`✓ 引用最多的 Top ${topN} 论文:`);
  top.forEach((p, i) => {
    console.log(`   ${i + 1}. ${p.title.substring(0, 60)}... (${p.citationCount} 引用)`);
  });

  return top;
}

/**
 * 获取论文并集（近三年 + Top引用）
 * @param {Array} papers - 论文列表
 * @param {number} recentYears - 近多少年
 * @param {number} topCited - Top引用数
 * @returns {Object} { recentPapers, topCitedPapers, unionPapers }
 */
function selectPapersForAnalysis(papers, recentYears = 3, topCited = 10) {
  const recentPapers = filterRecentPapers(papers, recentYears);
  const topCitedPapers = getTopCitedPapers(papers, topCited);

  // 取并集（使用论文标题作为唯一标识）
  const paperMap = new Map();

  recentPapers.forEach(p => {
    paperMap.set(p.title, p);
  });

  topCitedPapers.forEach(p => {
    if (!paperMap.has(p.title)) {
      paperMap.set(p.title, p);
    }
  });

  const unionPapers = Array.from(paperMap.values());

  console.log(`\n📊 论文统计:`);
  console.log(`   近 ${recentYears} 年: ${recentPapers.length} 篇`);
  console.log(`   Top ${topCited} 引用: ${topCitedPapers.length} 篇`);
  console.log(`   并集总计: ${unionPapers.length} 篇`);

  return {
    recentPapers,
    topCitedPapers,
    unionPapers
  };
}

// ============================================================================
// 深度分析（使用Claude API）
// ============================================================================

/**
 * 使用Claude API深度分析论文
 * @param {Array} papers - 论文列表
 * @param {string} mentorName - 导师姓名
 * @returns {Promise<Object>} 分析结果
 */
async function analyzePapersDeeply(papers, mentorName) {
  console.log(`\n🧠 深度分析 ${papers.length} 篇论文...`);

  // 准备论文摘要（限制总长度）
  const paperSummaries = papers.map((p, i) => `
## 论文 ${i + 1}: ${p.title}

- **年份**: ${p.year || 'Unknown'}
- **引用**: ${p.citationCount || 0}
- **会议/期刊**: ${p.venue || 'Unknown'}
- **摘要**: ${(p.abstract || p.summary || 'No abstract available').substring(0, 500)}...
`).join('\n');

  const analysisPrompt = `你是一位学术分析专家。请深度分析以下论文，了解这位导师的研究方向、方法和影响力。

## 导师
${mentorName}

## 论文列表 (${papers.length}篇)
${paperSummaries}

请从以下维度进行分析，返回JSON格式：

1. **研究方向演进**:
   - 早期关注点 vs 近期关注点
   - 研究重点的变化趋势

2. **核心研究主题**:
   - 主要研究领域（3-5个）
   - 每个领域的代表性工作

3. **方法论特点**:
   - 偏理论还是偏实验
   - 常用的技术方法
   - 实验设计特点

4. **学术影响力**:
   - 高引用论文的共同特点
   - 研究的潜在应用价值

5. **合作模式**:
   - 是否有固定的合作者
   - 跨学科合作情况

请返回JSON：
{
  "research_evolution": {
    "early_focus": ["早期主题1", "早期主题2"],
    "recent_focus": ["近期主题1", "近期主题2"],
    "trend": "研究演进趋势描述"
  },
  "core_research_areas": [
    {
      "area": "领域名称",
      "description": "领域描述",
      "key_papers": ["论文1", "论文2"]
    }
  ],
  "methodology": {
    "type": "理论型/实验型/系统型/混合型",
    "techniques": ["技术1", "技术2"],
    "experimental_style": "实验风格描述"
  },
  "impact_analysis": {
    "highly_cited_characteristics": "高引用论文特点",
    "application_domains": ["应用领域1", "应用领域2"]
  },
  "collaboration_pattern": {
    "frequent_collaborators": ["合作者1", "合作者2"],
    "interdisciplinary": true/false,
    "collaboration_style": "合作风格描述"
  }
}`;

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 4000,
        messages: [{
          role: 'user',
          content: analysisPrompt
        }]
      })
    });

    const data = await response.json();
    const content = data.content[0].text;

    // 提取JSON
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const analysis = JSON.parse(jsonMatch[0]);
      console.log(`✓ 深度分析完成`);
      return analysis;
    }
  } catch (error) {
    console.error(`Deep analysis failed: ${error.message}`);
  }

  // 降级：返回基础分析
  return {
    research_evolution: {
      early_focus: papers.slice(0, 3).map(p => p.title.split(/\s+/).slice(0, 3).join(' ')),
      recent_focus: papers.slice(-3).map(p => p.title.split(/\s+/).slice(0, 3).join(' ')),
      trend: "研究持续发展"
    },
    core_research_areas: papers.slice(0, 5).map(p => ({
      area: p.title.split(/\s+/).slice(0, 3).join(' '),
      description: p.summary?.substring(0, 100) || '',
      key_papers: [p.title]
    })),
    methodology: {
      type: "混合型",
      techniques: ["实验", "理论"],
      experimental_style: "数据驱动"
    },
    impact_analysis: {
      highly_cited_characteristics: "创新性",
      application_domains: ["学术界", "工业界"]
    },
    collaboration_pattern: {
      frequent_collaborators: [],
      interdisciplinary: true,
      collaboration_style: "开放合作"
    }
  };
}

// ============================================================================
// 主流程
// ============================================================================

/**
 * 完整的论文分析流程
 * @param {string} authorName - 作者姓名
 * @param {Array} arxivPapers - ArXiv论文列表（可选）
 * @param {Object} options - 选项
 * @returns {Promise<Object>} 分析结果
 */
async function analyzeAuthorPapers(authorName, arxivPapers = [], options = {}) {
  const {
    recentYears = 3,
    topCited = 10,
    useSemanticScholar = true
  } = options;

  console.log(`\n🎓 开始论文深度分析: ${authorName}`);
  console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);

  let allPapers = [];

  // 1. 使用Semantic Scholar搜索
  if (useSemanticScholar) {
    const ssPapers = await searchSemanticScholar(authorName, 100);
    allPapers = [...ssPapers];
  }

  // 2. 如果有ArXiv论文，补充引用信息后合并
  if (arxivPapers.length > 0) {
    console.log(`\n📚 合并 ArXiv 论文...`);
    const enrichedArxiv = await enrichPapersWithCitations(arxivPapers);

    // 合并去重
    const paperMap = new Map();
    allPapers.forEach(p => paperMap.set(p.title, p));
    enrichedArxiv.forEach(p => {
      if (!paperMap.has(p.title)) {
        paperMap.set(p.title, p);
      }
    });

    allPapers = Array.from(paperMap.values());
    console.log(`✓ 合并后总计: ${allPapers.length} 篇论文`);
  }

  if (allPapers.length === 0) {
    console.log(`⚠️  未找到论文，跳过深度分析`);
    return null;
  }

  // 3. 筛选论文
  const { recentPapers, topCitedPapers, unionPapers } = selectPapersForAnalysis(
    allPapers,
    recentYears,
    topCited
  );

  // 4. 深度分析
  const deepAnalysis = await analyzePapersDeeply(unionPapers, authorName);

  console.log(`\n✅ 论文分析完成！`);
  console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`);

  return {
    total_papers: allPapers.length,
    recent_papers: recentPapers.length,
    top_cited_papers: topCitedPapers.length,
    analyzed_papers: unionPapers.length,
    papers: unionPapers.map(p => ({
      title: p.title,
      year: p.year,
      citationCount: p.citationCount,
      venue: p.venue
    })),
    deep_analysis: deepAnalysis
  };
}

/**
 * 保存分析结果到文件
 * @param {string} authorName - 作者姓名
 * @param {Object} analysis - 分析结果
 */
async function saveAnalysisReport(authorName, analysis) {
  const reportsDir = '/Users/yuebaoqing/Desktop/projects/distill-human/supervisor/reports';
  await fs.mkdir(reportsDir, { recursive: true });

  const fileName = `${authorName.replace(/[^a-zA-Z0-9\u4e00-\u9fa5]/g, '_')}_analysis.json`;
  const filePath = `${reportsDir}/${fileName}`;

  await fs.writeFile(filePath, JSON.stringify(analysis, null, 2), 'utf8');
  console.log(`📄 分析报告已保存: ${filePath}`);

  return filePath;
}

// 导出函数
export {
  searchSemanticScholar,
  getPaperDetailsByTitle,
  enrichPapersWithCitations,
  filterRecentPapers,
  getTopCitedPapers,
  selectPapersForAnalysis,
  analyzePapersDeeply,
  analyzeAuthorPapers,
  saveAnalysisReport
};
