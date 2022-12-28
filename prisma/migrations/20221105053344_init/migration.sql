/*
  Warnings:

  - You are about to drop the column `tag` on the `thread` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `thread` DROP COLUMN `tag`;

-- CreateTable
CREATE TABLE `_TagToThread` (
    `A` INTEGER NOT NULL,
    `B` INTEGER NOT NULL,

    UNIQUE INDEX `_TagToThread_AB_unique`(`A`, `B`),
    INDEX `_TagToThread_B_index`(`B`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
