import type { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: DefaultSession["user"] & {
      id?: string;
      isGuest?: boolean;
      guestId?: string;
    };
    guestExpiresAt?: string | null;
    guestStartedAt?: string | null;
    error?: string;
  }

  interface User {
    id?: string;
    isGuest?: boolean;
    guestId?: string;
    guestExpiresAt?: string;
    guestStartedAt?: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    userId?: string;
    provider?: string;
    accessToken?: string;
    refreshToken?: string;
    accessTokenExpires?: number;
    error?: string;
    isGuest?: boolean;
    guestId?: string;
    guestExpiresAt?: string;
    guestStartedAt?: string;
  }
}
