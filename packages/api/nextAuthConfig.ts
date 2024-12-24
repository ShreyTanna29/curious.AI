import GoogleProvider from "next-auth/providers/google";
import prismadb from "./prismadb";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcrypt";
import { SessionStrategy } from "next-auth";

export const NEXT_AUTH_CONFIG = {
  providers: [
    CredentialsProvider({
      name: "Email",
      credentials: {
        email: {
          label: "Email",
          placeholder: "Enter your email",
          type: "email",
        },
        password: {
          label: "Password",
          placeholder: "Enter your password",
          type: "password",
        },
      },
      async authorize(credentials: any) {
        if (!credentials.email || !credentials.password) {
          throw new Error("Please enter email and password");
        }
        const user = await prismadb.user.findUnique({
          where: {
            email: credentials.email,
          },
        });
        if (!user) {
          throw new Error("No user found with this email");
        }

        const isValid = await bcrypt.compare(
          credentials.password,
          user.password || ""
        );

        if (!isValid) {
          throw new Error("Incorrect password");
        }

        return {
          id: user.id,
          email: user.email,
          image: user.profilePic,
          name: user.name,
        };
      },
    }),
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  session: {
    strategy: "jwt" as SessionStrategy,
    maxAge: 30 * 24 * 60 * 60, // 30 days
    updateAge: 24 * 60 * 60, // Update session every 24 hours
  },
  jwt: {
    maxAge: 30 * 24 * 60 * 60, // Keep JWTs valid for 30 days
  },
  callbacks: {
    signIn: async ({ user, account }: any) => {
      if (account?.provider === "google") {
        const existingUser = await prismadb.user.upsert({
          where: {
            email: user.email,
          },
          update: {
            name: user.name,
            profilePic: user.image,
          },
          create: {
            email: user.email,
            name: user.name,
            profilePic: user.image,
            provider: "google",
          },
        });
        user.id = existingUser.id;
      }
      return true;
    },
    session: async ({ session }: any) => {
      const dbUser = await prismadb.user.findUnique({
        where: {
          email: session.user.email,
        },
      });
      session.user.id = dbUser?.id;
      session.user.image = dbUser?.profilePic;
      return session;
    },
    async jwt({ token, account }: any) {
      // Initial sign-in
      if (account) {
        token.accessToken = account.access_token;
        token.refreshToken = account.refresh_token;
        token.accessTokenExpires = account.expires_at * 1000; // Convert to ms
      }

      // Return the previous token if the access token has not expired
      if (Date.now() < token.accessTokenExpires) {
        return token;
      }

      // Access token has expired, try to update it
      return refreshAccessToken(token);
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
  pages: {
    signIn: "/signin",
  },
};

async function refreshAccessToken(token: {
  accessToken: string;
  refreshToken: string;
  accessTokenExpires: number;
}): Promise<any> {
  try {
    const url =
      "https://oauth2.googleapis.com/token?" +
      new URLSearchParams({
        client_id: process.env.GOOGLE_CLIENT_ID || "",
        client_secret: process.env.GOOGLE_CLIENT_SECRET || "",
        grant_type: "refresh_token",
        refresh_token: token.refreshToken,
      });

    const response = await fetch(url, {
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      method: "POST",
    });

    const refreshedTokens = await response.json();

    if (!response.ok) {
      throw new Error(
        refreshedTokens.error || "Failed to refresh access token"
      );
    }

    return {
      ...token,
      accessToken: refreshedTokens.access_token,
      accessTokenExpires: Date.now() + refreshedTokens.expires_in * 1000, // Token expiration time in ms
      refreshToken: refreshedTokens.refresh_token ?? token.refreshToken, // Use the new refresh token if provided, else fallback to the old one
    };
  } catch (error) {
    console.error("Error refreshing access token", error);

    return {
      ...token,
      error: "RefreshAccessTokenError",
    };
  }
}
