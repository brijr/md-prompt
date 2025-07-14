interface TemplateOptions {
    framework?: "mastra" | "ai-sdk" | "openai" | "basic";
    promptsDir?: string;
    typescript?: boolean;
}
declare function scaffoldTemplate(framework?: TemplateOptions["framework"], options?: TemplateOptions): string[];
declare function getAvailableTemplates(): string[];

export { type TemplateOptions, getAvailableTemplates, scaffoldTemplate };
