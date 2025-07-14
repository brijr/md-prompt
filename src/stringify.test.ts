import { describe, it, expect } from 'vitest';
import { mdToString } from './stringify.js';

describe('mdToString', () => {
  it('should convert simple markdown to string', async () => {
    const result = await mdToString('# Hello World\n\nThis is a paragraph.');
    expect(result).toBe('Hello World This is a paragraph.');
  });

  it('should collapse whitespace by default', async () => {
    const result = await mdToString('# Hello\n\n\nWorld\n\n  Test  ');
    expect(result).toBe('Hello World Test');
  });

  it('should preserve whitespace when collapse is false', async () => {
    const result = await mdToString('# Hello\n\nWorld', { collapse: false });
    expect(result).toBe('Hello\n\nWorld');
  });

  it('should strip markdown formatting', async () => {
    const result = await mdToString('**Bold** and *italic* text');
    expect(result).toBe('Bold and italic text');
  });

  it('should handle lists', async () => {
    const result = await mdToString('- Item 1\n- Item 2\n- Item 3');
    expect(result).toBe('Item 1 Item 2 Item 3');
  });

  it('should handle blockquotes', async () => {
    const result = await mdToString('> This is a quote\n> Second line');
    expect(result).toBe('This is a quote Second line');
  });

  it('should strip code blocks by default', async () => {
    const result = await mdToString('```js\nconsole.log("hello");\n```');
    expect(result).toBe('');
  });

  it('should handle inline code', async () => {
    const result = await mdToString('Use `console.log()` to print');
    expect(result).toBe('Use console.log() to print');
  });

  it('should handle mixed content', async () => {
    const markdown = `# Weather Assistant

You are a helpful weather assistant.

Current city: **{city}**
Temperature: **{temp:number} °C**

## Instructions

- Be helpful
- Provide accurate information`;

    const result = await mdToString(markdown);
    expect(result).toBe('Weather Assistant You are a helpful weather assistant. Current city: {city} Temperature: {temp:number} °C Instructions Be helpful Provide accurate information');
  });
});