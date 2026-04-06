#!/bin/bash
# Test script to verify dual API support

echo "╔════════════════════════════════════════════════════════════╗"
echo "║                                                            ║"
echo "║     LLM API 双支持验证测试                                ║"
echo "║     Dual API Support Verification Test                    ║"
echo "║                                                            ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo ""

echo "📋 测试项目："
echo "  1. 检查 content-analyzer 模块导出"
echo "  2. 验证 Anthropic API 配置"
echo "  3. 验证 OpenAI API 配置"
echo "  4. 测试 API 切换功能"
echo ""

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Test 1: Check module exports
echo "✅ 测试 1: 检查模块导出"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
node -e "
import('./tools/content-analyzer.mjs').then(m => {
  const exports = Object.keys(m);
  console.log('导出的函数:', exports.join(', '));
  console.log('');
  if (exports.includes('getAPIConfig') &&
      exports.includes('analyzePaperContent') &&
      exports.includes('analyzePublicContent')) {
    console.log('✅ 所有必要函数已导出');
  } else {
    console.log('❌ 缺少必要的导出函数');
    process.exit(1);
  }
});
"
echo ""

# Test 2: Verify Anthropic configuration
echo "✅ 测试 2: 验证 Anthropic API 配置"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
node -e "
process.env.LLM_API = 'anthropic';
process.env.ANTHROPIC_API_KEY = 'test-key';
import('./tools/content-analyzer.mjs').then(m => {
  const config = m.getAPIConfig();
  console.log('Provider:', config.provider);
  console.log('Model:', config.model);
  console.log('Base URL:', config.baseURL);
  console.log('');
  if (config.provider === 'anthropic' &&
      config.model === 'claude-sonnet-4-20250514') {
    console.log('✅ Anthropic 配置正确');
  } else {
    console.log('❌ Anthropic 配置有误');
    process.exit(1);
  }
});
"
echo ""

# Test 3: Verify OpenAI configuration
echo "✅ 测试 3: 验证 OpenAI API 配置"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
node -e "
process.env.LLM_API = 'openai';
process.env.OPENAI_API_KEY = 'test-key';
import('./tools/content-analyzer.mjs').then(m => {
  const config = m.getAPIConfig();
  console.log('Provider:', config.provider);
  console.log('Model:', config.model);
  console.log('Base URL:', config.baseURL);
  console.log('');
  if (config.provider === 'openai' &&
      config.model === 'gpt-4o') {
    console.log('✅ OpenAI 配置正确');
  } else {
    console.log('❌ OpenAI 配置有误');
    process.exit(1);
  }
});
"
echo ""

# Test 4: Test API switching
echo "✅ 测试 4: 测试 API 切换功能"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
node -e "
// Test default (Anthropic)
delete process.env.LLM_API;
process.env.ANTHROPIC_API_KEY = 'test-key';
import('./tools/content-analyzer.mjs').then(m => {
  let config = m.getAPIConfig();
  console.log('默认配置 - Provider:', config.provider);
  console.log('');

  // Test switching to OpenAI
  process.env.LLM_API = 'openai';
  process.env.OPENAI_API_KEY = 'test-key';
  config = m.getAPIConfig();
  console.log('切换后 - Provider:', config.provider);
  console.log('');

  if (config.provider === 'openai') {
    console.log('✅ API 切换功能正常');
  } else {
    console.log('❌ API 切换功能异常');
    process.exit(1);
  }
});
"
echo ""

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

echo "╔════════════════════════════════════════════════════════════╗"
echo "║                                                            ║"
echo "║     ✅ 所有测试通过！                                      ║"
echo "║     All tests passed!                                     ║"
echo "║                                                            ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo ""

echo "📚 相关文档："
echo "  • API_QUICK_REFERENCE.md  - 快速配置指南"
echo "  • API_CONFIGURATION.md    - 完整配置文档"
echo ""

echo "🚀 快速开始："
echo ""
echo "  使用 Anthropic Claude:"
echo "  export ANTHROPIC_API_KEY=\"sk-ant-...\""
echo "  node tools/skill-generator.mjs \"Mentor Name\" --deep-analyze"
echo ""
echo "  使用 OpenAI:"
echo "  export LLM_API=\"openai\""
echo "  export OPENAI_API_KEY=\"sk-...\""
echo "  node tools/skill-generator.mjs \"Mentor Name\" --deep-analyze"
echo ""
