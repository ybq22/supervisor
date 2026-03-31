// 测试脚本 - 验证已实现的函数

// ArXiv 搜索函数
async function searchArxiv(authorName, maxResults = 10) {
  const searchQuery = `au:${authorName.replace(/\s+/g, '+')}`;
  const url = `http://export.arxiv.org/api/query?search_query=${searchQuery}&start=0&max_results=${maxResults}`;

  try {
    const response = await fetch(url);
    const text = await response.text();

    // 解析 XML 响应
    const entries = text.match(/<entry>[\s\S]*?<\/entry>/g) || [];

    return entries.map(entry => {
      const title = entry.match(/<title>(.*?)<\/title>/)?.[1] || '';
      const summary = entry.match(/<summary>(.*?)<\/summary>/)?.[1] || '';
      const published = entry.match(/<published>(.*?)<\/published>/)?.[1] || '';
      const arxivId = entry.match(/<id>(.*?)<\/id>/)?.[1]?.split('/').pop() || '';
      const authors = entry.match(/<name>(.*?)<\/name>/g)?.map(a => a.replace(/<name>|<\/name>/g, '')) || [];

      return {
        title: title.trim(),
        summary: summary.trim(),
        published: published,
        arxiv_id: arxivId,
        authors: authors,
        year: published ? new Date(published).getFullYear() : null
      };
    });
  } catch (error) {
    console.error(`ArXiv search failed: ${error.message}`);
    return [];
  }
}

// Google 搜索函数
async function searchGoogle(name, affiliation) {
  const query = affiliation
    ? `${name} ${affiliation} computer science`
    : `${name} professor university`;

  const url = `https://duckduckgo.com/html/?q=${encodeURIComponent(query)}`;

  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      }
    });
    const html = await response.text();

    // 提取搜索结果（简化版）
    const results = html.match(/<a[^>]*class="result__url"[^>]*>(.*?)<\/a>/g) || [];

    return results.slice(0, 5).map(result => {
      const urlMatch = result.match(/href="([^"]*)"/)?.[1] || '';
      const title = result.replace(/<[^>]*>/g, '').trim();

      return {
        url: urlMatch,
        title: title
      };
    }).filter(r => r.url && !r.url.includes('duckduckgo'));
  } catch (error) {
    console.error(`Google search failed: ${error.message}`);
    return [];
  }
}

// 主测试函数
async function runTests() {
  console.log('🧪 开始测试...\n');

  // 测试 1: ArXiv 搜索
  console.log('📚 测试 1: ArXiv 搜索 - Geoffrey Hinton');
  console.log('=' .repeat(60));
  try {
    const arxivResults = await searchArxiv('Geoffrey Hinton', 3);
    console.log(`✅ 找到 ${arxivResults.length} 篇论文\n`);
    if (arxivResults.length > 0) {
      console.log('第一篇论文:');
      console.log(`  标题: ${arxivResults[0].title.substring(0, 80)}...`);
      console.log(`  年份: ${arxivResults[0].year}`);
      console.log(`  ArXiv ID: ${arxivResults[0].arxiv_id}`);
      console.log(`  摘要: ${arxivResults[0].summary.substring(0, 100)}...\n`);
    }
  } catch (error) {
    console.log(`❌ ArXiv 搜索失败: ${error.message}\n`);
  }

  // 测试 2: Google 搜索
  console.log('🔍 测试 2: Google 搜索 - Yann LeCun NYU');
  console.log('=' .repeat(60));
  try {
    const googleResults = await searchGoogle('Yann LeCun', 'NYU');
    console.log(`✅ 找到 ${googleResults.length} 个搜索结果\n`);
    if (googleResults.length > 0) {
      console.log('搜索结果:');
      googleResults.forEach((result, index) => {
        console.log(`  ${index + 1}. ${result.title.substring(0, 60)}...`);
        console.log(`     URL: ${result.url.substring(0, 60)}...`);
      });
      console.log('');
    }
  } catch (error) {
    console.log(`❌ Google 搜索失败: ${error.message}\n`);
  }

  // 测试 3: 中文导师搜索
  console.log('🎓 测试 3: ArXiv 搜索 - 姚期智');
  console.log('=' .repeat(60));
  try {
    const chineseResults = await searchArxiv('Andrew Chi-Chih Yao', 2);
    console.log(`✅ 找到 ${chineseResults.length} 篇论文\n`);
    if (chineseResults.length > 0) {
      console.log('第一篇论文:');
      console.log(`  标题: ${chineseResults[0].title.substring(0, 80)}...`);
      console.log(`  年份: ${chineseResults[0].year}\n`);
    }
  } catch (error) {
    console.log(`❌ 搜索失败: ${error.message}\n`);
  }

  console.log('✅ 测试完成！');
}

// 运行测试
runTests().catch(console.error);
