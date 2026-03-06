import { PrismaClient } from "@prisma/client";
import { firebaseRealtimeAdapter } from "@/firebase/realtimeAdapter";

declare global {
  var prisma: PrismaClient | undefined;
}

const hasFirebaseRealtimeEnv = Boolean(
  process.env.FIREBASE_PROJECT_ID &&
    process.env.FIREBASE_CLIENT_EMAIL &&
    process.env.FIREBASE_PRIVATE_KEY &&
    process.env.FIREBASE_DATABASE_URL
);
const forceFirebaseRealtime = process.env.USE_FIREBASE_REALTIME_DB === "true";
const useFirebaseRealtime = forceFirebaseRealtime || hasFirebaseRealtimeEnv;

const prismadb = useFirebaseRealtime
  ? undefined
  : globalThis.prisma || new PrismaClient();

const dbClient = useFirebaseRealtime ? firebaseRealtimeAdapter : prismadb;

if (!useFirebaseRealtime && process.env.NODE_ENV !== "production" && prismadb) {
  globalThis.prisma = prismadb;
}

export default dbClient as any;
