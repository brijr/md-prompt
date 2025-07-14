# md-prompt

Markdown-to-prompt toolkit with typed placeholders and zero runtime overhead.

## Features

- **Markdown → string**: Collapses headings, comments, extra whitespace
- **Typed placeholders**: `{name}` → required key, `{age:number}` → typed key, `{city?}` → optional key
- **Bundler plugin**: Single unplugin wrapper → works in Vite, Rollup, Webpack, esbuild, rspack
- **Node ESM loader**: `node --loader md-prompt/loader` for quick scripts & ts-node dev
- **Hot reload / watch**: Changes to `.md` invalidate modules & trigger HMR in Vite
- **CLI**: `md-prompt build [--watch]` generates ready-to-publish `.js` + `.d.ts`
- **Edge-safe output**: No `fs` or `remark` shipped to production; final bundle ≈ constant string

## Installation

```bash
npm install md-prompt
# or
pnpm install md-prompt
# or
yarn add md-prompt
```

## Quick Start

### 1. Create a markdown prompt

```markdown
<!-- src/prompts/weather.md -->
# Weather Assistant

You are a helpful weather assistant.

Current city: **{city}**
Temperature: **{temp:number} °C**
Weather conditions: **{conditions?}**
```

### 2. Configure your bundler

```ts
// vite.config.ts
import { defineConfig } from 'vite';
import { mdPromptPlugin } from 'md-prompt';

export default defineConfig({
  plugins: [mdPromptPlugin()],
});
```

### 3. Import and use

```ts
// src/agents/weather.ts
import prompt from '@/prompts/weather.md';

// TypeScript enforces all required variables are provided
const weatherPrompt = prompt({ 
  city: 'San Francisco', 
  temp: 22,
  conditions: 'sunny' // optional
});

console.log(weatherPrompt);
// Output: "Weather Assistant You are a helpful weather assistant. Current city: San Francisco Temperature: 22 °C Weather conditions: sunny"
```

## Placeholder Syntax

- `{name}` - Required string variable
- `{name?}` - Optional string variable  
- `{age:number}` - Required number variable
- `{age:number?}` - Optional number variable
- `{data:json}` - Required Record<string, unknown> variable
- `{enabled:boolean}` - Required boolean variable

## Usage

### With Vite/Rollup/Webpack

```ts
import { mdPromptPlugin } from 'md-prompt';

export default {
  plugins: [mdPromptPlugin()],
};
```

### With Node.js loader

```bash
node --loader md-prompt/loader script.js
```

### With CLI

```bash
# Build once
npx md-prompt build src/prompts/**/*.md

# Build and watch
npx md-prompt build src/prompts/**/*.md --watch

# Custom output directory
npx md-prompt build src/prompts/**/*.md --outdir dist/prompts
```

## API

### `mdToString(markdown, options?)`

Converts markdown to a plain string.

```ts
import { mdToString } from 'md-prompt';

const result = await mdToString('# Hello\n\nWorld');
console.log(result); // "Hello World"
```

Options:
- `collapse?: boolean` - Collapse whitespace (default: true)
- `preserveCodeBlocks?: boolean` - Keep code block content (default: false)
- `remarkPlugins?: any[]` - Additional remark plugins

### `extractPlaceholders(content)`

Extract placeholder information from content.

```ts
import { extractPlaceholders } from 'md-prompt';

const placeholders = extractPlaceholders('Hello {name} age {age:number}');
console.log(placeholders);
// [
//   { name: 'name', type: undefined, optional: false, raw: '{name}' },
//   { name: 'age', type: 'number', optional: false, raw: '{age:number}' }
// ]
```

### `generateTemplateFunction(content, placeholders)`

Generate a template function from content and placeholders.

```ts
import { generateTemplateFunction, extractPlaceholders } from 'md-prompt';

const content = 'Hello {name}!';
const placeholders = extractPlaceholders(content);
const jsCode = generateTemplateFunction(content, placeholders);

console.log(jsCode);
// export default function(vars: { name: string }): string {
//   return `Hello ${vars.name}!`;
// }
```

## Plugin Options

```ts
mdPromptPlugin({
  include: /\.md$/, // File patterns to include
  exclude: /node_modules/, // File patterns to exclude
  stringifyOptions: {
    collapse: true,
    preserveCodeBlocks: false,
    remarkPlugins: []
  }
})
```

## License

MIT