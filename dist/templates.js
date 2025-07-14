// src/templates.ts
import { writeFileSync, mkdirSync } from "fs";
import { join } from "path";
var templates = {
  basic: {
    "prompts/assistant.md": `# AI Assistant

You are a helpful AI assistant named {name}.

## Your Role
You provide accurate and helpful information on a wide variety of topics.

## Instructions
- Be {tone?} in your responses
- Keep answers {length?} unless asked for more detail
- If you don't know something, say so honestly`,
    "example.ts": `import assistantPrompt from './prompts/assistant.md';

// Basic usage
const prompt = assistantPrompt({
  name: 'Claude',
  tone: 'friendly',
  length: 'concise'
});

console.log(prompt);`
  },
  mastra: {
    "src/prompts/weather-agent.md": `# Weather Assistant

You are a helpful weather assistant named {name} that provides accurate weather information and can help planning activities based on the weather.

Your primary function is to help users get weather details for specific locations. When responding:

- Always ask for a location if none is provided
- If the location name isn't in English, please translate it
- If giving a location with multiple parts (e.g. "New York, NY"), use the most relevant part (e.g. "New York")
- Include relevant details like humidity, wind conditions, and precipitation
- Keep responses concise but informative
- If the user asks for activities and provides the weather forecast, suggest activities based on the weather forecast.
- If the user asks for activities, respond in the format they request.

Use the weatherTool to fetch current weather data.`,
    "src/agents/weather-agent.ts": `import { anthropic } from "@ai-sdk/anthropic";
import { Agent } from "@mastra/core/agent";
import { Memory } from "@mastra/memory";
import { LibSQLStore } from "@mastra/libsql";
import weatherPrompt from "../prompts/weather-agent.md";

export const weatherAgent = new Agent({
  name: "Weather Agent",
  instructions: weatherPrompt({ name: "Claude" }),
  model: anthropic("claude-3-5-sonnet-20241022"),
  memory: new Memory({
    storage: new LibSQLStore({
      url: "file:../mastra.db",
    }),
  }),
});`,
    "src/mastra/index.ts": `import { Mastra } from "@mastra/core/mastra";
import { weatherAgent } from "../agents/weather-agent";

export const mastra = new Mastra({
  agents: { weatherAgent }
});`
  },
  "ai-sdk": {
    "prompts/chat-assistant.md": `# Chat Assistant

You are a conversational AI assistant that helps users with various tasks.

## Context
- Conversation ID: {conversationId}
- User: {userName?}
- Session: {sessionId}

## Instructions
- Be helpful and {tone}
- Maintain context throughout the conversation
- Ask clarifying questions when needed
- Provide actionable advice when possible`,
    "src/chat.ts": `import { openai } from '@ai-sdk/openai';
import { generateText } from 'ai';
import chatPrompt from '../prompts/chat-assistant.md';

export async function generateResponse(message: string, context: any = {}) {
  const prompt = chatPrompt({
    conversationId: context.conversationId || 'default',
    userName: context.userName,
    sessionId: context.sessionId || Date.now().toString(),
    tone: 'friendly'
  });

  const { text } = await generateText({
    model: openai('gpt-4'),
    messages: [
      { role: 'system', content: prompt },
      { role: 'user', content: message }
    ],
  });

  return text;
}`
  },
  openai: {
    "prompts/completion.md": `# Task Assistant

You are an AI assistant that helps complete various tasks efficiently.

## Task Details
- Task: {taskType}
- Context: {context?}
- Requirements: {requirements?}
- Output format: {outputFormat?}

## Instructions
- Focus on the specific task at hand
- Provide clear, actionable responses
- Follow the specified output format if provided`,
    "src/openai-client.ts": `import OpenAI from 'openai';
import completionPrompt from '../prompts/completion.md';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function completeTask(task: {
  taskType: string;
  context?: string;
  requirements?: string;
  outputFormat?: string;
}) {
  const prompt = completionPrompt(task);

  const completion = await openai.chat.completions.create({
    messages: [{ role: 'user', content: prompt }],
    model: 'gpt-4',
  });

  return completion.choices[0]?.message?.content;
}`
  }
};
function scaffoldTemplate(framework = "basic", options = {}) {
  const { promptsDir = "." } = options;
  const templateFiles = templates[framework || "basic"] || templates.basic;
  const createdFiles = [];
  if (!templateFiles) {
    console.warn(`No templates found for framework: ${framework}, using basic templates`);
    return createdFiles;
  }
  for (const [filePath, content] of Object.entries(templateFiles)) {
    const fullPath = join(promptsDir, filePath);
    const dir = join(fullPath, "..");
    try {
      mkdirSync(dir, { recursive: true });
      writeFileSync(fullPath, content);
      createdFiles.push(filePath);
    } catch (error) {
      console.error(`Failed to create ${filePath}:`, error);
    }
  }
  return createdFiles;
}
function getAvailableTemplates() {
  return Object.keys(templates);
}
export {
  getAvailableTemplates,
  scaffoldTemplate
};
//# sourceMappingURL=templates.js.map