import { M as MdPromptPluginOptions } from './plugin-DjmX6cx1.js';
export { a as mdPromptPlugin } from './plugin-DjmX6cx1.js';
import 'unplugin';

/**
 * Universal md-prompt plugin that auto-detects your build environment
 * and applies the correct configuration. No manual setup required!
 */
declare function mdPrompt(options?: MdPromptPluginOptions): any;
/**
 * Simple API: just import and use, no configuration needed
 */
declare const auto: typeof mdPrompt;

export { MdPromptPluginOptions, auto, mdPrompt };
