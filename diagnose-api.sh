#!/bin/bash
# API 诊断脚本

echo "╔════════════════════════════════════════════════════════════╗"
echo "║                                                            ║"
echo "║     API 配置诊断工具                                        ║"
echo "║     API Configuration Diagnostic Tool                      ║"
echo "║                                                            ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo ""

# Check .env file
if [ ! -f ".env" ]; then
  echo "❌ .env 文件不存在"
  exit 1
fi

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "📋 当前配置："
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Show provider
PROVIDER=$(grep "^LLM_API" .env | cut -d'=' -f2)
echo "Provider: ${PROVIDER:-anthropic (default)}"
echo ""

# Show base URL
BASE_URL=$(grep "^OPENAI_BASE_URL" .env | cut -d'=' -f2)
echo "Base URL: ${BASE_URL:-https://api.openai.com/v1}"
echo ""

# Show API key info
API_KEY=$(grep "^OPENAI_API_KEY" .env | cut -d'=' -f2)
if [ -n "$API_KEY" ]; then
  KEY_LENGTH=${#API_KEY}
  KEY_PREFIX=$(echo "$API_KEY" | cut -c1-10)
  echo "API Key: ✅ 已设置"
  echo "  长度: $KEY_LENGTH 字符"
  echo "  前缀: $KEY_PREFIX"
  echo ""

  # Check key length
  if [ $KEY_LENGTH -lt 20 ]; then
    echo "⚠️  警告: API Key 长度较短"
    echo "   标准的 API Key 通常有 40-51 个字符"
    echo ""
  fi

  # Check key format
  if [[ ! "$API_KEY" =~ ^sk- ]]; then
    echo "⚠️  警告: API Key 格式可能不正确"
    echo "   大多数 API Key 以 'sk-' 开头"
    echo ""
  fi
else
  echo "API Key: ❌ 未设置"
  echo ""
fi

# Show model
MODEL=$(grep "^OPENAI_MODEL" .env | cut -d'=' -f2)
echo "Model: ${MODEL:-gpt-4o (default)}"
echo ""

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "🧪 连接测试："
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Test API connection
if [ -n "$API_KEY" ]; then
  node -e "
  import('./tools/content-analyzer.mjs').then(async (m) => {
    const config = m.getAPIConfig();

    try {
      const response = await fetch(config.baseURL + '/models', {
        method: 'GET',
        headers: {
          'Authorization': 'Bearer ' + config.apiKey
        }
      });

      if (response.ok) {
        console.log('✅ API 连接成功！');
        console.log('');

        const data = await response.json();
        if (data.data && data.data.length > 0) {
          console.log('📦 可用模型 (' + data.data.length + ' 个):');
          data.data.slice(0, 10).forEach(model => {
            console.log('  - ' + model.id);
          });
          if (data.data.length > 10) {
            console.log('  ... 还有 ' + (data.data.length - 10) + ' 个模型');
          }
        }
      } else {
        const text = await response.text();
        console.log('❌ API 连接失败');
        console.log('状态码: ' + response.status);
        console.log('响应: ' + text.substring(0, 200));
        console.log('');

        if (response.status === 401) {
          console.log('💡 可能的原因：');
          console.log('   1. API Key 不正确');
          console.log('   2. API Key 已过期');
          console.log('   3. API Key 没有权限访问此端点');
        } else if (response.status === 404) {
          console.log('💡 可能的原因：');
          console.log('   1. Base URL 不正确');
          console.log('   2. API 端点路径不正确');
        }
      }
    } catch (error) {
      console.log('❌ 请求失败:', error.message);
    }
  });
  " 2>&1
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "💡 常见问题解决方案："
echo ""
echo "问题 1: 401 未授权"
echo "  → 检查 API Key 是否完整"
echo "  → 确认 API Key 是否激活"
echo "  → 检查 API Key 是否有足够权限"
echo ""
echo "问题 2: 模型不可用"
echo "  → 联系 API 提供商确认可用模型列表"
echo "  → 在 .env 中设置 OPENAI_MODEL=<正确的模型名>"
echo ""
echo "问题 3: Base URL 错误"
echo "  → 确认 API 服务的正确端点地址"
echo "  → 检查是否需要包含 /v1 路径"
echo ""
echo "📚 相关文档："
echo "  • ENV_CONFIGURATION_GUIDE.md - .env 配置指南"
echo "  • API_CONFIGURATION.md - 完整 API 文档"
echo ""
