import Heading from "@/components/heading";
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
import { useState } from "react";



export default function MarketplacePage() {

interface ImageInterface{
  url: string,
  prompt: string,
  userName: string,
}

  const [images, setImages] = useState<ImageInterface[]>([])
  const [downloadingImages, setDownloadingImages] = useState<{
    [key: string]: boolean;
  }>({});

  const getImages = async () => {
  const response = await axios.get("/api/image/get-all-images")


  };

  const imageDownloadHandler = async (url: string, prompt: string) => {
    setDownloadingImages((prev) => ({ ...prev, [url]: true }));
    await downloadImage(url, prompt);
    setDownloadingImages((prev) => ({ ...prev, [url]: false }));
  };

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
            <Image width={524} height={524} alt="image" src={image.url} />
          </div>
          <CardFooter className="justify-center p-4 bg-black/10 dark:bg-white/10  ">
            <h1 className="font-bold ">{image.prompt}</h1>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
