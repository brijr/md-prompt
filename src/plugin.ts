import { createUnplugin } from 'unplugin';
import { createFilter } from '@rollup/pluginutils';
import MagicString from 'magic-string';
import { mdToString, type StringifyOptions } from './stringify.js';
import { extractPlaceholders, generateTemplateFunction } from './extract.js';

export interface MdPromptPluginOptions {
  include?: string | string[];
  exclude?: string | string[];
  stringifyOptions?: StringifyOptions;
}

export const mdPromptPlugin = createUnplugin((options: MdPromptPluginOptions = {}) => {
  const filter = createFilter(
    options.include || /\.md$/,
    options.exclude
  );

  return {
    name: 'md-prompt',
    async transform(code: string, id: string) {
      if (!filter(id)) return null;
      
      try {
        const stringified = await mdToString(code, options.stringifyOptions);
        const placeholders = extractPlaceholders(stringified);
        const jsCode = generateTemplateFunction(stringified, placeholders);
        
        const s = new MagicString(jsCode);
        
        return {
          code: s.toString(),
          map: s.generateMap({ hires: true }),
        };
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        const fileName = id.split('/').pop() || id;
        
        // Provide helpful error messages based on common issues
        if (errorMessage.includes('placeholder')) {
          this.error(
            `Invalid placeholder syntax in ${fileName}.\n` +
            `Supported formats:\n` +
            `  {name} - required string\n` +
            `  {name?} - optional string\n` +
            `  {age#} or {age:number} - number type\n` +
            `  {active!} or {active:boolean} - boolean type\n` +
            `  {data@} or {data:json} - JSON object\n` +
            `Error: ${errorMessage}`
          );
        } else if (errorMessage.includes('type')) {
          this.error(
            `Type error in ${fileName}.\n` +
            `Valid types: string (default), number, boolean, json\n` +
            `Error: ${errorMessage}`
          );
        } else {
          this.error(
            `Failed to process ${fileName}.\n` +
            `Error: ${errorMessage}\n` +
            `See https://github.com/yourusername/md-prompt#troubleshooting for help.`
          );
        }
        return null;
      }
    },
    
    vite: {
      handleHotUpdate({ file, server }) {
        if (filter(file)) {
          server.ws.send({
            type: 'full-reload',
          });
        }
      },
    },
  };
});

export default mdPromptPlugin;