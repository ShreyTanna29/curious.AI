import { copyToClipboard } from "@/packages/features"
import { Copy } from "lucide-react"

export default function CopyButton({ text, className }: { text: string, className?: string }) {
    return (
        <Copy onClick={() => { copyToClipboard(text) }} className={`ml-2 text-black/50 dark:text-white/50 cursor-pointer hover:text-black dark:hover:text-white  ${className} `} />
    )
}
