#!/usr/bin/env node
/**
 * News and Public Information Search
 *
 * Searches for public information about an academic mentor including:
 * - News articles
 * - Interviews
 * - Talks and presentations
 * - Social media presence
 * - Blog posts
 *
 * Usage:
 *   node news-search.mjs "<name>" [--affiliation "<institution>"] [--limit 20]
 */

/**
 * Search for news and interviews about the mentor
 */
async function searchNews(name, affiliation = '', limit = 20) {
  const query = affiliation ? `${name} ${affiliation}` : name;
  const searchQueries = [
    `${name} interview`, // 访谈
    `${name} talk`, // 演讲
    `${name} research profile`, // 研究者简介
    `${name} news`, // 新闻
    `${name} blog`, // 博客
    `${name} lab`, // 实验室
    `${name} group`, // 研究组
  ];

  console.log(`\n📰 Searching for news and public information about: ${name}\n`);

  const results = {
    interviews: [],
    talks: [],
    news: [],
    profiles: [],
    blogs: [],
    social_media: [],
    lab_pages: []
  };

  // Try to import puppeteer-search
  try {
    const puppeteerModule = await import('./puppeteer-search.mjs');
    const searchWithBrowser = puppeteerModule.searchWithBrowser;

    for (const query of searchQueries) {
      try {
        const searchResults = await searchWithBrowser(query, 5);
        categorizeResults(searchResults, results, query);
      } catch (error) {
        console.error(`Search failed for query: ${query} - ${error.message}`);
      }
    }
  } catch (error) {
    console.error('Failed to load browser search module');
    console.log('Falling back to basic URL suggestions...');
    results.suggestions = generateSuggestions(name, affiliation);
  }

  return results;
}

/**
 * Categorize search results into types
 */
function categorizeResults(searchResults, results, query) {
  searchResults.forEach(result => {
    const { url, title, snippet } = result;

    // Detect category from URL and title
    if (isInterview(url, title, snippet)) {
      results.interviews.push(result);
    } else if (isTalk(url, title, snippet)) {
      results.talks.push(result);
    } else if (isNews(url, title, snippet)) {
      results.news.push(result);
    } else if (isProfile(url, title, snippet)) {
      results.profiles.push(result);
    } else if (isBlog(url, title, snippet)) {
      results.blogs.push(result);
    } else if (isSocialMedia(url)) {
      results.social_media.push(result);
    } else if (isLabPage(url, title, snippet)) {
      results.lab_pages.push(result);
    }
  });
}

/**
 * Detect if result is an interview
 */
function isInterview(url, title, snippet) {
  const text = (url + title + (snippet || '')).toLowerCase();
  const keywords = ['interview', '访谈', '采访', 'conversation', 'dialogue', '对话'];
  return keywords.some(kw => text.includes(kw));
}

/**
 * Detect if result is a talk/presentation
 */
function isTalk(url, title, snippet) {
  const text = (url + title + (snippet || '')).toLowerCase();
  const keywords = [
    'talk', 'presentation', 'lecture', 'speech', 'seminar',
    '演讲', '报告', '讲座', 'ted talk', 'keynote'
  ];
  const videoPlatforms = ['youtube', 'vimeo', 'bilibili', 'ted.com'];
  return keywords.some(kw => text.includes(kw)) ||
         videoPlatforms.some(platform => url.includes(platform));
}

/**
 * Detect if result is news
 */
function isNews(url, title, snippet) {
  const text = (url + title + (snippet || '')).toLowerCase();
  const newsDomains = [
    'news.', 'www.news', 'cnn', 'bbc', 'nytimes', 'techcrunch',
    'sina', '163', 'sohu', 'qq.com/news', 'thepaper'
  ];
  const keywords = ['news', '新闻', '报道', 'report', 'breaking'];
  return newsDomains.some(domain => url.includes(domain)) ||
         keywords.some(kw => text.includes(kw));
}

/**
 * Detect if result is a profile/bio
 */
function isProfile(url, title, snippet) {
  const text = (url + title + (snippet || '')).toLowerCase();
  const keywords = [
    'profile', 'bio', 'biography', 'about',
    '简介', '介绍', '个人主页', 'homepage'
  ];
  return keywords.some(kw => text.includes(kw));
}

/**
 * Detect if result is a blog
 */
function isBlog(url, title, snippet) {
  const text = (url + title + (snippet || '')).toLowerCase();
  const blogPlatforms = [
    'medium.com', 'blog.', 'blogs.', 'wordpress',
    'zhihu.com', 'csdn.net', 'jianshu.com'
  ];
  const keywords = ['blog', '博文', 'post'];
  return blogPlatforms.some(platform => url.includes(platform)) ||
         keywords.some(kw => text.includes(kw));
}

/**
 * Detect if result is social media
 */
function isSocialMedia(url) {
  const socialPlatforms = [
    'twitter.com', 'x.com', 'linkedin.com', 'facebook.com',
    'weibo.com', 'zhihu.com', 'github.com'
  ];
  return socialPlatforms.some(platform => url.includes(platform));
}

/**
 * Detect if result is a lab/group page
 */
function isLabPage(url, title, snippet) {
  const text = (url + title + (snippet || '')).toLowerCase();
  const keywords = [
    'lab', 'laboratory', 'group', 'research group',
    '实验室', '研究组', '团队'
  ];
  return keywords.some(kw => text.includes(kw));
}

/**
 * Generate suggestions if search fails
 */
function generateSuggestions(name, affiliation) {
  const slug = name.toLowerCase().replace(/\s+/g, '-');
  return [
    {
      type: 'Google Scholar',
      url: `https://scholar.google.com/citations?user=${slug}`,
      description: 'Check Google Scholar profile for detailed publication history'
    },
    {
      type: 'Google News',
      url: `https://news.google.com/search?q=${encodeURIComponent(name)}`,
      description: 'Search Google News for recent articles'
    },
    {
      type: 'YouTube',
      url: `https://www.youtube.com/results?search_query=${encodeURIComponent(name + ' talk')}`,
      description: 'Search YouTube for talks and presentations'
    },
    {
      type: 'Twitter/X',
      url: `https://twitter.com/search?q=${encodeURIComponent(name)}`,
      description: 'Search Twitter for recent posts and discussions'
    },
    {
      type: 'LinkedIn',
      url: `https://www.linkedin.com/search/results/people/?keywords=${encodeURIComponent(name)}`,
      description: 'Search LinkedIn for professional profile'
    }
  ];
}

/**
 * Print search results summary
 */
function printResultsSummary(results) {
  console.log('\n📊 Search Results Summary:\n');

  const categories = [
    { key: 'interviews', label: 'Interviews / 访谈', emoji: '🎤' },
    { key: 'talks', label: 'Talks & Presentations / 演讲', emoji: '🎬' },
    { key: 'news', label: 'News Articles / 新闻', emoji: '📰' },
    { key: 'profiles', label: 'Profiles / 简介', emoji: '👤' },
    { key: 'blogs', label: 'Blog Posts / 博客', emoji: '📝' },
    { key: 'social_media', label: 'Social Media / 社交媒体', emoji: '💬' },
    { key: 'lab_pages', label: 'Lab & Group Pages / 实验室', emoji: '🔬' }
  ];

  categories.forEach(({ key, label, emoji }) => {
    const items = results[key] || [];
    if (items.length > 0) {
      console.log(`${emoji} ${label} (${items.length} found):`);
      items.slice(0, 3).forEach((item, idx) => {
        console.log(`   ${idx + 1}. ${item.title}`);
        console.log(`      ${item.url}`);
      });
      if (items.length > 3) {
        console.log(`   ... and ${items.length - 3} more`);
      }
      console.log('');
    }
  });

  if (results.suggestions) {
    console.log('💡 Manual Search Suggestions:\n');
    results.suggestions.forEach((suggestion, idx) => {
      console.log(`   ${idx + 1}. ${suggestion.type}`);
      console.log(`      ${suggestion.url}`);
      console.log(`      ${suggestion.description}`);
    });
    console.log('');
  }

  // Total count
  const totalFound = Object.entries(results)
    .filter(([key]) => key !== 'suggestions')
    .reduce((sum, [, items]) => sum + (Array.isArray(items) ? items.length : 0), 0);

  console.log(`📈 Total: ${totalFound} results found\n`);
}

/**
 * Main function
 */
async function main() {
  const args = process.argv.slice(2);

  if (args.length === 0) {
    console.log('Usage: node news-search.mjs "<name>" [--affiliation "<institution>"] [--limit 20]');
    console.log('');
    console.log('Examples:');
    console.log('  node news-search.mjs "Geoffrey Hinton"');
    console.log('  node news-search.mjs "刘知远" --affiliation "清华大学"');
    process.exit(1);
  }

  const name = args[0];
  const affiliationIndex = args.indexOf('--affiliation');
  const affiliation = affiliationIndex !== -1 ? args[affiliationIndex + 1] : '';
  const limitIndex = args.indexOf('--limit');
  const limit = limitIndex !== -1 ? parseInt(args[limitIndex + 1]) : 20;

  try {
    const results = await searchNews(name, affiliation, limit);
    printResultsSummary(results);

    // Save results to JSON
    const fs = await import('fs/promises');
    const outputPath = `reports/${name.replace(/\s+/g, '_')}_news_search.json`;
    await fs.mkdir('reports', { recursive: true });
    await fs.writeFile(outputPath, JSON.stringify(results, null, 2));
    console.log(`💾 Results saved to: ${outputPath}\n`);
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export { searchNews };
