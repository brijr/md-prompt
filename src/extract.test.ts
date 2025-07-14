import { describe, it, expect } from 'vitest';
import { extractPlaceholders, generateTypeDefinition, generateTemplateFunction } from './extract.js';

describe('extractPlaceholders', () => {
  it('should extract simple placeholders', () => {
    const result = extractPlaceholders('Hello {name}!');
    expect(result).toEqual([
      { name: 'name', type: undefined, optional: false, raw: '{name}' }
    ]);
  });

  it('should extract typed placeholders', () => {
    const result = extractPlaceholders('User {name} is {age:number} years old');
    expect(result).toEqual([
      { name: 'name', type: undefined, optional: false, raw: '{name}' },
      { name: 'age', type: 'number', optional: false, raw: '{age:number}' }
    ]);
  });

  it('should extract optional placeholders', () => {
    const result = extractPlaceholders('Hello {name?}');
    expect(result).toEqual([
      { name: 'name', type: undefined, optional: true, raw: '{name?}' }
    ]);
  });

  it('should extract mixed placeholders', () => {
    const result = extractPlaceholders('Hello {name}, you are {age:number} and {city?}');
    expect(result).toEqual([
      { name: 'name', type: undefined, optional: false, raw: '{name}' },
      { name: 'age', type: 'number', optional: false, raw: '{age:number}' },
      { name: 'city', type: undefined, optional: true, raw: '{city?}' }
    ]);
  });

  it('should handle duplicate placeholders', () => {
    const result = extractPlaceholders('Hello {name}, goodbye {name}');
    expect(result).toEqual([
      { name: 'name', type: undefined, optional: false, raw: '{name}' }
    ]);
  });

  it('should handle json type', () => {
    const result = extractPlaceholders('Data: {data:json}');
    expect(result).toEqual([
      { name: 'data', type: 'json', optional: false, raw: '{data:json}' }
    ]);
  });
});

describe('generateTypeDefinition', () => {
  it('should generate empty type for no placeholders', () => {
    const result = generateTypeDefinition([]);
    expect(result).toBe('{}');
  });

  it('should generate type for required placeholders', () => {
    const placeholders = [
      { name: 'name', type: undefined, optional: false, raw: '{name}' },
      { name: 'age', type: 'number', optional: false, raw: '{age:number}' }
    ];
    const result = generateTypeDefinition(placeholders);
    expect(result).toBe('{ name: string; age: number }');
  });

  it('should generate type for optional placeholders', () => {
    const placeholders = [
      { name: 'name', type: undefined, optional: false, raw: '{name}' },
      { name: 'city', type: undefined, optional: true, raw: '{city?}' }
    ];
    const result = generateTypeDefinition(placeholders);
    expect(result).toBe('{ name: string; city?: string }');
  });

  it('should map json type correctly', () => {
    const placeholders = [
      { name: 'data', type: 'json', optional: false, raw: '{data:json}' }
    ];
    const result = generateTypeDefinition(placeholders);
    expect(result).toBe('{ data: Record<string, unknown> }');
  });
});

describe('generateTemplateFunction', () => {
  it('should generate string export for no placeholders', () => {
    const result = generateTemplateFunction('Hello World!', []);
    expect(result).toBe('export default "Hello World!";');
  });

  it('should generate template function for placeholders', () => {
    const placeholders = [
      { name: 'name', type: undefined, optional: false, raw: '{name}' }
    ];
    const result = generateTemplateFunction('Hello {name}!', placeholders);
    expect(result).toContain('export default function(vars: { name: string }): string {');
    expect(result).toContain('return `Hello ${vars.name}!`;');
  });

  it('should escape template literals correctly', () => {
    const placeholders = [
      { name: 'name', type: undefined, optional: false, raw: '{name}' }
    ];
    const result = generateTemplateFunction('Hello {name}! `test` $var', placeholders);
    expect(result).toContain('return `Hello ${vars.name}! \\`test\\` \\$var`;');
  });
});