import { type DataSnapshot } from "firebase-admin/database";
import { getFirebaseRealtimeDb } from "./admin";

type SortDirection = "asc" | "desc";

type UserRecord = {
  id: string;
  name: string;
  email: string;
  password?: string | null;
  provider: string;
  profilePic?: string | null;
  createdAt: Date;
};

type ImageRecord = {
  id: string;
  userId: string;
  url: string;
  prompt: string;
  createdAt: Date;
};

type CodeRecord = {
  id: string;
  userId: string;
  prompt: string;
  response: string;
  createdAt: Date;
};

type ChatRecord = {
  id: string;
  groupId: string;
  prompt: string;
  response: string;
  createdAt: Date;
};

type GroupChatRecord = {
  id: string;
  title: string;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
  chats?: ChatRecord[];
};

function snapshotToArray<T>(snapshot: DataSnapshot): Array<T & { id: string }> {
  const value = snapshot.val() || {};
  return Object.entries(value).map(([id, entry]) => ({
    id,
    ...(entry as T),
  }));
}

function toDate(value: unknown): Date {
  if (value instanceof Date) return value;
  if (typeof value === "number") return new Date(value);
  if (typeof value === "string") return new Date(value);
  return new Date();
}

function normalizeUser(record: any): UserRecord {
  return {
    ...record,
    createdAt: toDate(record.createdAt),
  };
}

function normalizeImage(record: any): ImageRecord {
  return {
    ...record,
    createdAt: toDate(record.createdAt),
  };
}

function normalizeCode(record: any): CodeRecord {
  return {
    ...record,
    createdAt: toDate(record.createdAt),
  };
}

function normalizeChat(record: any): ChatRecord {
  return {
    ...record,
    createdAt: toDate(record.createdAt),
  };
}

function normalizeGroupChat(record: any): GroupChatRecord {
  return {
    ...record,
    createdAt: toDate(record.createdAt),
    updatedAt: toDate(record.updatedAt),
    chats: (record.chats || []).map(normalizeChat),
  };
}

function sortByField<T extends Record<string, any>>(
  items: T[],
  field: string,
  direction: SortDirection
): T[] {
  return [...items].sort((a, b) => {
    const aValue = a[field];
    const bValue = b[field];
    const aTs = aValue instanceof Date ? aValue.getTime() : Number(aValue || 0);
    const bTs = bValue instanceof Date ? bValue.getTime() : Number(bValue || 0);
    if (direction === "asc") return aTs - bTs;
    return bTs - aTs;
  });
}

async function loadChatsByGroupId(groupId: string): Promise<ChatRecord[]> {
  const db = getFirebaseRealtimeDb();
  const snapshot = await db.ref(`groupChats/${groupId}/chats`).get();
  const chats = snapshotToArray<Omit<ChatRecord, "id">>(snapshot).map((chat) =>
    normalizeChat({ ...chat, groupId })
  );
  return sortByField(chats, "createdAt", "asc");
}

export const firebaseRealtimeAdapter = {
  user: {
    async findUnique({ where }: { where: { email?: string; id?: string } }) {
      const db = getFirebaseRealtimeDb();
      if (where.id) {
        const snapshot = await db.ref(`users/${where.id}`).get();
        if (!snapshot.exists()) return null;
        return normalizeUser({ id: where.id, ...(snapshot.val() || {}) });
      }

      if (where.email) {
        try {
          const snapshot = await db
            .ref("users")
            .orderByChild("email")
            .equalTo(where.email)
            .limitToFirst(1)
            .get();
          const users = snapshotToArray<Omit<UserRecord, "id">>(snapshot);
          if (users.length === 0) return null;
          return normalizeUser(users[0]);
        } catch (error) {
          const message = String(error);
          if (!message.includes("Index not defined")) {
            throw error;
          }

          const snapshot = await db.ref("users").get();
          const users = snapshotToArray<Omit<UserRecord, "id">>(snapshot);
          const user = users.find((entry) => entry.email === where.email);
          return user ? normalizeUser(user) : null;
        }
      }

      return null;
    },
    async create({ data }: { data: Omit<UserRecord, "id" | "createdAt"> }) {
      const db = getFirebaseRealtimeDb();
      const ref = db.ref("users").push();
      const id = ref.key as string;
      const createdAt = Date.now();
      await ref.set({ ...data, createdAt });
      return normalizeUser({ id, ...data, createdAt });
    },
    async upsert({
      where,
      update,
      create,
    }: {
      where: { email: string };
      update: Partial<UserRecord>;
      create: Omit<UserRecord, "id" | "createdAt">;
    }) {
      const existingUser = await this.findUnique({ where });
      const db = getFirebaseRealtimeDb();

      if (existingUser) {
        await db.ref(`users/${existingUser.id}`).update(update);
        return { ...existingUser, ...update };
      }

      return this.create({ data: create });
    },
  },
  image: {
    async create({
      data,
    }: {
      data: Omit<ImageRecord, "id" | "createdAt">;
    }): Promise<ImageRecord> {
      const db = getFirebaseRealtimeDb();
      const ref = db.ref("images").push();
      const id = ref.key as string;
      const createdAt = Date.now();
      await ref.set({ ...data, createdAt });
      return normalizeImage({ id, ...data, createdAt });
    },
    async findMany({
      where,
      orderBy,
      take,
      skip,
    }: {
      where?: { userId?: string };
      orderBy?: { createdAt?: SortDirection };
      take?: number;
      skip?: number;
    }) {
      const db = getFirebaseRealtimeDb();
      const snapshot = await db.ref("images").get();
      let images = snapshotToArray<Omit<ImageRecord, "id">>(snapshot).map(
        normalizeImage
      );

      if (where?.userId) {
        images = images.filter((image) => image.userId === where.userId);
      }

      if (orderBy?.createdAt) {
        images = sortByField(images, "createdAt", orderBy.createdAt);
      }

      if (typeof skip === "number" && skip > 0) {
        images = images.slice(skip);
      }

      if (typeof take === "number") {
        images = images.slice(0, take);
      }

      return images;
    },
    async delete({ where }: { where: { url: string; userId?: string } }) {
      const db = getFirebaseRealtimeDb();
      let images: Array<Omit<ImageRecord, "id"> & { id: string }> = [];

      try {
        const snapshot = await db
          .ref("images")
          .orderByChild("url")
          .equalTo(where.url)
          .get();
        images = snapshotToArray<Omit<ImageRecord, "id">>(snapshot);
      } catch (error) {
        const message = String(error);
        if (!message.includes("Index not defined")) {
          throw error;
        }

        const snapshot = await db.ref("images").get();
        images = snapshotToArray<Omit<ImageRecord, "id">>(snapshot).filter(
          (image) => image.url === where.url
        );
      }

      const target = images.find((image) =>
        where.userId ? image.userId === where.userId : true
      );
      if (!target) return null;
      await db.ref(`images/${target.id}`).remove();
      return { id: target.id };
    },
  },
  code: {
    async create({
      data,
    }: {
      data: Omit<CodeRecord, "id" | "createdAt">;
    }): Promise<CodeRecord> {
      const db = getFirebaseRealtimeDb();
      const ref = db.ref("codes").push();
      const id = ref.key as string;
      const createdAt = Date.now();
      await ref.set({ ...data, createdAt });
      return normalizeCode({ id, ...data, createdAt });
    },
    async findMany({
      where,
    }: {
      where?: { userId?: string };
      orderBy?: { createdAt?: SortDirection };
    }) {
      const db = getFirebaseRealtimeDb();
      const snapshot = await db.ref("codes").get();
      let codes = snapshotToArray<Omit<CodeRecord, "id">>(snapshot).map(
        normalizeCode
      );

      if (where?.userId) {
        codes = codes.filter((code) => code.userId === where.userId);
      }

      codes = sortByField(codes, "createdAt", "desc");
      return codes;
    },
  },
  groupChat: {
    async findFirst({
      where,
      include,
    }: {
      where: { id: string };
      include?: { chats?: boolean };
    }) {
      const entry = await this.findUnique({ where, include });
      return entry;
    },
    async findUnique({
      where,
      include,
    }: {
      where: { id: string };
      include?: { chats?: boolean };
    }) {
      const db = getFirebaseRealtimeDb();
      const snapshot = await db.ref(`groupChats/${where.id}`).get();
      if (!snapshot.exists()) return null;

      const value = snapshot.val() || {};
      const base = normalizeGroupChat({ id: where.id, ...value, chats: [] });
      if (!include?.chats) return { ...base, chats: undefined };

      const chats = await loadChatsByGroupId(where.id);
      return normalizeGroupChat({ ...base, chats });
    },
    async findMany({
      where,
      orderBy,
    }: {
      where?: { userId?: string };
      orderBy?: { updatedAt?: SortDirection };
    }) {
      const db = getFirebaseRealtimeDb();
      const snapshot = await db.ref("groupChats").get();
      let groups = snapshotToArray<Omit<GroupChatRecord, "id">>(snapshot).map(
        (group) => normalizeGroupChat({ ...group, chats: [] })
      );

      if (where?.userId) {
        groups = groups.filter((group) => group.userId === where.userId);
      }

      const direction = orderBy?.updatedAt || "desc";
      groups = sortByField(groups, "updatedAt", direction).map((group) => ({
        ...group,
        chats: undefined,
      }));

      return groups;
    },
    async update({
      where,
      data,
    }: {
      where: { id: string };
      data: {
        title?: string;
        chats?: { create?: { prompt: string; response: string } };
      };
    }) {
      const db = getFirebaseRealtimeDb();
      const updateTime = Date.now();
      const groupUpdatePayload: Record<string, unknown> = {
        updatedAt: updateTime,
      };

      if (typeof data.title === "string") {
        groupUpdatePayload.title = data.title;
      }

      if (data.chats?.create) {
        const chatRef = db.ref(`groupChats/${where.id}/chats`).push();
        const chatId = chatRef.key as string;
        await chatRef.set({
          id: chatId,
          groupId: where.id,
          prompt: data.chats.create.prompt,
          response: data.chats.create.response,
          createdAt: updateTime,
        });
      }

      await db.ref(`groupChats/${where.id}`).update(groupUpdatePayload);

      return this.findUnique({ where, include: { chats: true } });
    },
    async create({
      data,
    }: {
      data: {
        title: string;
        userId: string;
        chats?: { create?: { prompt: string; response: string } };
      };
    }) {
      const db = getFirebaseRealtimeDb();
      const groupRef = db.ref("groupChats").push();
      const id = groupRef.key as string;
      const now = Date.now();
      await groupRef.set({
        title: data.title,
        userId: data.userId,
        createdAt: now,
        updatedAt: now,
      });

      if (data.chats?.create) {
        const chatRef = db.ref(`groupChats/${id}/chats`).push();
        const chatId = chatRef.key as string;
        await chatRef.set({
          id: chatId,
          groupId: id,
          prompt: data.chats.create.prompt,
          response: data.chats.create.response,
          createdAt: now,
        });
      }

      const created = await this.findUnique({
        where: { id },
        include: { chats: true },
      });

      return created as GroupChatRecord;
    },
  },
};
