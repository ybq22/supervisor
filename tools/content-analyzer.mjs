#!/usr/bin/env node
/**
 * Content Analyzer using LLM APIs
 *
 * Supports both Anthropic Claude and OpenAI APIs
 * Analyzes text content (papers, interviews, etc.) to extract:
 * - Research themes
 * - Communication style
 * - Personality traits
 * - Academic values
 * - Writing patterns
 *
 * Configuration (via .env file or environment variables):
 *   LLM_API=anthropic|openai (default: anthropic)
 *   ANTHROPIC_API_KEY=key (for Anthropic)
 *   ANTHROPIC_BASE_URL=url (optional, for Anthropic-compatible APIs)
 *   OPENAI_API_KEY=key (for OpenAI)
 *   OPENAI_MODEL=model (default: gpt-4o)
 *   OPENAI_BASE_URL=url (for OpenAI-compatible APIs)
 */

// ============================================================================
// Load .env file
// ============================================================================
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import path from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Try to load .env from project root
const projectRoot = path.resolve(__dirname, '..');
const envPath = path.join(projectRoot, '.env');

try {
  const result = dotenv.config({ path: envPath });
  if (result.parsed && Object.keys(result.parsed).length > 0) {
    // Silently load .env - don't spam console
  }
} catch (error) {
  // Ignore if .env doesn't exist
}

// ============================================================================
// Configuration
// ============================================================================

function getAPIProvider() {
  return process.env.LLM_API?.toLowerCase() || 'anthropic';
}

function getAPIConfig() {
  const provider = getAPIProvider();

  if (provider === 'openai') {
    return {
      provider: 'openai',
      apiKey: process.env.OPENAI_API_KEY,
      model: process.env.OPENAI_MODEL || 'gpt-4o',
      baseURL: process.env.OPENAI_BASE_URL || 'https://api.openai.com/v1'
    };
  }

  // Default to Anthropic
  return {
    provider: 'anthropic',
    apiKey: process.env.ANTHROPIC_API_KEY,
    model: process.env.ANTHROPIC_MODEL || 'claude-sonnet-4-20250514',
    baseURL: process.env.ANTHROPIC_BASE_URL || 'https://api.anthropic.com'
  };
}

// ============================================================================
// Generic API Call Functions
// ============================================================================

/**
 * Generic function to call LLM API (supports both Anthropic and OpenAI)
 */
async function callLLM(prompt, systemPrompt = null) {
  const config = getAPIConfig();

  // Check API key
  if (!config.apiKey) {
    const keyName = config.provider === 'openai' ? 'OPENAI_API_KEY' : 'ANTHROPIC_API_KEY';
    return {
      error: `${keyName} not set`,
      note: `Set ${keyName} environment variable to enable content analysis`
    };
  }

  try {
    if (config.provider === 'openai') {
      return await callOpenAI(prompt, systemPrompt, config);
    } else {
      return await callAnthropic(prompt, systemPrompt, config);
    }
  } catch (error) {
    console.error(`${config.provider} API error: ${error.message}`);
    return { error: error.message };
  }
}

/**
 * Call Anthropic Claude API
 */
async function callAnthropic(prompt, systemPrompt, config) {
  const messages = [{
    role: 'user',
    content: prompt
  }];

  const body = {
    model: config.model,
    max_tokens: 3000,
    messages: messages
  };

  if (systemPrompt) {
    body.system = systemPrompt;
  }

  const response = await fetch(`${config.baseURL}/v1/messages`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': config.apiKey,
      'anthropic-version': '2023-06-01'
    },
    body: JSON.stringify(body)
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`API error ${response.status}: ${errorText}`);
  }

  const data = await response.json();

  if (data.content && data.content[0] && data.content[0].text) {
    return { success: true, text: data.content[0].text };
  }

  return { error: 'No content in response' };
}

/**
 * Call OpenAI API
 */
async function callOpenAI(prompt, systemPrompt, config) {
  const messages = [];

  if (systemPrompt) {
    messages.push({
      role: 'system',
      content: systemPrompt
    });
  }

  messages.push({
    role: 'user',
    content: prompt
  });

  const response = await fetch(`${config.baseURL}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${config.apiKey}`
    },
    body: JSON.stringify({
      model: config.model,
      messages: messages,
      max_tokens: 3000,
      temperature: 0.7
    })
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`API error ${response.status}: ${errorText}`);
  }

  const data = await response.json();

  if (data.choices && data.choices[0] && data.choices[0].message) {
    return { success: true, text: data.choices[0].message.content };
  }

  return { error: 'No content in response' };
}

/**
 * Parse JSON from LLM response
 */
function parseJSONResponse(text) {
  // Try to extract JSON from markdown code blocks
  const jsonMatch = text.match(/```json\n([\s\S]*?)\n```/);
  if (jsonMatch) {
    try {
      return JSON.parse(jsonMatch[1]);
    } catch (e) {
      // Try parsing without the markdown wrapper
    }
  }

  // Try parsing directly
  try {
    return JSON.parse(text);
  } catch (e) {
    return {
      error: 'Could not parse as JSON',
      raw: text.substring(0, 500)
    };
  }
}

// ============================================================================
// Analysis Functions
// ============================================================================

/**
 * Analyze paper content
 */
async function analyzePaperContent(paperContent, paperTitle, mentorName) {
  const config = getAPIConfig();

  if (!config.apiKey) {
    const keyName = config.provider === 'openai' ? 'OPENAI_API_KEY' : 'ANTHROPIC_API_KEY';
    console.warn(`  ⚠️  ${keyName} not set - skipping analysis`);
    return {
      error: `${keyName} not set`,
      note: `Set ${keyName} environment variable to enable content analysis`
    };
  }

  const prompt = `You are an expert research analyst. Analyze this academic paper and extract structured information.

**Paper Title**: ${paperTitle}
**Mentor**: ${mentorName}

**Paper Content**:
${paperContent.substring(0, 8000)}...

Please analyze and return ONLY a JSON object (no markdown, no extra text):

{
  "research_themes": [
    {
      "theme": "theme name",
      "evidence": "brief evidence from text",
      "confidence": "high/medium/low"
    }
  ],
  "problem_preferences": {
    "type": "theoretical/practical/balanced",
    "orientation": "basic_research/applied_research",
    "innovation_style": "groundbreaking/incremental/iterative",
    "evidence": ["supporting quotes from text"]
  },
  "methodology": {
    "dataset_preference": "small_detailed/large_comprehensive/both",
    "ablation_focus": "detailed/simplified/rare",
    "evaluation_metrics": ["list of metrics"],
    "evidence": ["quotes"]
  },
  "visualization_style": {
    "common_charts": ["list types"],
    "style": "minimalist/detailed/innovative",
    "evidence": ["quotes"]
  },
  "writing_style": {
    "title_pattern": "short/detailed/question",
    "abstract_structure": "standard/variant",
    "technical_depth": "high/medium/low",
    "evidence": ["quotes"]
  },
  "thinking_pattern": {
    "innovation_source": "theory/data/application/cross_discipline",
    "problem_approach": ["step1", "step2", "step3"],
    "evidence": ["quotes"]
  },
  "academic_values": [
    "value1",
    "value2"
  ],
  "paper_organization": {
    "standard_structure": true,
    "intro_length": "short/medium/long",
    "method_presentation": "formulas/pseudocode/text",
    "experiments_ratio": "high/medium/low"
  }
}`;

  const result = await callLLM(prompt);

  if (result.error) {
    return result;
  }

  return parseJSONResponse(result.text);
}

/**
 * Analyze public information content (interviews, talks, etc.)
 */
async function analyzePublicContent(content, contentType, mentorName) {
  const config = getAPIConfig();

  if (!config.apiKey) {
    const keyName = config.provider === 'openai' ? 'OPENAI_API_KEY' : 'ANTHROPIC_API_KEY';
    return {
      error: `${keyName} not set`,
      note: `Set ${keyName} environment variable to enable content analysis`
    };
  }

  const contextInfo = {
    interview: 'interview transcript or conversation',
    talk: 'presentation or lecture transcript',
    news: 'news article or profile'
  };

  const prompt = `You are an expert analyst. Analyze this ${contextInfo[contentType] || 'public content'} about ${mentorName} and extract personality and style information.

**Content Type**: ${contentType}
**Mentor**: ${mentorName}

**Content**:
${content.substring(0, 6000)}...

Please analyze and return ONLY a JSON object:

{
  "personality": {
    "openness": {"level": "high/medium/low", "evidence": ["quotes"]},
    "conscientiousness": {"level": "high/medium/low", "evidence": ["quotes"]},
    "extraversion": {"level": "high/medium/low", "evidence": ["quotes"]},
    "agreeableness": {"level": "high/medium/low", "evidence": ["quotes"]},
    "emotional_stability": {"level": "high/medium/low", "evidence": ["quotes"]}
  },
  "work_style": {
    "pace": "fast/medium/slow",
    "priorities": ["priority1", "priority2"],
    "decision_style": "quick/deliberative",
    "evidence": ["quotes"]
  },
  "communication": {
    "speaking": {
      "pace": "fast/medium/slow",
      "tone": "formal/casual/serious",
      "humor": "present/absent",
      "formality": "very/formal/casual",
      "evidence": ["quotes"]
    }
  },
  "academic_philosophy": {
    "research_purpose": "description",
    "good_research": ["criteria1", "criteria2"],
    "field_views": ["view1", "view2"],
    "evidence": ["quotes"]
  },
  "values": [
    "value1",
    "value2"
  ],
  "interests": [
    "interest1",
    "interest2"
  ],
  "typical_quotes": [
    {"category": "about_research", "quote": "exact quote"},
    {"category": "about_work", "quote": "exact quote"}
  ]
}`;

  const result = await callLLM(prompt);

  if (result.error) {
    return result;
  }

  return parseJSONResponse(result.text);
}

/**
 * Analyze multiple papers and aggregate results
 */
async function analyzeMultiplePapers(papers, mentorName) {
  const config = getAPIConfig();
  console.log(`\n🧠 Analyzing ${papers.length} papers using ${config.provider.toUpperCase()} API...`);

  const results = [];
  let successCount = 0;

  for (let i = 0; i < Math.min(papers.length, 3); i++) {  // Limit to 3 for cost
    const paper = papers[i];
    console.log(`  [${i+1}/${Math.min(papers.length, 3)}] Analyzing: ${paper.title.substring(0, 60)}...`);

    const result = await analyzePaperContent(
      paper.summary + '\n\nTitle: ' + paper.title,
      paper.title,
      mentorName
    );

    if (!result.error && result.research_themes) {
      results.push(result);
      successCount++;
    }

    // Small delay to avoid rate limits
    await new Promise(resolve => setTimeout(resolve, 1000));
  }

  console.log(`  ✓ Successfully analyzed ${successCount}/${Math.min(papers.length, 3)} papers`);
  return results;
}

/**
 * Aggregate analysis results
 */
function aggregatePaperAnalysis(analyses) {
  if (analyses.length === 0) {
    return null;
  }

  // Aggregate research themes
  const themeMap = new Map();
  analyses.forEach(analysis => {
    analysis.research_themes.forEach(theme => {
      const key = theme.theme.toLowerCase();
      if (!themeMap.has(key)) {
        themeMap.set(key, []);
      }
      themeMap.get(key).push(theme.evidence);
    });
  });

  // Get top themes
  const topThemes = Array.from(themeMap.entries())
    .sort((a, b) => b[1].length - a[1].length)
    .slice(0, 5)
    .map(([theme, evidences]) => ({
      theme: theme.charAt(0).toUpperCase() + theme.slice(1),
      frequency: evidences.length,
      evidence: evidences[0]
    }));

  // Aggregate methodology (simplified)
  const methodologies = analyses
    .map(a => a.methodology)
    .filter(m => m && m.dataset_preference);

  const datasetPreference = methodologies.length > 0
    ? methodologies[0].dataset_preference
    : 'mixed';

  return {
    research_themes: topThemes,
    problem_preferences: {
      type: analyses[0]?.problem_preferences?.type || 'mixed',
      orientation: analyses[0]?.problem_preferences?.orientation || 'balanced',
      innovation_style: analyses[0]?.problem_preferences?.innovation_style || 'iterative',
      evidence: analyses.map(a => a.problem_preferences?.evidence || []).flat()
    },
    methodology: {
      dataset_preference: datasetPreference,
      ablation_focus: 'varies',
      evaluation_metrics: ['accuracy', 'efficiency'],
      evidence: methodologies.map(m => m.evidence || []).flat()
    },
    visualization_style: {
      common_charts: ['mixed'],
      style: 'varies',
      evidence: analyses.map(a => a.visualization_style?.evidence || []).flat()
    },
    writing_style: {
      title_pattern: 'mixed',
      abstract_structure: 'standard',
      technical_depth: 'varies',
      evidence: analyses.map(a => a.writing_style?.evidence || []).flat()
    },
    thinking_pattern: {
      innovation_source: 'mixed',
      problem_approach: ['identify', 'analyze', 'solve', 'validate'],
      evidence: analyses.map(a => a.thinking_pattern?.evidence || []).flat()
    },
    academic_values: ['innovation', 'rigor', 'impact'],
    paper_organization: {
      standard_structure: true,
      intro_length: 'medium',
      method_presentation: 'mixed',
      experiments_ratio: 'high'
    }
  };
}

// ============================================================================
// CLI Interface
// ============================================================================

/**
 * Main function for testing
 */
async function main() {
  const args = process.argv.slice(2);

  if (args.length === 0) {
    console.log('Usage: node content-analyzer.mjs "<paper-content-file> <paper-title> <mentor-name>"');
    console.log('');
    console.log('Environment Variables:');
    console.log('  LLM_API=anthropic|openai       (default: anthropic)');
    console.log('  ANTHROPIC_API_KEY=key           (for Anthropic Claude)');
    console.log('  OPENAI_API_KEY=key              (for OpenAI)');
    console.log('  OPENAI_MODEL=model              (default: gpt-4o)');
    console.log('  ANTHROPIC_MODEL=model           (default: claude-sonnet-4-20250514)');
    console.log('');
    console.log('Examples:');
    console.log('  # Using Anthropic Claude');
    console.log('  export ANTHROPIC_API_KEY="sk-ant-..."');
    console.log('  node content-analyzer.mjs paper.txt "My Paper" "Geoffrey Hinton"');
    console.log('');
    console.log('  # Using OpenAI');
    console.log('  export LLM_API=openai');
    console.log('  export OPENAI_API_KEY="sk-..."');
    console.log('  node content-analyzer.mjs paper.txt "My Paper" "Geoffrey Hinton"');
    process.exit(1);
  }

  const [contentFile, title, mentorName] = args;

  try {
    const fs = await import('fs/promises');
    const content = await fs.readFile(contentFile, 'utf8');

    const config = getAPIConfig();
    console.log(`\n🧠 Analyzing content from: ${contentFile}`);
    console.log(`📝 Title: ${title}`);
    console.log(`👤 Mentor: ${mentorName}`);
    console.log(`🔧 Using: ${config.provider.toUpperCase()} API (${config.model})`);
    console.log('');

    const result = await analyzePaperContent(content, title, mentorName);

    console.log('\n📊 Analysis Result:');
    console.log(JSON.stringify(result, null, 2));

  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export { analyzePaperContent, analyzePublicContent, analyzeMultiplePapers, aggregatePaperAnalysis, getAPIConfig };
