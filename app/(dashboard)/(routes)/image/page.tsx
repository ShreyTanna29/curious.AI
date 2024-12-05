"use client";
import axios from "axios";
import Image from "next/image";
import {
  ArrowUp,
  ChevronDown,
  Download,
  EllipsisVertical,
  Share2,
  Trash2,
} from "lucide-react";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { formSchema } from "./constants";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { useState } from "react";
import Loader from "@/components/loader";
import { Card, CardFooter } from "@/components/ui/card";
import toast from "react-hot-toast";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { shareImage, downloadImage } from "@/packages/features";
import { deleteImage } from "@/packages/features/deleteImage";
import LoadingSpinner from "@/components/loadingSpinner";
import { Textarea } from "@/components/ui/textarea";
import { TextGenerateEffect } from "@/components/text-generate-effect";

type imageType = {
  url: string;
  prompt: string;
};
function ImagePage() {
  const router = useRouter();
  const [newImages, setNewImages] = useState<imageType[]>([]);
  const [prevImages, setPrevImages] = useState<imageType[]>([]);
  const [showPrevImages, setShowPrevImages] = useState(false);
  const [loadingImages, setLoadingImages] = useState(false)
  const [deletingImages, setDeletingImages] = useState<{
    [key: string]: boolean;
  }>({});

  const [downloadingImages, setDownloadingImages] = useState<{
    [key: string]: boolean;
  }>({});

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      prompt: "",
    },
  });

  const userImages = async () => {
    setLoadingImages(true)
    try {
      const response = await axios.get("/api/image/get-user-images");

      if (response.data) {
        setPrevImages(
          response.data.map((img: imageType) => {
            return { url: img.url, prompt: img.prompt };
          })
        );
      }
    } catch (error) {
      console.log("Error fetching user images:", error);
      toast.error("Failed to load images");
    }
    setLoadingImages(false)
  };

  const isLoading = form.formState.isSubmitting;
  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      const response = await axios.post("/api/image", values);
      const output = await response.data;

      setNewImages((prev) => [{ url: output, prompt: values.prompt }, ...prev]);
      form.reset();
    } catch (error: any) {
      console.log(error);
      toast.error("Something went wrong.");
    }
    finally {
      router.refresh();
    }
  };

  const imageDownloadHandler = async (url: string, prompt: string) => {
    setDownloadingImages((prev) => ({ ...prev, [url]: true }));
    await downloadImage(url, prompt);
    setDownloadingImages((prev) => ({ ...prev, [url]: false }));
  };

  const deleteImageHandler = async (url: string) => {
    setDeletingImages((prev) => ({ ...prev, [url]: true }))
    await deleteImage({ url })
    await userImages()
    setDeletingImages((prev) => ({ ...prev, [url]: false }))
  }

  return (
    <div className="select-none h-full">
      <div className=" px-4 lg:px-8 h-full w-full">
        <div className="w-full h-[30%] flex items-center justify-center" >
          <TextGenerateEffect className="text-3xl md:text-6xl" words="Let's Imagify Your Thoughts ✨🎩" />
        </div>
        <div className="flex w-full  mt-8">
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="rounded-full border w-full p-4 px-3 md:px-6 focus-within:shadow-sm grid grid-cols-10 gap-2"
            >
              <FormField
                name="prompt"
                render={({ field }) => (
                  <FormItem className="col-span-10 lg:col-span-9">
                    <FormControl className="m-0 p-2">
                      <Textarea
                        className="border-0 outline-none focus-visible:ring-0  focus-visible:ring-transparent"
                        disabled={isLoading}
                        placeholder="e.g. A cute cat with hat"
                        {...field}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
              <Button
                className="rounded-full bg-black/10 dark:bg-white/10"
                disabled={isLoading}
              >
                <ArrowUp className="text-black dark:text-white" />
              </Button>
            </form>
          </Form>
        </div>
        <div className="space-y-4 mt-4">
          {(isLoading || loadingImages) && (
            <div className="p-8 rounded-lg w-full flex items-center justify-center bg-muted">
              <Loader />
            </div>
          )}

          <div className="flex w-full items-center justify-center">
            <div className="cursor-pointer flex bg-black/10 p-4 items-center justify-center gap-2 dark:bg-white/10" onClick={() => {
              setShowPrevImages(!showPrevImages)
              userImages()
            }}>
              My Previous Images <ChevronDown />
            </div>
          </div>

          <div className={` grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 ${showPrevImages ? "grid" : "hidden"} `}>
            {prevImages &&
              prevImages.map((image) => (
                <Card key={image.url} className="rounded-lg overflow-hidden">
                  <div className="relative aspect-square">
                    <div className="absolute text-white top-2 right-2 z-10 cursor-pointer ">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <div className="p-1 rounded-full bg-black/20    backdrop-blur-sm hover:bg-black/30  transition">
                            {(downloadingImages[image.url] || deletingImages[image.url]) ? (
                              <LoadingSpinner />
                            ) : (
                              <EllipsisVertical className="w-5 h-5 text-white drop-shadow-[0_1.2px_1.2px_rgba(0,0,0,0.8)]" />
                            )}
                          </div>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent>
                          <DropdownMenuItem
                            className="flex gap-2 cursor-pointer"
                            onClick={() => {
                              imageDownloadHandler(image.url, image.prompt);
                            }}
                          >
                            <Download />
                            Download
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />

                          <DropdownMenuItem
                            className="flex gap-2 cursor-pointer "
                            onClick={() => shareImage(image.url, image.prompt)}
                          >
                            <Share2 />
                            Share
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            className="flex gap-2 cursor-pointer "
                            onClick={() =>
                              deleteImageHandler(image.url)}
                          >
                            <Trash2 />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                    <Image
                      width={524}
                      height={524}
                      alt="image"
                      src={image.url}
                    />
                  </div>
                  <CardFooter className="justify-center p-4 bg-black/10 dark:bg-white/10  ">
                    <h1 className="font-bold ">{image.prompt}</h1>
                  </CardFooter>
                </Card>
              ))}
          </div>
          <div className={` grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 ${newImages ? "grid" : "hidden"} `}>
            {newImages &&
              newImages.map((image) => (
                <Card key={image.url} className="rounded-lg overflow-hidden">
                  <div className="relative aspect-square">
                    <div className="absolute text-white top-2 right-2 z-10 cursor-pointer ">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <div className="p-1 rounded-full bg-black/20    backdrop-blur-sm hover:bg-black/30  transition">
                            {(downloadingImages[image.url] || deletingImages[image.url]) ? (
                              <LoadingSpinner />
                            ) : (
                              <EllipsisVertical className="w-5 h-5 text-white drop-shadow-[0_1.2px_1.2px_rgba(0,0,0,0.8)]" />
                            )}
                          </div>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent>
                          <DropdownMenuItem
                            className="flex gap-2 cursor-pointer"
                            onClick={() => {
                              imageDownloadHandler(image.url, image.prompt);
                            }}
                          >
                            <Download />
                            Download
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />

                          <DropdownMenuItem
                            className="flex gap-2 cursor-pointer "
                            onClick={() => shareImage(image.url, image.prompt)}
                          >
                            <Share2 />
                            Share
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            className="flex gap-2 cursor-pointer "
                            onClick={() =>
                              deleteImageHandler(image.url)}
                          >
                            <Trash2 />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                    <Image
                      width={524}
                      height={524}
                      alt="image"
                      src={image.url}
                    />
                  </div>
                  <CardFooter className="justify-center p-4 bg-black/10 dark:bg-white/10  ">
                    <h1 className="font-bold ">{image.prompt}</h1>
                  </CardFooter>
                </Card>
              ))}
          </div>
        </div>
      </div>
    </div>
  );
}
export default ImagePage;
