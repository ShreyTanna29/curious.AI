"use client";

import axios from "axios";
import Editor from "@monaco-editor/react";
import { FileSystemTree } from "@webcontainer/api";
import { AnimatePresence, motion } from "framer-motion";
import {
  ChevronDown,
  ChevronRight,
  Code2,
  Eye,
  FileIcon,
  RefreshCw,
  Sparkles,
  WandSparkles,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
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
  const [webcontainerCreated, setWebcontainerCreated] = useState(false);
  const [prompt, setPrompt] = useState("");
  const [loading, setLoading] = useState(false);
  const [explanations, setExplanations] = useState<string[]>([]);

  const webContainer = useWebContainer();

  useEffect(() => {
    const applyTheme = () => {
      setCurrentTheme(document.documentElement.classList.contains("dark") ? "dark" : "light");
    };

    applyTheme();
    const observer = new MutationObserver(applyTheme);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });

    return () => observer.disconnect();
  }, []);

  const getLanguageFromExtension = (extension: string) => {
    const extensionMap: Record<string, string> = {
      js: "javascript",
      ts: "typescript",
      jsx: "javascript",
      tsx: "typescript",
      html: "html",
      css: "css",
      json: "json",
      md: "markdown",
    };

    return extensionMap[extension.toLowerCase()] || "plaintext";
  };

  const mergeFileIntoTree = (
    baseTree: FileStructure[],
    filePath: string,
    content: string,
    language?: string,
  ) => {
    const segments = filePath.split("/");
    const fileName = segments.pop() || "";

    const extension = fileName.split(".").pop() || "";
    const fileLanguage = language || getLanguageFromExtension(extension);

    const addIntoNode = (nodes: FileStructure[], parts: string[]): FileStructure[] => {
      if (parts.length === 0) {
        return [
          ...nodes,
          {
            id: crypto.randomUUID(),
            name: fileName,
            type: "file",
            content,
            language: fileLanguage,
          },
        ];
      }

      const [current, ...rest] = parts;
      const existingFolderIndex = nodes.findIndex((node) => node.type === "folder" && node.name === current);

      if (existingFolderIndex === -1) {
        const newFolder: FileStructure = {
          id: crypto.randomUUID(),
          name: current,
          type: "folder",
          children: addIntoNode([], rest),
        };

        return [...nodes, newFolder];
      }

      return nodes.map((node, index) => {
        if (index !== existingFolderIndex || node.type !== "folder") return node;

        return {
          ...node,
          children: addIntoNode(node.children || [], rest),
        };
      });
    };

    return addIntoNode(baseTree, segments);
  };

  const updateFileContent = (fileId: string, newContent: string) => {
    const updateTree = (nodes: FileStructure[]): FileStructure[] => {
      return nodes.map((node) => {
        if (node.id === fileId && node.type === "file") {
          return { ...node, content: newContent };
        }

        if (node.children) {
          return { ...node, children: updateTree(node.children) };
        }

        return node;
      });
    };

    setFileTree((prevTree) => updateTree(prevTree));
    setSelectedFile((prev) => (prev?.id === fileId ? { ...prev, content: newContent } : prev));
  };

  const convertFilesToWebContainerFormat = (nodes: FileStructure[]): FileSystemTree => {
    const result: FileSystemTree = {};

    const processNode = (node: FileStructure): FileSystemTree => {
      if (node.type === "file") {
        return {
          [node.name]: {
            file: {
              contents: node.content || "",
            },
          },
        };
      }

      const folderContents: FileSystemTree = {};
      (node.children || []).forEach((child) => {
        if (child.type === "folder") {
          folderContents[child.name] = {
            directory: processNode(child),
          };
        } else {
          folderContents[child.name] = {
            file: {
              contents: child.content || "",
            },
          };
        }
      });

      return folderContents;
    };

    nodes.forEach((node) => {
      if (node.type === "folder") {
        result[node.name] = {
          directory: processNode(node),
        };
      } else {
        result[node.name] = {
          file: {
            contents: node.content || "",
          },
        };
      }
    });

    return result;
  };

  const startDevServer = async () => {
    if (!webContainer) return;

    const installProcess = await webContainer.spawn("npm", ["install"]);
    installProcess.output.pipeTo(
      new WritableStream({
        write(chunk) {
          console.log(chunk);
        },
      }),
    );

    const installExitCode = await installProcess.exit;

    if (installExitCode !== 0) {
      throw new Error(`Unable to run npm install. Exit code: ${installExitCode}`);
    }

    await webContainer.spawn("npm", ["run", "dev"]);

    webContainer.on("server-ready", (_, url) => {
      setIframeUrl(url);
      setWebcontainerCreated(true);
    });
  };

  const loadFilesToWebContainer = async (tree: FileStructure[]) => {
    if (!webContainer) return;

    await webContainer.mount(convertFilesToWebContainerFormat(tree));
    await startDevServer();
  };

  const handleSelectedFile = (node: FileStructure) => {
    if (node.type === "file") {
      setSelectedFile(node);
      return;
    }

    setOpenFolders((prev) =>
      prev.includes(node.id) ? prev.filter((id) => id !== node.id) : [...prev, node.id],
    );
  };

  const extractCodeBlocks = (responseText: string): string[] => {
    const codeRegex = /<code>([\s\S]*?)<\/code>/g;
    const matches: string[] = [];
    let match: RegExpExecArray | null;

    while ((match = codeRegex.exec(responseText)) !== null) {
      matches.push(match[1]);
    }

    return matches;
  };

  const extractFileBlocks = (responseText: string): Array<{ name: string; content: string }> => {
    const fileRegex = /<file name="(.*?)">([\s\S]*?)<\/file>/g;
    const matches: Array<{ name: string; content: string }> = [];
    let match: RegExpExecArray | null;

    while ((match = fileRegex.exec(responseText)) !== null) {
      matches.push({
        name: match[1],
        content: match[2],
      });
    }

    return matches;
  };

  const extractExplanation = (responseText: string): string => {
    const textWithoutCodeBlocks = responseText.replace(/<code>[\s\S]*?<\/code>/g, "");
    const cleanedText = textWithoutCodeBlocks.replace(/<[^>]*>/g, "");
    return cleanedText.trim();
  };

  const onSubmit = async () => {
    if (!prompt.trim() || loading) return;

    try {
      setLoading(true);

      const response = await axios.post("/api/code", {
        prompt,
        userMessages,
        modelMessages,
      });

      setUserMessages((prev) => [...prev, { text: prompt }]);
      setModelMessages((prev) => [...prev, { text: response.data }]);

      const codeBlocks = extractCodeBlocks(response.data);
      const explanation = extractExplanation(response.data);
      const files = extractFileBlocks(codeBlocks[0] || "");

      let nextTree: FileStructure[] = [];
      files.forEach((file) => {
        nextTree = mergeFileIntoTree(nextTree, file.name, file.content);
      });

      setFileTree(nextTree);
      setSelectedFile(null);
      setOpenFolders([]);
      setExplanations((prev) => [...prev, explanation]);
      setShowPromptSection(false);
      setWebcontainerCreated(false);
      setIframeUrl("");
      setPrompt("");

      await loadFilesToWebContainer(nextTree);
    } catch (error: any) {
      if (error?.status === 401 || error?.response?.status === 401) {
        toast.error("Please login to continue");
      } else {
        toast.error("Something went wrong.");
      }
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  const renderFileTree = (nodes: FileStructure[]) => {
    return (
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
  };

  const canGenerate = useMemo(() => prompt.trim().length > 0 && !loading, [prompt, loading]);

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
                <h1 className="mt-4 text-3xl font-semibold tracking-tight md:text-4xl">Generate full web app scaffolds from a single prompt.</h1>
                <p className="mt-2 max-w-3xl text-sm text-slate-600 dark:text-slate-200 md:text-base">
                  Describe your app, generate files instantly, edit in Monaco, and launch a live preview in the same workspace.
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
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        onSubmit();
                      }
                    }}
                    placeholder="Example: Build a pricing page with testimonials and a contact form..."
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
                    {explanations.map((explanation, index) => (
                      <article key={`${index}-${explanation.slice(0, 16)}`} className="rounded-xl border border-slate-200/70 bg-white/80 p-3 text-sm dark:border-white/10 dark:bg-black/70">
                        <ReactMarkdown
                          remarkPlugins={[remarkGfm]}
                          components={{
                            code: ({ className, children, ...props }) => (
                              <code className={cn("rounded bg-slate-100 px-1.5 py-0.5 dark:bg-zinc-900", className)} {...props}>
                                {children}
                              </code>
                            ),
                            pre: ({ children, ...props }) => (
                              <pre className="my-2 overflow-auto rounded-lg bg-slate-950 p-3 text-slate-100" {...props}>
                                {children}
                              </pre>
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
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && !e.shiftKey) {
                          e.preventDefault();
                          onSubmit();
                        }
                      }}
                      placeholder="Ask for edits: add auth, improve UX, change colors..."
                      className="h-24 w-full resize-none rounded-xl border border-slate-300/80 bg-white/90 p-3 text-sm outline-none ring-sky-500/40 transition focus:ring-2 dark:border-white/15 dark:bg-black/80"
                    />
                    <Button
                      type="button"
                      className="w-full"
                      disabled={!canGenerate}
                      onClick={onSubmit}
                    >
                      {loading ? <span className="inline-flex items-center gap-2">{dotLoader} Updating...</span> : "Apply Changes"}
                    </Button>
                  </div>
                </CardContent>
              </Card>

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
                          {fileTree.length ? (
                            renderFileTree(fileTree)
                          ) : (
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
                              onChange={(value) => updateFileContent(selectedFile.id, value || "")}
                              options={{
                                minimap: { enabled: true },
                                fontSize: 14,
                                lineNumbers: "on",
                                automaticLayout: true,
                                formatOnPaste: true,
                                formatOnType: true,
                              }}
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
                        {webcontainerCreated ? (
                          <iframe
                            title="preview"
                            src={iframeUrl}
                            className="h-full w-full"
                            allow="cross-origin-isolated"
                          />
                        ) : (
                          <div className="flex h-full items-center justify-center bg-slate-50/80 dark:bg-black/60">
                            <div className="rounded-2xl border border-slate-300/70 bg-white/90 px-5 py-4 text-center dark:border-white/15 dark:bg-zinc-950/90">
                              <p className="text-sm font-medium">Starting preview server...</p>
                              <p className="mt-2 text-xs text-muted-foreground">This can take up to a minute for fresh installs.</p>
                            </div>
                          </div>
                        )}
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
