import { Command } from 'commander';
import { watch } from 'chokidar';
import { readFile, writeFile, mkdir } from 'fs/promises';
import { dirname, resolve, basename, extname } from 'path';
import { glob } from 'glob';
import { mdToString } from './stringify.js';
import { extractPlaceholders, generateTemplateFunction } from './extract.js';

const program = new Command();

program
  .name('md-prompt')
  .description('Markdown-to-prompt toolkit with typed placeholders')
  .version('0.1.0');

program
  .command('build')
  .description('Build markdown files to JavaScript modules')
  .argument('[pattern]', 'Glob pattern for markdown files', '**/*.md')
  .option('-w, --watch', 'Watch for changes and rebuild')
  .option('-o, --outdir <dir>', 'Output directory', 'dist')
  .action(async (pattern: string, options: { watch?: boolean; outdir: string }) => {
    const files = await glob(pattern);
    
    if (files.length === 0) {
      console.log('No markdown files found');
      return;
    }
    
    const buildFiles = async () => {
      console.log(`Building ${files.length} files...`);
      
      for (const file of files) {
        await buildFile(file, options.outdir);
      }
      
      console.log('Build complete');
    };
    
    await buildFiles();
    
    if (options.watch) {
      console.log('Watching for changes...');
      const watcher = watch(files);
      
      watcher.on('change', async (path) => {
        console.log(`File changed: ${path}`);
        await buildFile(path, options.outdir);
      });
      
      watcher.on('add', async (path) => {
        console.log(`File added: ${path}`);
        await buildFile(path, options.outdir);
      });
      
      process.on('SIGINT', () => {
        watcher.close();
        process.exit(0);
      });
    }
  });

async function buildFile(inputPath: string, outdir: string): Promise<void> {
  try {
    const content = await readFile(inputPath, 'utf-8');
    const stringified = await mdToString(content);
    const placeholders = extractPlaceholders(stringified);
    const jsCode = generateTemplateFunction(stringified, placeholders);
    
    const baseName = basename(inputPath, extname(inputPath));
    const outputPath = resolve(outdir, `${baseName}.js`);
    const typesPath = resolve(outdir, `${baseName}.d.ts`);
    
    await mkdir(dirname(outputPath), { recursive: true });
    await writeFile(outputPath, jsCode);
    
    const typesContent = placeholders.length > 0 
      ? `declare const _default: (vars: ${generateTypeDefinition(placeholders)}) => string;
export default _default;`
      : `declare const _default: string;
export default _default;`;
    
    await writeFile(typesPath, typesContent);
    
    console.log(`Built: ${inputPath} -> ${outputPath}`);
  } catch (error) {
    console.error(`Error building ${inputPath}:`, error);
  }
}

function generateTypeDefinition(placeholders: any[]): string {
  if (placeholders.length === 0) return '{}';
  
  const props = placeholders.map(p => {
    const type = mapType(p.type);
    return p.optional ? `${p.name}?: ${type}` : `${p.name}: ${type}`;
  });
  
  return `{ ${props.join('; ')} }`;
}

function mapType(type?: string): string {
  switch (type) {
    case 'number': return 'number';
    case 'boolean': return 'boolean';
    case 'json': return 'Record<string, unknown>';
    default: return 'string';
  }
}

program.parse();