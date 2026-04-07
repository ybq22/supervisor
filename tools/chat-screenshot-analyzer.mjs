#!/usr/bin/env node
/**
 * Chat Screenshot Analyzer
 *
 * Analyzes chat screenshots to:
 * - Detect if image is a chat screenshot
 * - Identify which side is the mentor (usually left)
 * - Extract mentor's messages
 * - Analyze mentor's speaking style
 */

import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import path from 'path';
import fs from 'fs/promises';

// Load .env
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');
const envPath = path.join(projectRoot, '.env');

try {
  dotenv.config({ path: envPath });
} catch (error) {
  // Ignore
}

// Get API config
function getAPIConfig() {
  const provider = process.env.LLM_API?.toLowerCase() || 'anthropic';

  if (provider === 'openai') {
    return {
      provider: 'openai',
      apiKey: process.env.OPENAI_API_KEY,
      model: process.env.OPENAI_MODEL || 'gpt-4o',  // Use vision model
      baseURL: process.env.OPENAI_BASE_URL || 'https://api.openai.com/v1'
    };
  }

  return {
    provider: 'anthropic',
    apiKey: process.env.ANTHROPIC_API_KEY,
    model: process.env.ANTHROPIC_MODEL || 'claude-sonnet-4-20250514',
    baseURL: process.env.ANTHROPIC_BASE_URL || 'https://api.anthropic.com'
  };
}

/**
 * Check if file is an image
 */
function isImageFile(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  return ['.png', '.jpg', '.jpeg', '.gif', '.webp', '.bmp'].includes(ext);
}

/**
 * Convert image to base64
 */
async function imageToBase64(filePath) {
  const buffer = await fs.readFile(filePath);
  return buffer.toString('base64');
}

/**
 * Detect if image is a chat screenshot
 */
async function detectChatScreenshot(imagePath) {
  const config = getAPIConfig();

  if (!config.apiKey) {
    return { isChat: false, reason: 'No API key configured' };
  }

  try {
    const base64Image = await imageToBase64(imagePath);
    const mimeType = `image/${path.extname(imagePath).slice(1)}`;

    const prompt = `Look at this image and determine if it is a chat screenshot (WeChat, WhatsApp, Telegram, etc.).

Respond with ONLY a JSON object (no markdown, no extra text):
{
  "is_chat": true/false,
  "confidence": "high/medium/low",
  "platform": "WeChat/WhatsApp/Telegram/iMessage/SMS/Other",
  "evidence": ["list of visual cues that indicate it's a chat"]
}`;

    if (config.provider === 'openai') {
      const mimeType = `image/${path.extname(imagePath).slice(1)}`;
      const response = await fetch(`${config.baseURL}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${config.apiKey}`
        },
        body: JSON.stringify({
          model: config.model,
          messages: [
            {
              role: 'user',
              content: [
                { type: 'text', text: prompt },
                { type: 'image_url', image_url: { url: `data:${mimeType};base64,${base64Image}` } }
              ]
            }
          ],
          max_tokens: 500
        })
      });

      if (!response.ok) {
        throw new Error(`API error ${response.status}`);
      }

      const data = await response.json();
      const text = data.choices[0].message.content;
      return JSON.parse(text);

    } else {
      // Anthropic doesn't support image input in claude-sonnet-4
      // Use a different approach or skip
      return {
        isChat: false,
        reason: 'Anthropic API image input not supported, use OpenAI with gpt-4o'
      };
    }

  } catch (error) {
    return {
      isChat: false,
      reason: `Detection failed: ${error.message}`
    };
  }
}

/**
 * Extract mentor messages from chat screenshot
 */
async function extractMentorMessages(imagePath, mentorName) {
  const config = getAPIConfig();

  if (!config.apiKey) {
    return { error: 'No API key configured' };
  }

  try {
    const base64Image = await imageToBase64(imagePath);
    const mimeType = `image/${path.extname(imagePath).slice(1)}`;

    const prompt = `Analyze this chat screenshot and extract messages from the person named "${mentorName}".

**Important**: In most chat interfaces:
- Messages on the LEFT are from the other person (the mentor)
- Messages on the RIGHT are from "self" (the person who took the screenshot)

Extract ALL messages from "${mentorName}" and return ONLY a JSON object:
{
  "mentor_messages": [
    {
      "text": "exact message text",
      "timestamp": "if visible",
      "context": "what they're responding to (brief)"
    }
  ],
  "identified_side": "left/right",
  "confidence": "high/medium/low",
  "total_messages": number
}

If you cannot find "${mentorName}" in the chat, return:
{
  "error": "Mentor not found in chat",
  "suggestion": "The chat might be with a different person"
}`;

    const response = await fetch(`${config.baseURL}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${config.apiKey}`
      },
      body: JSON.stringify({
        model: config.model,
        messages: [
          {
            role: 'user',
            content: [
              { type: 'text', text: prompt },
              { type: 'image_url', image_url: { url: `data:${mimeType};base64,${base64Image}` } }
            ]
          }
        ],
        max_tokens: 2000
      })
    });

    if (!response.ok) {
      throw new Error(`API error ${response.status}`);
    }

    const data = await response.json();
    const text = data.choices[0].message.content;
    return JSON.parse(text);

  } catch (error) {
    return { error: error.message };
  }
}

/**
 * Analyze mentor's speaking style from chat messages
 */
async function analyzeSpeakingStyle(messages, mentorName) {
  const config = getAPIConfig();

  if (!config.apiKey) {
    return { error: 'No API key configured' };
  }

  try {
    const messagesText = messages.map(m => m.text).join('\n\n');

    const prompt = `Analyze the speaking style of "${mentorName}" based on these chat messages:

**Messages:**
${messagesText}

Return ONLY a JSON object:
{
  "speaking_style": {
    "tone": "formal/casual/friendly/professional/humorous",
    "directness": "very_direct/direct/indirect/very_subtle",
    "politeness": "very_polite/polite/neutral/casual",
    "emoji_usage": "frequent/moderate/rare/never",
    "common_emojis": ["emoji1", "emoji2"],
    "punctuation": ["typical patterns like ... or !!!"],
    "sentence_length": "short/medium/long/mixed",
    "response_length": "brief/medium/detailed"
  },
  "communication_patterns": {
    "greeting_style": "how they start messages",
    "closing_style": "how they end messages",
    "question_preference": "asks_many_questions/sometimes/rarely",
    "feedback_style": "encouraging/critical/constructive/direct"
  },
  "personality_traits": [
    "trait1",
    "trait2"
  ],
  "typical_phrases": [
    "phrase they often use 1",
    "phrase they often use 2"
  ],
  "language": "Chinese/English/Mixed",
  "formality_level": "very_formal/formal/neutral/casual/very_casual"
}`;

    const response = await fetch(`${config.baseURL}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${config.apiKey}`
      },
      body: JSON.stringify({
        model: config.model,
        messages: [{ role: 'user', content: prompt }],
        max_tokens: 1500
      })
    });

    if (!response.ok) {
      throw new Error(`API error ${response.status}`);
    }

    const data = await response.json();
    const text = data.choices[0].message.content;

    // Try to parse JSON
    const jsonMatch = text.match(/```json\n([\s\S]*?)\n```/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[1]);
    }

    return JSON.parse(text);

  } catch (error) {
    return { error: error.message };
  }
}

/**
 * Main analysis pipeline
 */
async function analyzeChatScreenshot(imagePath, mentorName) {
  console.log(`\n🔍 Analyzing chat screenshot: ${imagePath}`);
  console.log(`👤 Mentor: ${mentorName}\n`);

  // Step 1: Detect if it's a chat screenshot
  console.log('Step 1: Detecting chat screenshot...');
  const detection = await detectChatScreenshot(imagePath);

  if (!detection.isChat) {
    console.log(`  ❌ Not a chat screenshot: ${detection.reason || 'Unknown reason'}`);
    return {
      success: false,
      isChatScreenshot: false,
      reason: detection.reason
    };
  }

  console.log(`  ✅ Chat screenshot detected (${detection.platform})`);
  console.log(`  Confidence: ${detection.confidence}`);
  console.log(`  Evidence: ${detection.evidence.join(', ')}\n`);

  // Step 2: Extract mentor messages
  console.log('Step 2: Extracting mentor messages...');
  const extraction = await extractMentorMessages(imagePath, mentorName);

  if (extraction.error) {
    console.log(`  ❌ Extraction failed: ${extraction.error}`);
    return {
      success: false,
      isChatScreenshot: true,
      error: extraction.error
    };
  }

  if (!extraction.mentor_messages || extraction.mentor_messages.length === 0) {
    console.log(`  ⚠️  No messages found for "${mentorName}"`);
    return {
      success: false,
      isChatScreenshot: true,
      error: extraction.suggestion || 'No mentor messages found'
    };
  }

  console.log(`  ✅ Found ${extraction.total_messages} messages (side: ${extraction.identified_side})\n`);

  // Step 3: Analyze speaking style
  console.log('Step 3: Analyzing speaking style...');
  const style = await analyzeSpeakingStyle(extraction.mentor_messages, mentorName);

  if (style.error) {
    console.log(`  ⚠️  Style analysis failed: ${style.error}`);
    return {
      success: true,
      isChatScreenshot: true,
      messages: extraction.mentor_messages,
      style: null
    };
  }

  console.log(`  ✅ Style analysis complete\n`);

  // Print summary
  console.log('📊 Analysis Summary:');
  console.log(`  Tone: ${style.speaking_style.tone}`);
  console.log(`  Formality: ${style.formality_level}`);
  console.log(`  Language: ${style.language}`);
  console.log(`  Emojis: ${style.speaking_style.emoji_usage}`);
  console.log(`  Traits: ${style.personality_traits.join(', ')}`);
  console.log(`  Typical phrases: ${style.typical_phrases.slice(0, 2).join(', ')}`);

  return {
    success: true,
    isChatScreenshot: true,
    platform: detection.platform,
    messages: extraction.mentor_messages,
    style: style,
    metadata: {
      totalMessages: extraction.total_messages,
      identifiedSide: extraction.identified_side,
      confidence: extraction.confidence
    }
  };
}

// CLI interface
async function main() {
  const args = process.argv.slice(2);

  if (args.length < 2) {
    console.log('Usage: node chat-screenshot-analyzer.mjs <image_path> <mentor_name>');
    console.log('');
    console.log('Examples:');
    console.log('  node chat-screenshot-analyzer.mjs screenshot.png "Fei-Fei Li"');
    console.log('  node chat-screenshot-analyzer.mjs chat.jpg "Geoffrey Hinton"');
    process.exit(1);
  }

  const [imagePath, mentorName] = args;

  try {
    await fs.access(imagePath);
  } catch {
    console.error(`❌ File not found: ${imagePath}`);
    process.exit(1);
  }

  const result = await analyzeChatScreenshot(imagePath, mentorName);

  // Save result
  const outputPath = imagePath + '.analysis.json';
  await fs.writeFile(outputPath, JSON.stringify(result, null, 2));
  console.log(`\n💾 Analysis saved to: ${outputPath}`);
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export {
  isImageFile,
  detectChatScreenshot,
  extractMentorMessages,
  analyzeSpeakingStyle,
  analyzeChatScreenshot
};
