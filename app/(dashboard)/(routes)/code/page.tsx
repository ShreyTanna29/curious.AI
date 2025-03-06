"use client";
import axios from "axios";
import { ChevronDown, ChevronRightIcon, FileIcon } from "lucide-react";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { formSchema } from "./constants";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import Editor from "@monaco-editor/react";
import toast from "react-hot-toast";
import useWebContainer from "@/hooks/useWebContainer";
import { FileSystemTree } from "@webcontainer/api";

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
  const [webcontainerCreated, setWebContainerCreated] = useState(false);

  const webContainer = useWebContainer();

  useEffect(() => {
    if (document.documentElement.classList.contains("dark")) {
      setCurrentTheme("dark");
    } else {
      setCurrentTheme("light");
    }
  });
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      prompt: "",
    },
  });

  const isLoading = form.formState.isSubmitting;

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

    // setFiletree((prevTree) =>
    //   parentId ? updateFileTree(prevTree) : [...prevTree, newNode]
    // );
  };

  // const findFile = (
  //   nodes: FileStructure[],
  //   fileId: string
  // ): FileStructure | null => {
  //   for (const node of nodes) {
  //     if (node.id === fileId) return node;
  //     if (node.children) {
  //       const found = findFile(node.children, fileId);
  //       if (found) return found;
  //     }
  //   }
  //   return null;
  // };

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

    console.log("files mounted: ", files);
    if (!files) console.log("FILES ARE EMPTY BITCH!!");

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
          "Unable to run npm install, Exit Code is not equal to 0."
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

  useEffect(() => {
    if (showTab === "preview") {
      if (!webcontainerCreated) {
        startDevServer();
      }
    }
  }, [showTab]);

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

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      const response = await axios.post("/api/code", {
        prompt: values.prompt,
        userMessages,
        modelMessages,
      });

      setUserMessages((prev) => [...prev, { text: values.prompt }]);
      setModelMessages((prev) => [...prev, { text: response.data }]);

      // console.log(response.data);

      filetree.length = 0;
      setSelectedFile(null);
      const strings = response.data.split("```");

      strings.map((string: any) => {
        if (string) {
          if (string.includes("json")) {
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
        }
      });
      console.log("file tree before calling loadfiles func :: ", filetree);

      loadFilesToWebContainer();
      console.log(strings);

      form.reset();
    } catch (error) {
      toast.error("Something went wrong.");
      console.log(error);
    }
  };

  return (
    <div className="h-full">
      <div className="px-4 lg:px-8">
        <div className="flex items-center gap-4">
          <Button>Code</Button>
          <Button>Preview</Button>
        </div>

        <div className="mt-8">
          <div className="p-2 rounded-t-lg bg-neutral-100 dark:bg-zinc-900 dark:text-white border  border-black/10 dark:border-white/10">
            <span className="dark:bg-black rounded-3xl gap-3 flex px-3 py-1 w-fit ">
              <span
                className={`${
                  showTab === "code"
                    ? "bg-blue-500/20 text-[#2BA6FF]"
                    : "opacity-50"
                }  px-3 py-1 text-sm rounded-3xl cursor-pointer `}
                onClick={() => setShowTab("code")}
              >
                Code
              </span>
              <span
                className={`${
                  showTab === "preview"
                    ? "bg-blue-500/20 text-[#2BA6FF]"
                    : "opacity-70"
                }  px-3 py-1 text-sm rounded-3xl cursor-pointer`}
                onClick={() => setShowTab("preview")}
              >
                Preview
              </span>
            </span>
          </div>
          {showTab === "code" && (
            <div className="flex h-[calc(100vh-300px)] ">
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
                    theme={`${currentTheme === "dark" ? "vs-dark" : "light"}`}
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
            </div>
          )}
          {showTab === "preview" && (
            <div className="w-1/2">
              <iframe
                title="preview"
                src={iframeUrl}
                className="w-full h-[80vh]"
                allow="cross-origin-isolated"
              ></iframe>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default CodeGenerationPage;
