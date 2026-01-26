/*
  Warnings:

  - You are about to drop the column `address` on the `companies` table. All the data in the column will be lost.
  - You are about to drop the column `contact_person` on the `companies` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "companies" DROP COLUMN "address",
DROP COLUMN "contact_person";
