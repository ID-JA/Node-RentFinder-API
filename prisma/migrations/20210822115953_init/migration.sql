-- CreateTable
CREATE TABLE `announcements` (
    `Id` INTEGER NOT NULL AUTO_INCREMENT,
    `Title` VARCHAR(60),
    `Description` VARCHAR(800),
    `Photos` VARCHAR(1000),
    `Price` FLOAT,
    `Location` VARCHAR(45),
    `TotalFloors` INTEGER,
    `TotalBathrooms` INTEGER,
    `TotalLivingrooms` INTEGER,
    `TotalKitchens` INTEGER,
    `TotalBedrooms` INTEGER,
    `Surface` INTEGER,
    `IsAvailable` TINYINT,
    `UserId` INTEGER,

    INDEX `FK_Announcement_User_idx`(`UserId`),
    PRIMARY KEY (`Id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `favorite` (
    `UserId` INTEGER NOT NULL,
    `AnnouncementId` INTEGER NOT NULL,

    INDEX `FK_Favorite_Announcement_idx`(`AnnouncementId`),
    PRIMARY KEY (`UserId`, `AnnouncementId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `feedback` (
    `Id` INTEGER NOT NULL AUTO_INCREMENT,
    `Content` VARCHAR(500),
    `Value` INTEGER,
    `UserId` INTEGER,

    INDEX `FK_FeedBack_User_idx`(`UserId`),
    PRIMARY KEY (`Id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `rationgs` (
    `UserId` INTEGER NOT NULL,
    `AnnouncementId` INTEGER NOT NULL,
    `Value` INTEGER,

    INDEX `FK_Ratings_Announcement_idx`(`AnnouncementId`),
    PRIMARY KEY (`UserId`, `AnnouncementId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `roles` (
    `Id` INTEGER NOT NULL AUTO_INCREMENT,
    `Name` VARCHAR(45),
    `Description` VARCHAR(150),

    PRIMARY KEY (`Id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `user_role` (
    `idUser` INTEGER NOT NULL,
    `IdRole` INTEGER NOT NULL,

    INDEX `IdRole_idx`(`IdRole`),
    PRIMARY KEY (`idUser`, `IdRole`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `users` (
    `Id` INTEGER NOT NULL AUTO_INCREMENT,
    `FirstName` VARCHAR(45),
    `LastName` VARCHAR(45),
    `PhoneNumber` VARCHAR(28),
    `City` VARCHAR(80),
    `UserName` VARCHAR(50),
    `Email` VARCHAR(100),
    `PasswordHash` VARCHAR(500),
    `AccountConfirmed` TINYINT DEFAULT 0,
    `Avatar` VARCHAR(450),

    UNIQUE INDEX `users.Email_unique`(`Email`),
    PRIMARY KEY (`Id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `announcements` ADD FOREIGN KEY (`UserId`) REFERENCES `users`(`Id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `favorite` ADD FOREIGN KEY (`AnnouncementId`) REFERENCES `announcements`(`Id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `favorite` ADD FOREIGN KEY (`UserId`) REFERENCES `users`(`Id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `feedback` ADD FOREIGN KEY (`UserId`) REFERENCES `users`(`Id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `rationgs` ADD FOREIGN KEY (`AnnouncementId`) REFERENCES `announcements`(`Id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `rationgs` ADD FOREIGN KEY (`UserId`) REFERENCES `users`(`Id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `user_role` ADD FOREIGN KEY (`IdRole`) REFERENCES `roles`(`Id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `user_role` ADD FOREIGN KEY (`idUser`) REFERENCES `users`(`Id`) ON DELETE CASCADE ON UPDATE CASCADE;
