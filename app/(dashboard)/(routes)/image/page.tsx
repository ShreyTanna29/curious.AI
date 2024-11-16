"use client";
import axios from "axios";
import Heading from "@/components/heading";
import Image from "next/image";
import {
  Download,
  EllipsisVertical,
  Image as ImageIcon,
  Share2,
} from "lucide-react";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { formSchema } from "./constants";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Empty from "@/components/empty";
import Loader from "@/components/loader";
import { Card, CardFooter } from "@/components/ui/card";
import { useProModel } from "@/hooks/useProModel";
import toast from "react-hot-toast";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

type imageType = {
  url: string;
  prompt: string;
};

const downloadImage = async (imageUrl: string, prompt: string) => {
  try {
    const response = await fetch(imageUrl);
    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${prompt.slice(0, 30)}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  } catch (error: unknown) {
    console.log(error);

    toast.error("Failed to download image");
  }
};

const shareImage = async (imageUrl: string, prompt: string) => {
  try {
    if (navigator.share) {
      await navigator.share({
        title: "Check out this AI generated image!",
        text: prompt,
        url: imageUrl,
      });
    } else {
      await navigator.clipboard.writeText(imageUrl);
      toast.success("Image URL copied to clipboard!");
    }
  } catch (error: unknown) {
    console.log(error);

    toast.error("Failed to share image");
  }
};

function ImagePage() {
  const router = useRouter();
  const proModel = useProModel();
  const [images, setImages] = useState<imageType[]>([]);
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      prompt: "",
    },
  });

  const userImages = async () => {
    try {
      const response = await axios.get("/api/image/get-user-images");

      if (response.data) {
        setImages(
          response.data.map((img: imageType) => {
            return { url: img.url, prompt: img.prompt };
          })
        );
      }
    } catch (error) {
      console.log("Error fetching user images:", error);
      toast.error("Failed to load images");
    }
  };

  useEffect(() => {
    userImages();
  }, []);

  const isLoading = form.formState.isSubmitting;
  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      const response = await axios.post("/api/image", values);
      const output = await response.data;

      setImages((prev) => [{ url: output, prompt: values.prompt }, ...prev]);
      form.reset();
    } catch (error: any) {
      console.log(error);
      if (error?.response?.status === 403) {
        proModel.onOpen();
      } else {
        toast.error("Please write anohter prompt.");
      }
    } finally {
      router.refresh();
    }
  };

  return (
    <div>
      <Heading
        title="Image Generation"
        description="Turn your thoughts into images."
        icon={ImageIcon}
        iconColor="text-pink-500"
        bgColor="bg-pink-500/10"
      />
      <div className="px-4 lg:px-8">
        <div>
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
                        placeholder="e.g. A cute cat with hat"
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
                Generate
              </Button>
            </form>
          </Form>
        </div>
        <div className="space-y-4 mt-4">
          {isLoading && (
            <div className="p-8 rounded-lg w-full flex items-center justify-center bg-muted">
              <Loader />
            </div>
          )}
          {!images[0] && !isLoading && (
            <Empty label="No images generated."></Empty>
          )}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mt-8 ">
            {images &&
              images.map((image) => (
                <Card key={image.url} className="rounded-lg overflow-hidden">
                  <div className="relative aspect-square">
                    <div className="absolute text-white top-2 right-2 z-10 ">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <div className="p-1 rounded-full bg-black/20 backdrop-blur-sm hover:bg-black/30 transition">
                            <EllipsisVertical className="w-5 h-5 text-white drop-shadow-[0_1.2px_1.2px_rgba(0,0,0,0.8)]" />
                          </div>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent>
                          <DropdownMenuItem
                            className="flex gap-2 cursor-pointer"
                            onClick={() =>
                              downloadImage(image.url, image.prompt)
                            }
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
                    <h1 className="font-bold  ">{image.prompt}</h1>
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
