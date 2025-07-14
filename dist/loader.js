// src/loader.ts
import { readFile } from "fs/promises";
import { pathToFileURL } from "url";

// src/stringify.ts
import { remark } from "remark";
import strip from "strip-markdown";
async function mdToString(raw, options = {}) {
  const {
    collapse = true,
    remarkPlugins = []
  } = options;
  let processor = remark();
  for (const plugin of remarkPlugins) {
    if (plugin) {
      processor = processor.use(plugin);
    }
  }
  processor = processor.use(strip);
  const file = await processor.process(raw);
  let result = String(file);
  if (collapse) {
    result = result.replace(/\s+/g, " ").trim();
  } else {
    result = result.trim();
  }
  return result;
}

// src/extract.ts
function extractPlaceholders(src) {
  const re = /\{([a-zA-Z0-9_]+?)(\?)?(?::([a-z]+))?\}/g;
  const placeholders = [];
  const seen = /* @__PURE__ */ new Set();
  let match;
  while (match = re.exec(src)) {
    const [raw, name, optionalMarker, type] = match;
    const key = `${name}${optionalMarker || ""}${type ? `:${type}` : ""}`;
    if (!seen.has(key) && name) {
      seen.add(key);
      const placeholder = {
        name,
        optional: Boolean(optionalMarker),
        raw
      };
      if (type) {
        placeholder.type = type;
      }
      placeholders.push(placeholder);
    }
  }
  return placeholders;
}
function generateTypeDefinition(placeholders) {
  const required = [];
  const optional = [];
  for (const placeholder of placeholders) {
    const tsType = mapPlaceholderType(placeholder.type);
    const prop = `${placeholder.name}: ${tsType}`;
    if (placeholder.optional) {
      optional.push(`${placeholder.name}?: ${tsType}`);
    } else {
      required.push(prop);
    }
  }
  const allProps = [...required, ...optional];
  return allProps.length > 0 ? `{ ${allProps.join("; ")} }` : "{}";
}
function mapPlaceholderType(type) {
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
function generateTemplateFunction(content, placeholders) {
  const typeDefinition = generateTypeDefinition(placeholders);
  const hasPlaceholders = placeholders.length > 0;
  if (!hasPlaceholders) {
    return `export default ${JSON.stringify(content)};`;
  }
  let templateBody = content;
  for (const placeholder of placeholders) {
    const regex = new RegExp(escapeRegExp(placeholder.raw), "g");
    templateBody = templateBody.replace(regex, `\${vars.${placeholder.name}}`);
  }
  return `export default function(vars: ${typeDefinition}): string {
  return \`${templateBody.replace(/`/g, "\\`").replace(/\$(?!{)/g, "\\$")}\`;
}`;
}
function escapeRegExp(string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

// src/loader.ts
async function resolve(specifier, context, defaultResolve) {
  if (specifier.endsWith(".md")) {
    return {
      url: pathToFileURL(specifier).href,
      format: "module"
    };
  }
  return defaultResolve(specifier, context, defaultResolve);
}
async function load(url, context, defaultLoad) {
  if (url.endsWith(".md")) {
    const filePath = new URL(url).pathname;
    const content = await readFile(filePath, "utf-8");
    const stringified = await mdToString(content);
    const placeholders = extractPlaceholders(stringified);
    const jsCode = generateTemplateFunction(stringified, placeholders);
    return {
      format: "module",
      source: jsCode
    };
  }
  return defaultLoad(url, context, defaultLoad);
}
export {
  load,
  resolve
};
//# sourceMappingURL=loader.js.map