import { NEXT_AUTH_CONFIG } from "@/packages/api/nextAuthConfig";
import prismadb from "@/packages/api/prismadb";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const session = await getServerSession(NEXT_AUTH_CONFIG);
  const userId = session.user.id;
  const { searchParams } = new URL(req.url);
  const page = parseInt(searchParams.get("page")!);
  const PAGESIZE = 12;
  if (!userId) {
    return new NextResponse("Unauthorised", { status: 401 });
  }

  const images = await prismadb.image.findMany({
    take: PAGESIZE,
    skip: page * PAGESIZE,
    orderBy: {
      createdAt: "desc",
    },
  });

  if (!images) {
    return new NextResponse("No images in DB", { status: 404 });
  }

  return NextResponse.json(images);
}
