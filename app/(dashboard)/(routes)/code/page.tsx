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
    // Node represent file or folder being created
    const newNode: FileStructure = {
      id: crypto.randomUUID(),
      name,
      type,
      content,
      language,
      children,
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
    console.log(filetree);
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

  useEffect(() => {
    console.log("selected FIle: ", selectedFile);
  }, [selectedFile]);

  const renderFileTree = (nodes: FileStructure[]) => {
    return (
      <ul>
        {nodes.map((node) => (
          <li key={node.id} className="ml-2 w-full">
            <div
              className={`flex items-center space-x-2 p-2 rounded cursor-pointer ${
                selectedFile?.id === node.id
                  ? "bg-zinc-700"
                  : "hover:bg-zinc-800"
              }`}
              onClick={() =>
                node.type === "file"
                  ? setSelectedFile(node)
                  : setOpenFolders(
                      (prev) =>
                        prev.includes(node.id)
                          ? prev.filter((id) => id !== node.id) // Close folder
                          : [...prev, node.id] // Open folder
                    )
              }
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

      console.log(response.data);
      console.log("userMessages :: ", userMessages);
      console.log("modelMessages :: ", modelMessages);

      filetree.length = 0;
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
              console.log(key);

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
            console.log(JSON.stringify(parsedObj));
          }
        }
      });
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
          <div className="w-64 bg-zinc-900 text-white p-4 rounded-l-lg overflow-auto scrollbar-thin scrollbar-thumb-black/10 dark:scrollbar-thumb-white/10 scrollbar-track-transparent">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Files</h3>
            </div>
            {renderFileTree(filetree)}
          </div>
          <div className="flex-1 bg-[#1e1e1e] rounded-r-lg">
            {selectedFile && selectedFile.type === "file" ? (
              <Editor
                height="100%"
                theme="vs-dark"
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
      </div>
    </div>
  );
}

export default CodeGenerationPage;
