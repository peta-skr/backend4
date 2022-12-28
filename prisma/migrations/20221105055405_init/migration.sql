/*
  Warnings:

  - You are about to drop the `_tagtothread` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
DROP TABLE `_tagtothread`;

-- CreateTable
CREATE TABLE `middleThreadAndTag` (
    `tagId` INTEGER NOT NULL,
    `threadId` INTEGER NOT NULL,

    PRIMARY KEY (`tagId`, `threadId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
