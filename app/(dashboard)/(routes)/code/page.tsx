"use client";

import axios from "axios";
import Editor from "@monaco-editor/react";
import { FileSystemTree } from "@webcontainer/api";
import { AnimatePresence, motion } from "framer-motion";
import {
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  Code2,
  Eye,
  FileIcon,
  Loader2,
  LucideIcon,
  RefreshCw,
  Sparkles,
  WandSparkles,
  XCircle,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import toast from "react-hot-toast";
import remarkGfm from "remark-gfm";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import useWebContainer from "@/hooks/useWebContainer";

interface FileStructure {
  id: string;
  name: string;
  type: "folder" | "file";
  content?: string;
  language?: string;
  children?: FileStructure[];
}

type BuildStageKey = "installing" | "building" | "running";

interface BuildStage {
  key: BuildStageKey;
  label: string;
}

const BUILD_STAGES: BuildStage[] = [
  { key: "installing", label: "Installing dependencies" },
  { key: "building", label: "Building project" },
  { key: "running", label: "Starting preview server" },
];

type PreviewMode = "html" | "webcontainer" | null;

type DetectedProjectType = "nextjs" | "vite-react" | "vite" | "react" | "node";

interface DetectedProject {
  type: DetectedProjectType;
  label: string;
  packageDir: string;
  startScript: "dev" | "start";
}

interface PackageJsonShape {
  dependencies?: Record<string, string>;
  devDependencies?: Record<string, string>;
  scripts?: Record<string, string>;
}

const dotLoader = (
  <div className="inline-flex items-center gap-1.5">
    <span className="h-2 w-2 animate-bounce rounded-full bg-sky-500 [animation-delay:-0.2s]" />
    <span className="h-2 w-2 animate-bounce rounded-full bg-cyan-400 [animation-delay:-0.1s]" />
    <span className="h-2 w-2 animate-bounce rounded-full bg-sky-500" />
  </div>
);

function CodeGenerationPage() {
  const [fileTree, setFileTree] = useState<FileStructure[]>([]);
  const [selectedFile, setSelectedFile] = useState<FileStructure | null>(null);
  const [userMessages, setUserMessages] = useState<{ text: string }[]>([]);
  const [modelMessages, setModelMessages] = useState<{ text: string }[]>([]);
  const [openFolders, setOpenFolders] = useState<string[]>([]);
  const [currentTheme, setCurrentTheme] = useState<"light" | "dark">("light");
  const [iframeUrl, setIframeUrl] = useState("");
  const [activeTab, setActiveTab] = useState<"code" | "preview">("code");
  const [showPromptSection, setShowPromptSection] = useState(true);
  const [prompt, setPrompt] = useState("");
  const [loading, setLoading] = useState(false);
  const [explanations, setExplanations] = useState<string[]>([]);

  // Dual-mode preview state
  const [previewMode, setPreviewMode] = useState<PreviewMode>(null);
  const [previewHtml, setPreviewHtml] = useState("");

  // WebContainer build stage state
  const [currentBuildStage, setCurrentBuildStage] = useState<BuildStageKey | null>(null);
  const [completedBuildStages, setCompletedBuildStages] = useState<BuildStageKey[]>([]);
  const [failedBuildStage, setFailedBuildStage] = useState<BuildStageKey | null>(null);
  const [previewError, setPreviewError] = useState<string | null>(null);
  const [detectedProject, setDetectedProject] = useState<DetectedProject | null>(null);
  const [stageProgress, setStageProgress] = useState<Record<BuildStageKey, number>>({
    installing: 0,
    building: 0,
    running: 0,
  });
  const [webcontainerReady, setWebcontainerReady] = useState(false);

  const devServerProcessRef = useRef<any>(null);
  const serverReadyResolverRef = useRef<((url: string) => void) | null>(null);
  const progressIntervalRef = useRef<Partial<Record<BuildStageKey, ReturnType<typeof setInterval>>>>({});
  const pendingRuntimeStartRef = useRef<{ tree: FileStructure[]; project: DetectedProject } | null>(null);

  const webContainer = useWebContainer();

  // Theme observer
  useEffect(() => {
    const applyTheme = () => {
      setCurrentTheme(document.documentElement.classList.contains("dark") ? "dark" : "light");
    };
    applyTheme();
    const observer = new MutationObserver(applyTheme);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
    return () => observer.disconnect();
  }, []);

  // WebContainer server-ready listener
  useEffect(() => {
    if (!webContainer) return;
    const unsubscribe = webContainer.on("server-ready", (_, url) => {
      setIframeUrl(url);
      setWebcontainerReady(true);
      setPreviewError(null);
      setCurrentBuildStage(null);
      serverReadyResolverRef.current?.(url);
      serverReadyResolverRef.current = null;
    });
    return () => {
      serverReadyResolverRef.current = null;
      if (typeof unsubscribe === "function") unsubscribe();
    };
  }, [webContainer]);

  // Cleanup progress intervals on unmount
  const clearAllStageAnimations = () => {
    BUILD_STAGES.forEach((stage) => {
      const timer = progressIntervalRef.current[stage.key];
      if (timer) {
        clearInterval(timer);
        progressIntervalRef.current[stage.key] = undefined;
      }
    });
  };

  useEffect(() => {
    return () => clearAllStageAnimations();
  }, []);

  const getLanguageFromExtension = (extension: string) => {
    const map: Record<string, string> = {
      js: "javascript", ts: "typescript", jsx: "javascript", tsx: "typescript",
      html: "html", css: "css", json: "json", md: "markdown",
    };
    return map[extension.toLowerCase()] || "plaintext";
  };

  const mergeFileIntoTree = (baseTree: FileStructure[], filePath: string, content: string, language?: string) => {
    const segments = filePath.split("/");
    const fileName = segments.pop() || "";
    const extension = fileName.split(".").pop() || "";
    const fileLanguage = language || getLanguageFromExtension(extension);

    const addIntoNode = (nodes: FileStructure[], parts: string[]): FileStructure[] => {
      if (parts.length === 0) {
        return [...nodes, { id: crypto.randomUUID(), name: fileName, type: "file", content, language: fileLanguage }];
      }
      const [current, ...rest] = parts;
      const existingIdx = nodes.findIndex((n) => n.type === "folder" && n.name === current);
      if (existingIdx === -1) {
        return [...nodes, { id: crypto.randomUUID(), name: current, type: "folder", children: addIntoNode([], rest) }];
      }
      return nodes.map((node, i) => {
        if (i !== existingIdx || node.type !== "folder") return node;
        return { ...node, children: addIntoNode(node.children || [], rest) };
      });
    };

    return addIntoNode(baseTree, segments);
  };

  const updateFileContent = (fileId: string, newContent: string) => {
    const updateTree = (nodes: FileStructure[]): FileStructure[] =>
      nodes.map((node) => {
        if (node.id === fileId && node.type === "file") return { ...node, content: newContent };
        if (node.children) return { ...node, children: updateTree(node.children) };
        return node;
      });

    const updatedTree = updateTree(fileTree);
    setFileTree(updatedTree);
    setSelectedFile((prev) => (prev?.id === fileId ? { ...prev, content: newContent } : prev));

    // Sync edits to WebContainer filesystem live
    if (webContainer && previewMode === "webcontainer") {
      const findPath = (nodes: FileStructure[], id: string, parentPath = ""): string | null => {
        for (const n of nodes) {
          const cur = parentPath ? `${parentPath}/${n.name}` : n.name;
          if (n.id === id && n.type === "file") return cur;
          if (n.type === "folder" && n.children?.length) {
            const found = findPath(n.children, id, cur);
            if (found) return found;
          }
        }
        return null;
      };
      const path = findPath(fileTree, fileId);
      if (path) webContainer.fs.writeFile(path, newContent).catch(console.error);
    }

    // Update srcdoc preview live for HTML mode — re-inline to pick up any changed JS/CSS files
    if (previewMode === "html") {
      const rawHtml = findFileContent(updatedTree, "index.html");
      if (rawHtml) setPreviewHtml(buildInlinedHtml(rawHtml, updatedTree));
    }
  };

  const convertToWebContainerFs = (nodes: FileStructure[]): FileSystemTree => {
    const result: FileSystemTree = {};
    const processNode = (node: FileStructure): FileSystemTree => {
      if (node.type === "file") return { [node.name]: { file: { contents: node.content || "" } } };
      const dir: FileSystemTree = {};
      (node.children || []).forEach((child) => {
        if (child.type === "folder") dir[child.name] = { directory: processNode(child) };
        else dir[child.name] = { file: { contents: child.content || "" } };
      });
      return dir;
    };
    nodes.forEach((node) => {
      if (node.type === "folder") result[node.name] = { directory: processNode(node) };
      else result[node.name] = { file: { contents: node.content || "" } };
    });
    return result;
  };

  // ─── Build Stage Helpers ───────────────────────────────────────────────────
  const clearStageAnimation = (stage: BuildStageKey) => {
    const t = progressIntervalRef.current[stage];
    if (t) { clearInterval(t); progressIntervalRef.current[stage] = undefined; }
  };

  const animateStage = (stage: BuildStageKey) => {
    clearStageAnimation(stage);
    setStageProgress((p) => ({ ...p, [stage]: Math.max(p[stage], 8) }));
    progressIntervalRef.current[stage] = setInterval(() => {
      setStageProgress((p) => ({ ...p, [stage]: Math.min(92, p[stage] + Math.ceil(Math.random() * 8)) }));
    }, 320);
  };

  const runStage = async (
    stage: BuildStageKey,
    cmd: string,
    args: string[],
    options?: { cwd?: string },
  ) => {
    if (!webContainer) throw new Error("WebContainer not ready");
    setCurrentBuildStage(stage);
    animateStage(stage);
    const proc = await webContainer.spawn(cmd, args, options);
    proc.output.pipeTo(new WritableStream({ write(chunk) { console.log("[wc]", chunk); } }));
    const code = await proc.exit;
    clearStageAnimation(stage);
    if (code !== 0) {
      setFailedBuildStage(stage);
      throw new Error(`"${cmd} ${args.join(" ")}" failed with exit code ${code}`);
    }
    setStageProgress((p) => ({ ...p, [stage]: 100 }));
    setCompletedBuildStages((p) => [...p, stage]);
  };

  const startDevServer = async (tree: FileStructure[], project: DetectedProject) => {
    if (!webContainer) throw new Error("Preview runtime is still booting. Try again in a moment.");
    const projectCwd = project.packageDir ? `/${project.packageDir}` : "/";

    // Kill previous server if any
    if (devServerProcessRef.current) {
      devServerProcessRef.current.kill();
      devServerProcessRef.current = null;
    }

    // Reset all stage state
    setPreviewError(null);
    setFailedBuildStage(null);
    setWebcontainerReady(false);
    setIframeUrl("");
    setCompletedBuildStages([]);
    setStageProgress({ installing: 0, building: 0, running: 0 });
    setDetectedProject(project);

    await webContainer.mount(convertToWebContainerFs(tree));

    await runStage("installing", "npm", ["install"], { cwd: projectCwd });
    await runStage("building", "npm", ["run", "build", "--if-present"], { cwd: projectCwd });

    // Start dev server (waits for server-ready event)
    setCurrentBuildStage("running");
    animateStage("running");

    const ready = new Promise<string>((resolve, reject) => {
      const timeout = setTimeout(() => {
        serverReadyResolverRef.current = null;
        clearStageAnimation("running");
        setFailedBuildStage("running");
        reject(new Error("Preview server did not start in time. Try generating again."));
      }, 120_000);

      serverReadyResolverRef.current = (url) => {
        clearTimeout(timeout);
        resolve(url);
      };
    });

    devServerProcessRef.current = await webContainer.spawn("npm", ["run", project.startScript], {
      cwd: projectCwd,
    });
    devServerProcessRef.current.output.pipeTo(
      new WritableStream({ write(chunk) { console.log("[dev]", chunk); } }),
    );

    await ready;
    clearStageAnimation("running");
    setStageProgress((p) => ({ ...p, running: 100 }));
    setCompletedBuildStages((p) => [...p, "running"]);
    setCurrentBuildStage(null);

    devServerProcessRef.current.exit.then((code: number) => {
      if (code !== 0) {
        setFailedBuildStage("running");
        setPreviewError(`Preview server exited unexpectedly (code: ${code}).`);
        setWebcontainerReady(false);
      }
    });
  };

  useEffect(() => {
    if (!webContainer || !pendingRuntimeStartRef.current) return;
    const pending = pendingRuntimeStartRef.current;
    pendingRuntimeStartRef.current = null;
    void startDevServer(pending.tree, pending.project).catch((err) => {
      setPreviewError(err instanceof Error ? err.message : "Failed to start preview server.");
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [webContainer]);

  const handleSelectedFile = (node: FileStructure) => {
    if (node.type === "file") { setSelectedFile(node); return; }
    setOpenFolders((p) => p.includes(node.id) ? p.filter((id) => id !== node.id) : [...p, node.id]);
  };

  const extractCodeBlocks = (text: string): string[] => {
    const re = /<code>([\s\S]*?)<\/code>/g;
    const out: string[] = [];
    let m: RegExpExecArray | null;
    while ((m = re.exec(text)) !== null) out.push(m[1]);
    return out;
  };

  const extractFileBlocks = (text: string): Array<{ name: string; content: string }> => {
    const out: Array<{ name: string; content: string }> = [];

    // ── Format 1: <file name="...">...</file> (preferred)
    const xmlRe = /<file\s+name\s*=\s*"([^"]+)"\s*>([\s\S]*?)<\/file>/g;
    let m: RegExpExecArray | null;
    while ((m = xmlRe.exec(text)) !== null) out.push({ name: m[1].trim(), content: m[2] });
    if (out.length) return out;

    // ── Format 2: ## filename\n```lang\n...\n``` (markdown heading + fence)
    const headedFenceRe =
      /(?:^|\n)(?:#{1,3}\s+|\*\*)?([\w./\-]+\.(?:html|css|js|jsx|ts|tsx|json|md))(?:\*\*)?\s*\n```[\w]*\n([\s\S]*?)```/gi;
    while ((m = headedFenceRe.exec(text)) !== null) {
      out.push({ name: m[1].trim(), content: m[2] });
    }
    if (out.length) return out;

    // ── Format 3: filename in fence's info string  ```html filename=index.html
    const infoFenceRe = /```[\w]*(?:\s+filename=["']?([\w./\-]+)["']?)?\n([\s\S]*?)```/gi;
    while ((m = infoFenceRe.exec(text)) !== null) {
      if (m[1]) out.push({ name: m[1].trim(), content: m[2] });
    }
    if (out.length) return out;

    // ── Format 4: single bare code fence — treat entire content as index.html
    const singleFenceRe = /```[\w]*\n([\s\S]+?)```/;
    const single = singleFenceRe.exec(text);
    if (single) {
      const content = single[1].trim();
      // Only wrap if it looks like HTML (starts with <)
      const name = content.trimStart().startsWith("<") ? "index.html" : "index.js";
      out.push({ name, content });
    }

    return out;
  };

  const extractExplanation = (text: string): string =>
    text
      .replace(/<code>[\s\S]*?<\/code>/g, "")
      .replace(/<file[\s\S]*?<\/file>/g, "")
      .replace(/```[\s\S]*?```/g, "")
      .replace(/<[^>]*>/g, "")
      .trim();

  const findFileContent = (nodes: FileStructure[], name: string): string => {
    for (const n of nodes) {
      if (n.type === "file" && n.name === name) return n.content || "";
      if (n.type === "folder" && n.children?.length) {
        const found = findFileContent(n.children, name);
        if (found) return found;
      }
    }
    return "";
  };

  const hasFileName = (nodes: FileStructure[], name: string): boolean => {
    for (const n of nodes) {
      if (n.type === "file" && n.name === name) return true;
      if (n.type === "folder" && n.children?.length && hasFileName(n.children, name)) return true;
    }
    return false;
  };

  const findFileByName = (
    nodes: FileStructure[],
    name: string,
    parentPath = "",
  ): { path: string; content: string } | null => {
    for (const n of nodes) {
      const currentPath = parentPath ? `${parentPath}/${n.name}` : n.name;
      if (n.type === "file" && n.name === name) {
        return { path: currentPath, content: n.content || "" };
      }
      if (n.type === "folder" && n.children?.length) {
        const found = findFileByName(n.children, name, currentPath);
        if (found) return found;
      }
    }
    return null;
  };

  const detectProjectType = (pkg: PackageJsonShape, nodes: FileStructure[]): DetectedProjectType => {
    const deps = {
      ...(pkg.dependencies || {}),
      ...(pkg.devDependencies || {}),
    };

    const hasNextConfig = hasFileName(nodes, "next.config.js")
      || hasFileName(nodes, "next.config.mjs")
      || hasFileName(nodes, "next.config.ts");
    if (deps.next || hasNextConfig) return "nextjs";

    const hasViteConfig = hasFileName(nodes, "vite.config.js")
      || hasFileName(nodes, "vite.config.ts")
      || hasFileName(nodes, "vite.config.mjs");
    if (deps.vite || hasViteConfig) {
      if (deps.react || deps["react-dom"]) return "vite-react";
      return "vite";
    }

    if (deps["react-scripts"]) return "react";
    if (deps.react || deps["react-dom"]) return "react";

    return "node";
  };

  const detectProjectRuntime = (nodes: FileStructure[]): DetectedProject | null => {
    const packageFile = findFileByName(nodes, "package.json");
    if (!packageFile) return null;

    let parsed: PackageJsonShape;
    try {
      parsed = JSON.parse(packageFile.content) as PackageJsonShape;
    } catch {
      return null;
    }

    const scripts = parsed.scripts || {};
    const startScript: "dev" | "start" | null = scripts.dev ? "dev" : scripts.start ? "start" : null;
    if (!startScript) return null;

    const type = detectProjectType(parsed, nodes);
    const labelMap: Record<DetectedProjectType, string> = {
      nextjs: "Next.js",
      "vite-react": "React + Vite",
      vite: "Vite",
      react: "React",
      node: "Node",
    };

    const packageSegments = packageFile.path.split("/");
    packageSegments.pop();
    const packageDir = packageSegments.join("/");

    return {
      type,
      label: labelMap[type],
      packageDir,
      startScript,
    };
  };

  /**
   * Build a self-contained srcdoc HTML that previews a React/Vite project
   * without any build step, by:
   *  1. Loading React, ReactDOM and Babel-standalone from CDN
   *  2. Registering every .js/.jsx/.ts/.tsx file as a virtual module
   *  3. Compiling JSX on the fly with Babel and resolving intra-project imports
   *  4. Inlining all CSS as <style> tags
   *  5. Mounting the app via src/main.jsx (or the first .jsx file found)
   */
  const buildReactSrcdoc = (nodes: FileStructure[]): string => {
    // Collect all files recursively into a flat map { "path/to/file.jsx": content }
    const fileMap: Record<string, string> = {};
    const collectFiles = (items: FileStructure[], prefix = "") => {
      for (const item of items) {
        const path = prefix ? `${prefix}/${item.name}` : item.name;
        if (item.type === "file") fileMap[path] = item.content || "";
        else if (item.children) collectFiles(item.children, path);
      }
    };
    collectFiles(nodes);

    // Inline all CSS files
    const cssBlocks = Object.entries(fileMap)
      .filter(([name]) => name.endsWith(".css"))
      .map(([, content]) => `<style>${content}</style>`)
      .join("\n");

    // Build the virtual module registry as an escaped JSON blob
    const moduleSource = JSON.stringify(fileMap);

    // Determine entry point: prefer src/main.jsx > src/main.js > src/App.jsx > first .jsx
    const entryOptions = ["src/main.jsx", "src/main.js", "src/main.tsx", "src/App.jsx", "src/App.js"];
    const entry = entryOptions.find((e) => fileMap[e]) ||
      Object.keys(fileMap).find((k) => k.endsWith(".jsx") || k.endsWith(".tsx")) ||
      "src/main.jsx";

    return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title>Preview</title>
<script src="https://unpkg.com/react@18/umd/react.development.js" crossorigin><\/script>
<script src="https://unpkg.com/react-dom@18/umd/react-dom.development.js" crossorigin><\/script>
<script src="https://unpkg.com/@babel/standalone/babel.min.js"><\/script>
${cssBlocks}
<style>body{margin:0;font-family:system-ui,sans-serif;}#root{min-height:100vh;}<\/style>
</head>
<body>
<div id="root"></div>
<script>
// ── Virtual module registry ───────────────────────────────────────────────────
const __FILES__ = ${moduleSource};
const __MODULE_CACHE__ = {};

function __resolve(importPath, fromPath) {
  if (!importPath.startsWith('.')) return null; // external — skip
  const parts = fromPath.split('/');
  parts.pop(); // remove filename
  const segments = importPath.split('/');
  for (const seg of segments) {
    if (seg === '..') parts.pop();
    else if (seg !== '.') parts.push(seg);
  }
  const base = parts.join('/');
  // try exact, then with extensions
  const exts = ['', '.jsx', '.js', '.tsx', '.ts', '/index.jsx', '/index.js'];
  for (const ext of exts) {
    if (__FILES__[base + ext] !== undefined) return base + ext;
  }
  return null;
}

function __require(importPath, fromPath) {
  const resolved = __resolve(importPath, fromPath);
  if (!resolved) {
    // Return React as a fallback for unresolved react imports
    if (importPath === 'react') return window.React;
    if (importPath === 'react-dom' || importPath === 'react-dom/client') return window.ReactDOM;
    return {};
  }
  if (__MODULE_CACHE__[resolved]) return __MODULE_CACHE__[resolved].exports;
  const mod = { exports: {} };
  __MODULE_CACHE__[resolved] = mod;
  const source = __FILES__[resolved];
  const transformed = Babel.transform(source, {
    presets: ['react'],
    plugins: [],
    filename: resolved,
  }).code;
  // Wrap in a module factory with a custom require
  const factory = new Function('module', 'exports', 'require', 'React', 'ReactDOM', transformed);
  factory(mod, mod.exports, (p) => __require(p, resolved), window.React, window.ReactDOM);
  return mod.exports;
}

// Boot the entry module
try {
  __require(${JSON.stringify(entry)}, '');
} catch (err) {
  document.getElementById('root').innerHTML =
    '<div style="color:red;padding:24px;font-family:monospace;white-space:pre-wrap">' +
    '<b>Preview Error:</b>\\n' + err.message + '</div>';
  console.error(err);
}
<\/script>
</body></html>`;
  };

  const buildInlinedHtml = (html: string, nodes: FileStructure[]): string => {
    // Inline external CSS: <link rel="stylesheet" href="..."> → <style>...</style>
    let result = html.replace(
      /<link[^>]+rel=["']stylesheet["'][^>]+href=["']([^"']+)["'][^>]*\/?>/gi,
      (_match, href) => {
        const filename = href.replace(/^\.?\//, "").split("/").pop() || "";
        const css = findFileContent(nodes, filename);
        return css ? `<style>\n${css}\n</style>` : _match;
      },
    );
    // Also handle href-before-rel variant
    result = result.replace(
      /<link[^>]+href=["']([^"']+)["'][^>]+rel=["']stylesheet["'][^>]*\/?>/gi,
      (_match, href) => {
        const filename = href.replace(/^\.?\//, "").split("/").pop() || "";
        const css = findFileContent(nodes, filename);
        return css ? `<style>\n${css}\n</style>` : _match;
      },
    );
    // Inline external JS: <script src="..."> → <script>...</script>
    result = result.replace(
      /<script([^>]*)src=["']([^"']+)["']([^>]*)><\/script>/gi,
      (_match, pre, src, post) => {
        // Skip CDN / absolute URLs — browser can still reach those
        if (/^https?:\/\//i.test(src)) return _match;
        const filename = src.replace(/^\.?\//, "").split("/").pop() || "";
        const js = findFileContent(nodes, filename);
        // Strip "type=module" when inlining since we don't have a bundler
        const attrs = (pre + post).replace(/type=["']module["']/gi, "").trim();
        return js ? `<script ${attrs}>\n${js}\n</script>` : _match;
      },
    );
    return result;
  };

  const onSubmit = async () => {
    if (!prompt.trim() || loading) return;
    try {
      setLoading(true);

      const response = await axios.post("/api/code", { prompt, userMessages, modelMessages });
      setUserMessages((p) => [...p, { text: prompt }]);
      setModelMessages((p) => [...p, { text: response.data }]);

      const codeBlocks = extractCodeBlocks(response.data);
      const explanation = extractExplanation(response.data);
      const files = extractFileBlocks(codeBlocks.length ? codeBlocks.join("\n") : response.data);

      if (!files.length) throw new Error("No files found in the generated response.");

      const dedupedFiles = new Map<string, string>();
      files.forEach((f) => dedupedFiles.set(f.name, f.content));

      let nextTree: FileStructure[] = [];
      dedupedFiles.forEach((content, name) => { nextTree = mergeFileIntoTree(nextTree, name, content); });

      const findFirstFile = (nodes: FileStructure[]): FileStructure | null => {
        for (const n of nodes) {
          if (n.type === "file") return n;
          if (n.children?.length) { const f = findFirstFile(n.children); if (f) return f; }
        }
        return null;
      };

      setFileTree(nextTree);
      setSelectedFile(findFirstFile(nextTree));
      setOpenFolders([]);
      setExplanations([explanation]);
      setShowPromptSection(false);
      setPrompt("");

      // ─── Choose preview mode ───────────────────────────────────────────────
      setActiveTab("preview");
      pendingRuntimeStartRef.current = null;

      const detectedRuntime = detectProjectRuntime(nextTree);
      if (detectedRuntime) {
        setPreviewMode("webcontainer");
        setPreviewHtml("");
        setDetectedProject(detectedRuntime);
        setPreviewError(null);

        if (webContainer) {
          void startDevServer(nextTree, detectedRuntime).catch((err) => {
            setPreviewError(err instanceof Error ? err.message : "Failed to start preview server.");
          });
        } else {
          pendingRuntimeStartRef.current = { tree: nextTree, project: detectedRuntime };
        }
      } else {
        const packageJson = findFileByName(nextTree, "package.json");
        if (packageJson) {
          setPreviewMode("html");
          setPreviewHtml(buildReactSrcdoc(nextTree));
          setPreviewError('Detected "package.json" but no runnable script. Add "dev" or "start" in scripts.');
        } else {
          const rawHtml = findFileContent(nextTree, "index.html");
          const inlined = buildInlinedHtml(rawHtml, nextTree);
          setPreviewMode("html");
          setPreviewHtml(inlined);
          setPreviewError(null);
        }
        setDetectedProject(null);
      }
    } catch (error: any) {
      if (error?.status === 401 || error?.response?.status === 401) {
        toast.error("Please login to continue");
      } else {
        toast.error(error?.message || "Something went wrong.");
      }
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  // ─── Derived ────────────────────────────────────────────────────────────────
  const buildStageState = useMemo(() =>
    BUILD_STAGES.map((s) => {
      if (completedBuildStages.includes(s.key)) return { ...s, state: "completed" as const };
      if (failedBuildStage === s.key) return { ...s, state: "error" as const };
      if (currentBuildStage === s.key) return { ...s, state: "in-progress" as const };
      return { ...s, state: "pending" as const };
    }),
    [completedBuildStages, currentBuildStage, failedBuildStage],
  );

  const canShowWebContainerPreview = useMemo(
    () => webcontainerReady && Boolean(iframeUrl) && completedBuildStages.length === BUILD_STAGES.length,
    [webcontainerReady, iframeUrl, completedBuildStages],
  );

  const canGenerate = useMemo(() => prompt.trim().length > 0 && !loading, [prompt, loading]);

  const renderStageIcon = (state: "completed" | "in-progress" | "pending" | "error"): LucideIcon => {
    if (state === "completed") return CheckCircle2;
    if (state === "in-progress") return Loader2;
    if (state === "error") return XCircle;
    return ChevronRight;
  };

  // ─── File tree renderer ──────────────────────────────────────────────────────
  const renderFileTree = (nodes: FileStructure[]) => (
    <ul className="space-y-1">
      {nodes.map((node) => (
        <li key={node.id}>
          <button
            type="button"
            onClick={() => handleSelectedFile(node)}
            className={cn(
              "flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-left text-sm transition-colors",
              selectedFile?.id === node.id
                ? "bg-sky-500/15 text-sky-700 dark:text-sky-200"
                : "hover:bg-slate-200/70 dark:hover:bg-slate-800/70",
            )}
          >
            {node.type === "file" ? (
              <FileIcon className="h-4 w-4 text-slate-500" />
            ) : openFolders.includes(node.id) ? (
              <ChevronDown className="h-4 w-4 text-slate-500" />
            ) : (
              <ChevronRight className="h-4 w-4 text-slate-500" />
            )}
            <span className="truncate">{node.name}</span>
          </button>
          {node.type === "folder" && openFolders.includes(node.id) && node.children?.length ? (
            <div className="ml-4 border-l border-slate-300/70 pl-2 dark:border-white/15">
              {renderFileTree(node.children)}
            </div>
          ) : null}
        </li>
      ))}
    </ul>
  );

  // ─── Preview panel renderer ──────────────────────────────────────────────────
  const renderPreview = () => {
    // Empty state
    if (!previewMode) {
      return (
        <div className="flex h-full items-center justify-center bg-slate-50/80 dark:bg-black/60">
          <div className="flex flex-col items-center gap-3 text-center">
            <div className="rounded-full border border-slate-200/70 bg-white/80 p-4 dark:border-white/15 dark:bg-zinc-950/80">
              <Eye className="h-7 w-7 text-slate-400" />
            </div>
            <p className="text-sm font-medium text-slate-700 dark:text-slate-200">No preview yet</p>
            <p className="max-w-xs text-xs text-muted-foreground">
              Generate an app from the prompt builder and the preview will appear here automatically.
            </p>
          </div>
        </div>
      );
    }

    // HTML srcdoc — instant
    if (previewMode === "html") {
      return previewHtml ? (
        <iframe
          title="preview"
          srcDoc={previewHtml}
          className="h-full w-full border-0 bg-white"
          sandbox="allow-scripts allow-same-origin allow-forms allow-modals"
        />
      ) : (
        <div className="flex h-full items-center justify-center text-sm text-muted-foreground">No HTML content found.</div>
      );
    }

    // WebContainer mode
    if (previewMode === "webcontainer") {
      if (canShowWebContainerPreview) {
        return (
          <iframe
            title="preview"
            src={iframeUrl}
            className="h-full w-full border-0"
            allow="cross-origin-isolated"
          />
        );
      }

      // Build progress UI
      return (
        <div className="flex h-full items-center justify-center bg-slate-50/80 dark:bg-black/60">
          <div className="w-full max-w-md rounded-2xl border border-slate-200/70 bg-white/90 px-5 py-6 shadow-lg dark:border-white/10 dark:bg-zinc-950/90">
            {/* Header */}
            <div className="mb-5 flex items-center gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-sky-500/15">
                <Loader2 className="h-4 w-4 animate-spin text-sky-500" />
              </div>
              <div>
                <p className="text-sm font-semibold">Preparing preview…</p>
                <p className="text-xs text-muted-foreground">This can take up to a minute for fresh installs.</p>
                {detectedProject && (
                  <p className="mt-1 text-[11px] text-slate-500 dark:text-slate-400">
                    Detected: {detectedProject.label} ({`npm run ${detectedProject.startScript}`})
                  </p>
                )}
              </div>
            </div>

            {/* Stage list */}
            <div className="space-y-4">
              {buildStageState.map((stage) => {
                const StageIcon = renderStageIcon(stage.state);
                return (
                  <div key={stage.key} className="space-y-1.5">
                    <div className="flex items-center gap-2 text-sm">
                      <StageIcon
                        className={cn(
                          "h-4 w-4 shrink-0",
                          stage.state === "completed" && "text-emerald-500",
                          stage.state === "in-progress" && "animate-spin text-sky-500",
                          stage.state === "error" && "text-rose-500",
                          stage.state === "pending" && "text-slate-400",
                        )}
                      />
                      <span
                        className={cn(
                          "font-medium",
                          stage.state === "completed" && "text-emerald-600 dark:text-emerald-400",
                          stage.state === "in-progress" && "text-sky-600 dark:text-sky-300",
                          stage.state === "error" && "text-rose-600 dark:text-rose-400",
                          stage.state === "pending" && "text-muted-foreground",
                        )}
                      >
                        {stage.label}
                      </span>
                      {stage.state === "completed" && (
                        <span className="ml-auto text-xs text-emerald-500">Done</span>
                      )}
                    </div>
                    {/* Progress bar */}
                    <div className="h-1.5 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-800">
                      <motion.div
                        initial={false}
                        animate={{ width: `${stageProgress[stage.key]}%` }}
                        transition={{ duration: 0.3, ease: "easeOut" }}
                        className={cn(
                          "h-full rounded-full",
                          stage.state === "error" ? "bg-rose-500" : "bg-gradient-to-r from-sky-500 to-cyan-400",
                        )}
                      />
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Error message */}
            {previewError && (
              <div className="mt-5 rounded-lg border border-rose-300/70 bg-rose-50/80 px-3 py-2.5 text-xs text-rose-700 dark:border-rose-500/40 dark:bg-rose-950/40 dark:text-rose-300">
                {previewError}
              </div>
            )}
          </div>
        </div>
      );
    }

    return null;
  };

  // ─── Render ──────────────────────────────────────────────────────────────────
  return (
    <main className="relative h-full overflow-hidden px-3 py-4 md:px-6 md:py-6">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_12%_15%,rgba(15,23,42,0.08),transparent_36%),radial-gradient(circle_at_84%_18%,rgba(15,23,42,0.06),transparent_33%),radial-gradient(circle_at_50%_100%,rgba(100,116,139,0.12),transparent_40%)] dark:bg-[radial-gradient(circle_at_12%_15%,rgba(255,255,255,0.06),transparent_36%),radial-gradient(circle_at_84%_18%,rgba(255,255,255,0.04),transparent_33%),radial-gradient(circle_at_50%_100%,rgba(161,161,170,0.08),transparent_40%)]" />
      <div className="pointer-events-none absolute inset-0 [background-image:linear-gradient(to_right,rgba(100,116,139,0.12)_1px,transparent_1px),linear-gradient(to_bottom,rgba(100,116,139,0.12)_1px,transparent_1px)] [background-size:34px_34px] dark:[background-image:linear-gradient(to_right,rgba(161,161,170,0.09)_1px,transparent_1px),linear-gradient(to_bottom,rgba(161,161,170,0.09)_1px,transparent_1px)]" />

      <div className="relative mx-auto flex h-full w-full max-w-7xl flex-col gap-4">
        <AnimatePresence mode="wait">
          {showPromptSection ? (
            <motion.section
              key="prompt"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.35 }}
              className="space-y-4"
            >
              <section className="rounded-3xl border border-slate-200 bg-gradient-to-r from-white via-slate-50 to-slate-100 px-5 py-6 text-slate-900 shadow-[0_24px_60px_rgba(15,23,42,0.12)] dark:border-white/20 dark:from-black dark:via-zinc-950 dark:to-black dark:text-white dark:shadow-[0_24px_60px_rgba(0,0,0,0.5)] md:px-8 md:py-8">
                <p className="inline-flex items-center gap-2 rounded-full border border-slate-300 bg-white/80 px-3 py-1 text-xs uppercase tracking-widest text-slate-700 dark:border-white/20 dark:bg-white/10 dark:text-zinc-200">
                  <Sparkles className="h-3.5 w-3.5" />
                  Code Studio
                </p>
                <h1 className="mt-4 text-3xl font-semibold tracking-tight md:text-4xl">
                  Generate full web app scaffolds from a single prompt.
                </h1>
                <p className="mt-2 max-w-3xl text-sm text-slate-600 dark:text-slate-200 md:text-base">
                  Describe your app, generate files instantly, edit in Monaco, and launch a live preview — HTML apps preview instantly, framework apps auto-install and boot.
                </p>
              </section>

              <Card className="border-slate-200/80 bg-white/80 backdrop-blur-xl dark:border-white/10 dark:bg-zinc-950/80">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <WandSparkles className="h-5 w-5 text-cyan-500" />
                    Prompt Builder
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <textarea
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); onSubmit(); } }}
                    placeholder="Example: Build a pricing page with testimonials... or Build a React dashboard with charts"
                    className="min-h-[190px] w-full resize-none rounded-2xl border border-slate-300/80 bg-white/90 p-4 text-sm outline-none ring-sky-500/40 transition focus:ring-2 dark:border-white/15 dark:bg-black/80"
                  />
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-xs text-muted-foreground">Press Enter to generate, Shift + Enter for newline.</p>
                    <Button
                      type="button"
                      onClick={onSubmit}
                      disabled={!canGenerate}
                      className="bg-gradient-to-r from-cyan-500 to-blue-500 text-slate-950 hover:from-cyan-400 hover:to-blue-400"
                    >
                      {loading ? <span className="inline-flex items-center gap-2">{dotLoader} Generating...</span> : "Generate App"}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.section>
          ) : (
            <motion.section
              key="workspace"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.35 }}
              className="grid h-full min-h-0 grid-cols-1 gap-4 xl:grid-cols-12"
            >
              {/* ── Build Notes panel ── */}
              <Card className="flex h-full min-h-0 flex-col border-slate-200/80 bg-white/80 backdrop-blur-xl dark:border-white/10 dark:bg-zinc-950/80 xl:col-span-4">
                <CardHeader className="border-b border-slate-200/70 pb-4 dark:border-white/10">
                  <div className="flex items-center justify-between gap-3">
                    <CardTitle className="text-lg">Build Notes</CardTitle>
                    <Button type="button" size="icon" variant="outline" onClick={() => setShowPromptSection(true)}>
                      <RefreshCw className="h-4 w-4" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="flex min-h-0 flex-1 flex-col gap-3 overflow-hidden p-4">
                  <div className="flex-1 space-y-3 overflow-y-auto pr-1">
                    {explanations.map((explanation, i) => (
                      <article key={`${i}-${explanation.slice(0, 16)}`} className="rounded-xl border border-slate-200/70 bg-white/80 p-3 text-sm dark:border-white/10 dark:bg-black/70">
                        <ReactMarkdown
                          remarkPlugins={[remarkGfm]}
                          components={{
                            code: ({ className, children, ...props }) => (
                              <code className={cn("rounded bg-slate-100 px-1.5 py-0.5 dark:bg-zinc-900", className)} {...props}>{children}</code>
                            ),
                            pre: ({ children, ...props }) => (
                              <pre className="my-2 overflow-auto rounded-lg bg-slate-950 p-3 text-slate-100" {...props}>{children}</pre>
                            ),
                          }}
                        >
                          {explanation}
                        </ReactMarkdown>
                      </article>
                    ))}
                  </div>
                  <div className="space-y-2 border-t border-slate-200/70 pt-3 dark:border-white/10">
                    <textarea
                      value={prompt}
                      onChange={(e) => setPrompt(e.target.value)}
                      onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); onSubmit(); } }}
                      placeholder="Ask for edits: add auth, improve UX, change colors..."
                      className="h-24 w-full resize-none rounded-xl border border-slate-300/80 bg-white/90 p-3 text-sm outline-none ring-sky-500/40 transition focus:ring-2 dark:border-white/15 dark:bg-black/80"
                    />
                    <Button type="button" className="w-full" disabled={!canGenerate} onClick={onSubmit}>
                      {loading ? <span className="inline-flex items-center gap-2">{dotLoader} Updating...</span> : "Apply Changes"}
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* ── Workspace panel ── */}
              <Card className="flex h-full min-h-0 flex-col border-slate-200/80 bg-white/80 backdrop-blur-xl dark:border-white/10 dark:bg-zinc-950/80 xl:col-span-8">
                <CardHeader className="border-b border-slate-200/70 pb-4 dark:border-white/10">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <CardTitle className="text-lg">Workspace</CardTitle>
                    <div className="inline-flex rounded-full border border-slate-300/80 bg-white/90 p-1 dark:border-white/15 dark:bg-black/90">
                      <button
                        type="button"
                        onClick={() => setActiveTab("code")}
                        className={cn(
                          "inline-flex items-center gap-1 rounded-full px-3 py-1.5 text-xs font-medium transition",
                          activeTab === "code" ? "bg-sky-500/15 text-sky-600 dark:text-sky-300" : "text-muted-foreground",
                        )}
                      >
                        <Code2 className="h-3.5 w-3.5" />
                        Code
                      </button>
                      <button
                        type="button"
                        onClick={() => setActiveTab("preview")}
                        className={cn(
                          "inline-flex items-center gap-1 rounded-full px-3 py-1.5 text-xs font-medium transition",
                          activeTab === "preview" ? "bg-sky-500/15 text-sky-600 dark:text-sky-300" : "text-muted-foreground",
                        )}
                      >
                        <Eye className="h-3.5 w-3.5" />
                        Preview
                      </button>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="min-h-0 flex-1 p-0">
                  <AnimatePresence mode="wait" initial={false}>
                    {activeTab === "code" ? (
                      <motion.div
                        key="code"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                        transition={{ duration: 0.2 }}
                        className="flex h-full"
                      >
                        <aside className="h-full w-[34%] overflow-auto border-r border-slate-200/70 bg-slate-50/80 p-3 dark:border-white/10 dark:bg-black/60 lg:w-[26%]">
                          <h3 className="mb-2 text-sm font-medium">Files</h3>
                          {fileTree.length ? renderFileTree(fileTree) : (
                            <p className="text-xs text-muted-foreground">No files generated yet.</p>
                          )}
                        </aside>
                        <section className="h-full flex-1 bg-slate-100/70 dark:bg-[#0a0a0a]">
                          {selectedFile?.type === "file" ? (
                            <Editor
                              height="100%"
                              theme={currentTheme === "dark" ? "vs-dark" : "light"}
                              language={selectedFile.language}
                              value={selectedFile.content}
                              onChange={(v) => updateFileContent(selectedFile.id, v || "")}
                              options={{ minimap: { enabled: true }, fontSize: 14, lineNumbers: "on", automaticLayout: true, formatOnPaste: true, formatOnType: true }}
                            />
                          ) : (
                            <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
                              Select a generated file to start editing.
                            </div>
                          )}
                        </section>
                      </motion.div>
                    ) : (
                      <motion.div
                        key="preview"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ duration: 0.2 }}
                        className="h-full w-full"
                      >
                        {renderPreview()}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </CardContent>
              </Card>
            </motion.section>
          )}
        </AnimatePresence>
      </div>
    </main>
  );
}

export default CodeGenerationPage;

