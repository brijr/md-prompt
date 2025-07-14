# md-prompt

**The easiest way to use markdown files as AI prompts with TypeScript safety.**

Transform markdown files into type-safe template functions with zero runtime overhead. Perfect for AI applications, chatbots, and prompt engineering.

```typescript
// weather.md → TypeScript function with auto-completion
import weatherPrompt from './prompts/weather.md';

const prompt = weatherPrompt({
  city: 'San Francisco',    // ✅ Required
  temp: 22,                 // ✅ Typed as number
  conditions: 'sunny'       // ✅ Optional
});
```

## ⚡ Quick Start (30 seconds)

```bash
# 1. Install
pnpm add md-prompt

# 2. Auto-setup everything (detects your bundler & configures)
npx md-prompt init

# 3. Create your first prompt
echo "# Assistant\nYou are {name} helping with {task}." > prompts/assistant.md

# 4. Use it!
import assistant from './prompts/assistant.md';
const prompt = assistant({ name: 'Claude', task: 'coding' });
```

That's it! TypeScript types, bundler integration, and hot reload are automatically configured.

## 🎯 Framework Quick Start

Get started instantly with your favorite AI framework:

### Mastra.ai
```bash
npx md-prompt init --template mastra
```
Creates a complete weather agent with prompts, tools, and memory.

### AI SDK (Vercel)
```bash
npx md-prompt init --template ai-sdk
```
Ready-to-use chat assistant with streaming support.

### OpenAI Direct
```bash
npx md-prompt init --template openai
```
Simple OpenAI integration with typed prompts.

### Basic Template
```bash
npx md-prompt init --template basic
```
Minimal setup for any AI library.

## ✨ Features

- **🔄 Auto-Detection**: Automatically detects and configures Vite, Next.js, Webpack, etc.
- **📝 Markdown → TypeScript**: Your `.md` files become typed functions
- **🚀 Zero Runtime**: Compiles to pure JavaScript, no dependencies shipped
- **🔥 Hot Reload**: Changes to `.md` files trigger instant rebuilds
- **🎨 Type Safety**: Required/optional parameters with TypeScript validation
- **⚙️ Universal**: Works with any bundler or framework
- **📦 CLI Tools**: Build, watch, and scaffold commands

## 📚 Documentation

### Placeholder Syntax

Create dynamic prompts with typed placeholders:

```markdown
# AI Assistant

You are a {role} AI assistant named {name}.

## Context
- User: {userName}
- Task urgency: {urgency:number}
- Include examples: {includeExamples:boolean}
- Additional notes: {notes?}
- Data: {metadata:json}
```

**Types:**
- `{name}` → `string` (required)
- `{age:number}` → `number` (required)
- `{active:boolean}` → `boolean` (required)
- `{data:json}` → `Record<string, unknown>` (required)
- `{city?}` → `string` (optional)

### Using in Code

```typescript
import assistantPrompt from './prompts/assistant.md';

// TypeScript enforces all required parameters
const prompt = assistantPrompt({
  role: 'helpful',
  name: 'Claude',
  userName: 'Alice',
  urgency: 8,
  includeExamples: true,
  notes: 'Focus on React patterns', // optional
  metadata: { source: 'docs', version: '1.0' }
});
```

### Framework Integration

#### **Universal (Auto-Detection)**
```typescript
import { mdPrompt } from 'md-prompt/auto';

// Works with any bundler - auto-detects your setup
export default {
  plugins: [mdPrompt()]
};
```

#### **Vite**
```typescript
import { defineConfig } from 'vite';
import { mdPromptPlugin } from 'md-prompt/vite';

export default defineConfig({
  plugins: [mdPromptPlugin()],
});
```

#### **Next.js**
```typescript
import { mdPromptPlugin } from 'md-prompt/next';

export default {
  webpack: (config) => {
    config.plugins.push(mdPromptPlugin());
    return config;
  },
};
```

#### **No Bundler (CLI)**
```bash
# Build once
npx md-prompt build src/**/*.md --outdir dist

# Watch mode
npx md-prompt build src/**/*.md --watch

# Import generated files
import prompt from './dist/assistant.js';
```

## 🛠️ CLI Commands

### `npx md-prompt init`
Auto-detects your project and sets up everything:
- Configures bundler plugins
- Adds TypeScript types
- Creates example files
- Shows framework-specific instructions

```bash
npx md-prompt init                    # Auto-setup
npx md-prompt init --dry-run         # Preview changes
npx md-prompt init --template mastra  # With framework template
```

### `npx md-prompt template <framework>`
Scaffold starter files for specific frameworks:

```bash
npx md-prompt template mastra    # Mastra.ai weather agent
npx md-prompt template ai-sdk    # Vercel AI SDK chat
npx md-prompt template openai    # OpenAI direct integration
npx md-prompt template basic     # Minimal setup
```

### `npx md-prompt build`
Compile markdown files (for projects without bundler integration):

```bash
npx md-prompt build "src/**/*.md"           # Build once
npx md-prompt build "src/**/*.md" --watch   # Watch mode
npx md-prompt build "src/**/*.md" --outdir dist  # Custom output
```

## 🌟 Real-World Examples

### Mastra.ai Weather Agent

```markdown
<!-- src/prompts/weather-agent.md -->
# Weather Assistant

You are a helpful weather assistant named {name}.

Current location: {location}
Temperature: {temperature:number}°C
Conditions: {conditions?}

Provide accurate weather information and activity suggestions.
```

```typescript
// src/agents/weather-agent.ts
import { Agent } from "@mastra/core/agent";
import weatherPrompt from "../prompts/weather-agent.md";

export const weatherAgent = new Agent({
  name: "Weather Agent",
  instructions: weatherPrompt({
    name: "Claude",
    location: "San Francisco",
    temperature: 22
  }),
  model: anthropic("claude-3-5-sonnet-20241022"),
});
```

### AI SDK Chat Assistant

```markdown
<!-- prompts/chat.md -->
# Chat Assistant

You are a conversational AI assistant.

## Context
- Conversation ID: {conversationId}
- User: {userName?}
- Previous context: {context?}

Be helpful, concise, and {tone}.
```

```typescript
import { generateText } from 'ai';
import { openai } from '@ai-sdk/openai';
import chatPrompt from './prompts/chat.md';

const { text } = await generateText({
  model: openai('gpt-4'),
  prompt: chatPrompt({
    conversationId: 'abc123',
    userName: 'Alice',
    tone: 'friendly'
  }),
});
```

### Custom OpenAI Integration

```typescript
import OpenAI from 'openai';
import taskPrompt from './prompts/task.md';

const openai = new OpenAI();

const completion = await openai.chat.completions.create({
  model: 'gpt-4',
  messages: [{
    role: 'user',
    content: taskPrompt({
      taskType: 'code review',
      language: 'TypeScript',
      complexity: 'intermediate'
    })
  }]
});
```

## 🔧 Advanced Configuration

### Plugin Options

```typescript
mdPromptPlugin({
  include: /\.md$/,                    // File patterns to include
  exclude: /node_modules/,             // File patterns to exclude
  stringifyOptions: {
    collapse: true,                    // Collapse whitespace
    remarkPlugins: []                  // Additional remark plugins
  }
})
```

### TypeScript Configuration

Your `tsconfig.json` is automatically updated, but you can manually add:

```json
{
  "compilerOptions": {
    "types": ["md-prompt"]
  }
}
```

## 🚧 Migration from v0.0.1

All existing code continues to work! New features are additive:

```typescript
// Old way (still works)
import { mdPromptPlugin } from 'md-prompt';

// New way (easier)
import { mdPrompt } from 'md-prompt/auto';  // Auto-detects environment
```

## 📦 API Reference

### Core Functions

```typescript
import {
  mdToString,           // Convert markdown to string
  extractPlaceholders,  // Extract {variable} placeholders
  generateTemplateFunction, // Generate TypeScript function
  detectProject,        // Auto-detect project setup
  autoSetup,           // Auto-configure bundler
  scaffoldTemplate     // Create framework templates
} from 'md-prompt';
```

### Plugin Exports

```typescript
import { mdPromptPlugin } from 'md-prompt';        // Universal plugin
import { mdPromptPlugin } from 'md-prompt/vite';   // Vite-specific
import { mdPromptPlugin } from 'md-prompt/next';   // Next.js-specific
import { mdPrompt, auto } from 'md-prompt/auto';   // Auto-detection
```

## 🤝 Contributing

```bash
git clone https://github.com/yourusername/md-prompt
cd md-prompt
pnpm install
pnpm dev          # Watch mode
pnpm test         # Run tests
pnpm build        # Build package
```

## 📄 License

MIT

---

**Quick Links:**
- [Quick Start Guide](QUICK_START.md) - Get running in 30 seconds
- [Examples](./example/) - See it in action
- [Issues](https://github.com/yourusername/md-prompt/issues) - Bug reports & feature requests
