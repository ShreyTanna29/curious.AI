import prismadb from "@/packages/api/prismadb";
import { NextResponse } from "next/server";
import bcrypt from "bcrypt";
interface Params {
  email: string;
  name: string;
  password: string;
}
export async function POST(req: Request) {
  const body = await req.json();
  const { email, name, password }: Params = body;
  if (!email || !name || !password) {
    return new NextResponse("Incomplete credentials.", { status: 401 });
  }
  const userExists = await prismadb.user.findUnique({
    where: {
      email,
    },
  });
  if (userExists) {
    return new NextResponse(
      "User with this email already exists, please login.",
      { status: 401 }
    );
  }

  const salt = await bcrypt.genSalt(10);
  const hash = await bcrypt.hash(password, salt);

  const user = await prismadb.user.create({
    data: {
      name,
      email,
      password: hash,
      provider: "email",
    },
  });

  const createdUser = {
    name: user.name,
    email: user.email,
    image: user.profilePic,
  };

  return new NextResponse(JSON.stringify(createdUser), { status: 201 });
}
