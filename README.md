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

## Getting Started Guide

### Step 1: Install and Configure

First, install `md-prompt` in your project:

```bash
pnpm add -D md-prompt
```

#### For Vite Projects

```ts
// vite.config.ts
import { defineConfig } from 'vite';
import { mdPromptPlugin } from 'md-prompt';

export default defineConfig({
  plugins: [mdPromptPlugin()],
});
```

#### For Next.js Projects

```js
// next.config.js
import { mdPromptPlugin } from 'md-prompt/next';

export default {
  webpack: (config) => {
    config.plugins.push(mdPromptPlugin());
    return config;
  },
};
```

#### For TypeScript Support

Add to your `tsconfig.json`:

```json
{
  "compilerOptions": {
    "types": ["md-prompt"]
  }
}
```

Or create a `global.d.ts` file:

```ts
declare module '*.md' {
  const prompt: (...args: any[]) => string;
  export default prompt;
}
```

### Step 2: Create Your First Prompt

Create a markdown file for your prompt:

```markdown
<!-- src/prompts/assistant.md -->
# AI Assistant

You are a helpful AI assistant named {name}.

## Context
- User location: {location}
- Current date: {date}
- Language preference: {language?}

## Instructions
Please be {tone} and {style?} in your responses.
```

### Step 3: Use in Your Code

```ts
// src/app.ts
import assistantPrompt from './prompts/assistant.md';

// TypeScript will enforce required fields!
const prompt = assistantPrompt({
  name: 'Claude',
  location: 'San Francisco',
  date: new Date().toISOString(),
  tone: 'friendly',
  // language is optional
  // style is optional
});

console.log(prompt);
// Output: "AI Assistant You are a helpful AI assistant named Claude. Context User location: San Francisco Current date: 2024-07-14T... Language preference: Instructions Please be friendly and in your responses."
```

### Step 4: Advanced Usage

#### Multiple Prompt Variants

```markdown
<!-- src/prompts/chatbot.md -->
# {botType} Assistant

You are a specialized {botType} assistant.

{isExpert?:boolean}
{#if isExpert}
You have expert-level knowledge in {expertise}.
{/if}

Current session:
- User: {userName}
- Session ID: {sessionId}
- Message count: {messageCount:number}
```

```ts
import chatbotPrompt from './prompts/chatbot.md';

// Customer service bot
const customerServicePrompt = chatbotPrompt({
  botType: 'Customer Service',
  userName: 'Alice',
  sessionId: 'cs-12345',
  messageCount: 0
});

// Expert technical bot
const technicalPrompt = chatbotPrompt({
  botType: 'Technical Support',
  userName: 'Bob',
  sessionId: 'tech-67890',
  messageCount: 5,
  isExpert: true,
  expertise: 'Cloud Architecture'
});
```

#### Using with AI SDKs

```ts
import { Anthropic } from '@anthropic-ai/sdk';
import weatherPrompt from './prompts/weather.md';

const anthropic = new Anthropic();

async function getWeatherResponse(city: string, temp: number) {
  const prompt = weatherPrompt({ city, temp });
  
  const response = await anthropic.messages.create({
    model: 'claude-3-sonnet-20241022',
    max_tokens: 1000,
    messages: [{ role: 'user', content: prompt }]
  });
  
  return response.content;
}
```

### Step 5: Development Workflow

#### Hot Reload in Development

When using Vite, your markdown prompts will hot reload automatically:

```markdown
<!-- Edit this file and see changes instantly -->
# Developer Assistant

Help debug {language} code.
Error type: {errorType}
```

#### Using Node.js Loader for Scripts

For quick scripts or testing:

```bash
# Run scripts with markdown imports
node --loader md-prompt/loader scripts/test-prompts.js
```

```js
// scripts/test-prompts.js
import devPrompt from '../prompts/developer.md';

console.log(devPrompt({
  language: 'TypeScript',
  errorType: 'Type Error'
}));
```

### Step 6: Production Build

Your markdown prompts compile to pure JavaScript:

```ts
// What you write
import prompt from './assistant.md';
const result = prompt({ name: 'Claude' });

// What gets bundled (zero dependencies!)
const prompt = (vars) => `AI Assistant You are ${vars.name}...`;
const result = prompt({ name: 'Claude' });
```

## Complete Example Project Structure

```
my-ai-app/
├── src/
│   ├── agents/
│   │   ├── chatbot.ts
│   │   └── assistant.ts
│   ├── prompts/
│   │   ├── chat.md
│   │   ├── summary.md
│   │   └── analysis.md
│   └── app.ts
├── vite.config.ts
├── tsconfig.json
└── package.json
```

```ts
// src/agents/chatbot.ts
import { Agent } from 'your-ai-sdk';
import chatPrompt from '../prompts/chat.md';
import summaryPrompt from '../prompts/summary.md';

export class ChatBot {
  private agent: Agent;
  
  constructor(private userName: string) {
    this.agent = new Agent({
      model: 'gpt-4',
      temperature: 0.7
    });
  }
  
  async chat(message: string, context?: string) {
    const prompt = chatPrompt({
      userName: this.userName,
      message,
      context: context || 'General conversation',
      timestamp: new Date().toISOString()
    });
    
    return this.agent.complete(prompt);
  }
  
  async summarize(conversation: string[]) {
    const prompt = summaryPrompt({
      messages: conversation.join('\n'),
      messageCount: conversation.length,
      userName: this.userName
    });
    
    return this.agent.complete(prompt);
  }
}
```

## Placeholder Syntax Reference

- `{name}` - Required string variable
- `{name?}` - Optional string variable  
- `{age:number}` - Required number variable
- `{age:number?}` - Optional number variable
- `{data:json}` - Required Record<string, unknown> variable
- `{enabled:boolean}` - Required boolean variable

## Alternative Usage Methods

### CLI Tool (Standalone)

For projects that can't use bundler plugins:

```bash
# Build once
npx md-prompt build src/prompts/**/*.md

# Build and watch for changes
npx md-prompt build src/prompts/**/*.md --watch

# Custom output directory
npx md-prompt build src/prompts/**/*.md --outdir dist/prompts
```

Then import the generated files:

```ts
import assistantPrompt from './dist/prompts/assistant.js';
```

### Node.js Loader (Development)

For quick testing and development scripts:

```bash
node --loader md-prompt/loader script.js
```

```js
// script.js
import prompt from './assistant.md';
console.log(prompt({ name: 'Test' }));
```

### Manual API Usage

Use the core functions directly:

```ts
import { mdToString, extractPlaceholders, generateTemplateFunction } from 'md-prompt';
import { readFileSync } from 'fs';

async function processMarkdown(filePath: string) {
  const markdown = readFileSync(filePath, 'utf-8');
  const text = await mdToString(markdown);
  const placeholders = extractPlaceholders(text);
  const jsCode = generateTemplateFunction(text, placeholders);
  
  console.log('Generated JS:', jsCode);
}
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
    remarkPlugins: []
  }
})
```

## Best Practices

### 1. Organize Your Prompts

Keep prompts organized by feature or use case:

```
src/prompts/
├── agents/
│   ├── customer-service.md
│   ├── technical-support.md
│   └── sales.md
├── tasks/
│   ├── summarize.md
│   ├── translate.md
│   └── analyze.md
└── templates/
    ├── email.md
    ├── report.md
    └── documentation.md
```

### 2. Use Descriptive Variable Names

```markdown
<!-- Good -->
# Code Review Assistant

Please review this {programmingLanguage} code:
```{codeBlock}```

Focus on {reviewType} and check for {securityConcerns?}.

<!-- Less clear -->
# Assistant

Review this {lang} code: {code}
Focus on {type}.
```

### 3. Provide Context in Your Prompts

```markdown
<!-- Good: Provides clear context -->
# Email Response Generator

You are a professional customer service representative.
Respond to this customer email in a {tone} tone.

Customer email:
{customerMessage}

Company policy: {relevantPolicy?}

<!-- Less effective: Too vague -->
# Assistant

Respond to: {message}
```

### 4. Use Type Hints for Better DX

```markdown
<!-- Helps with validation and documentation -->
Generate a report for {reportType} analysis.

Data points: {dataCount:number}
Include charts: {includeCharts:boolean}
Export format: {format}
Additional notes: {notes?}
```

## Troubleshooting

### TypeScript Errors

**Problem**: TypeScript doesn't recognize `.md` imports
```
Cannot find module './prompt.md' or its corresponding type declarations.
```

**Solution**: Add type declarations to your project:

```ts
// global.d.ts or types/md-prompt.d.ts
declare module '*.md' {
  const prompt: (vars?: Record<string, any>) => string;
  export default prompt;
}
```

### Build Errors

**Problem**: Plugin not transforming markdown files

**Solution**: Ensure the plugin is properly configured and files match the include pattern:

```ts
// Check your bundler config
mdPromptPlugin({
  include: /\.md$/, // Make sure this matches your files
  exclude: /node_modules/
})
```

### Runtime Errors

**Problem**: Variables not being replaced in output

**Solution**: Check your placeholder syntax:

```markdown
<!-- Correct -->
Hello {name}!

<!-- Incorrect (will not be replaced) -->
Hello ${name}!
Hello {name
Hello name}
```

**Problem**: Missing required variables

**Solution**: TypeScript will catch this at compile time, but ensure all required placeholders are provided:

```ts
// This will cause a TypeScript error
const prompt = myPrompt({ name: 'John' }); // Missing 'age' if required

// Correct
const prompt = myPrompt({ name: 'John', age: 25 });
```

### Performance Tips

1. **Minimize placeholder complexity**: Simple variable names perform better than complex expressions
2. **Use optional parameters wisely**: Only mark variables as optional if they truly are
3. **Consider prompt length**: Very long prompts may impact AI model performance
4. **Cache compiled prompts**: In production, the generated functions are already optimized

## Migration Guide

### From Template Strings

```ts
// Before: Using template strings
const prompt = `You are ${role}. Help with ${task}.`;

// After: Using md-prompt
// Create: prompts/assistant.md
// Content: You are {role}. Help with {task}.
import assistantPrompt from './prompts/assistant.md';
const prompt = assistantPrompt({ role: 'helper', task: 'coding' });
```

### From Other Prompt Libraries

Most prompt libraries can be migrated by:
1. Converting template syntax to `{variable}` format
2. Adding type hints where beneficial (`:number`, `:boolean`, etc.)
3. Using markdown for better readability
4. Leveraging TypeScript for compile-time validation

## License

MIT