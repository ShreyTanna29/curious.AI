import { auth } from "@clerk/nextjs/server";
import prismadb from "./prismadb";
import { MAX_FREE_COUNT } from "@/constants";

export const increaseApiLimit = async () => {
  const { userId } = auth();

  if (!userId) {
    return;
  }

  const userApiLimit = await prismadb.userApiLimit.findUnique({
    where: {
      userId,
    },
  });

  if (userApiLimit) {
    await prismadb.userApiLimit.update({
      where: { userId },
      data: { count: userApiLimit.count + 1 },
    });
  } else {
    await prismadb.userApiLimit.create({
      data: { userId, count: 1 },
    });
  }
};

export const checkApiLimit = async () => {
  const { userId } = auth();

  if (!userId) {
    return;
  }

  const apiLimit = await prismadb.userApiLimit.findUnique({
    where: {
      userId,
    },
  });

  if (!apiLimit || apiLimit.count < MAX_FREE_COUNT) {
    return true;
  } else {
    return false;
  }
};

export const getApiLimitCount = async () => {
  const { userId } = auth();

  if (!userId) {
    return;
  }

  const apiLimitCount = await prismadb.userApiLimit.findUnique({
    where: { userId },
  });

  if (!apiLimitCount) {
    return 0;
  }

  return apiLimitCount.count;
};
