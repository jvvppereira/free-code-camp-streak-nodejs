import { test, describe } from 'node:test';
import assert from 'node:assert';
import { generateBadgeSvg } from '../services/svgService.js';

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
    assert.match(svg, /fill="url\(#bg\)"/);
    assert.match(svg, /stroke="#2d2e4a"/);
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

  test('should apply widget-small preset (280x120)', () => {
    const svg = generateBadgeSvg(mockData, { preset: 'widget-small' });
    
    assert.match(svg, /width="280"/);
    assert.match(svg, /height="120"/);
    assert.match(svg, /viewBox="0 0 280 120"/);
  });

  test('should apply widget-medium preset (360x160)', () => {
    const svg = generateBadgeSvg(mockData, { preset: 'widget-medium' });
    
    assert.match(svg, /width="360"/);
    assert.match(svg, /height="160"/);
    assert.match(svg, /viewBox="0 0 360 160"/);
  });

  test('should override preset with explicit width and height', () => {
    const svg = generateBadgeSvg(mockData, { preset: 'widget-small', width: 500, height: 200 });
    
    assert.match(svg, /width="500"/);
    assert.match(svg, /height="200"/);
    assert.match(svg, /viewBox="0 0 500 200"/);
  });

  test('should ignore invalid preset and use defaults', () => {
    const svg = generateBadgeSvg(mockData, { preset: 'invalid-preset' });
    
    assert.match(svg, /width="540"/);
    assert.match(svg, /height="190"/);
  });

  test('should generate filled background (default)', () => {
    const svg = generateBadgeSvg(mockData, { bg: 'filled' });
    
    assert.match(svg, /fill="url\(#bg\)"/);
    assert.match(svg, /stroke="#2d2e4a"/);
    assert.match(svg, /<defs>/);
    assert.match(svg, /linearGradient id="bg"/);
  });

  test('should generate dark background (solid, no gradient)', () => {
    const svg = generateBadgeSvg(mockData, { bg: 'dark' });
    
    assert.match(svg, /fill="#1a1b2e"/);
    assert.match(svg, /<defs>/);
    assert.doesNotMatch(svg, /linearGradient id="bg"/);
    assert.doesNotMatch(svg, /stroke="#2d2e4a"/);
  });

  test('should generate light background (solid, inverted colors)', () => {
    const svg = generateBadgeSvg(mockData, { bg: 'light' });
    
    assert.match(svg, /fill="#f8fafc"/);
    assert.match(svg, /fill="#1a1b2e"/); // text color
    assert.match(svg, /fill="#6b7280"/); // label color
    assert.match(svg, /<defs>/);
    assert.doesNotMatch(svg, /linearGradient id="bg"/);
    assert.doesNotMatch(svg, /stroke="#2d2e4a"/);
  });

  test('should generate transparent background (no rect, no gradient defs)', () => {
    const svg = generateBadgeSvg(mockData, { bg: 'transparent' });
    
    assert.doesNotMatch(svg, /<rect/);
    assert.match(svg, /<defs>/);
    assert.doesNotMatch(svg, /linearGradient id="bg"/);
    assert.match(svg, /linearGradient id="fire"/);
  });

  test('should fallback to filled for invalid bg value', () => {
    const svg = generateBadgeSvg(mockData, { bg: 'invalid' });
    
    assert.match(svg, /fill="url\(#bg\)"/);
    assert.match(svg, /stroke="#2d2e4a"/);
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
    
    // Status text should be escaped: & -> &, " -> "
    assert.match(svg, /Ready & Waiting "quoted"/);
    // Day label should be escaped: < -> <, > -> >
    assert.match(svg, /<script>/);
  });

  test('widget-small: should include status message with scaled fonts and icons', () => {
    const svg = generateBadgeSvg(mockData, { preset: 'widget-small' });
    
    // Status message should be present
    assert.match(svg, /Well done! Keep learning/);
    // Header font size 18
    assert.match(svg, /font-size="18"/);
    // Status font size 11
    assert.match(svg, /font-size="11"/);
    // Label font size 10
    assert.match(svg, /font-size="10"/);
    // Icon outer radius scaled to 8 (16 * 0.5)
    assert.match(svg, /r="8"/);
    // Icon inner radius scaled to 6 (12 * 0.5)
    assert.match(svg, /r="6"/);
  });

  test('widget-medium: should include status message with scaled fonts and icons', () => {
    const svg = generateBadgeSvg(mockData, { preset: 'widget-medium' });
    
    // Status message should be present
    assert.match(svg, /Well done! Keep learning/);
    // Header font size 20
    assert.match(svg, /font-size="20"/);
    // Status font size 12
    assert.match(svg, /font-size="12"/);
    // Label font size 11
    assert.match(svg, /font-size="11"/);
    // Icon outer radius scaled to 12 (16 * 0.75)
    assert.match(svg, /r="12"/);
    // Icon inner radius scaled to 9 (12 * 0.75)
    assert.match(svg, /r="9"/);
  });

  test('default: should use full size fonts and icons', () => {
    const svg = generateBadgeSvg(mockData, { preset: 'default' });
    
    // Status message should be present
    assert.match(svg, /Well done! Keep learning/);
    // Header font size 24
    assert.match(svg, /font-size="24"/);
    // Status font size 14
    assert.match(svg, /font-size="14"/);
    // Label font size 13
    assert.match(svg, /font-size="13"/);
    // Icon outer radius 16
    assert.match(svg, /r="16"/);
    // Icon inner radius 12
    assert.match(svg, /r="12"/);
  });

  test('progressive scaling: header font 24 > 20 > 18', () => {
    const svgDefault = generateBadgeSvg(mockData, { preset: 'default' });
    const svgMedium = generateBadgeSvg(mockData, { preset: 'widget-medium' });
    const svgSmall = generateBadgeSvg(mockData, { preset: 'widget-small' });
    
    assert.match(svgDefault, /font-size="24"/);
    assert.match(svgMedium, /font-size="20"/);
    assert.match(svgSmall, /font-size="18"/);
  });

  test('progressive scaling: icon outer radius 16 > 12 > 8', () => {
    const svgDefault = generateBadgeSvg(mockData, { preset: 'default' });
    const svgMedium = generateBadgeSvg(mockData, { preset: 'widget-medium' });
    const svgSmall = generateBadgeSvg(mockData, { preset: 'widget-small' });
    
    assert.match(svgDefault, /r="16"/);
    assert.match(svgMedium, /r="12"/);
    assert.match(svgSmall, /r="8"/);
  });
});