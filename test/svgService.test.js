const { test, describe } = require('node:test');
const assert = require('node:assert');
const { generateBadgeSvg } = require('../services/svgService');

describe('svgService - generateBadgeSvg', () => {
  const mockData = {
    count: 5,
    last7Days: [
      { dayOfWeek: 'Mon', haveDone: true },
      { dayOfWeek: 'Tue', haveDone: false },
      { dayOfWeek: 'Wed', haveDone: true }
    ],
    status: 'Well done! Keep learning'
  };

  test('should generate SVG with default options (540x190)', () => {
    const svg = generateBadgeSvg(mockData);
    
    assert.match(svg, /<svg/);
    assert.match(svg, /width="540"/);
    assert.match(svg, /height="190"/);
    assert.match(svg, /viewBox="0 0 540 190"/);
    assert.match(svg, /5-day streak!/);
    assert.match(svg, /Well done! Keep learning/);
    assert.match(svg, /Mon<\/text>/);
    assert.match(svg, /Tue<\/text>/);
    assert.match(svg, /Wed<\/text>/);
  });

  test('should respect custom width and height options', () => {
    const svg = generateBadgeSvg(mockData, { width: 800, height: 300 });
    
    assert.match(svg, /width="800"/);
    assert.match(svg, /height="300"/);
    assert.match(svg, /viewBox="0 0 800 300"/);
  });

  test('should fallback to default options if custom width and height are invalid', () => {
    const svg = generateBadgeSvg(mockData, { width: 'invalid', height: -100 });
    
    assert.match(svg, /width="540"/);
    assert.match(svg, /height="190"/);
  });

  test('should escape special XML characters in status and user data', () => {
    const maliciousData = {
      count: 0,
      last7Days: [
        { dayOfWeek: '<script>', haveDone: true }
      ],
      status: 'Ready & Waiting "quoted"'
    };

    const svg = generateBadgeSvg(maliciousData);
    
    // Status text should be escaped: & -> &amp;, " -> &quot;
    assert.match(svg, /Ready &amp; Waiting &quot;quoted&quot;/);
    // Day label should be escaped: < -> &lt;, > -> &gt;
    assert.match(svg, /&lt;script&gt;/);
  });
});
