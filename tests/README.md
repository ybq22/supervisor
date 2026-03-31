# Distill-Mentor Test Suite

This directory contains automated tests for the distill-mentor system.

## Test Files

### `test-distill-mentor.js`
Comprehensive test suite covering all core functions:
- ArXiv search functionality
- Profile generation
- Data quality assessment
- System prompt generation
- Edge case handling

## Running Tests

### Run all tests:
```bash
node tests/test-distill-mentor.js
```

### Expected Output:
```
============================================================
🧪 Distill-Mendor Test Suite
============================================================

📚 Test 1: ArXiv Search
============================================================
✅ 找到 3 篇论文
✓ ArXiv 搜索测试通过

... (more tests)

============================================================
📊 Test Results
============================================================
✅ Passed: 5/5
❌ Failed: 0/5
============================================================

🎉 All tests passed!
```

## Test Coverage

### 1. ArXiv Search Test
- Tests fetching papers from ArXiv API
- Validates response structure (title, arxiv_id, summary, etc.)
- Falls back to mock data if network fails
- Searches for well-known researchers (Hinton, LeCun)

### 2. Profile Generation Test
- Tests creating mentor profiles from mock data
- Validates profile structure and metadata
- Checks research fields and publications
- Ensures proper data transformation

### 3. Data Quality Assessment Test
- Tests quality scoring algorithm
- Validates detection of missing data
- Checks data source tracking
- Tests both high-quality and low-quality scenarios

### 4. System Prompt Generation Test
- Tests generation of AI system prompts
- Validates inclusion of mentor information
- Checks prompt structure and completeness
- Ensures all required sections are present

### 5. Edge Cases Test
- Tests handling of empty data
- Validates null/undefined handling
- Tests special character sanitization
- Ensures graceful degradation

## Adding New Tests

To add a new test:

1. Create a new test function:
```javascript
async function testNewFeature() {
  console.log('\n🔬 Test 6: New Feature');
  console.log('=' .repeat(60));

  // Your test code here
  assert(condition, "Error message");

  console.log('✓ New feature test passed');
}
```

2. Add it to the tests array in `runTests()`:
```javascript
const tests = [
  // ... existing tests
  { name: 'New Feature', fn: testNewFeature }
];
```

3. Run the test suite to verify

## Troubleshooting

### Tests fail with "网络搜索失败"
- Check your internet connection
- The test will use mock data as a fallback
- This is expected behavior in offline environments

### ArXiv API rate limiting
- The test uses multiple search queries as fallback
- If all queries fail, mock data is used
- Consider running tests later if rate limit is hit

### Test file not found
- Ensure you're in the `supervisor` directory
- Use: `node tests/test-distill-mentor.js`
- Not: `node test-distill-mentor.js`

## Continuous Integration

These tests can be integrated into CI/CD pipelines:

```yaml
# Example GitHub Actions
- name: Run tests
  run: node tests/test-distill-mentor.js
```

## Test Data

Tests use a combination of:
- Real ArXiv API calls (with network)
- Mock data for offline scenarios
- Edge case data for comprehensive coverage

## Contributing

When adding new features to distill-mentor:
1. Add corresponding tests here
2. Ensure all existing tests still pass
3. Update this README with new test descriptions
4. Consider edge cases and error conditions
