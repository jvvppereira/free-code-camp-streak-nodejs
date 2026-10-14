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
});