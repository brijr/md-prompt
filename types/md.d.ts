declare module '*.md' {
  /**
   * Template function generated from markdown file.
   * @param params - Object containing values for template placeholders
   * @returns Processed string with placeholders replaced
   */
  const template: (params?: Record<string, any>) => string;
  export default template;
  
  /**
   * Raw markdown content as a string (when using raw query parameter)
   */
  export const raw: string;
  
  /**
   * Template metadata
   */
  export const metadata: {
    placeholders: Array<{
      name: string;
      optional: boolean;
      type: 'string' | 'number' | 'boolean' | 'json';
    }>;
  };
}