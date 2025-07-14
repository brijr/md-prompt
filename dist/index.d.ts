export { M as MdPromptPluginOptions, S as StringifyOptions, a as mdPromptPlugin, m as mdToString } from './plugin-DjmX6cx1.js';
export { auto, mdPrompt } from './universal-plugin.js';
export { autoSetup, detectProject } from './auto-setup.js';
export { TemplateOptions, getAvailableTemplates, scaffoldTemplate } from './templates.js';
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
