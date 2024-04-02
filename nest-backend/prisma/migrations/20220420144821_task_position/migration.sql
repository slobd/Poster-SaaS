/*
  Warnings:

  - You are about to drop the column `nextTaskId` on the `Task` table. All the data in the column will be lost.
  - Added the required column `positionByStatus` to the `Task` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Task" DROP CONSTRAINT "Task_nextTaskId_fkey";

-- DropIndex
DROP INDEX "Task_nextTaskId_key";

-- AlterTable
ALTER TABLE "Task" DROP COLUMN "nextTaskId",
ADD COLUMN     "positionByStatus" DECIMAL(65,30) NOT NULL;
