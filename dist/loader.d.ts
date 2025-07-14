declare function resolve(specifier: string, context: any, defaultResolve: any): Promise<any>;
declare function load(url: string, context: any, defaultLoad: any): Promise<any>;

export { load, resolve };
