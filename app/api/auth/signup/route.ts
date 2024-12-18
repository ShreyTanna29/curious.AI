import prismadb from "@/packages/api/prismadb";
import { NextResponse } from "next/server";
import bcrypt from "bcrypt";

interface Params {
  email: string;
  name: string;
  password: string;
}

export default async function POST(req: Request) {
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

  bcrypt.genSalt(10, async (err, salt) => {
    bcrypt.hash(password, salt, async (err, hash) => {
      await prismadb.user.create({
        data: {
          name,
          email,
          password: hash,
        },
      });
    });
  });
}
