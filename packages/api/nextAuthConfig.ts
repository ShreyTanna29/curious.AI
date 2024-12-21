import GoogleProvider from "next-auth/providers/google";
import prismadb from "./prismadb";

export const NEXT_AUTH_CONFIG = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
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
  },
  secret: process.env.NEXTAUTH_SECRET,
};
