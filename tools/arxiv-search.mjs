#!/usr/bin/env node
/**
 * Simple ArXiv Paper Search (no external dependencies)
 *
 * Search ArXiv for papers by a given author
 */

/**
 * Search ArXiv for papers by author
 */
async function searchArxiv(authorName, maxResults = 10) {
  const searchQuery = `au:${authorName.replace(/\s+/g, '+')}`;
  const url = `http://export.arxiv.org/api/query?search_query=${searchQuery}&start=0&max_results=${maxResults}`;

  try {
    console.log(`🔍 搜索 ArXiv: ${authorName}`);

    const response = await fetch(url);
    const text = await response.text();

    // Parse XML with regex (simple approach, no external dependencies)
    const entries = text.match(/<entry>[\s\S]*?<\/entry>/g) || [];

    const papers = entries.map(entry => {
      const titleMatch = entry.match(/<title>(.*?)<\/title>/);
      const summaryMatch = entry.match(/<summary>(.*?)<\/summary>/);
      const publishedMatch = entry.match(/<published>(.*?)<\/published>/);
      const idMatch = entry.match(/<id>(.*?)<\/id>/);
      const authorMatches = entry.match(/<name>(.*?)<\/name>/g);

      return {
        title: titleMatch ? titleMatch[1].trim() : '',
        summary: summaryMatch ? summaryMatch[1].trim() : '',
        published: publishedMatch ? publishedMatch[1] : '',
        arxiv_id: idMatch ? idMatch[1].split('/').pop() : '',
        authors: authorMatches ? authorMatches.map(a => a.replace(/<name>|<\/name>/g, '')) : [],
        year: publishedMatch ? new Date(publishedMatch[1]).getFullYear() : null,
        venue: 'ArXiv'
      };
    }).filter(p => p.title); // Filter out entries without titles

    console.log(`✓ 找到 ${papers.length} 篇论文`);
    return papers;

  } catch (error) {
    console.error(`ArXiv search failed: ${error.message}`);
    return [];
  }
}

/**
 * Main function
 */
async function main() {
  const args = process.argv.slice(2);

  if (args.length === 0) {
    console.log('Usage: node arxiv-search.mjs "<author-name>" [--limit 20]');
    console.log('');
    console.log('Examples:');
    console.log('  node arxiv-search.mjs "Geoffrey Hinton"');
    console.log('  node arxiv-search.mjs "Geoffrey Hinton" --limit 30');
    process.exit(1);
  }

  const name = args[0];
  const limitIndex = args.indexOf('--limit');
  const limit = limitIndex !== -1 ? parseInt(args[limitIndex + 1]) : 10;

  try {
    const papers = await searchArxiv(name, limit);

    console.log('\n📄 论文列表:');
    papers.slice(0, 5).forEach((paper, idx) => {
      console.log(`\n${idx + 1}. ${paper.title}`);
      console.log(`   年份: ${paper.year}`);
      console.log(`   作者: ${paper.authors.slice(0, 3).join(', ')}${paper.authors.length > 3 ? '...' : ''}`);
      console.log(`   ArXiv: ${paper.arxiv_id}`);
    });

    if (papers.length > 5) {
      console.log(`\n... and ${papers.length - 5} more papers`);
    }

    // Save to JSON
    const fs = await import('fs/promises');
    const outputPath = `reports/${name.replace(/\s+/g, '_')}_arxiv_papers.json`;
    await fs.mkdir('reports', { recursive: true });
    await fs.writeFile(outputPath, JSON.stringify(papers, null, 2));
    console.log(`\n💾 已保存: ${outputPath}`);

  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export { searchArxiv };
