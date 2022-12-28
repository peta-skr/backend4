/*
  Warnings:

  - Added the required column `userId` to the `ReportThread` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `reportthread` ADD COLUMN `userId` INTEGER NOT NULL;

-- CreateTable
CREATE TABLE `ReportResponse` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `threadId` INTEGER NOT NULL,
    `userId` INTEGER NOT NULL,
    `category` VARCHAR(191) NOT NULL,
    `text` TEXT NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
