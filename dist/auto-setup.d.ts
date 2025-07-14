interface ProjectInfo {
    bundler: "vite" | "next" | "webpack" | "rollup" | "none";
    hasTypeScript: boolean;
    projectRoot: string;
}
declare function detectProject(cwd?: string): ProjectInfo;
declare function autoSetup(projectInfo: ProjectInfo): string[];
declare function generateQuickStart(projectInfo: ProjectInfo): string;

export { autoSetup, detectProject, generateQuickStart };
