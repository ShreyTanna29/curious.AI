import axios from "axios";
import toast from "react-hot-toast";

export const downloadImage = async (imageUrl: string, prompt: string) => {
  try {
    const response = await axios.post(
      "/api/image/download",
      { imageUrl },
      {
        responseType: "blob",
      }
    );
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement("a");
    link.href = url;
    link.download = `${prompt.slice(0, 30)}.png`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);

    toast.success("Image downloaded successfully!");
  } catch (error: unknown) {
    console.log(error);

    toast.error("Failed to download image");
  }
};
