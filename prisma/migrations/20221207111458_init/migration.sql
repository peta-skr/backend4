-- CreateTable
CREATE TABLE `FriezedUser` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `uid` VARCHAR(191) NOT NULL,
    `long` DATETIME(3) NOT NULL,

    UNIQUE INDEX `FriezedUser_uid_key`(`uid`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
