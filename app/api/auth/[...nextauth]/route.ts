import { NEXT_AUTH_CONFIG } from "@/packages/api/nextAuthConfig";
import NextAuth from "next-auth";

const handler = NextAuth(NEXT_AUTH_CONFIG);

export const GET = handler;
export const POST = handler;
