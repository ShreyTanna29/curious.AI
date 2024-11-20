import { toast } from "react-hot-toast";

export const shareImage = async (imageUrl: string, prompt: string) => {
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
