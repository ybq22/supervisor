#!/usr/bin/env node
/**
 * 改进的 ArXiv 搜索工具
 * 解决了 curl + grep 无法正确解析 XML 的问题
 */

const fs = require('fs').promises;
const path = require('path');

/**
 * 搜索 ArXiv 论文（改进版）
 */
async function searchArxiv(authorName, maxResults = 10) {
  const searchQuery = `au:${authorName.replace(/\s+/g, '+')}`;
  const url = `http://export.arxiv.org/api/query?search_query=${searchQuery}&start=0&max_results=${maxResults}`;

  try {
    console.log(`🔍 搜索: ${authorName}`);
    console.log(`📡 URL: ${url}`);

    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const text = await response.text();

    // 使用 [\s\S]*? 匹配多行内容
    const entries = text.match(/<entry>[\s\S]*?<\/entry>/g) || [];

    console.log(`📊 找到 ${entries.length} 篇论文`);

    if (entries.length === 0) {
      console.log('⚠️  未找到论文，尝试其他搜索方式...');
      return [];
    }

    return entries.map(entry => {
      // 更健壮的 XML 解析
      const titleMatch = entry.match(/<title>(.*?)<\/title>/);
      const summaryMatch = entry.match(/<summary>(.*?)<\/summary>/);
      const publishedMatch = entry.match(/<published>(.*?)<\/published>/);
      const idMatch = entry.match(/<id>(.*?)<\/id>/);
      const authorMatches = entry.matchAll(/<name>(.*?)<\/name>/g);

      return {
        title: titleMatch ? titleMatch[1].trim() : 'Unknown Title',
        summary: summaryMatch ? summaryMatch[1].trim() : '',
        published: publishedMatch ? publishedMatch[1] : '',
        arxiv_id: idMatch ? idMatch[1].split('/').pop() : '',
        authors: authorMatches ? authorMatches.map(m => m[1]) : [],
        year: publishedMatch ? new Date(publishedMatch[1]).getFullYear() : null
      };
    });
  } catch (error) {
    console.error(`❌ ArXiv 搜索失败: ${error.message}`);
    return [];
  }
}

/**
 * 搜索 ArXiv 论文（带回退机制）
 */
async function searchArxivWithFallback(authorName, maxResults = 10) {
  console.log(`\n📚 ArXiv 搜索: ${authorName}`);
  console.log('=' .repeat(60));

  let papers = await searchArxiv(authorName, maxResults);

  // 如果第一次搜索失败，尝试不同的名字格式
  if (papers.length === 0 && authorName.includes(' ')) {
    const nameParts = authorName.split(' ');
    // 尝试 "Last First" 格式
    const reversed = `${nameParts[nameParts.length - 1]}, ${nameParts.slice(0, -1).join(' ')}`;
    console.log(`\n🔄 尝试其他格式: ${reversed}`);
    papers = await searchArxiv(reversed, maxResults);
  }

  // 如果还是失败，尝试只搜索姓氏
  if (papers.length === 0) {
    const lastName = authorName.split(' ').pop();
    console.log(`\n🔄 只搜索姓氏: ${lastName}`);
    papers = await searchArxiv(lastName, maxResults);
  }

  return papers;
}

/**
 * 显示搜索结果
 */
function displayResults(papers) {
  if (papers.length === 0) {
    console.log('\n❌ 未找到相关论文');
    console.log('\n💡 建议:');
    console.log('  - 确认名字拼写');
    console.log('  - 尝试英文名字');
    console.log('  - 检查是否在 ArXiv 有发表');
    return;
  }

  console.log(`\n✅ 成功找到 ${papers.length} 篇论文:\n`);

  papers.slice(0, 5).forEach((paper, index) => {
    console.log(`${index + 1}. ${paper.title}`);
    console.log(`   📅 年份: ${paper.year || 'Unknown'}`);
    console.log(`   🆔 ArXiv: ${paper.arxiv_id || 'Unknown'}`);
    console.log(`   📝 摘要: ${(paper.summary || '').substring(0, 100)}...`);
    console.log('');
  });
}

/**
 * 保存搜索结果到文件
 */
async function saveResults(papers, mentorName) {
  const fileName = mentorName.replace(/[^a-zA-Z0-9\u4e00-\u9fa5]/g, '_');
  const filePath = `/tmp/${fileName}_papers.json`;

  await fs.writeFile(filePath, JSON.stringify(papers, null, 2), 'utf8');
  console.log(`💾 结果已保存到: ${filePath}`);
  return filePath;
}

// 主函数
async function main() {
  const args = process.argv.slice(2);

  if (args.length === 0) {
    console.log('用法: node arxiv-search-improved.js "<导师姓名>"');
    console.log('\n示例:');
    console.log('  node arxiv-search-improved.js "Yoshua Bengio"');
    console.log('  node arxiv-search-improved.js "Geoffrey Hinton"');
    process.exit(1);
  }

  const authorName = args.join(' ');
  const papers = await searchArxivWithFallback(authorName);

  displayResults(papers);
  await saveResults(papers, authorName);
}

// 如果直接运行此脚本
if (require.main === module) {
  main().catch(console.error);
}

module.exports = { searchArxiv, searchArxivWithFallback, displayResults, saveResults };
