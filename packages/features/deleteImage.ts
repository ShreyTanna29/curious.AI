import axios from "axios";
import { NextResponse } from "next/server";

export const deleteImage = async ({ url }: { url: string }) => {
  try {
    await axios.delete("/api/image/delete", {
      data: { url },
    });
    return true;
  } catch (error) {
    console.log("====================================");
    console.log("ERROR :: DeleteImages :: ", error);
    console.log("====================================");
    return new NextResponse("Internal server Error", { status: 500 });
  }
};
