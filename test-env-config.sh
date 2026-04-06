#!/bin/bash
# Test .env file configuration

echo "╔════════════════════════════════════════════════════════════╗"
echo "║                                                            ║"
echo "║     .env 文件配置测试                                      ║"
echo "║     Environment Configuration Test                         ║"
echo "║                                                            ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo ""

# Check if .env exists
if [ ! -f ".env" ]; then
  echo "❌ .env 文件不存在"
  echo ""
  echo "📝 创建 .env 文件："
  echo "  cp .env.example .env"
  echo "  nano .env  # 编辑配置"
  echo ""
  exit 1
fi

echo "✅ 找到 .env 文件"
echo ""

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Test 1: Check .env file syntax
echo "✅ 测试 1: 检查 .env 文件语法"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
node -e "
import('dotenv').then(({ config }) => {
  try {
    const result = config({ path: '.env' });
    if (result.error) {
      console.log('❌ .env 文件有语法错误:', result.error);
      process.exit(1);
    }
    console.log('✅ .env 文件语法正确');

    const keys = Object.keys(result.parsed || {});
    if (keys.length > 0) {
      console.log('找到的配置项:', keys.join(', '));
    } else {
      console.log('⚠️  .env 文件为空或所有配置都被注释');
    }
  } catch (error) {
    console.log('❌ 无法解析 .env 文件:', error.message);
    process.exit(1);
  }
});
"
echo ""

# Test 2: Load and verify configuration
echo "✅ 测试 2: 加载并验证配置"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
node -e "
import('./tools/content-analyzer.mjs').then(m => {
  const config = m.getAPIConfig();

  console.log('当前配置:');
  console.log('  Provider:', config.provider);
  console.log('  Model:', config.model);
  console.log('  Base URL:', config.baseURL);
  console.log('  API Key:', config.apiKey ? '✅ 已设置' : '❌ 未设置');
  echo '';

  if (!config.apiKey) {
    console.log('⚠️  警告: API 密钥未设置');
    echo '';

    if (config.provider === 'anthropic') {
      console.log('请设置: ANTHROPIC_API_KEY');
    } else {
      console.log('请设置: OPENAI_API_KEY');
    }
  } else {
    console.log('✅ 配置完整，可以正常使用');
  }
});
"
echo ""

# Test 3: Check API key format
echo "✅ 测试 3: 验证 API 密钥格式"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
node -e "
import('./tools/content-analyzer.mjs').then(m => {
  const config = m.getAPIConfig();

  if (!config.apiKey) {
    console.log('⚠️  跳过（API 密钥未设置）');
    return;
  }

  const key = config.apiKey;

  if (config.provider === 'anthropic') {
    if (key.startsWith('sk-ant-')) {
      console.log('✅ Anthropic API 密钥格式正确');
    } else {
      console.log('⚠️  Anthropic API 密钥格式可能不正确');
      console.log('   期望格式: sk-ant-...');
    }
  } else if (config.provider === 'openai') {
    if (key.startsWith('sk-')) {
      console.log('✅ OpenAI API 密钥格式正确');
    } else {
      console.log('⚠️  OpenAI API 密钥格式可能不正确');
      console.log('   期望格式: sk-...');
    }
  }
});
"
echo ""

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

echo "╔════════════════════════════════════════════════════════════╗"
echo "║                                                            ║"
echo "║     ✅ 测试完成！                                          ║"
echo "║                                                            ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo ""

echo "📚 相关文档："
echo "  • ENV_CONFIGURATION_GUIDE.md  - .env 配置指南"
echo "  • API_QUICK_REFERENCE.md     - 快速参考"
echo ""

echo "🚀 快速开始："
echo ""
echo "  1. 编辑 .env 文件："
echo "     nano .env"
echo ""
echo "  2. 填入 API 密钥："
echo "     # Anthropic"
echo "     ANTHROPIC_API_KEY=sk-ant-..."
echo ""
echo "     # OpenAI"
echo "     LLM_API=openai"
echo "     OPENAI_API_KEY=sk-..."
echo ""
echo "  3. 运行命令："
echo "     node tools/skill-generator.mjs \"Mentor Name\" --deep-analyze"
echo ""
