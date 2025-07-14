import { remark } from "remark";
import strip from "strip-markdown";

export interface StringifyOptions {
  collapse?: boolean;
  remarkPlugins?: any[];
}

export async function mdToString(
  raw: string,
  options: StringifyOptions = {}
): Promise<string> {
  const {
    collapse = true,
    remarkPlugins = [],
  } = options;

  let processor = remark();
  
  for (const plugin of remarkPlugins) {
    if (plugin && (typeof plugin === 'function' || (Array.isArray(plugin) && plugin.length > 0))) {
      processor = processor.use(plugin);
    }
  }
  
  processor = processor.use(strip as any);
  
  const file = await processor.process(raw);
  let result = String(file);
  
  if (collapse) {
    result = result.replace(/\s+/g, " ").trim();
  } else {
    result = result.trim();
  }
  
  return result;
}

