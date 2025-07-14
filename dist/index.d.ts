export { M as MdPromptPluginOptions, S as StringifyOptions, a as mdPromptPlugin, m as mdToString } from './plugin-DjmX6cx1.js';
import 'unplugin';

interface PlaceholderInfo {
    name: string;
    type?: string;
    optional: boolean;
    raw: string;
}
declare function extractPlaceholders(src: string): PlaceholderInfo[];
declare function generateTypeDefinition(placeholders: PlaceholderInfo[]): string;
declare function generateTemplateFunction(content: string, placeholders: PlaceholderInfo[]): string;

export { type PlaceholderInfo, extractPlaceholders, generateTemplateFunction, generateTypeDefinition };
