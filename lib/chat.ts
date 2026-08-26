export type ConversationRole = "user" | "assistant";

export type ConversationMessage = {
  role: ConversationRole;
  content: string;
};

export type EmbeddedImage = {
  alt: string;
  url: string;
};

export const MAX_CHAT_ATTACHMENTS = 5;
export const MAX_CHAT_ATTACHMENT_BYTES = 3 * 1024 * 1024;

const getEmbeddedImageRegex = () =>
  /!\[([^\]]*)\]\(((?:data:image\/[a-zA-Z+.-]+;base64,[^)]+)|(?:https?:\/\/[^)\s]+)|(?:\/[^)\s]+))\)/gi;

export function safeChatImageUrl(url: string): string {
  if (
    url.startsWith("data:image/") ||
    url.startsWith("http://") ||
    url.startsWith("https://") ||
    url.startsWith("/")
  ) {
    return url;
  }

  return "";
}

export const safeUrlTransform = (url: string) => safeChatImageUrl(url);

export function extractEmbeddedImages(content: string): EmbeddedImage[] {
  const matches = Array.from(content.matchAll(getEmbeddedImageRegex()));

  return matches
    .map((match) => ({
      alt: match[1]?.trim() || "Uploaded image",
      url: safeChatImageUrl(match[2] || ""),
    }))
    .filter((image): image is EmbeddedImage => Boolean(image.url));
}

export function stripEmbeddedImages(content: string): string {
  return content
    .replace(getEmbeddedImageRegex(), "")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

export function hasEmbeddedImage(content: string): boolean {
  return extractEmbeddedImages(content).length > 0;
}

export function isImageOnlyMessage(content: string): boolean {
  return hasEmbeddedImage(content) && !stripEmbeddedImages(content);
}

export function buildPromptWithAttachment(
  prompt: string,
  attachmentUrl?: string | null
): string {
  const trimmedPrompt = prompt.trim();

  if (!attachmentUrl) {
    return trimmedPrompt;
  }

  const safeAttachmentUrl = safeChatImageUrl(attachmentUrl);
  if (!safeAttachmentUrl) {
    return trimmedPrompt;
  }

  const imageMarkdown = `![Uploaded image](${safeAttachmentUrl})`;
  return trimmedPrompt ? `${trimmedPrompt}\n\n${imageMarkdown}` : imageMarkdown;
}

export function sanitizeAssistantContentForModel(content: string): string {
  const normalized = content
    .replace(getEmbeddedImageRegex(), "[image]")
    .replace(/\n{3,}/g, "\n\n")
    .trim();

  return normalized || "[image]";
}
