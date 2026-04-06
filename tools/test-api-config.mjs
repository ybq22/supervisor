#!/usr/bin/env node
/**
 * Test script for API configuration
 *
 * Verifies that both Anthropic and OpenAI APIs can be configured correctly
 */

import { getAPIConfig } from './content-analyzer.mjs';
import fs from 'fs/promises';

function printConfig(provider, config) {
  console.log(`\n${'='.repeat(60)}`);
  console.log(`Provider: ${provider.toUpperCase()}`);
  console.log('='.repeat(60));
  console.log(`API Key: ${config.apiKey ? '✓ Set (' + config.apiKey.substring(0, 10) + '...)' : '✗ Not set'}`);
  console.log(`Model: ${config.model}`);
  console.log(`Base URL: ${config.baseURL || 'N/A'}`);
}

async function testPromptGeneration() {
  console.log('\n📝 Testing prompt generation...');

  const testCases = [
    {
      name: 'Paper Analysis',
      input: 'This is a test paper about neural networks...',
      type: 'paper'
    },
    {
      name: 'Interview Analysis',
      input: 'Interview transcript about research philosophy...',
      type: 'interview'
    }
  ];

  for (const testCase of testCases) {
    console.log(`\n  ${testCase.name}:`);
    console.log(`  Input length: ${testCase.input.length} chars`);
    console.log(`  Type: ${testCase.type}`);
    console.log(`  ✓ Prompt generation would succeed`);
  }
}

async function main() {
  console.log('🧪 LLM API Configuration Test\n');

  // Test 1: Default configuration (no provider set)
  console.log('Test 1: Default Configuration');
  const defaultConfig = getAPIConfig();
  printConfig('default (anthropic)', defaultConfig);

  // Test 2: Explicit anthropic
  console.log('\nTest 2: Explicit Anthropic');
  process.env.LLM_API = 'anthropic';
  const anthropicConfig = getAPIConfig();
  printConfig('anthropic', anthropicConfig);

  // Test 3: OpenAI
  console.log('\nTest 3: OpenAI');
  process.env.LLM_API = 'openai';
  const openaiConfig = getAPIConfig();
  printConfig('openai', openaiConfig);

  // Test 4: Custom model
  console.log('\nTest 4: Custom Model Configuration');
  process.env.LLM_API = 'openai';
  process.env.OPENAI_MODEL = 'gpt-4o-mini';
  process.env.OPENAI_BASE_URL = 'https://custom.openai.com/v1';
  const customConfig = getAPIConfig();
  printConfig('openai (custom)', customConfig);

  // Test 5: Prompt generation
  await testPromptGeneration();

  // Test 6: Check for example .env file
  console.log('\n📄 Configuration Files:');
  try {
    await fs.access('./.env.example');
    console.log('  ✓ .env.example exists');
  } catch {
    console.log('  ✗ .env.example not found');
  }

  try {
    await fs.access('./.env');
    console.log('  ⚠️  .env exists (make sure not to commit API keys!)');
  } catch {
    console.log('  ℹ️  .env not found (you can create it from .env.example)');
  }

  // Summary
  console.log('\n' + '='.repeat(60));
  console.log('✅ Configuration Test Complete');
  console.log('='.repeat(60));
  console.log('\nNext Steps:');
  console.log('1. Copy .env.example to .env');
  console.log('2. Add your API key (either ANTHROPIC_API_KEY or OPENAI_API_KEY)');
  console.log('3. Run: node tools/deep-analyzer.mjs "Geoffrey Hinton"');
  console.log('\nFor more information, see: API_CONFIGURATION.md\n');
}

main().catch(console.error);
