/*
  Warnings:

  - Added the required column `name` to the `middleThreadAndTag` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `middlethreadandtag` ADD COLUMN `name` VARCHAR(191) NOT NULL;
