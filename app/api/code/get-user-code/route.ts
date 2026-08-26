import prismadb from "@/packages/api/prismadb";
import { NextResponse } from "next/server";
import { requireSessionAccess } from "@/lib/server/app-session";

export async function GET() {
  const access = await requireSessionAccess({
    guestMessage: "Create an account to access saved code history.",
  });

  if (!access.ok) {
    return access.response;
  }

  const userCode = await prismadb.code.findMany({
    where: {
      userId: access.userId,
    },
  });

  return NextResponse.json(userCode);
}
