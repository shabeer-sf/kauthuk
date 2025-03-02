/*
  Warnings:

  - The values [enum] on the enum `Attribute_type` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the column `image` on the `product` table. All the data in the column will be lost.
  - You are about to drop the column `stock` on the `product` table. All the data in the column will be lost.
  - You are about to drop the column `variation` on the `product` table. All the data in the column will be lost.
  - You are about to drop the column `available_colors` on the `productvariant` table. All the data in the column will be lost.
  - You are about to drop the column `available_sizes` on the `productvariant` table. All the data in the column will be lost.
  - You are about to drop the column `stock` on the `productvariant` table. All the data in the column will be lost.
  - You are about to drop the `admin` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `variantvalue` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `display_name` to the `Attribute` table without a default value. This is not possible if the table is not empty.
  - Added the required column `display_value` to the `AttributeValue` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX `AttributeValue_attribute_id_fkey` ON `attributevalue`;

-- DropIndex
DROP INDEX `Product_subcat_id_fkey` ON `product`;

-- DropIndex
DROP INDEX `ProductVariant_product_id_fkey` ON `productvariant`;

-- DropIndex
DROP INDEX `SubCategory_cat_id_fkey` ON `subcategory`;

-- AlterTable
ALTER TABLE `attribute` ADD COLUMN `affects_price` BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN `display_name` VARCHAR(255) NOT NULL,
    ADD COLUMN `display_order` INTEGER NOT NULL DEFAULT 0,
    ADD COLUMN `is_variant` BOOLEAN NOT NULL DEFAULT false,
    MODIFY `type` ENUM('text', 'number', 'color', 'size', 'material', 'boolean', 'select') NOT NULL DEFAULT 'text';

-- AlterTable
ALTER TABLE `attributevalue` ADD COLUMN `color_code` VARCHAR(50) NULL,
    ADD COLUMN `display_order` INTEGER NOT NULL DEFAULT 0,
    ADD COLUMN `display_value` VARCHAR(255) NOT NULL,
    ADD COLUMN `image_path` VARCHAR(255) NULL;

-- AlterTable
ALTER TABLE `product` DROP COLUMN `image`,
    DROP COLUMN `stock`,
    DROP COLUMN `variation`,
    ADD COLUMN `hasVariants` BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN `stock_status` ENUM('yes', 'no') NOT NULL DEFAULT 'yes',
    MODIFY `stock_count` INTEGER NOT NULL DEFAULT 0,
    MODIFY `quantity_limit` INTEGER NOT NULL DEFAULT 10;

-- AlterTable
ALTER TABLE `productvariant` DROP COLUMN `available_colors`,
    DROP COLUMN `available_sizes`,
    DROP COLUMN `stock`,
    ADD COLUMN `is_default` BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN `stock_count` INTEGER NOT NULL DEFAULT 0,
    ADD COLUMN `stock_status` ENUM('yes', 'no') NOT NULL DEFAULT 'yes',
    ADD COLUMN `weight` DOUBLE NULL;

-- DropTable
DROP TABLE `admin`;

-- DropTable
DROP TABLE `variantvalue`;

-- CreateTable
CREATE TABLE `ProductImage` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `product_id` INTEGER NOT NULL,
    `product_variant_id` INTEGER NULL,
    `image_path` VARCHAR(255) NOT NULL,
    `image_type` ENUM('main', 'thumbnail', 'gallery', 'banner') NOT NULL DEFAULT 'main',
    `display_order` INTEGER NOT NULL DEFAULT 0,
    `is_thumbnail` BOOLEAN NOT NULL DEFAULT false,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ProductAttribute` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `product_id` INTEGER NOT NULL,
    `attribute_id` INTEGER NOT NULL,
    `is_required` BOOLEAN NOT NULL DEFAULT false,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ProductAttributeValue` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `product_attribute_id` INTEGER NOT NULL,
    `attribute_value_id` INTEGER NOT NULL,
    `price_adjustment_rupees` DECIMAL(10, 2) NULL,
    `price_adjustment_dollars` DECIMAL(10, 2) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `VariantAttributeValue` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `variant_id` INTEGER NOT NULL,
    `attribute_value_id` INTEGER NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `VariantAttributeValue_variant_id_attribute_value_id_key`(`variant_id`, `attribute_value_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Slider` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `title` VARCHAR(255) NOT NULL,
    `subtitle` VARCHAR(255) NULL,
    `image` VARCHAR(255) NULL,
    `href` VARCHAR(255) NULL,
    `link` VARCHAR(255) NULL,
    `linkTitle` VARCHAR(255) NULL,
    `description` TEXT NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `SubCategory` ADD CONSTRAINT `SubCategory_cat_id_fkey` FOREIGN KEY (`cat_id`) REFERENCES `Category`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Product` ADD CONSTRAINT `Product_subcat_id_fkey` FOREIGN KEY (`subcat_id`) REFERENCES `SubCategory`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ProductImage` ADD CONSTRAINT `ProductImage_product_id_fkey` FOREIGN KEY (`product_id`) REFERENCES `Product`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ProductImage` ADD CONSTRAINT `ProductImage_product_variant_id_fkey` FOREIGN KEY (`product_variant_id`) REFERENCES `ProductVariant`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `AttributeValue` ADD CONSTRAINT `AttributeValue_attribute_id_fkey` FOREIGN KEY (`attribute_id`) REFERENCES `Attribute`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ProductAttribute` ADD CONSTRAINT `ProductAttribute_product_id_fkey` FOREIGN KEY (`product_id`) REFERENCES `Product`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ProductAttribute` ADD CONSTRAINT `ProductAttribute_attribute_id_fkey` FOREIGN KEY (`attribute_id`) REFERENCES `Attribute`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ProductAttributeValue` ADD CONSTRAINT `ProductAttributeValue_product_attribute_id_fkey` FOREIGN KEY (`product_attribute_id`) REFERENCES `ProductAttribute`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ProductAttributeValue` ADD CONSTRAINT `ProductAttributeValue_attribute_value_id_fkey` FOREIGN KEY (`attribute_value_id`) REFERENCES `AttributeValue`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ProductVariant` ADD CONSTRAINT `ProductVariant_product_id_fkey` FOREIGN KEY (`product_id`) REFERENCES `Product`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `VariantAttributeValue` ADD CONSTRAINT `VariantAttributeValue_variant_id_fkey` FOREIGN KEY (`variant_id`) REFERENCES `ProductVariant`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `VariantAttributeValue` ADD CONSTRAINT `VariantAttributeValue_attribute_value_id_fkey` FOREIGN KEY (`attribute_value_id`) REFERENCES `AttributeValue`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
