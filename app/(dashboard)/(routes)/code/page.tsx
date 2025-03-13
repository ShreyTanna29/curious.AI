"use client";
import axios from "axios";
import {
  ChevronDown,
  ChevronRightIcon,
  FileIcon,
  RefreshCw,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import Editor from "@monaco-editor/react";
import toast from "react-hot-toast";
import useWebContainer from "@/hooks/useWebContainer";
import { FileSystemTree } from "@webcontainer/api";
import { AnimatePresence, motion, useInView } from "framer-motion";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

interface FileStructure {
  id: string;
  name: string;
  type: "folder" | "file";
  content?: string;
  language?: string;
  children?: FileStructure[];
}

function CodeGenerationPage() {
  const [filetree, setFiletree] = useState<FileStructure[]>([]);
  const [selectedFile, setSelectedFile] = useState<FileStructure | null>(null);
  const [userMessages, setUserMessages] = useState<{ text: string }[]>([]);
  const [modelMessages, setModelMessages] = useState<{ text: string }[]>([]);
  const [openFolders, setOpenFolders] = useState<string[]>([]); // which ever folder needs to open, id of that folder will be in this array
  const [currentTheme, setCurrentTheme] = useState<"light" | "dark">();
  const [iframeUrl, setIframeUrl] = useState<string>("");
  const [showTab, setShowTab] = useState<"code" | "preview">("code");
  const [showPromptSection, setShowPromptSection] = useState(true);
  const [webcontainerCreated, setWebContainerCreated] = useState(false);
  const [prompt, setPrompt] = useState("");
  const [loading, setLoading] = useState(false);
  const [explanations, setExplanations] = useState<string[]>([]);
  const [swipeDirection, setSwipeDirection] = useState(0);

  const webContainer = useWebContainer();

  const LoadingDots = () => (
    <div className="flex items-center gap-1">
      {[1, 2, 3].map((dot) => (
        <motion.div
          key={dot}
          className="w-2 h-2 rounded-full bg-black"
          initial={{ y: 0 }}
          animate={{ y: [-3, 0, -3] }}
          transition={{
            duration: 1.2,
            repeat: Infinity,
            delay: dot * 0.2,
            ease: "easeInOut",
          }}
        />
      ))}
    </div>
  );
  useEffect(() => {
    if (document.documentElement.classList.contains("dark")) {
      setCurrentTheme("dark");
    } else {
      setCurrentTheme("light");
    }
  });

  const addFileOrFolder = (
    parentId: string | null,
    name: string,
    type: "file" | "folder",
    content?: string,
    language?: string,
    children?: FileStructure[]
  ) => {
    const assignIdToChildren = children?.map((child) => ({
      ...child,
      id: crypto.randomUUID(),
      children: child.children
        ? child.children.map((c) => ({ ...c, id: crypto.randomUUID() }))
        : undefined,
    }));

    // Node represent file or folder being created
    const newNode: FileStructure = {
      id: crypto.randomUUID(),
      name,
      type,
      content,
      language,
      children: assignIdToChildren,
    };

    const updateFileTree = (nodes: FileStructure[]): FileStructure[] => {
      // node refers to file or folder.
      return nodes.map((node) => {
        if (node.id === parentId) {
          return { ...node, children: [...(node.children || []), newNode] };
        }
        if (node.children) {
          // using recursion to update file strucutre if node has children
          return { ...node, children: updateFileTree(node.children) };
        }
        return node;
      });
    };

    if (parentId) {
      updateFileTree(filetree);
    } else {
      filetree.push(newNode);
    }
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

    setFiletree((prevTree) => updateTree(prevTree));
  };

  const loadFilesToWebContainer = async () => {
    if (!webContainer) return;

    const convertFilesToWebContainerFormat = (
      nodes: FileStructure[]
    ): FileSystemTree => {
      const result: FileSystemTree = {};

      const processNode = (node: FileStructure) => {
        if (node.type === "folder") {
          const folderContents: FileSystemTree = {};

          if (node.children) {
            node.children.forEach((child) => {
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
          }
          return folderContents;
        }
        return {
          [node.name]: {
            file: {
              contents: node.content || "",
            },
          },
        };
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

    const files = convertFilesToWebContainerFormat(filetree);

    console.log("file tree :: ", filetree);
    await webContainer.mount(files);
    await startDevServer();
  };

  const startDevServer = async () => {
    try {
      if (!webContainer) return;

      const installProcess = await webContainer.spawn("npm", ["install"]);
      installProcess.output.pipeTo(
        new WritableStream({
          write(chunk) {
            console.log(chunk);
          },
        })
      );

      const installExitCode = await installProcess.exit;

      if (installExitCode !== 0) {
        throw new Error(
          "Unable to run npm install, Exit Code is not equal to 0. " +
            installExitCode
        );
      }
      try {
        await webContainer.spawn("npm", ["run", "dev"]);

        webContainer.on("server-ready", (port, url) => {
          console.log("url: ", url, "port: ", port);
          setIframeUrl(url);
          setWebContainerCreated(true);
        });
      } catch (error) {
        console.log("npm run dev error : ", error);
      }
    } catch (error) {
      console.log("start DEV SEREVER : ", error);
    }
  };

  const handleSelectedFile = (node: FileStructure) => {
    if (node.type === "file") {
      if (node.id.trim() === "" || node.id === undefined) {
        node.id = crypto.randomUUID();
        setSelectedFile(node);
      } else {
        setSelectedFile(node);
      }
    } else {
      setOpenFolders(
        (prev) =>
          prev.includes(node.id)
            ? prev.filter((id) => id !== node.id) // Close folder
            : [...prev, node.id] // Open folder
      );
    }
  };

  const renderFileTree = (nodes: FileStructure[]) => {
    return (
      <ul>
        {nodes.map((node) => (
          <li key={node.id} className="ml-2 w-full">
            <div
              className={`flex items-center space-x-2 p-2 rounded cursor-pointer ${
                selectedFile?.id === node.id
                  ? "bg-zinc-300 dark:bg-zinc-700"
                  : " hover:bg-zinc-200 dark:hover:bg-zinc-800"
              }`}
              onClick={() => handleSelectedFile(node)}
            >
              <div className="flex items-center gap-3">
                {node.type === "file" ? (
                  <FileIcon />
                ) : openFolders.includes(node.id) ? (
                  <ChevronDown />
                ) : (
                  <ChevronRightIcon />
                )}
                <span>{node.name}</span>
              </div>
            </div>

            {openFolders.includes(node.id) &&
              node.children &&
              node.children.length > 0 && (
                <div className="ml-4 border-l pl-2 gap-3">
                  {renderFileTree(node.children)}
                </div>
              )}
          </li>
        ))}
      </ul>
    );
  };

  const onSubmit = async () => {
    try {
      setLoading(true);
      const response = await axios.post("/api/code", {
        prompt,
        userMessages,
        modelMessages,
      });

      setUserMessages((prev) => [...prev, { text: prompt }]);
      setModelMessages((prev) => [...prev, { text: response.data }]);

      // console.log(response.data);

      filetree.length = 0;
      setSelectedFile(null);
      const strings = response.data.split("```");

      strings.map((string: any) => {
        if (string) {
          const firstLine = string.split("\n")[0].trim().toLowerCase();
          if (firstLine.includes("json")) {
            const newString = string.replace("json", "").trim();

            console.log(newString);
            const parsedObj = JSON.parse(newString);

            for (const key in parsedObj) {
              // console.log("key: ",key);

              const addThisNode = (node: FileStructure) => {
                addFileOrFolder(
                  null,
                  node.name || "",
                  node.type,
                  node.type === "file" ? node.content : undefined,
                  node.type === "file" ? node.language : undefined,
                  node.type === "folder" ? node.children : undefined
                );
              };
              addThisNode(parsedObj[key]);
            }
            // console.log(JSON.stringify(parsedObj));
          }
          if (firstLine.includes("explanation")) {
            console.log("EXPLANATION :: ", string);
            const newString = string.replace("explanation", "").trim();
            setExplanations((prev) => [...prev, newString]);
          }
        }
      });
      console.log("file tree before calling loadfiles func :: ", filetree);
      setShowPromptSection(false);
      setLoading(false);
      loadFilesToWebContainer();
      console.log(strings);

      setPrompt("");
    } catch (error) {
      toast.error("Something went wrong.");
      setLoading(false);
      console.log(error);
    }
  };

  const mainRef = useRef(null);
  const isInView = useInView(mainRef);

  const fadeIn = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  const borderAnimation = {
    initial: { backgroundPosition: "0% 0%" },
    animate: {
      backgroundPosition: isInView ? ["0% 0%", "100% 100%"] : "0% 0%",
      transition: {
        duration: 8,
        ease: "linear",
        repeat: isInView ? Infinity : 0,
      },
    },
  };

  const pageTransition = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 },
  };

  const slideVariants = {
    enter: (direction: number) => ({
      x: direction > 0 ? "30%" : "-30%",
      opacity: 0,
    }),
    center: {
      x: 0,
      opacity: 1,
    },
    exit: (direction: number) => ({
      x: direction < 0 ? "30%" : "-30%",
      opacity: 0,
    }),
  };
  return (
    <div className="h-full w-full transition-all duration-300 ease-in-out">
      <AnimatePresence mode="wait">
        <div>
          {showPromptSection && (
            <motion.div
              key="prompt"
              initial="hidden"
              animate="visible"
              exit="exit"
              variants={pageTransition}
              transition={{ duration: 0.5, ease: "easeInOut" }}
              className="bg-gradient-to-br h-screen backdrop-blur-lg dark:from-[#0A0A0A] dark:to-[#1A1A1A] text-black dark:text-white transition-all duration-300 ease-in-out"
            >
              <main ref={mainRef} className="pt-24 px-4 max-w-4xl mx-auto">
                <motion.div
                  initial="hidden"
                  animate="visible"
                  variants={fadeIn}
                  transition={{ duration: 0.8, delay: 0.2 }}
                  className="text-center mb-12 space-y-4"
                >
                  <motion.h1
                    className="text-4xl md:text-5xl w-full font-bold bg-gradient-to-r from-blue-400 to-purple-500 text-transparent bg-clip-text"
                    animate={{
                      backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"],
                    }}
                    transition={{
                      duration: 8,
                      repeat: Infinity,
                      ease: "linear",
                    }}
                    style={{ backgroundSize: "200% 200%" }}
                  >
                    Build Web Apps At Light Speed
                  </motion.h1>
                  <motion.p
                    className="text-lg text-black/70 dark:text-white/70"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 1, delay: 0.4 }}
                  >
                    Describe what you want to build, and let AI do the magic
                  </motion.p>
                </motion.div>

                <motion.div
                  initial="initial"
                  animate="animate"
                  variants={borderAnimation}
                  className="relative rounded-xl p-[2px] overflow-hidden"
                  style={{
                    background:
                      "linear-gradient(90deg, #3B82F6, #8B5CF6, #EC4899, #3B82F6)",
                    backgroundSize: "300% 300%",
                  }}
                >
                  <div className="relative bg-white  dark:bg-[#0A0A0A] rounded-xl p-4 backdrop-blur-sm">
                    <div className="min-h-[200px]">
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 1, delay: 1 }}
                      >
                        <span className="dark:text-white/70">Start with: </span>
                        <span className="text-blue-400">
                          &quot;Create a modern landing page...&quot;
                        </span>
                      </motion.div>
                      <textarea
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault();
                            onSubmit();
                          }
                        }}
                        placeholder="Describe what you want to build..."
                        className="w-full h-[150px] mt-4 bg-transparent border-none outline-none resize-none dark:text-white placeholder-white/30"
                      />
                    </div>
                    <div className="absolute bottom-4 right-4">
                      {loading ? (
                        <motion.div
                          className="flex items-center gap-2"
                          initial={{ opacity: 0, scale: 0.95 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ duration: 0.2 }}
                        >
                          <motion.div
                            className="relative w-5 h-5"
                            animate={{
                              rotate: 360,
                              transition: {
                                duration: 1,
                                repeat: Infinity,
                                ease: "linear",
                                repeatType: "loop",
                              },
                            }}
                          >
                            <div className="absolute w-full h-full border-2 border-white border-t-transparent rounded-full animate-pulse" />
                            <div className="absolute w-full h-full border-2 border-black/30 dark:border-white/30 rounded-full" />
                          </motion.div>
                          <motion.span
                            className="dark:text-white/90"
                            initial={{ opacity: 0, x: -5 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.2 }}
                          >
                            Generating...
                          </motion.span>
                        </motion.div>
                      ) : (
                        <motion.div
                          className="flex items-center gap-2 cursor-pointer"
                          initial={{ x: -5 }}
                          whileHover={{ x: 0 }}
                        >
                          <span>Generate</span>
                          <ChevronRightIcon className="w-4 h-4" />
                        </motion.div>
                      )}
                    </div>
                  </div>
                </motion.div>
              </main>

              {/* Background Effects */}
              <div className="fixed inset-0 -z-10 overflow-hidden">
                <div className="absolute -inset-[10px] opacity-50">
                  <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500 rounded-full mix-blend-multiply filter blur-[128px]" />
                  <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-purple-500 rounded-full mix-blend-multiply filter blur-[128px]" />
                  <div className="absolute bottom-1/4 left-1/3 w-96 h-96 bg-pink-500 rounded-full mix-blend-multiply filter blur-[128px]" />
                </div>
              </div>
            </motion.div>
          )}

          {!showPromptSection && (
            <motion.div
              key="editor"
              initial="hidden"
              animate="visible"
              exit="exit"
              variants={pageTransition}
              transition={{ duration: 0.5, ease: "easeInOut" }}
              className="flex gap-4"
            >
              {/* EXPLANATION SECTION  */}
              <div className="w-[400px] border-r  border-black/10 dark:border-white/10 bg-neutral-50 dark:bg-zinc-900">
                <div className="p-4 border-b border-black/10 dark:border-white/10">
                  <div className="flex items-center justify-between">
                    <h2 className="text-lg font-semibold">Explanation</h2>
                    <button
                      onClick={() => setShowPromptSection(true)}
                      className="p-2 hover:bg-black/5 dark:hover:bg-white/5 rounded-full transition"
                    >
                      <RefreshCw className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                <div className="px-4 pt-4 space-y-4 overflow-auto max-h-[calc(100vh-300px)] scrollbar-thin scrollbar-track-transparent scrollbar-thumb-white/10">
                  {explanations.map((explanation, index) => (
                    <div
                      key={index}
                      className="prose dark:prose-invert prose-sm max-w-none"
                    >
                      <ReactMarkdown
                        remarkPlugins={[remarkGfm]}
                        components={{
                          code({ className, children, ...props }) {
                            return (
                              <code
                                className={`${className} bg-black/10 dark:bg-white/10 rounded px-1 py-0.5`}
                                {...props}
                              >
                                {children}
                              </code>
                            );
                          },
                          pre({ children, ...props }) {
                            return (
                              <pre
                                className="bg-black/10 dark:bg-white/10 rounded-lg p-3 overflow-auto"
                                {...props}
                              >
                                {children}
                              </pre>
                            );
                          },
                          h1: ({ ...props }) => (
                            <h1 className="text-xl font-bold mt-4" {...props} />
                          ),
                          h2: ({ ...props }) => (
                            <h2
                              className="text-lg font-semibold mt-3"
                              {...props}
                            />
                          ),
                          h3: ({ ...props }) => (
                            <h3
                              className="text-base font-medium mt-2"
                              {...props}
                            />
                          ),
                          p: ({ ...props }) => (
                            <p
                              className="text-sm leading-relaxed my-2"
                              {...props}
                            />
                          ),
                          ul: ({ ...props }) => (
                            <ul className="list-disc pl-4 my-2" {...props} />
                          ),
                          ol: ({ ...props }) => (
                            <ol className="list-decimal pl-4 my-2" {...props} />
                          ),
                          li: ({ ...props }) => (
                            <li className="text-sm my-1" {...props} />
                          ),
                          blockquote: ({ ...props }) => (
                            <blockquote
                              className="border-l-2 border-blue-500 pl-4 italic my-2"
                              {...props}
                            />
                          ),
                        }}
                      >
                        {explanation}
                      </ReactMarkdown>
                    </div>
                  ))}
                  <div className="sticky bottom-0 bg-neutral-50 dark:bg-zinc-900">
                    {loading ? (
                      <div
                        aria-disabled={loading}
                        className="p-4 w-full flex items-center justify-center disabled:opacity-30 "
                      >
                        <LoadingDots />
                      </div>
                    ) : null}
                    <textarea
                      value={prompt}
                      onChange={(e) => setPrompt(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && !e.shiftKey) {
                          e.preventDefault();
                          onSubmit();
                        }
                      }}
                      placeholder="Make changes to your app..."
                      className="w-full h-24 p-2 bg-white/5 rounded-lg border border-black/10 dark:border-white/10 resize-none focus:outline-none ring-1 ring-blue-500 dark:text-white placeholder-black/50 dark:placeholder-white/50"
                    />
                  </div>
                </div>
              </div>
              <div className="flex-1">
                <div className="p-2 w-full rounded-t-lg bg-neutral-100 dark:bg-zinc-900 dark:text-white border  border-black/10 dark:border-white/10">
                  <span className=" bg-black text-white  rounded-3xl gap-3 flex px-3 py-1 w-fit ">
                    <span
                      className={`${
                        showTab === "code"
                          ? "bg-blue-500/20 text-[#2BA6FF]"
                          : "opacity-50"
                      }  px-3 py-1 text-sm rounded-3xl cursor-pointer `}
                      onClick={() => {
                        setSwipeDirection(-1);
                        setShowTab("code");
                      }}
                    >
                      Code
                    </span>
                    <span
                      className={`${
                        showTab === "preview"
                          ? "bg-blue-500/20 text-[#2BA6FF]"
                          : "opacity-70"
                      }  px-3 py-1 text-sm rounded-3xl cursor-pointer`}
                      onClick={() => {
                        setSwipeDirection(1);
                        setShowTab("preview");
                      }}
                    >
                      Preview
                    </span>
                  </span>
                </div>
                <div className="relative overflow-hidden">
                  <AnimatePresence
                    initial={false}
                    custom={swipeDirection}
                    mode="popLayout"
                  >
                    {showTab === "code" && (
                      <motion.div
                        key={"code"}
                        variants={slideVariants}
                        custom={swipeDirection}
                        initial="enter"
                        animate="center"
                        exit={"exit"}
                        transition={{
                          x: { type: "spring", stiffness: 300, damping: 30 },
                          opacity: { duration: 0.2 },
                        }}
                        className="flex h-[calc(100vh-300px)] "
                      >
                        <div className="lg:w-[20%] w-[30%] bg-neutral-100 dark:bg-zinc-900 dark:text-white p-4 overflow-auto scrollbar-thin scrollbar-thumb-black/10 dark:scrollbar-thumb-white/10 scrollbar-track-transparent border-r border-black/10 dark:border-white/10">
                          <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-semibold">Files</h3>
                          </div>
                          {renderFileTree(filetree)}
                        </div>
                        <div className="flex-1 bg-neutral-100 dark:bg-[#1e1e1e]">
                          {selectedFile && selectedFile.type === "file" ? (
                            <Editor
                              height="100%"
                              theme={`${
                                currentTheme === "dark" ? "vs-dark" : "light"
                              }`}
                              language={selectedFile.language}
                              value={selectedFile.content}
                              onChange={(value) => {
                                updateFileContent(selectedFile.id, value || "");
                              }}
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
                            <div className="flex items-center justify-center h-full text-gray-500">
                              Write a prompt to build your app.
                            </div>
                          )}
                        </div>
                      </motion.div>
                    )}
                    {showTab === "preview" && (
                      <motion.div
                        key="preview"
                        variants={slideVariants}
                        initial="enter"
                        custom={swipeDirection}
                        animate="center"
                        exit="exit"
                        transition={{
                          x: { type: "spring", stiffness: 300, damping: 30 },
                          opacity: { duration: 0.2 },
                        }}
                        className="w-full"
                      >
                        {!webcontainerCreated ? (
                          <div className="h-[70vh] flex items-center justify-center bg-neutral-100 dark:bg-zinc-900">
                            <motion.div className="relative flex items-center justify-center">
                              {/* Outer spinning ring */}
                              <motion.div
                                className="absolute border-4 border-blue-500/30 rounded-full w-40 h-40"
                                animate={{
                                  rotate: 360,
                                  scale: [1, 1.1, 1],
                                }}
                                transition={{
                                  duration: 2,
                                  repeat: Infinity,
                                  ease: "linear",
                                }}
                              />

                              {/* Inner pulsing circle */}
                              <motion.div
                                className="absolute bg-gradient-to-r from-blue-400 to-purple-500 rounded-full w-32 h-32"
                                animate={{
                                  scale: [0.8, 1.1, 0.8],
                                  opacity: [0.6, 1, 0.6],
                                }}
                                transition={{
                                  duration: 1.5,
                                  repeat: Infinity,
                                  ease: "easeInOut",
                                }}
                              />

                              {/* Loading text */}
                              <motion.div
                                className="absolute top-24 left-1/2 -translate-x-1/2 whitespace-nowrap"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ duration: 0.3 }}
                              >
                                <span className="text-xl font-semibold bg-gradient-to-r from-blue-400 to-purple-500 text-transparent bg-clip-text">
                                  Starting Preview Server...
                                </span>
                              </motion.div>
                            </motion.div>
                          </div>
                        ) : (
                          <iframe
                            title="preview"
                            src={iframeUrl}
                            className="w-full h-[70vh]"
                            allow="cross-origin-isolated"
                          />
                        )}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </AnimatePresence>
    </div>
  );
}

export default CodeGenerationPage;
