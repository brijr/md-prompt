import { readFile } from 'fs/promises';
import { pathToFileURL } from 'url';
import { mdToString } from './stringify.js';
import { extractPlaceholders, generateTemplateFunction } from './extract.js';

export async function resolve(
  specifier: string,
  context: any,
  defaultResolve: any
): Promise<any> {
  if (specifier.endsWith('.md')) {
    return {
      url: pathToFileURL(specifier).href,
      format: 'module',
    };
  }
  
  return defaultResolve(specifier, context, defaultResolve);
}

export async function load(
  url: string,
  context: any,
  defaultLoad: any
): Promise<any> {
  if (url.endsWith('.md')) {
    const filePath = new URL(url).pathname;
    const content = await readFile(filePath, 'utf-8');
    const stringified = await mdToString(content);
    const placeholders = extractPlaceholders(stringified);
    const jsCode = generateTemplateFunction(stringified, placeholders);
    
    return {
      format: 'module',
      source: jsCode,
    };
  }
  
  return defaultLoad(url, context, defaultLoad);
}