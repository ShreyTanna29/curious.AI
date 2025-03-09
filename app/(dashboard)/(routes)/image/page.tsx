"use client";
import axios from "axios";
import Image from "next/image";
import {
  ChevronDown,
  ChevronUp,
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
import { useEffect, useState } from "react";
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
import LoadingSpinner from "@/components/loaders/loadingSpinner";
import { Textarea } from "@/components/ui/textarea";
import { TextGenerateEffect } from "@/components/features/text-generate-effect";
import Loader from "@/components/loaders/loader";
import { MovingBorderButton } from "@/components/features/moving-border";
import CopyButton from "@/components/extra/CopyButton";

type imageType = {
  url: string;
  prompt: string;
};
function ImagePage() {
  const router = useRouter();
  const [newImages, setNewImages] = useState<imageType[]>([]);
  const [prevImages, setPrevImages] = useState<imageType[]>([]);
  const [showPrevImages, setShowPrevImages] = useState(false);
  const [loadingImages, setLoadingImages] = useState(false);
  const [surpriseMeLoading, setSurpriseMeLoading] = useState(false);
  const [surpriseMeDisabled, setSurpriseMeDisabled] = useState(false);
  const [deviceWidth, setDeviceWidth] = useState(0);

  const [deletingImages, setDeletingImages] = useState<{
    [key: string]: boolean;
  }>({});

  const [downloadingImages, setDownloadingImages] = useState<{
    [key: string]: boolean;
  }>({});

  useEffect(() => {
    setDeviceWidth(window.innerWidth);

    const handelResize = () => {
      setDeviceWidth(window.innerWidth);
    };

    window.addEventListener("resize", handelResize);

    return window.removeEventListener("resize", handelResize);
  }, []);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      prompt: "",
    },
  });

  const [loadedPreviousImages, setLoadedPreviousImages] = useState(false);
  const userImages = async () => {
    try {
      if (!loadedPreviousImages) {
        setLoadingImages(true);
        const response = await axios.get("/api/image/get-user-images");

        if (response.data) {
          setPrevImages(
            response.data.map((img: imageType) => {
              return { url: img.url, prompt: img.prompt };
            })
          );
          setLoadedPreviousImages(true);
        }
      }
    } catch (error) {
      console.log("Error fetching user images:", error);
      toast.error("Failed to load images");
    } finally {
      setLoadingImages(false);
    }
  };

  const isLoading = form.formState.isSubmitting;
  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      setSurpriseMeDisabled(true);
      const response = await axios.post("/api/image", values);
      const output = await response.data;

      setNewImages((prev) => [{ url: output, prompt: values.prompt }, ...prev]);
      form.reset();
    } catch (error: any) {
      console.log(error);
      toast.error("Something went wrong. Please try again.");
    } finally {
      router.refresh();
      setSurpriseMeDisabled(false);
    }
  };

  const imageDownloadHandler = async (url: string, prompt: string) => {
    setDownloadingImages((prev) => ({ ...prev, [url]: true }));
    await downloadImage(url, prompt);
    setDownloadingImages((prev) => ({ ...prev, [url]: false }));
  };

  const deleteImageHandler = async (url: string) => {
    setDeletingImages((prev) => ({ ...prev, [url]: true }));
    await deleteImage({ url });
    const newImgs = newImages.filter((image) => image.url !== url);
    setNewImages(newImgs);
    setPrevImages(prevImages.filter((img) => img.url !== url));
    setDeletingImages((prev) => ({ ...prev, [url]: false }));
  };

  const surpriseMeHandler = async () => {
    try {
      setSurpriseMeLoading(true);
      const response = await axios.post("/api/chat/surprise-me", {
        prompt:
          "Give me a unique and amazing prompt for an image generation model. give me prompt directly without any extra text",
      });
      form.setValue("prompt", response.data);
    } catch (error) {
      console.log("ERROR :: Image page :: ", error);
      toast.error("Please try again.");
    } finally {
      setSurpriseMeLoading(false);
    }
  };

  return (
    <div className="select-none h-full">
      <div className=" px-4 lg:px-8 h-full w-full">
        <div className="w-full h-[20%] md:h-[30%] flex items-center justify-center">
          <TextGenerateEffect
            className="text-3xl md:text-6xl"
            words="Let's Imagify Your Thoughts ✨🎩"
          />
        </div>
        <div className="flex justify-center">
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className=" rounded-[16px] border p-4 w-full lg:w-[60%] focus-within:shadow-sm grid grid-cols-8 gap-2"
            >
              <FormField
                name="prompt"
                render={({ field }) => (
                  <FormItem className="col-span-12 lg:col-span-9">
                    <div className="flex flex-col gap-2">
                      <FormControl className="m-0 p-2">
                        <Textarea
                          className="border-0 outline-none focus-visible:ring-0 focus-visible:ring-transparent resize-none transition-all dark:text-gray-100 duration-200"
                          disabled={isLoading}
                          placeholder="Enter your prompt here..."
                          {...field}
                          rows={3}
                          onInput={(e) => {
                            const textarea = e.target as HTMLTextAreaElement; // Cast EventTarget to HTMLTextAreaElement
                            textarea.style.height = "auto"; // Reset height to calculate correctly
                            textarea.style.height = `${textarea.scrollHeight}px`; // Adjust height based on content
                          }}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              e.preventDefault();
                              form.handleSubmit(onSubmit)();
                            }
                          }}
                        />
                      </FormControl>
                      <Button
                        className="rounded-full  dark:hover:text-black bg-black dark:bg-white/10  text-white"
                        disabled={isLoading}
                      >
                        {isLoading ? <Loader className="w-7 h-7" /> : "Create"}
                      </Button>
                    </div>
                  </FormItem>
                )}
              />
            </form>
          </Form>
        </div>
        <div className="space-y-4 mt-4">
          <div className=" flex w-full flex-wrap gap-4 md:items-center md:justify-center">
            <div
              className={`${surpriseMeDisabled ? "pointer-events-none" : ""}`}
              aria-disabled={surpriseMeLoading}
            >
              <MovingBorderButton
                containerClassName={`${deviceWidth < 500 ? "h-12 w-32" : null}`}
                className="bg-white rounded-lg  dark:bg-slate-900 text-black dark:text-white border-neutral-200 dark:border-slate-800"
                borderRadius="2rem"
                onClick={() => {
                  surpriseMeHandler();
                }}
              >
                Surprise Me {}{" "}
                {surpriseMeLoading ? <LoadingSpinner className="ml-2" /> : "✨"}
              </MovingBorderButton>
            </div>

            <div
              className={`cursor-pointer flex bg-black/10 text-sm md:text-lg rounded-lg ${
                deviceWidth < 500 ? "p-2" : "p-4"
              } items-center justify-center gap-2 dark:bg-white/10`}
              onClick={() => {
                setShowPrevImages(!showPrevImages);
                userImages();
              }}
            >
              My Previous Images{" "}
              {loadingImages ? (
                <LoadingSpinner />
              ) : showPrevImages ? (
                <ChevronUp />
              ) : (
                <ChevronDown />
              )}
            </div>
          </div>

          <div
            className={` grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 ${
              showPrevImages ? "grid" : "hidden"
            } `}
          >
            {prevImages &&
              prevImages.map((image) => (
                <Card key={image.url} className="rounded-lg overflow-hidden">
                  <div className="relative aspect-square">
                    <div className="absolute text-white top-2 right-2 z-10 cursor-pointer ">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <div className="p-1 rounded-full bg-black/20    backdrop-blur-sm hover:bg-black/30  transition">
                            {downloadingImages[image.url] ||
                            deletingImages[image.url] ? (
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
                            onClick={() => deleteImageHandler(image.url)}
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
                    <h1 className="font-bold w-full text-center">
                      {image.prompt}
                      <div className="mt-1">
                        <CopyButton className="ml-auto" text={image.prompt} />
                      </div>
                    </h1>
                  </CardFooter>
                </Card>
              ))}
          </div>
          <div
            className={` grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 ${
              newImages ? "grid" : "hidden"
            } `}
          >
            {newImages &&
              newImages.map((image) => (
                <Card key={image.url} className="rounded-lg overflow-hidden">
                  <div className="relative aspect-square">
                    <div className="absolute text-white top-2 right-2 z-10 cursor-pointer ">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <div className="p-1 rounded-full bg-black/20    backdrop-blur-sm hover:bg-black/30  transition">
                            {downloadingImages[image.url] ||
                            deletingImages[image.url] ? (
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
                            onClick={() => deleteImageHandler(image.url)}
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
                  <CardFooter className="justify-center p-4 bg-black/10 dark:bg-white/10 ">
                    <h1 className="font-bold w-full text-center ">
                      {image.prompt}
                      <div className="mt-1">
                        <CopyButton className="ml-auto" text={image.prompt} />
                      </div>
                    </h1>
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
