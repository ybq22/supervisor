# Changelog

## [1.1.0] - 2026-03-31

### 🚀 Major Update: 浏览器搜索成为默认选项

**重大变更**：系统现在默认使用浏览器搜索，全面收集导师信息，不再局限于 ArXiv API。

### ✨ 新增功能

#### 全面信息收集
- **默认启用浏览器搜索**：从 4 个维度收集导师信息
  - 🔍 个人主页和学术信息
  - 📄 论文和出版物
  - 🎤 演讲和访谈
  - 📚 Wikipedia 和百科信息

- **智能去重**：基于 URL 自动去重，确保结果唯一性

- **结果分类**：自动识别并分类搜索结果
  - 学术机构
  - 个人主页
  - 论文/研究
  - 演讲/访谈
  - Wikipedia
  - 其他

#### 新增工具脚本
- `test-comprehensive-search.js` - 全面信息收集测试脚本
- `puppeteer-search.js` - 浏览器搜索模块
- `test-puppeteer.js` - Puppeteer 基础测试

### 📝 改进

#### 数据质量评估
- 更新评分标准，适应浏览器搜索的大量数据
  - 论文数量：最高 0.4 分（≥ 5 篇）
  - 网页数量：最高 0.4 分（≥ 20 个）
  - 数据源多样性：最高 0.2 分（≥ 3 种）

#### 降级策略
- 浏览器搜索失败 → 自动回退到 DuckDuckGo API
- 确保系统在各种环境下都能工作

### 🔧 配置变更

#### 参数变更
- `--use-browser` → **默认启用**
- 新增 `--no-browser` 选项（快速模式）

#### 使用示例
```bash
# 全面收集（默认）
/distill-mentor "Yoshua Bengio"

# 快速模式
/distill-mentor "Yoshua Bengio" --no-browser
```

### 📊 测试结果

测试 "Yoshua Bengio (University of Montreal)"：
- ✅ 成功收集 23 个唯一结果
- ✅ 数据质量评分：0.8/1.0（优秀）
- ✅ 包含 4 种数据源类型

**收集到的信息类型**：
- 个人主页 (yoshuabengio.org)
- Google Scholar (164,000+ 引用)
- TED talks 和 YouTube 演讲
- Wikipedia 完整传记
- 学术机构页面
- 论文和出版物
- 访谈和观点文章

### 📦 依赖更新

- 新增 `puppeteer@^22.0.0`
- 包含 Chromium 浏览器 (~300MB)

### 📖 文档

- 新增 `PUPPETEER_GUIDE.md` - 浏览器搜索使用指南
- 更新 `distill-mentor.md` - 添加全面信息收集说明
- 新增 `package.json` - 项目依赖管理

### ⚠️ Breaking Changes

无破坏性变更。所有现有功能保持兼容。

### 💡 Migration Guide

无需迁移步骤。现有用户可以直接使用，系统会自动使用浏览器搜索。

如果需要使用旧的快速模式（仅 ArXiv + DuckDuckGo API）：
```bash
/distill-mentor "导师姓名" --no-browser
```

---

## [1.0.0] - 2026-03-30

### 🎉 Initial Release

- ArXiv 论文搜索
- DuckDuckGo 网页搜索
- AI 风格分析
- 数字分身生成
