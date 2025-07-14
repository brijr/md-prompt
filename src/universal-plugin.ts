import { mdPromptPlugin } from "./plugin.js";
import type { MdPromptPluginOptions } from "./plugin.js";

/**
 * Universal md-prompt plugin that auto-detects your build environment
 * and applies the correct configuration. No manual setup required!
 */
export function mdPrompt(options: MdPromptPluginOptions = {}) {
  // For Node.js environments, check if we're in a build process
  if (typeof process !== "undefined" && process.env) {
    // Auto-detect common build environments
    const isVite =
      process.env.VITE_CJS_TRACE ||
      process.env.npm_lifecycle_script?.includes("vite") ||
      process.argv.some((arg) => arg.includes("vite"));

    const isNext =
      process.env.NEXT_RUNTIME ||
      process.env.npm_lifecycle_script?.includes("next") ||
      process.argv.some((arg) => arg.includes("next"));

    const isWebpack =
      process.env.npm_lifecycle_script?.includes("webpack") ||
      process.argv.some((arg) => arg.includes("webpack"));

    // Return environment-specific plugin
    if (isVite) {
      return mdPromptPlugin.vite(options);
    } else if (isNext) {
      return mdPromptPlugin.webpack(options);
    } else if (isWebpack) {
      return mdPromptPlugin.webpack(options);
    }
  }

  // Return the raw unplugin (works with unplugin-compatible bundlers)
  return mdPromptPlugin.webpack(options);
}

/**
 * Simple API: just import and use, no configuration needed
 */
export const auto = mdPrompt;

/**
 * Legacy exports for backward compatibility
 */
export { mdPromptPlugin } from "./plugin.js";
export type { MdPromptPluginOptions } from "./plugin.js";
