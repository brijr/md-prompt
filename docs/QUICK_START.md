# Quick Start

Get up and running with md-prompt in 30 seconds.

## 🚀 Ultra-Fast Setup

```bash
# Install
pnpm add md-prompt

# Auto-setup everything
npx md-prompt init

# Or scaffold with a framework template
npx md-prompt init --template mastra
```

That's it! ✨

## 📝 Your First Prompt

Create `src/prompts/assistant.md`:

```markdown
# AI Assistant

You are a helpful assistant named {name}.

Current task: {task}
Urgency level: {urgency:number}
Additional context: {context?}
```

Use it in your code:

```typescript
import assistantPrompt from './prompts/assistant.md';

const prompt = assistantPrompt({
  name: 'Claude',
  task: 'Help debug TypeScript errors',
  urgency: 8,
  context: 'Working on a React project'
});

console.log(prompt);
// "AI Assistant You are a helpful assistant named Claude. Current task: Help debug TypeScript errors..."
```

## 🎯 Framework Examples

### Mastra.ai

```bash
npx md-prompt template mastra
```

Creates a ready-to-use weather agent:

```typescript
import { weatherAgent } from './src/agents/weather-agent';

const response = await weatherAgent.generate('What's the weather in NYC?');
```

### AI SDK (Vercel)

```bash
npx md-prompt template ai-sdk
```

### OpenAI Direct

```bash
npx md-prompt template openai
```

## ⚡ Zero Config

The universal plugin auto-detects your setup:

```typescript
// Any bundler - auto-detects Vite, Next.js, Webpack, etc.
import { mdPrompt } from 'md-prompt/auto';

export default {
  plugins: [mdPrompt()]
};
```

## 🔧 Advanced

For fine control, use the specific plugins:

```typescript
// Vite
import { mdPromptPlugin } from 'md-prompt/vite';

// Next.js
import { mdPromptPlugin } from 'md-prompt/next';

// Universal
import { mdPromptPlugin } from 'md-prompt';
```

## 📦 CLI Commands

```bash
# Setup with auto-detection
npx md-prompt init

# Scaffold framework templates
npx md-prompt template mastra
npx md-prompt template ai-sdk

# Build standalone (no bundler needed)
npx md-prompt build src/**/*.md

# Watch mode for development
npx md-prompt build src/**/*.md --watch
```

## 🎨 Placeholder Types

- `{name}` - Required string
- `{age:number}` - Required number
- `{active:boolean}` - Required boolean
- `{data:json}` - Required object
- `{city?}` - Optional string
- `{count:number?}` - Optional number

## 💡 Pro Tips

1. **Hot Reload**: Changes to `.md` files trigger automatic rebuilds
2. **Type Safety**: TypeScript enforces all required variables
3. **Zero Runtime**: Compiles to pure JavaScript functions
4. **Framework Agnostic**: Works with any AI library

---

**Need help?** Check the [full documentation](README.md) or [open an issue](https://github.com/yourusername/md-prompt/issues).
