#!/usr/bin/env node
/**
 * Deep Analyzer - Comprehensive Mentor Profiling
 *
 * Performs deep analysis of a mentor including:
 * - Deep paper analysis (research style, methodology, writing style)
 * - Public information analysis (personality, communication, values)
 * - Integrated profile generation
 *
 * Usage:
 *   node deep-analyzer.mjs "<name>" [--affiliation "<institution>"]
 */

import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { searchNews } from './news-search.mjs';
import { searchArxiv } from './arxiv-search.mjs';
import { analyzePaperContent, analyzePublicContent, analyzeMultiplePapers, aggregatePaperAnalysis } from './content-analyzer.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Main deep analysis function
 */
async function deepAnalyzeMentor(name, affiliation = '') {
  console.log(`\n🔬 Starting deep analysis for: ${name}`);
  if (affiliation) {
    console.log(`🏢 Affiliation: ${affiliation}`);
  }
  console.log('');

  const results = {
    mentor_name: name,
    affiliation: affiliation,
    analysis_date: new Date().toISOString(),
    paper_analysis: null,
    public_info: null,
    integrated_profile: null
  };

  // Step 1: Search for papers and public information
  console.log('Step 1: Collecting information...');
  const newsResults = await searchNews(name, affiliation, 20);
  results.public_info = newsResults;
  console.log('  ✓ Public information collected');

  // Step 2: Deep paper analysis
  console.log('\nStep 2: Analyzing papers...');
  const paperAnalysis = await performDeepPaperAnalysis(name, newsResults);
  results.paper_analysis = paperAnalysis;
  console.log('  ✓ Paper analysis complete');

  // Step 3: Public information analysis
  console.log('\nStep 3: Analyzing public information...');
  const publicInfoAnalysis = await performPublicInfoAnalysis(name, newsResults);
  results.public_info_analysis = publicInfoAnalysis;
  console.log('  ✓ Public info analysis complete');

  // Step 4: Integrate into comprehensive profile
  console.log('\nStep 4: Integrating profiles...');
  const integratedProfile = await integrateProfiles(name, paperAnalysis, publicInfoAnalysis);
  results.integrated_profile = integratedProfile;
  console.log('  ✓ Integration complete');

  // Step 5: Save results
  const reportsDir = path.join(process.cwd(), 'reports');
  await fs.mkdir(reportsDir, { recursive: true });

  const outputPath = path.join(reportsDir, `${name.replace(/\s+/g, '_')}_deep_analysis.json`);
  await fs.writeFile(outputPath, JSON.stringify(results, null, 2));
  console.log(`\n💾 Analysis saved to: ${outputPath}\n`);

  return results;
}

/**
 * Perform deep paper analysis
 */
async function performDeepPaperAnalysis(name, newsResults) {
  console.log('  📚 Fetching papers from ArXiv...');

  // Get papers from ArXiv
  const papers = await searchArxiv(name, 20);

  if (papers.length === 0) {
    console.log('  ⚠️  No papers found on ArXiv');
    return {
      analysis_type: 'deep_paper_analysis',
      status: 'no_papers_found',
      papers_analyzed: 0,
      placeholder_profile: {
        research_themes: [],
        problem_preferences: {},
        methodology: {},
        visualization_style: {},
        writing_style: {},
        thinking_pattern: {},
        academic_values: [],
        paper_organization: {}
      }
    };
  }

  console.log(`  ✓ Found ${papers.length} papers`);

  // Analyze multiple papers using Claude API
  const analyses = await analyzeMultiplePapers(papers, name);

  if (analyses.length === 0) {
    console.log('  ⚠️  Paper analysis failed, returning placeholder');
    return {
      analysis_type: 'deep_paper_analysis',
      status: 'analysis_failed',
      papers_analyzed: papers.length,
      note: 'Claude API analysis failed - check ANTHROPIC_API_KEY',
      placeholder_profile: {
        research_themes: [],
        problem_preferences: {},
        methodology: {},
        visualization_style: {},
        writing_style: {},
        thinking_pattern: {},
        academic_values: [],
        paper_organization: {}
      }
    };
  }

  // Aggregate analyses
  const aggregated = aggregatePaperAnalysis(analyses);

  return {
    analysis_type: 'deep_paper_analysis',
    status: 'completed',
    papers_analyzed: analyses.length,
    papers_considered: papers.length,
    analysis_date: new Date().toISOString(),
    profile: aggregated || {
      research_themes: [],
      problem_preferences: {},
      methodology: {},
      visualization_style: {},
      writing_style: {},
      thinking_pattern: {},
      academic_values: [],
      paper_organization: {}
    }
  };
}

/**
 * Perform public information analysis
 */
async function performPublicInfoAnalysis(name, newsResults) {
  console.log('  🔍 Analyzing public information...');

  const analysis = {
    personality: {},
    work_style: {},
    communication: {},
    academic_philosophy: {},
    social: {},
    values: [],
    interests: [],
    sources_analyzed: 0,
    sources: []
  };

  // Collect sources from search results
  const categories = ['interviews', 'talks', 'news', 'profiles', 'blogs', 'social_media'];

  categories.forEach(category => {
    const items = newsResults[category] || [];
    items.forEach(item => {
      analysis.sources.push({
        type: category,
        url: item.url,
        title: item.title,
        snippet: item.snippet
      });
    });
  });

  console.log(`  📊 Found ${analysis.sources.length} sources`);

  // Analyze a few key sources using Claude API
  // For now, we'll analyze based on snippets since full content extraction requires web scraping
  const keySources = analysis.sources.slice(0, 3); // Analyze top 3 sources

  for (const source of keySources) {
    const content = `${source.title}\n\n${source.snippet}`;
    const contentType = source.type.slice(0, -1); // Remove 's' from end (e.g., 'interviews' -> 'interview')

    try {
      console.log(`    - Analyzing ${contentType}: ${source.title.substring(0, 50)}...`);
      const result = await analyzePublicContent(content, contentType, name);

      if (!result.error) {
        // Aggregate results
        if (result.personality && Object.keys(result.personality).length > 0) {
          analysis.personality = result.personality;
        }
        if (result.work_style && Object.keys(result.work_style).length > 0) {
          analysis.work_style = result.work_style;
        }
        if (result.communication && Object.keys(result.communication).length > 0) {
          analysis.communication = result.communication;
        }
        if (result.academic_philosophy && Object.keys(result.academic_philosophy).length > 0) {
          analysis.academic_philosophy = result.academic_philosophy;
        }
        if (result.values && result.values.length > 0) {
          analysis.values = [...new Set([...analysis.values, ...result.values])];
        }
        if (result.interests && result.interests.length > 0) {
          analysis.interests = [...new Set([...analysis.interests, ...result.interests])];
        }

        analysis.sources_analyzed++;
      }

      // Small delay to avoid rate limits
      await new Promise(resolve => setTimeout(resolve, 1000));
    } catch (error) {
      console.log(`    ⚠️  Analysis failed for ${source.url}: ${error.message}`);
    }
  }

  console.log(`  ✓ Analyzed ${analysis.sources_analyzed} sources`);

  return {
    analysis_type: 'public_info_analysis',
    status: analysis.sources_analyzed > 0 ? 'completed' : 'no_content_analyzed',
    sources_count: analysis.sources.length,
    sources_analyzed: analysis.sources_analyzed,
    ...analysis
  };
}

/**
 * Integrate paper and public info analyses
 */
async function integrateProfiles(name, paperAnalysis, publicInfoAnalysis) {
  // Get profile from paper analysis (might be placeholder_profile for backwards compat)
  const paperProfile = paperAnalysis.profile || paperAnalysis.placeholder_profile || {};

  return {
    mentor_name: name,
    integration_date: new Date().toISOString(),
    data_sources: {
      papers: paperAnalysis,
      public_info: publicInfoAnalysis
    },
    integrated_dimensions: {
      // Research characteristics from papers
      research_identity: {
        core_themes: paperProfile.research_themes || [],
        problem_preferences: paperProfile.problem_preferences || {},
        methodology: paperProfile.methodology || {}
      },

      // Communication and style from both sources
      communication_style: {
        writing: paperProfile.writing_style || {},
        speaking: publicInfoAnalysis.communication?.speaking || {},
        presentation: paperProfile.visualization_style || {}
      },

      // Personality and work style from public info
      personality_and_work: {
        traits: publicInfoAnalysis.personality || {},
        work_style: publicInfoAnalysis.work_style || {},
        values: publicInfoAnalysis.values || []
      },

      // Academic philosophy from both
      academic_philosophy: {
        research: paperProfile.thinking_pattern || {},
        teaching: publicInfoAnalysis.academic_philosophy?.teaching || {},
        service: publicInfoAnalysis.social || {}
      }
    },

    confidence_level: {
      overall: paperAnalysis.status === 'completed' && publicInfoAnalysis.sources_analyzed > 0
        ? 'medium'
        : 'low',
      note: 'Confidence increases with more source material and successful API analysis'
    },

    recommendations: {
      for_more_accuracy: [
        'Provide full text papers for deeper analysis',
        'Provide transcripts of talks and interviews',
        'Provide blog posts and social media content',
        'Provide student evaluations and recommendations',
        'Ensure ANTHROPIC_API_KEY is set for content analysis'
      ]
    }
  };
}

/**
 * Print analysis summary
 */
function printAnalysisSummary(results) {
  console.log('📊 Deep Analysis Summary:\n');
  console.log(`Mentor: ${results.mentor_name}`);
  console.log(`Date: ${results.analysis_date.split('T')[0]}\n`);

  if (results.paper_analysis) {
    console.log('📄 Paper Analysis:');
    console.log(`  Status: ${results.paper_analysis.status}`);
  }

  if (results.public_info_analysis) {
    console.log('\n🌐 Public Info Analysis:');
    console.log(`  Sources Found: ${results.public_info_analysis.sources_count}`);
  }

  if (results.integrated_profile) {
    console.log('\n🎯 Integrated Profile:');
    console.log(`  Dimensions: ${Object.keys(results.integrated_profile.integrated_dimensions).length}`);
    console.log(`  Confidence: ${results.integrated_profile.confidence_level.overall}`);
  }

  console.log('\n');
}

/**
 * Main function
 */
async function main() {
  const args = process.argv.slice(2);

  if (args.length === 0) {
    console.log('Usage: node deep-analyzer.mjs "<name>" [--affiliation "<institution>"]');
    console.log('');
    console.log('Examples:');
    console.log('  node deep-analyzer.mjs "Geoffrey Hinton"');
    console.log('  node deep-analyzer.mjs "Geoffrey Hinton" --affiliation "University of Toronto"');
    process.exit(1);
  }

  const name = args[0];
  const affiliationIndex = args.indexOf('--affiliation');
  const affiliation = affiliationIndex !== -1 ? args[affiliationIndex + 1] : '';

  try {
    const results = await deepAnalyzeMentor(name, affiliation);
    printAnalysisSummary(results);
  } catch (error) {
    console.error(`Error: ${error.message}`);
    console.error(error.stack);
    process.exit(1);
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export { deepAnalyzeMentor };
