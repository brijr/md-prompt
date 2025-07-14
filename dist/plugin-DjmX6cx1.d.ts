import * as unplugin from 'unplugin';

interface StringifyOptions {
    collapse?: boolean;
    remarkPlugins?: any[];
}
declare function mdToString(raw: string, options?: StringifyOptions): Promise<string>;

interface MdPromptPluginOptions {
    include?: string | string[];
    exclude?: string | string[];
    stringifyOptions?: StringifyOptions;
}
declare const mdPromptPlugin: unplugin.UnpluginInstance<MdPromptPluginOptions, boolean>;

export { type MdPromptPluginOptions as M, type StringifyOptions as S, mdPromptPlugin as a, mdToString as m };
