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
        this.error(`Failed to process markdown file: ${error}`);
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