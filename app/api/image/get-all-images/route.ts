import prismadb from "@/packages/api/prismadb";
import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";


export async function GET() {

    const {userId} =auth()

    if(!userId){
        return new NextResponse("Unauthorised", {status: 401})
    }

    const images = await prismadb.image.findMany({
        take: 12,
        skip: 12,
    })

   if(!images){
    return new NextResponse("No images in DB", {status: 404})
   }

   return  NextResponse.json(images)

}