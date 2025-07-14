// src/auto-setup.ts
import { existsSync, readFileSync, writeFileSync } from "fs";
import { join } from "path";
function detectProject(cwd = process.cwd()) {
  const packageJsonPath = join(cwd, "package.json");
  const hasPackageJson = existsSync(packageJsonPath);
  let bundler = "none";
  if (hasPackageJson) {
    const packageJson = JSON.parse(readFileSync(packageJsonPath, "utf-8"));
    const deps = {
      ...packageJson.dependencies,
      ...packageJson.devDependencies
    };
    if (deps.next || existsSync(join(cwd, "next.config.js")) || existsSync(join(cwd, "next.config.mjs"))) {
      bundler = "next";
    } else if (deps.astro || existsSync(join(cwd, "astro.config.mjs")) || existsSync(join(cwd, "astro.config.ts"))) {
      bundler = "astro";
    } else if (deps["@sveltejs/kit"] || existsSync(join(cwd, "svelte.config.js"))) {
      bundler = "sveltekit";
    } else if (deps.vite || existsSync(join(cwd, "vite.config.ts")) || existsSync(join(cwd, "vite.config.js"))) {
      bundler = "vite";
    } else if (deps.webpack || existsSync(join(cwd, "webpack.config.js"))) {
      bundler = "webpack";
    } else if (deps.rollup || existsSync(join(cwd, "rollup.config.js"))) {
      bundler = "rollup";
    }
  }
  const hasTypeScript = existsSync(join(cwd, "tsconfig.json")) || existsSync(join(cwd, "tsconfig.json"));
  return {
    bundler,
    hasTypeScript,
    projectRoot: cwd
  };
}
function autoSetup(projectInfo) {
  const messages = [];
  const { bundler, hasTypeScript, projectRoot } = projectInfo;
  if (hasTypeScript) {
    const tsconfigPath = join(projectRoot, "tsconfig.json");
    try {
      const tsconfig = JSON.parse(readFileSync(tsconfigPath, "utf-8"));
      if (!tsconfig.compilerOptions) {
        tsconfig.compilerOptions = {};
      }
      const currentTypes = tsconfig.compilerOptions.types || [];
      if (!currentTypes.includes("md-prompt")) {
        tsconfig.compilerOptions.types = [...currentTypes, "md-prompt"];
        writeFileSync(tsconfigPath, JSON.stringify(tsconfig, null, 2));
        messages.push("\u2705 Added md-prompt to tsconfig.json types");
      }
    } catch (error) {
      messages.push("\u26A0\uFE0F  Could not automatically update tsconfig.json");
    }
  }
  switch (bundler) {
    case "vite":
      const viteConfigPath = existsSync(join(projectRoot, "vite.config.ts")) ? join(projectRoot, "vite.config.ts") : join(projectRoot, "vite.config.js");
      if (!existsSync(viteConfigPath)) {
        const viteConfig = `import { defineConfig } from 'vite';
import { mdPromptPlugin } from 'md-prompt';

export default defineConfig({
  plugins: [mdPromptPlugin()],
});`;
        writeFileSync(viteConfigPath, viteConfig);
        messages.push("\u2705 Created vite.config.ts with md-prompt plugin");
      } else {
        messages.push(
          "\u26A0\uFE0F  Please add mdPromptPlugin() to your vite.config.ts plugins array"
        );
      }
      break;
    case "next":
      const nextConfigPath = join(projectRoot, "next.config.js");
      if (!existsSync(nextConfigPath)) {
        const nextConfig = `import { mdPromptPlugin } from 'md-prompt/next';

export default {
  webpack: (config) => {
    config.plugins.push(mdPromptPlugin());
    return config;
  },
};`;
        writeFileSync(nextConfigPath, nextConfig);
        messages.push("\u2705 Created next.config.js with md-prompt plugin");
      } else {
        messages.push(
          "\u26A0\uFE0F  Please add mdPromptPlugin() to your next.config.js webpack plugins"
        );
      }
      break;
    case "astro":
      messages.push(
        "\u26A0\uFE0F  Astro detected. Add to your astro.config.mjs:",
        "",
        "import { defineConfig } from 'astro/config';",
        "import mdPrompt from 'md-prompt';",
        "",
        "export default defineConfig({",
        "  vite: {",
        "    plugins: [mdPrompt()]",
        "  }",
        "});"
      );
      break;
    case "sveltekit":
      messages.push(
        "\u26A0\uFE0F  SvelteKit detected. Add to your vite.config.js:",
        "",
        "import { sveltekit } from '@sveltejs/kit/vite';",
        "import mdPrompt from 'md-prompt';",
        "",
        "export default {",
        "  plugins: [sveltekit(), mdPrompt()]",
        "};"
      );
      break;
    case "none":
      messages.push(
        "\u{1F4A1} No bundler detected. You can use the CLI: npx md-prompt build"
      );
      break;
    default:
      messages.push(
        `\u{1F4A1} ${bundler} detected. Add mdPrompt() to your bundler config.`
      );
  }
  return messages;
}
function generateQuickStart(projectInfo) {
  const { bundler } = projectInfo;
  const examples = {
    vite: `// 1. Create src/prompts/assistant.md:
# AI Assistant
You are a helpful assistant named {name}.

// 2. Use in your code:
import assistantPrompt from './prompts/assistant.md';
const prompt = assistantPrompt({ name: 'Claude' });`,
    next: `// 1. Create src/prompts/assistant.md:
# AI Assistant
You are a helpful assistant named {name}.

// 2. Use in your component:
import assistantPrompt from '../prompts/assistant.md';
const prompt = assistantPrompt({ name: 'Claude' });`,
    webpack: `// 1. Create src/prompts/assistant.md:
# AI Assistant
You are a helpful assistant named {name}.

// 2. Use in your code (with md-prompt/webpack loader):
import assistantPrompt from './prompts/assistant.md';
const prompt = assistantPrompt({ name: 'Claude' });`,
    rollup: `// 1. Create src/prompts/assistant.md:
# AI Assistant
You are a helpful assistant named {name}.

// 2. Use in your code (with md-prompt/rollup plugin):
import assistantPrompt from './prompts/assistant.md';
const prompt = assistantPrompt({ name: 'Claude' });`,
    astro: `// 1. Create src/prompts/assistant.md:
# AI Assistant
You are a helpful assistant named {name}.

// 2. Use in your .astro component:
---
import assistantPrompt from '../prompts/assistant.md';
const prompt = assistantPrompt({ name: 'Claude' });
---
<p>{prompt}</p>`,
    sveltekit: `// 1. Create src/prompts/assistant.md:
# AI Assistant
You are a helpful assistant named {name}.

// 2. Use in your +page.svelte:
<script>
import assistantPrompt from '$lib/prompts/assistant.md';
const prompt = assistantPrompt({ name: 'Claude' });
</script>
<p>{prompt}</p>`,
    none: `// 1. Create prompts/assistant.md:
# AI Assistant
You are a helpful assistant named {name}.

// 2. Build with CLI:
npx md-prompt build prompts/**/*.md --outdir src/generated

// 3. Import generated file:
import assistantPrompt from './generated/assistant.js';
const prompt = assistantPrompt({ name: 'Claude' });`
  };
  return examples[bundler] || examples.none;
}
export {
  autoSetup,
  detectProject,
  generateQuickStart
};
//# sourceMappingURL=auto-setup.js.map