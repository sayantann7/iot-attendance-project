/*
  Warnings:

  - The primary key for the `Schedule` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `id` on the `Schedule` table. All the data in the column will be lost.
  - Added the required column `batch` to the `Schedule` table without a default value. This is not possible if the table is not empty.
  - Added the required column `batch` to the `Student` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Schedule" DROP CONSTRAINT "Schedule_pkey",
DROP COLUMN "id",
ADD COLUMN     "batch" TEXT NOT NULL,
ADD CONSTRAINT "Schedule_pkey" PRIMARY KEY ("batch");

-- AlterTable
ALTER TABLE "Student" ADD COLUMN     "batch" TEXT NOT NULL;
