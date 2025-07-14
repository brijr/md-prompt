export interface PlaceholderInfo {
  name: string;
  type?: string;
  optional: boolean;
  raw: string;
}

export function extractPlaceholders(src: string): PlaceholderInfo[] {
  const re = /\{([a-zA-Z0-9_]+?)(\?)?(?::([a-z]+))?\}/g;
  const placeholders: PlaceholderInfo[] = [];
  const seen = new Set<string>();
  let match;
  
  while ((match = re.exec(src))) {
    const [raw, name, optionalMarker, type] = match;
    const key = `${name}${optionalMarker || ''}${type ? `:${type}` : ''}`;
    
    if (!seen.has(key) && name) {
      seen.add(key);
      const placeholder: PlaceholderInfo = {
        name,
        optional: Boolean(optionalMarker),
        raw,
      };
      if (type) {
        placeholder.type = type;
      }
      placeholders.push(placeholder);
    }
  }
  
  return placeholders;
}

export function generateTypeDefinition(placeholders: PlaceholderInfo[]): string {
  const required: string[] = [];
  const optional: string[] = [];
  
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
  return allProps.length > 0 ? `{ ${allProps.join('; ')} }` : '{}';
}

function mapPlaceholderType(type?: string): string {
  switch (type) {
    case 'number':
      return 'number';
    case 'boolean':
      return 'boolean';
    case 'json':
      return 'Record<string, unknown>';
    default:
      return 'string';
  }
}

export function generateTemplateFunction(
  content: string,
  placeholders: PlaceholderInfo[]
): string {
  const typeDefinition = generateTypeDefinition(placeholders);
  const hasPlaceholders = placeholders.length > 0;
  
  if (!hasPlaceholders) {
    return `export default ${JSON.stringify(content)};`;
  }
  
  let templateBody = content;
  for (const placeholder of placeholders) {
    const regex = new RegExp(escapeRegExp(placeholder.raw), 'g');
    templateBody = templateBody.replace(regex, `\${vars.${placeholder.name}}`);
  }
  
  return `export default function(vars: ${typeDefinition}): string {
  return \`${templateBody.replace(/`/g, '\\`').replace(/\$(?!{)/g, '\\$')}\`;
}`;
}

function escapeRegExp(string: string): string {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
