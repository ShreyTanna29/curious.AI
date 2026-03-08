import { cert, getApps, initializeApp, type App } from "firebase-admin/app";
import { getDatabase, type Database } from "firebase-admin/database";
import { existsSync, readFileSync } from "node:fs";

declare global {
  // eslint-disable-next-line no-var
  var __firebaseAdminApp: App | undefined;
}

function getFirebaseCredentials() {
  const databaseURL = process.env.FIREBASE_DATABASE_URL;
  const projectId = process.env.FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n");

  if (!databaseURL) {
    throw new Error("Missing FIREBASE_DATABASE_URL env var.");
  }

  if (projectId && clientEmail && privateKey) {
    return { projectId, clientEmail, privateKey, databaseURL };
  }

  const rawJson = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;
  if (rawJson) {
    const parsed = JSON.parse(rawJson);
    return {
      projectId: String(parsed.project_id || ""),
      clientEmail: String(parsed.client_email || ""),
      privateKey: String(parsed.private_key || "").replace(/\\n/g, "\n"),
      databaseURL,
    };
  }

  const serviceAccountPath =
    process.env.FIREBASE_SERVICE_ACCOUNT_PATH ||
    process.env.GOOGLE_APPLICATION_CREDENTIALS;

  if (serviceAccountPath && existsSync(serviceAccountPath)) {
    const rawFile = readFileSync(serviceAccountPath, "utf8");
    const parsed = JSON.parse(rawFile);
    return {
      projectId: String(parsed.project_id || ""),
      clientEmail: String(parsed.client_email || ""),
      privateKey: String(parsed.private_key || "").replace(/\\n/g, "\n"),
      databaseURL,
    };
  }

  if (!serviceAccountPath || !existsSync(serviceAccountPath)) {
    throw new Error(
      "Missing Firebase credentials. Set FIREBASE_PROJECT_ID/FIREBASE_CLIENT_EMAIL/FIREBASE_PRIVATE_KEY, or FIREBASE_SERVICE_ACCOUNT_JSON, or FIREBASE_SERVICE_ACCOUNT_PATH (or GOOGLE_APPLICATION_CREDENTIALS), plus FIREBASE_DATABASE_URL."
    );
  }

  throw new Error("Invalid Firebase credentials configuration.");
}

function assertCredentialFields(credentials: {
  projectId: string;
  clientEmail: string;
  privateKey: string;
  databaseURL: string;
}) {
  if (!credentials.projectId || !credentials.clientEmail || !credentials.privateKey) {
    throw new Error(
      "Firebase service account credentials are incomplete. Ensure project_id, client_email, and private_key are present."
    );
  }

  return credentials;
}

export function getFirebaseAdminApp(): App {
  if (globalThis.__firebaseAdminApp) {
    return globalThis.__firebaseAdminApp;
  }

  if (getApps().length > 0) {
    globalThis.__firebaseAdminApp = getApps()[0]!;
    return globalThis.__firebaseAdminApp;
  }

  const credentials = assertCredentialFields(getFirebaseCredentials());
  const app = initializeApp({
    credential: cert({
      projectId: credentials.projectId,
      clientEmail: credentials.clientEmail,
      privateKey: credentials.privateKey,
    }),
    databaseURL: credentials.databaseURL,
  });

  globalThis.__firebaseAdminApp = app;
  return app;
}

export function getFirebaseRealtimeDb(): Database {
  return getDatabase(getFirebaseAdminApp());
}
