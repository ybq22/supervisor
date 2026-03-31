#!/usr/bin/env node
/**
 * Puppeteer 浏览器搜索工具
 * 使用真实的 Chromium 浏览器进行搜索（DuckDuckGo）
 */

import puppeteer from 'puppeteer';

/**
 * 使用 Puppeteer 进行搜索（DuckDuckGo）
 * @param {string} query - 搜索查询
 * @param {number} maxResults - 最大结果数
 * @returns {Promise<Array>} 搜索结果数组
 */
async function searchWithBrowser(query, maxResults = 10) {
  let browser = null;

  try {
    console.log(`🌐 启动浏览器搜索: ${query}`);

    // 启动浏览器（使用轻量级配置）
    browser = await puppeteer.launch({
      headless: true,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-gpu'
      ]
    });

    const page = await browser.newPage();

    // 设置用户代理，模拟真实浏览器
    await page.setUserAgent(
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
    );

    // 访问 DuckDuckGo
    const searchUrl = `https://duckduckgo.com/?q=${encodeURIComponent(query)}`;
    console.log(`📡 访问: ${searchUrl}`);

    await page.goto(searchUrl, {
      waitUntil: 'networkidle2',
      timeout: 30000
    });

    // 等待页面稳定
    await new Promise(resolve => setTimeout(resolve, 3000));

    // 提取搜索结果（使用通用的链接提取方法）
    const results = await page.evaluate(() => {
      const items = [];

      // 查找所有链接
      const allLinks = Array.from(document.querySelectorAll('a[href]'));

      // 过滤出搜索结果链接
      allLinks.forEach(link => {
        const href = link.href;
        const text = link.textContent.trim();

        // 过滤条件：
        // - 有文本内容
        // - URL 不包含 duckduckgo
        // - URL 是 http/https
        // - 文本长度合理（不是单字符）
        if (
          text &&
          text.length > 5 &&
          text.length < 200 &&
          href &&
          href.startsWith('http') &&
          !href.includes('duckduckgo.com') &&
          !href.includes('callback') &&
          !href.includes('javascript:')
        ) {
          // 查找附近的摘要文本
          let snippet = '';
          const parent = link.parentElement;
          if (parent) {
            const snippetEl = parent.querySelector('p, span[class*="snippet"], div[class*="snippet"]');
            if (snippetEl) {
              snippet = snippetEl.textContent.trim().substring(0, 100);
            }
          }

          // 避免重复
          const exists = items.some(item => item.url === href);
          if (!exists) {
            items.push({
              title: text,
              url: href,
              snippet: snippet
            });
          }
        }
      });

      return items;
    });

    console.log(`✓ 找到 ${results.length} 个结果`);

    return results.slice(0, maxResults);

  } catch (error) {
    console.error(`❌ 浏览器搜索失败: ${error.message}`);
    return [];
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}

/**
 * 搜索导师个人主页（使用浏览器）
 * @param {string} name - 导师姓名
 * @param {string} affiliation - 所属机构
 * @returns {Promise<Array>} 搜索结果
 */
async function searchMentorWebsite(name, affiliation) {
  const query = affiliation
    ? `${name} ${affiliation} computer science`
    : `${name} professor university`;

  return await searchWithBrowser(query, 10);
}

/**
 * 带降级机制的搜索
 * 如果浏览器搜索失败，返回空数组（调用方可以回退到其他方法）
 * @param {string} name - 导师姓名
 * @param {string} affiliation - 所属机构
 * @returns {Promise<Array>} 搜索结果
 */
async function searchWithFallback(name, affiliation) {
  console.log(`\n🌐 浏览器搜索模式: ${name}${affiliation ? ` (${affiliation})` : ''}`);
  console.log('='.repeat(60));

  try {
    const results = await searchMentorWebsite(name, affiliation);

    if (results.length > 0) {
      console.log(`\n✅ 成功获取 ${results.length} 个结果:\n`);

      results.slice(0, 5).forEach((result, index) => {
        console.log(`${index + 1}. ${result.title.substring(0, 80)}`);
        console.log(`   🔗 ${result.url}`);
        if (result.snippet) {
          console.log(`   📝 ${result.snippet.substring(0, 100)}...`);
        }
        console.log('');
      });

      return results;
    } else {
      console.log('⚠️  未找到结果');
      return [];
    }
  } catch (error) {
    console.error(`❌ 搜索失败: ${error.message}`);
    return [];
  }
}

// 主函数（用于命令行测试）
async function main() {
  const args = process.argv.slice(2);

  if (args.length === 0) {
    console.log('用法: node puppeteer-search.js "<导师姓名>" [affiliation]');
    console.log('\n示例:');
    console.log('  node puppeteer-search.js "Yoshua Bengio"');
    console.log('  node puppeteer-search.js "Yoshua Bengio" "University of Montreal"');
    process.exit(1);
  }

  const name = args[0];
  const affiliation = args[1] || null;

  const results = await searchWithFallback(name, affiliation);

  if (results.length === 0) {
    console.log('\n💡 建议:');
    console.log('  - 检查网络连接');
    console.log('  - 尝试不同的名字格式');
    console.log('  - 使用 fetch API 搜索作为备选');
  }
}

// 如果直接运行此脚本
if (process.argv[1] === new URL(import.meta.url).pathname) {
  main().catch(console.error);
}

export {
  searchWithBrowser,
  searchMentorWebsite,
  searchWithFallback
};
