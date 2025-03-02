"use client";
import axios from "axios";
import Heading from "@/components/extra/heading";
import { ChevronDown, ChevronRightIcon, Code, FileIcon } from "lucide-react";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { formSchema } from "./constants";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import Editor from "@monaco-editor/react";
import toast from "react-hot-toast";
import Loader from "@/components/loaders/loader";
import useWebContainer from "@/hooks/useWebContainer";

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

    setFiletree((prevTree) =>
      parentId ? updateFileTree(prevTree) : [...prevTree, newNode]
    );
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

    const processFiles = async (nodes: FileStructure[], path = "") => {
      return nodes.reduce((acc, node) => {
        const fullPath = path ? `${path}/${node.name}` : node.name;

        if (node.type === "file") {
          acc[fullPath] = {
            file: {
              contents: node.content || "",
            },
          };
        } else if (node.type === "folder") {
          acc[fullPath] = {
            directory: {},
          };
          if (node.children) {
            Object.assign(acc, processFiles(node.children, fullPath));
          }
        }
        return acc;
      }, {});
    };

    console.log("file tree :: ", filetree);

    const files = await processFiles(filetree);
    if (webContainer) {
      console.log("files mounted: ", files);
      if (!files) console.log("FILES ARE EMPTY BITCH!!");

      await webContainer.mount(files);
      await startDevServer();
    }
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

      await webContainer.spawn("npm", ["run", "dev"]);

      webContainer.on("server-ready", (port, url) => {
        console.log("url: ", url, "port: ", port);

        setIframeUrl(url);
      });
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

      setFiletree([]);
      setSelectedFile(null);
      const strings = response.data.split("```");

      strings.map((string: any) => {
        if (string) {
          if (string.includes("json")) {
            const newString = string
              .replace("json", "")
              .replace(/`/g, "'")
              .trim();

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
      setTimeout(() => {
        loadFilesToWebContainer();
      }, 0);
      console.log(strings);

      form.reset();
    } catch (error) {
      toast.error("Something went wrong.");
      console.log(error);
    }
  };

  return (
    <div className="h-full">
      <Heading
        title="Code Generation"
        description="Get code for anything in any language."
        icon={Code}
        iconColor="text-green-500"
        bgColor="bg-green-500/10"
      />

      <div className="px-4 lg:px-8">
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="rounded-lg border w-full p-4 px-3 md:px-6 focus-within:shadow-sm grid grid-cols-12 gap-2"
          >
            <FormField
              name="prompt"
              render={({ field }) => (
                <FormItem className="col-span-12 lg:col-span-10">
                  <FormControl className="m-0 p-0">
                    <Input
                      className="border-0 outline-none focus-visible:ring-0 focus-visible:ring-transparent"
                      disabled={isLoading}
                      placeholder="e.g. Write code for a Todo application in javascript."
                      {...field}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
            <Button
              className="col-span-12 lg:col-span-2 w-full"
              disabled={isLoading}
            >
              {isLoading ? <Loader className="w-7 h-7" /> : "Generate"}
            </Button>
          </form>
        </Form>

        <div className="flex h-[calc(100vh-300px)] mt-8">
          <div className="w-[30%] bg-neutral-100 dark:bg-zinc-900 dark:text-white p-4 rounded-l-lg overflow-auto scrollbar-thin scrollbar-thumb-black/10 dark:scrollbar-thumb-white/10 scrollbar-track-transparent border-r border-black/10 dark:border-white/10">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Files</h3>
            </div>
            {renderFileTree(filetree)}
          </div>
          <div className="flex-1 bg-neutral-100 dark:bg-[#1e1e1e] rounded-r-lg">
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
        {
          <div className="w-1/2 border">
            <iframe
              title="preview"
              src={iframeUrl}
              className="w-[80vw] h-[100vh]"
              allow="cross-origin-isolated"
            ></iframe>
          </div>
        }
      </div>
    </div>
  );
}

export default CodeGenerationPage;
