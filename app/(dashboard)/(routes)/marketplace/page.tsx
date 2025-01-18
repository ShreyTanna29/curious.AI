"use client";
import Heading from "@/components/extra/heading";
import { Card, CardFooter } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { downloadImage, shareImage } from "@/packages/features";
import axios from "axios";
import { Download, EllipsisVertical, Share2, ShoppingBag } from "lucide-react";
import Image from "next/image";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import InfiniteScroll from "react-infinite-scroll-component";
import Loader from "@/components/loaders/loader";
import CopyButton from "@/components/extra/CopyButton";

export default function MarketplacePage() {
  interface ImageInterface {
    url: string;
    prompt: string;
  }

  const [images, setImages] = useState<ImageInterface[]>([]);
  const [page, setPage] = useState(0);
  const [downloadingImages, setDownloadingImages] = useState<{
    [key: string]: boolean;
  }>({});
  const [hasMore, setHasMore] = useState(true);

  const getImages = async () => {
    try {
      const response = await axios.get(
        `/api/image/get-all-images?page=${page}`
      );

      setImages((prev) => [...prev, ...response.data]);
      setPage((prev) => prev + 1);
      setHasMore(response.data.length === 12);
    } catch (error: unknown) {
      console.log("ERROR :: Marketplace :: getImages :: ", error);
      toast.error("Can't get images at this moment");
    }
  };

  const imageDownloadHandler = async (url: string, prompt: string) => {
    setDownloadingImages((prev) => ({ ...prev, [url]: true }));
    await downloadImage(url, prompt);
    setDownloadingImages((prev) => ({ ...prev, [url]: false }));
  };

  useEffect(() => {
    // as useEffect doesn't let us make it an async function so we need to declare an asnyc function inside useEffect.
    async function callGetImages() {
      await getImages();
    }

    callGetImages();

    // in dev mode be sure to turn off react strict mode if you want to see results as same as production, as react strict mode renders useEffect hook twice in dev mode, in production it is rendered only once.
  }, []);

  return (
    <div>
      <Heading
        title="Marketplace"
        description="Get amazed by the creativity of our users."
        icon={ShoppingBag}
        iconColor="text-orange-700"
        bgColor="bg-orange-700/10"
      />

      <div>
        <InfiniteScroll
          dataLength={images.length}
          next={getImages}
          hasMore={hasMore}
          loader={
            <div className="flex w-full items-center justify-center p-4 my-6">
              <Loader />
            </div>
          }
        >
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mt-8 ">
            {images &&
              images.map((image) => (
                <Card key={image.url} className="rounded-lg overflow-hidden">
                  <div className="relative aspect-square">
                    <div className="absolute text-white top-2 right-2 z-10 cursor-pointer ">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <div className="p-1 rounded-full bg-black/20    backdrop-blur-sm hover:bg-black/30  transition">
                            {downloadingImages[image.url] ? (
                              <div className="border-white h-5 w-5 animate-spin rounded-full border-4 border-t-white/10" />
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
                  <CardFooter className="justify-center p-4 bg-orange-500/10  dark:bg-white/10 ">
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
        </InfiniteScroll>
      </div>

      {!hasMore && (
        <div className=" flex items-center justify-center p-6 mt-12 rounded-lg  text-center md:text-xl bg-orange-900/10 text-orange-900  dark:bg-orange-500/10 dark:text-white">
          <div>&#34;Believe it or not, everything has an end.&#34;</div>
          <div className="ml-6">- unknown</div>
        </div>
      )}
    </div>
  );
}
