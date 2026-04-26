/*
  Warnings:

  - You are about to drop the column `cafe` on the `submission` table. All the data in the column will be lost.
  - You are about to drop the column `date` on the `submission` table. All the data in the column will be lost.
  - You are about to drop the column `owner` on the `submission` table. All the data in the column will be lost.
  - You are about to drop the column `total` on the `submission` table. All the data in the column will be lost.
  - Added the required column `address` to the `Submission` table without a default value. This is not possible if the table is not empty.
  - Added the required column `cafeName` to the `Submission` table without a default value. This is not possible if the table is not empty.
  - Added the required column `capacity` to the `Submission` table without a default value. This is not possible if the table is not empty.
  - Added the required column `latitude` to the `Submission` table without a default value. This is not possible if the table is not empty.
  - Added the required column `longitude` to the `Submission` table without a default value. This is not possible if the table is not empty.
  - Added the required column `ownerId` to the `Submission` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `submission` DROP COLUMN `cafe`,
    DROP COLUMN `date`,
    DROP COLUMN `owner`,
    DROP COLUMN `total`,
    ADD COLUMN `address` VARCHAR(191) NOT NULL,
    ADD COLUMN `cafeName` VARCHAR(191) NOT NULL,
    ADD COLUMN `capacity` INTEGER NOT NULL,
    ADD COLUMN `latitude` VARCHAR(191) NOT NULL,
    ADD COLUMN `longitude` VARCHAR(191) NOT NULL,
    ADD COLUMN `ownerId` INTEGER NOT NULL,
    ADD COLUMN `revisionNote` TEXT NULL;

-- CreateTable
CREATE TABLE `CafeImage` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `url` LONGTEXT NOT NULL,
    `submissionId` INTEGER NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Interaction` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `type` VARCHAR(191) NOT NULL,
    `cafeId` INTEGER NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `KeywordMapping` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `key` VARCHAR(191) NOT NULL,
    `value` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `KeywordMapping_key_key`(`key`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Submission` ADD CONSTRAINT `Submission_ownerId_fkey` FOREIGN KEY (`ownerId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `CafeImage` ADD CONSTRAINT `CafeImage_submissionId_fkey` FOREIGN KEY (`submissionId`) REFERENCES `Submission`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Interaction` ADD CONSTRAINT `Interaction_cafeId_fkey` FOREIGN KEY (`cafeId`) REFERENCES `Submission`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
