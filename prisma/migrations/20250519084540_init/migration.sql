/*
  Warnings:

  - You are about to drop the `UserApiLimit` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `UserSubscription` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[url]` on the table `Image` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `groupId` to the `chat` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "chat" ADD COLUMN     "groupId" TEXT NOT NULL;

-- DropTable
DROP TABLE "UserApiLimit";

-- DropTable
DROP TABLE "UserSubscription";

-- CreateTable
CREATE TABLE "groupChat" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "groupChat_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT,
    "provider" TEXT NOT NULL,
    "profilePic" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Image_url_key" ON "Image"("url");

-- AddForeignKey
ALTER TABLE "chat" ADD CONSTRAINT "chat_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "groupChat"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
