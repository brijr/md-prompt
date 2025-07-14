import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { existsSync, writeFileSync, mkdirSync, rmSync } from "fs";
import { join } from "path";
import { detectProject, autoSetup } from "./auto-setup.js";

const testDir = join(process.cwd(), "test-setup");

describe("auto-setup", () => {
  beforeEach(() => {
    if (existsSync(testDir)) {
      rmSync(testDir, { recursive: true, force: true });
    }
    mkdirSync(testDir, { recursive: true });
  });

  afterEach(() => {
    if (existsSync(testDir)) {
      rmSync(testDir, { recursive: true, force: true });
    }
  });

  describe("detectProject", () => {
    it("should detect vite project", () => {
      const packageJson = {
        dependencies: { vite: "^4.0.0" },
      };
      writeFileSync(join(testDir, "package.json"), JSON.stringify(packageJson));

      const result = detectProject(testDir);
      expect(result.bundler).toBe("vite");
    });

    it("should detect next.js project", () => {
      const packageJson = {
        dependencies: { next: "^13.0.0" },
      };
      writeFileSync(join(testDir, "package.json"), JSON.stringify(packageJson));

      const result = detectProject(testDir);
      expect(result.bundler).toBe("next");
    });

    it("should detect typescript", () => {
      writeFileSync(join(testDir, "tsconfig.json"), "{}");

      const result = detectProject(testDir);
      expect(result.hasTypeScript).toBe(true);
    });

    it("should handle no bundler detected", () => {
      const packageJson = { dependencies: {} };
      writeFileSync(join(testDir, "package.json"), JSON.stringify(packageJson));

      const result = detectProject(testDir);
      expect(result.bundler).toBe("none");
    });
  });

  describe("autoSetup", () => {
    it("should add md-prompt to tsconfig types", () => {
      const tsconfig = {
        compilerOptions: {
          types: ["node"],
        },
      };
      writeFileSync(
        join(testDir, "tsconfig.json"),
        JSON.stringify(tsconfig, null, 2)
      );

      const projectInfo = {
        bundler: "vite" as const,
        hasTypeScript: true,
        projectRoot: testDir,
      };

      const messages = autoSetup(projectInfo);
      expect(messages).toContain("✅ Added md-prompt to tsconfig.json types");

      const updatedTsconfig = JSON.parse(
        require("fs").readFileSync(join(testDir, "tsconfig.json"), "utf-8")
      );
      expect(updatedTsconfig.compilerOptions.types).toContain("md-prompt");
    });

    it("should create vite config for vite project", () => {
      const projectInfo = {
        bundler: "vite" as const,
        hasTypeScript: false,
        projectRoot: testDir,
      };

      const messages = autoSetup(projectInfo);
      expect(messages).toContain(
        "✅ Created vite.config.ts with md-prompt plugin"
      );
      expect(existsSync(join(testDir, "vite.config.ts"))).toBe(true);
    });

    it("should suggest CLI for no bundler", () => {
      const projectInfo = {
        bundler: "none" as const,
        hasTypeScript: false,
        projectRoot: testDir,
      };

      const messages = autoSetup(projectInfo);
      expect(messages.some((msg) => msg.includes("CLI"))).toBe(true);
    });
  });
});
