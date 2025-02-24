"use client";
import axios from "axios";
import Heading from "@/components/extra/heading";
import { Code, File, Plus } from "lucide-react";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { formSchema } from "./constants";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import Editor from "@monaco-editor/react";
import toast from "react-hot-toast";
import Loader from "@/components/loaders/loader";

interface FileStructure {
  name: string;
  content: string;
  language: string;
}

function CodeGenerationPage() {
  const [files, setFiles] = useState<FileStructure[]>([]);
  const [selectedFile, setSelectedFile] = useState<FileStructure | null>(null);
  const [userMessages, setUserMessages] = useState<{ text: string }[]>([]);
  const [modelMessages, setModelMessages] = useState<{ text: string }[]>([]);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      prompt: "",
    },
  });

  const isLoading = form.formState.isSubmitting;

  const createNewFile = () => {
    const newFile = {
      name: `untitled-${files.length + 1}.js`,
      content: "// Start coding here",
      language: "javascript",
    };
    setFiles([...files, newFile]);
    setSelectedFile(newFile);
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

      files.length = 0;
      const strings = response.data.split("```");

      strings.map((string: any) => {
        if (string) {
          if (string.includes("json")) {
            const newString = string
              .replace("json", "")
              .replace(/`/g, "'")
              .trim();

            console.log(newString);
            const obj = JSON.parse(newString);

            for (const key in obj) {
              console.log(key);

              const extension = key.split(".").pop()?.toLowerCase();
              const languageMap: { [key: string]: string } = {
                js: "javascript",
                jsx: "javascriptreact",
                ts: "typescript",
                tsx: "typescriptreact",
                html: "html",
                css: "css",
                json: "json",
                py: "python",
                java: "java",
                cpp: "cpp",
                c: "c",
                go: "go",
                rs: "rust",
              };

              const language = languageMap[extension || ""] || "plaintext";
              const newfile = {
                name: key,
                content: obj[key],
                language,
              };
              files.push(newfile);
              setSelectedFile(newfile);
            }
            console.log(JSON.stringify(obj));
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
          <div className="w-64 bg-zinc-900 text-white p-4 rounded-l-lg">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Files</h3>
              <Button variant="ghost" size="icon" onClick={createNewFile}>
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            <div className="space-y-2">
              {files.map((file, index) => (
                <div
                  key={index}
                  className={`flex items-center space-x-2 p-2 rounded cursor-pointer ${
                    selectedFile === file ? "bg-zinc-700" : "hover:bg-zinc-800"
                  }`}
                  onClick={() => setSelectedFile(file)}
                >
                  <File className="h-4 w-4" />
                  <span>{file.name}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="flex-1 bg-[#1e1e1e] rounded-r-lg">
            {selectedFile ? (
              <Editor
                height="100%"
                theme="vs-dark"
                language={selectedFile.language}
                value={selectedFile.content}
                onChange={(value) => {
                  if (selectedFile && value) {
                    const updatedFiles = files.map((f) =>
                      f === selectedFile ? { ...f, content: value } : f
                    );
                    setFiles(updatedFiles);
                    setSelectedFile({ ...selectedFile, content: value });
                  }
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
                Select a file or generate code to begin
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default CodeGenerationPage;
