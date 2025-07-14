import { defineConfig } from 'vite';
import { mdPromptPlugin } from 'md-prompt';

export default defineConfig({
  plugins: [mdPromptPlugin()],
});