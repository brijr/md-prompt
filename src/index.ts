// Default export: auto-detecting plugin for simplest usage
export { mdPrompt as default } from './universal-plugin.js';

// Named exports for specific use cases
export { extractPlaceholders, generateTypeDefinition, generateTemplateFunction } from './extract.js';
export { mdToString } from './stringify.js';
export { mdPromptPlugin } from './plugin.js';
export { mdPrompt, auto } from './universal-plugin.js';
export { detectProject, autoSetup } from './auto-setup.js';
export { scaffoldTemplate, getAvailableTemplates } from './templates.js';

// Type exports
export type { PlaceholderInfo } from './extract.js';
export type { StringifyOptions } from './stringify.js';
export type { MdPromptPluginOptions } from './plugin.js';
export type { TemplateOptions } from './templates.js';
