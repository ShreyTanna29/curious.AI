import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import prismadb from "@/packages/api/prismadb";
import bcrypt from "bcrypt";

const handler = NextAuth({
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
          return null;
        }

        const user = await prismadb.user.findUnique({
          where: {
            email: credentials.email,
          },
        });

        if (!user) {
          return null;
        }

        bcrypt.compare(credentials.password, user.password, (result) => {
          if (result) {
            return {
              name: user.name,
              email: user.email,
              id: user.id,
            };
          } else {
            return null;
          }
        });

        return null;
      },
    }),
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  secret: process.env.NEXTAUTH_SECRET,
});

export const GET = handler;
export const POST = handler;
