import { stripEmbeddedImages, type ConversationMessage } from "@/lib/chat";

export const GUEST_SESSION_MAX_AGE_SECONDS = 30 * 60;
export const GUEST_SESSION_MAX_AGE_MS =
  GUEST_SESSION_MAX_AGE_SECONDS * 1000;
export const GUEST_MAX_CHAT_CONVERSATIONS = 5;
export const GUEST_MAX_CHAT_MESSAGES_PER_CONVERSATION = 24;
export const GUEST_MAX_CODE_ENTRIES = 8;

const GUEST_STORAGE_KEY = "curious-ai:guest-session";
const GUEST_STORAGE_VERSION = 1;
const DATA_IMAGE_MARKDOWN_REGEX =
  /!\[[^\]]*\]\(data:image\/[a-zA-Z+.-]+;base64,[^)]+\)/gi;
const RAW_DATA_IMAGE_REGEX =
  /data:image\/[a-zA-Z+.-]+;base64,[a-zA-Z0-9+/=]+/gi;

export type GuestCodeMessage = {
  text: string;
};

export type GuestCodeFile = {
  id: string;
  name: string;
  type: "folder" | "file";
  content?: string;
  language?: string;
  children?: GuestCodeFile[];
};

export type GuestChatConversation = {
  id: string;
  title: string;
  messages: ConversationMessage[];
  createdAt: string;
  updatedAt: string;
};

export type GuestCodeWorkspace = {
  fileTree: GuestCodeFile[];
  selectedFileId: string | null;
  userMessages: GuestCodeMessage[];
  modelMessages: GuestCodeMessage[];
  explanations: string[];
  prompt: string;
  showPromptSection: boolean;
  updatedAt: string;
};

export type GuestSessionStore = {
  version: number;
  guestId: string;
  expiresAt: string;
  chats: GuestChatConversation[];
  activeChatId: string | null;
  codeWorkspace: GuestCodeWorkspace | null;
};

export type GuestUpgradeCodeEntry = {
  prompt: string;
  response: string;
  createdAt: string;
};

export type GuestUpgradePayload = {
  guestId: string;
  guestExpiresAt: string;
  chats: GuestChatConversation[];
  codeEntries: GuestUpgradeCodeEntry[];
};

type GuestSessionInit = {
  guestId: string;
  expiresAt: string;
};

function canUseStorage() {
  return typeof window !== "undefined";
}

function parseStoredGuestState(raw: string | null): GuestSessionStore | null {
  if (!raw) {
    return null;
  }

  try {
    const parsed = JSON.parse(raw) as Partial<GuestSessionStore>;
    if (
      parsed?.version !== GUEST_STORAGE_VERSION ||
      typeof parsed.guestId !== "string" ||
      typeof parsed.expiresAt !== "string"
    ) {
      return null;
    }

    return normalizeGuestStore(parsed);
  } catch (error) {
    console.warn("Failed to parse guest session storage.", error);
    return null;
  }
}

function normalizeGuestStore(
  store: Partial<GuestSessionStore>
): GuestSessionStore {
  const chats = Array.isArray(store.chats)
    ? store.chats
        .map((chat) => normalizeGuestConversation(chat))
        .filter((chat): chat is GuestChatConversation => Boolean(chat))
        .sort(
          (left, right) =>
            new Date(right.updatedAt).getTime() -
            new Date(left.updatedAt).getTime()
        )
        .slice(0, GUEST_MAX_CHAT_CONVERSATIONS)
    : [];

  const codeWorkspace = store.codeWorkspace
    ? normalizeGuestCodeWorkspace(store.codeWorkspace)
    : null;

  return {
    version: GUEST_STORAGE_VERSION,
    guestId: store.guestId || "",
    expiresAt: store.expiresAt || new Date().toISOString(),
    chats,
    activeChatId:
      typeof store.activeChatId === "string" &&
      chats.some((chat) => chat.id === store.activeChatId)
        ? store.activeChatId
        : null,
    codeWorkspace,
  };
}

function normalizeGuestConversation(
  conversation: Partial<GuestChatConversation> | undefined
) {
  if (
    !conversation ||
    typeof conversation.id !== "string" ||
    typeof conversation.createdAt !== "string" ||
    typeof conversation.updatedAt !== "string"
  ) {
    return null;
  }

  const messages = Array.isArray(conversation.messages)
    ? conversation.messages
        .filter(
          (message): message is ConversationMessage =>
            (message?.role === "user" || message?.role === "assistant") &&
            typeof message.content === "string"
        )
        .slice(-GUEST_MAX_CHAT_MESSAGES_PER_CONVERSATION)
    : [];

  return {
    id: conversation.id,
    title:
      typeof conversation.title === "string" && conversation.title.trim()
        ? conversation.title.trim()
        : "Untitled guest chat",
    messages,
    createdAt: conversation.createdAt,
    updatedAt: conversation.updatedAt,
  };
}

function normalizeGuestCodeWorkspace(
  workspace: Partial<GuestCodeWorkspace>
): GuestCodeWorkspace | null {
  if (!workspace || typeof workspace.updatedAt !== "string") {
    return null;
  }

  return {
    fileTree: Array.isArray(workspace.fileTree)
      ? (workspace.fileTree as GuestCodeFile[])
      : [],
    selectedFileId:
      typeof workspace.selectedFileId === "string"
        ? workspace.selectedFileId
        : null,
    userMessages: Array.isArray(workspace.userMessages)
      ? workspace.userMessages
          .filter(
            (message): message is GuestCodeMessage =>
              Boolean(message) && typeof message.text === "string"
          )
          .slice(-GUEST_MAX_CODE_ENTRIES)
      : [],
    modelMessages: Array.isArray(workspace.modelMessages)
      ? workspace.modelMessages
          .filter(
            (message): message is GuestCodeMessage =>
              Boolean(message) && typeof message.text === "string"
          )
          .slice(-GUEST_MAX_CODE_ENTRIES)
      : [],
    explanations: Array.isArray(workspace.explanations)
      ? workspace.explanations.filter(
          (explanation): explanation is string => typeof explanation === "string"
        )
      : [],
    prompt: typeof workspace.prompt === "string" ? workspace.prompt : "",
    showPromptSection: Boolean(workspace.showPromptSection),
    updatedAt: workspace.updatedAt,
  };
}

function writeGuestStore(store: GuestSessionStore) {
  if (!canUseStorage()) {
    return;
  }

  window.localStorage.setItem(
    GUEST_STORAGE_KEY,
    JSON.stringify(normalizeGuestStore(store))
  );
}

export function readGuestStore() {
  if (!canUseStorage()) {
    return null;
  }

  return parseStoredGuestState(window.localStorage.getItem(GUEST_STORAGE_KEY));
}

export function clearGuestStore() {
  if (!canUseStorage()) {
    return;
  }

  window.localStorage.removeItem(GUEST_STORAGE_KEY);
}

export function buildGuestEmail(guestId: string) {
  return `guest+${guestId}@curious.ai`;
}

export function createGuestSessionWindow(now = new Date()) {
  const guestId = createGuestEntityId();
  const guestStartedAt = now.toISOString();
  const guestExpiresAt = new Date(
    now.getTime() + GUEST_SESSION_MAX_AGE_MS
  ).toISOString();

  return {
    guestId,
    guestStartedAt,
    guestExpiresAt,
    email: buildGuestEmail(guestId),
  };
}

export function createGuestEntityId() {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return `guest_${crypto.randomUUID()}`;
  }

  return `guest_${Date.now()}_${Math.random().toString(16).slice(2)}`;
}

export function isGuestExpired(
  expiresAt?: string | null,
  now = Date.now()
): boolean {
  if (!expiresAt) {
    return true;
  }

  const expiresAtMs = new Date(expiresAt).getTime();
  if (Number.isNaN(expiresAtMs)) {
    return true;
  }

  return now >= expiresAtMs;
}

export function getGuestRemainingMs(
  expiresAt?: string | null,
  now = Date.now()
) {
  if (!expiresAt) {
    return 0;
  }

  return Math.max(new Date(expiresAt).getTime() - now, 0);
}

export function formatGuestTimeRemaining(remainingMs: number) {
  if (remainingMs <= 0) {
    return "expired";
  }

  const totalSeconds = Math.ceil(remainingMs / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;

  if (minutes <= 0) {
    return `${seconds}s`;
  }

  return `${minutes}m ${seconds.toString().padStart(2, "0")}s`;
}

export function compactGuestMessageContent(content: string) {
  const compacted = content
    .replace(
      DATA_IMAGE_MARKDOWN_REGEX,
      "[Image omitted from guest backup. Create an account to save image history.]"
    )
    .replace(RAW_DATA_IMAGE_REGEX, "[Image omitted from guest backup]")
    .trim();

  if (!compacted) {
    return "[Image omitted from guest backup]";
  }

  return compacted.length > 10_000
    ? `${compacted.slice(
        0,
        10_000
      )}\n\n[Message truncated in guest mode due to storage limits.]`
    : compacted;
}

function compactGuestMessages(messages: ConversationMessage[]) {
  return messages
    .map((message) => ({
      role: message.role,
      content: compactGuestMessageContent(message.content),
    }))
    .slice(-GUEST_MAX_CHAT_MESSAGES_PER_CONVERSATION);
}

export function createGuestConversationTitle(prompt: string) {
  const text = stripEmbeddedImages(prompt).replace(/\s+/g, " ").trim();
  if (!text) {
    return "Image conversation";
  }

  return text.length > 48 ? `${text.slice(0, 48).trimEnd()}...` : text;
}

export function ensureGuestStore(init: GuestSessionInit) {
  const existing = readGuestStore();
  const nextStore =
    existing && existing.guestId === init.guestId
      ? {
          ...existing,
          expiresAt: init.expiresAt,
        }
      : {
          version: GUEST_STORAGE_VERSION,
          guestId: init.guestId,
          expiresAt: init.expiresAt,
          chats: [],
          activeChatId: null,
          codeWorkspace: null,
        };

  writeGuestStore(nextStore);
  return nextStore;
}

export function saveGuestConversation(
  init: GuestSessionInit,
  conversation: Omit<GuestChatConversation, "messages"> & {
    messages: ConversationMessage[];
  }
) {
  const store = ensureGuestStore(init);
  const normalizedConversation = normalizeGuestConversation({
    ...conversation,
    messages: compactGuestMessages(conversation.messages),
  });

  if (!normalizedConversation) {
    return store;
  }

  const chats = [
    normalizedConversation,
    ...store.chats.filter((chat) => chat.id !== normalizedConversation.id),
  ].slice(0, GUEST_MAX_CHAT_CONVERSATIONS);

  const nextStore: GuestSessionStore = {
    ...store,
    chats,
    activeChatId: normalizedConversation.id,
  };

  writeGuestStore(nextStore);
  return nextStore;
}

export function setActiveGuestConversation(
  init: GuestSessionInit,
  conversationId: string | null
) {
  const store = ensureGuestStore(init);
  const nextStore: GuestSessionStore = {
    ...store,
    activeChatId:
      conversationId && store.chats.some((chat) => chat.id === conversationId)
        ? conversationId
        : null,
  };

  writeGuestStore(nextStore);
  return nextStore;
}

export function deleteGuestConversation(
  init: GuestSessionInit,
  conversationId: string
) {
  const store = ensureGuestStore(init);
  const chats = store.chats.filter((chat) => chat.id !== conversationId);
  const nextStore: GuestSessionStore = {
    ...store,
    chats,
    activeChatId:
      store.activeChatId === conversationId
        ? chats[0]?.id || null
        : store.activeChatId,
  };

  writeGuestStore(nextStore);
  return nextStore;
}

export function saveGuestCodeWorkspace(
  init: GuestSessionInit,
  workspace: GuestCodeWorkspace
) {
  const store = ensureGuestStore(init);
  const nextStore: GuestSessionStore = {
    ...store,
    codeWorkspace: normalizeGuestCodeWorkspace(workspace),
  };

  writeGuestStore(nextStore);
  return nextStore;
}

export function getActiveGuestConversation(store: GuestSessionStore | null) {
  if (!store?.activeChatId) {
    return null;
  }

  return store.chats.find((chat) => chat.id === store.activeChatId) || null;
}

function buildGuestCodeEntries(
  userMessages: GuestCodeMessage[],
  modelMessages: GuestCodeMessage[]
) {
  const entries: GuestUpgradeCodeEntry[] = [];
  const totalEntries = Math.min(
    userMessages.length,
    modelMessages.length,
    GUEST_MAX_CODE_ENTRIES
  );

  for (let index = 0; index < totalEntries; index += 1) {
    const prompt = userMessages[index]?.text?.trim();
    const response = modelMessages[index]?.text?.trim();

    if (!prompt || !response) {
      continue;
    }

    entries.push({
      prompt,
      response,
      createdAt: new Date().toISOString(),
    });
  }

  return entries;
}

export function buildGuestUpgradePayload(): GuestUpgradePayload | null {
  const store = readGuestStore();
  if (!store) {
    return null;
  }

  const codeEntries = store.codeWorkspace
    ? buildGuestCodeEntries(
        store.codeWorkspace.userMessages,
        store.codeWorkspace.modelMessages
      )
    : [];

  if (store.chats.length === 0 && codeEntries.length === 0) {
    return null;
  }

  return {
    guestId: store.guestId,
    guestExpiresAt: store.expiresAt,
    chats: store.chats,
    codeEntries,
  };
}
