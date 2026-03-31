#!/usr/bin/env node
/**
 * 测试论文深度分析功能
 */

import { analyzeAuthorPapers, saveAnalysisReport } from './paper-analysis.js';

async function main() {
  // 测试导师
  const testMentors = [
    { name: "Yiqun Liu", description: "刘奕群 - 清华大学" },
    { name: "Yoshua Bengio", description: "Yoshua Bengio - 蒙特利尔大学" }
  ];

  console.log("🧪 论文深度分析测试\n");
  console.log("=" .repeat(60));

  for (const mentor of testMentors) {
    console.log(`\n📝 测试导师: ${mentor.description}`);
    console.log("-".repeat(60));

    try {
      const analysis = await analyzeAuthorPapers(
        mentor.name,
        [],  // 不提供ArXiv论文，完全依赖Semantic Scholar
        {
          recentYears: 3,
          topCited: 10,
          useSemanticScholar: true
        }
      );

      if (analysis) {
        console.log("\n✅ 分析成功！");
        console.log("\n📊 统计信息:");
        console.log(`   总论文数: ${analysis.total_papers}`);
        console.log(`   近3年论文: ${analysis.recent_papers}`);
        console.log(`   Top引用: ${analysis.top_cited_papers}`);
        console.log(`   分析论文数: ${analysis.analyzed_papers}`);

        // 保存报告
        await saveAnalysisReport(mentor.name, analysis);

        // 显示部分深度分析结果
        if (analysis.deep_analysis) {
          console.log("\n🧠 深度分析摘要:");
          console.log(`   研究类型: ${analysis.deep_analysis.methodology?.type}`);
          console.log(`   研究趋势: ${analysis.deep_analysis.research_evolution?.trend?.substring(0, 100)}...`);
          console.log(`   核心领域数: ${analysis.deep_analysis.core_research_areas?.length || 0}`);
        }
      }

    } catch (error) {
      console.error(`\n❌ 测试失败: ${error.message}`);
    }

    // 延迟以避免API限流
    await new Promise(resolve => setTimeout(resolve, 2000));
  }

  console.log("\n" + "=".repeat(60));
  console.log("✅ 测试完成！\n");
}

main().catch(console.error);
