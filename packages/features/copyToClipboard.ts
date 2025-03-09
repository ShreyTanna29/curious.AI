import toast from "react-hot-toast";

export default function copyToClipboard(text: string) {
  navigator.clipboard.writeText(text);
  toast.success("Prompt copied.");
}
