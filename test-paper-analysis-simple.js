#!/usr/bin/env node
/**
 * 简化版论文深度分析测试
 * 使用 ArXiv 数据避免 API 限流问题
 */

import {
  enrichPapersWithCitations,
  filterRecentPapers,
  getTopCitedPapers,
  selectPapersForAnalysis,
  analyzePapersDeeply,
  saveAnalysisReport
} from './paper-analysis.js';

// ArXiv 搜索函数
async function searchArxiv(authorName, maxResults = 10) {
  const searchQuery = `au:${authorName.replace(/\s+/g, '+')}`;
  const url = `http://export.arxiv.org/api/query?search_query=${searchQuery}&start=0&max_results=${maxResults}`;

  try {
    console.log(`🔍 搜索 ArXiv: ${authorName}`);
    const response = await fetch(url);
    const text = await response.text();

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

async function main() {
  const mentorName = "Geoffrey Hinton";

  console.log("🧪 论文深度分析测试（模拟数据）\n");
  console.log("=".repeat(60));

  try {
    // 1. 使用模拟论文数据（避免 ArXiv API 问题）
    console.log(`\n📚 步骤 1: 准备论文数据（模拟）...`);

    const mockPapers = [
      {
        title: "Deep Learning",
        year: 2015,
        citationCount: 50000,
        venue: "Nature",
        abstract: "Deep learning allows computational models that are composed of multiple processing layers to learn representations of data with multiple levels of abstraction.",
        authors: "Yann LeCun, Yoshua Bengio, Geoffrey Hinton"
      },
      {
        title: "AlexNet: ImageNet Classification with Deep Convolutional Neural Networks",
        year: 2012,
        citationCount: 80000,
        venue: "NIPS",
        abstract: "We trained a large, deep convolutional neural network to classify the 1.2 million high-resolution images in the ImageNet LSVRC-2010 contest into the 1000 different classes.",
        authors: "Alex Krizhevsky, Ilya Sutskever, Geoffrey E. Hinton"
      },
      {
        title: "A Fast Learning Algorithm for Deep Belief Nets",
        year: 2006,
        citationCount: 15000,
        venue: "Neural Computation",
        abstract: "We show how to use complementary priors to eliminate the explaining-away effect that makes inference difficult in densely connected belief nets.",
        authors: "Geoffrey E. Hinton, Simon Osindero, Yee-Whye Teh"
      },
      {
        title: "Reducing the Dimensionality of Data with Neural Networks",
        year: 2006,
        citationCount: 12000,
        venue: "Science",
        abstract: "We give a new method for reducing the dimensionality of data using neural networks.",
        authors: "G. E. Hinton, R. R. Salakhutdinov"
      },
      {
        title: "Backpropagation Applied to Handwritten Zip Code Recognition",
        year: 1989,
        citationCount: 3000,
        venue: "Neural Computation",
        abstract: "The backpropagation learning algorithm is applied to a network that recognizes handwritten zip code digits.",
        authors: "Y. LeCun, B. Boser, J. S. Denker, D. Henderson, R. E. Howard, W. Hubbard, L. D. Jackel"
      },
      {
        title: "Deep Boltzmann Machines",
        year: 2009,
        citationCount: 4000,
        venue: "AISTATS",
        abstract: "We present a new learning algorithm for Boltzmann machines that contain many layers of hidden variables.",
        authors: "Ruslan Salakhutdinov, Geoffrey Hinton"
      },
      {
        title: "Representing High-Dimensional Data with Deep Boltzmann Machines",
        year: 2010,
        citationCount: 2000,
        venue: "Neural Networks",
        abstract: "Deep Boltzmann machines are learned one layer at a time using a variational upper bound on the likelihood.",
        authors: "Ruslan Salakhutdinov, Geoffrey Hinton"
      },
      {
        title: "Imagenet classification with deep convolutional neural networks",
        year: 2012,
        citationCount: 70000,
        venue: "NIPS",
        abstract: "We trained a large, deep convolutional neural network to classify the 1.2 million high-resolution images in the ImageNet LSVRC-2010 contest.",
        authors: "Alex Krizhevsky, Ilya Sutskever, Geoffrey E Hinton"
      },
      {
        title: "Distilling a Neural Network Into a Soft Decision Tree",
        year: 2017,
        citationCount: 1500,
        venue: "ArXiv",
        abstract: "We describe a new way to transfer knowledge from a neural network to a soft decision tree.",
        authors: "Nicholas Frosst, Geoffrey Hinton"
      },
      {
        title: "Dynamic Routing Between Capsules",
        year: 2017,
        citationCount: 2500,
        venue: "NIPS",
        abstract: "A capsule is a group of neurons whose activity vector represents the instantiation parameters of a specific type of entity.",
        authors: "Sara Sabour, Nicholas Frosst, Geoffrey E. Hinton"
      },
      {
        title: "Matrix Capsules with EM Routing",
        year: 2018,
        citationCount: 800,
        venue: "ICLR",
        abstract: "A capsule is a group of neurons whose activity vector represents the instantiation parameters of a specific type of entity.",
        authors: "Geoffrey Hinton, Sara Sabour, Nicholas Frosst"
      },
      {
        title: "Forward-Forward Algorithm",
        year: 2022,
        citationCount: 500,
        venue: "ArXiv",
        abstract: "We present a new learning algorithm for neural networks that does not use backpropagation.",
        authors: "Geoffrey Hinton"
      },
      {
        title: "The Forward-Forward Algorithm: Some Preliminary Investigations",
        year: 2023,
        citationCount: 200,
        venue: "ICML",
        abstract: "We investigate the properties of the forward-forward algorithm for training neural networks.",
        authors: "Geoffrey Hinton, Geoffrey Hinton"
      },
      {
        title: "Neural Networks for Machine Learning",
        year: 2012,
        citationCount: 1000,
        venue: "Coursera",
        abstract: "A course on neural networks for machine learning.",
        authors: "Geoffrey Hinton"
      },
      {
        title: "Learning Layers of Representations from Restricted Boltzmann Machines",
        year: 2024,
        citationCount: 100,
        venue: "ArXiv",
        abstract: "We show how to learn multiple layers of representation from restricted Boltzmann machines.",
        authors: "Geoffrey Hinton, Ruslan Salakhutdinov"
      }
    ];

    console.log(`✓ 准备了 ${mockPapers.length} 篇模拟论文`);

    // 2. 筛选论文
    console.log(`\n🎯 步骤 2: 筛选论文（近3年 + Top引用）...`);
    const { recentPapers, topCitedPapers, unionPapers } = selectPapersForAnalysis(
      mockPapers,
      3,
      10
    );

    // 3. 深度分析
    console.log(`\n🧠 步骤 3: 使用 Claude API 深度分析...`);
    const deepAnalysis = await analyzePapersDeeply(unionPapers, mentorName);

    // 4. 生成报告
    console.log(`\n📄 步骤 4: 生成分析报告...`);
    const report = {
      total_papers: mockPapers.length,
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

    await saveAnalysisReport(mentorName, report);

    // 6. 显示结果
    console.log(`\n${"=".repeat(60)}`);
    console.log(`✅ 分析完成！`);
    console.log(`"=".repeat(60)}\n`);

    console.log(`📊 统计信息:`);
    console.log(`   总论文数: ${report.total_papers}`);
    console.log(`   近3年论文: ${report.recent_papers}`);
    console.log(`   Top引用: ${report.top_cited_papers}`);
    console.log(`   分析论文数: ${report.analyzed_papers}\n`);

    if (deepAnalysis) {
      console.log(`🧠 深度分析结果:`);
      console.log(`   研究类型: ${deepAnalysis.methodology?.type || 'N/A'}`);
      console.log(`   研究趋势: ${deepAnalysis.research_evolution?.trend?.substring(0, 80) || 'N/A'}...`);
      console.log(`   核心领域数: ${deepAnalysis.core_research_areas?.length || 0}`);

      if (deepAnalysis.core_research_areas && deepAnalysis.core_research_areas.length > 0) {
        console.log(`\n   核心研究领域:`);
        deepAnalysis.core_research_areas.slice(0, 3).forEach((area, i) => {
          console.log(`     ${i + 1}. ${area.area}`);
        });
      }
    }

    console.log(`\n📁 报告已保存到: reports/${mentorName.replace(/\s+/g, '_')}_analysis.json`);

  } catch (error) {
    console.error(`\n❌ 测试失败: ${error.message}`);
    console.error(error.stack);
  }

  console.log(`\n${"=".repeat(60)}`);
  console.log(`✅ 测试完成！\n`);
}

main().catch(console.error);
