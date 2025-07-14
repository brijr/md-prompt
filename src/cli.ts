import { Command } from "commander";
import { watch } from "chokidar";
import { readFile, writeFile, mkdir } from "fs/promises";
import { dirname, resolve, basename, extname } from "path";
import { glob } from "glob";
import { mdToString } from "./stringify.js";
import { extractPlaceholders, generateTemplateFunction } from "./extract.js";
import { detectProject, autoSetup, generateQuickStart } from "./auto-setup.js";
import { scaffoldTemplate, getAvailableTemplates } from "./templates.js";

const program = new Command();

program
  .name("md-prompt")
  .description("Markdown-to-prompt toolkit with typed placeholders")
  .version("0.1.0");

// Simplified alias commands
program
  .command("setup")
  .description("Quick setup - same as 'init'")
  .option("--dry-run", "Show what would be configured without making changes")
  .option("--template <framework>", "Scaffold starter files for a specific framework")
  .action(() => {
    // Delegate to init command
    program.commands.find(cmd => cmd.name() === 'init')?.parseAsync(['', '', ...process.argv.slice(3)]);
  });

program
  .command("watch")
  .description("Watch and build markdown files (defaults to **/*.md)")
  .argument("[pattern]", "Glob pattern for markdown files", "**/*.md")
  .option("-o, --outdir <dir>", "Output directory", "./generated")
  .action((pattern, options) => {
    // Delegate to build command with watch flag
    program.commands.find(cmd => cmd.name() === 'build')?.parseAsync(['', '', pattern, '--watch', '--outdir', options.outdir]);
  });

program
  .command("create <framework>")
  .description("Create template files for a framework")
  .option("-d, --dir <dir>", "Directory to create files in", ".")
  .action((framework, options) => {
    // Delegate to template command
    program.commands.find(cmd => cmd.name() === 'template')?.parseAsync(['', '', framework, '--dir', options.dir]);
  });

program
  .command("init")
  .description("Initialize md-prompt in your project with auto-detection")
  .option("--dry-run", "Show what would be configured without making changes")
  .option("--template <framework>", "Scaffold starter files for a specific framework (mastra, ai-sdk, openai, basic)")
  .action(async (options: { dryRun?: boolean; template?: string }) => {
    console.log("🔍 Detecting your project setup...\n");

    const projectInfo = detectProject();

    console.log(`📦 Project detected:`);
    console.log(`  Bundler: ${projectInfo.bundler}`);
    console.log(`  TypeScript: ${projectInfo.hasTypeScript ? "Yes" : "No"}`);
    console.log();

    if (options.dryRun) {
      console.log("🧪 Dry run mode - no files will be modified\n");
      const messages = autoSetup({ ...projectInfo }); // Don't actually modify in dry run
      messages.forEach((msg) => console.log(msg));
    } else {
      console.log("⚙️  Setting up md-prompt...\n");
      const messages = autoSetup(projectInfo);
      messages.forEach((msg) => console.log(msg));
    }

    // Scaffold template if requested
    if (options.template) {
      const availableTemplates = getAvailableTemplates();
      if (availableTemplates.includes(options.template)) {
        console.log(`\n📁 Scaffolding ${options.template} template...\n`);
        if (!options.dryRun) {
          const createdFiles = scaffoldTemplate(options.template as any, {
            promptsDir: process.cwd(),
            typescript: projectInfo.hasTypeScript
          });
          createdFiles.forEach(file => console.log(`✅ Created: ${file}`));
        } else {
          console.log(`Would create ${options.template} template files`);
        }
      } else {
        console.log(`\n❌ Unknown template: ${options.template}`);
        console.log(`Available templates: ${availableTemplates.join(', ')}`);
      }
    }

    console.log("\n📚 Quick Start:");
    console.log(generateQuickStart(projectInfo));

    console.log("\n🎉 Setup complete! Happy prompting!");
  });

program
  .command("template <framework>")
  .description("Scaffold starter files for a specific framework")
  .option("-d, --dir <directory>", "Output directory", ".")
  .action(async (framework: string, options: { dir: string }) => {
    const availableTemplates = getAvailableTemplates();

    if (!availableTemplates.includes(framework)) {
      console.log(`❌ Unknown template: ${framework}`);
      console.log(`Available templates: ${availableTemplates.join(', ')}`);
      return;
    }

    console.log(`📁 Scaffolding ${framework} template...\n`);

    const createdFiles = scaffoldTemplate(framework as any, {
      promptsDir: options.dir,
      typescript: true
    });

    createdFiles.forEach(file => console.log(`✅ Created: ${file}`));
    console.log(`\n🎉 ${framework} template scaffolded successfully!`);

    console.log('\n📚 Next steps:');
    console.log('1. Install dependencies if needed');
    console.log('2. Configure your environment variables');
    console.log('3. Run: npx md-prompt init (to setup bundler integration)');
  });

program
  .command("build")
  .description("Build markdown files to JavaScript modules")
  .argument("[pattern]", "Glob pattern for markdown files", "**/*.md")
  .option("-w, --watch", "Watch for changes and rebuild")
  .option("-o, --outdir <dir>", "Output directory", "./generated")
  .action(
    async (pattern: string, options: { watch?: boolean; outdir: string }) => {
      const files = await glob(pattern);

      if (files.length === 0) {
        console.log("No markdown files found");
        return;
      }

      const buildFiles = async () => {
        console.log(`Building ${files.length} files...`);

        for (const file of files) {
          await buildFile(file, options.outdir);
        }

        console.log("Build complete");
      };

      await buildFiles();

      if (options.watch) {
        console.log("Watching for changes...");
        const watcher = watch(files);

        watcher.on("change", async (path) => {
          console.log(`File changed: ${path}`);
          await buildFile(path, options.outdir);
        });

        watcher.on("add", async (path) => {
          console.log(`File added: ${path}`);
          await buildFile(path, options.outdir);
        });

        process.on("SIGINT", () => {
          watcher.close();
          process.exit(0);
        });
      }
    }
  );

async function buildFile(inputPath: string, outdir: string): Promise<void> {
  try {
    const content = await readFile(inputPath, "utf-8");
    const stringified = await mdToString(content);
    const placeholders = extractPlaceholders(stringified);
    const jsCode = generateTemplateFunction(stringified, placeholders);

    const baseName = basename(inputPath, extname(inputPath));
    const outputPath = resolve(outdir, `${baseName}.js`);
    const typesPath = resolve(outdir, `${baseName}.d.ts`);

    await mkdir(dirname(outputPath), { recursive: true });
    await writeFile(outputPath, jsCode);

    const typesContent =
      placeholders.length > 0
        ? `declare const _default: (vars: ${generateTypeDefinition(
            placeholders
          )}) => string;
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
  if (placeholders.length === 0) return "{}";

  const props = placeholders.map((p) => {
    const type = mapType(p.type);
    return p.optional ? `${p.name}?: ${type}` : `${p.name}: ${type}`;
  });

  return `{ ${props.join("; ")} }`;
}

function mapType(type?: string): string {
  switch (type) {
    case "number":
      return "number";
    case "boolean":
      return "boolean";
    case "json":
      return "Record<string, unknown>";
    default:
      return "string";
  }
}

program.parse();
