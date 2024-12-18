import prismadb from "@/packages/api/prismadb";
import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export async function GET() {
  const { userId } = await auth();

  if (!userId) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const userCode = await prismadb.code.findMany({
    where: {
      userId,
    },
  });

  return NextResponse.json(userCode);
}
