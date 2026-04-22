-- CreateTable
CREATE TABLE `Submission` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `reqNumber` VARCHAR(191) NOT NULL,
    `cafe` VARCHAR(191) NOT NULL,
    `owner` VARCHAR(191) NOT NULL,
    `date` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `status` VARCHAR(191) NOT NULL DEFAULT 'Pending',
    `total` DOUBLE NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `Submission_reqNumber_key`(`reqNumber`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
