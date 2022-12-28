/*
  Warnings:

  - You are about to drop the column `parent` on the `response` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `response` DROP COLUMN `parent`,
    ADD COLUMN `parentId` INTEGER NULL;
