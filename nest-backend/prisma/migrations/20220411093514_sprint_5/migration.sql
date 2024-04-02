/*
  Warnings:

  - Made the column `projectId` on table `InformationTab` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "InformationTab" DROP CONSTRAINT "InformationTab_projectId_fkey";

-- DropIndex
DROP INDEX "Invite_email_key";

-- AlterTable
ALTER TABLE "InformationTab" ALTER COLUMN "projectId" SET NOT NULL;

-- AlterTable
ALTER TABLE "Invite" ADD COLUMN     "enabled" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "updatedById" INTEGER;

-- AlterTable
ALTER TABLE "Project" ADD COLUMN     "createdAt" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "TenantFeatures" ADD COLUMN     "Invite" BOOLEAN NOT NULL DEFAULT true;

-- AlterTable
ALTER TABLE "Upload" ADD COLUMN     "taskId" INTEGER;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "linkedin" VARCHAR DEFAULT E'',
ADD COLUMN     "researchGate" VARCHAR DEFAULT E'',
ALTER COLUMN "updatedAt" SET DATA TYPE TIMESTAMP(3);

-- CreateTable
CREATE TABLE "Board" (
    "id" SERIAL NOT NULL,
    "projectId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Board_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Task" (
    "id" SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "nextTaskId" INTEGER,
    "boardId" INTEGER NOT NULL,
    "statusId" INTEGER,
    "createdAt" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Task_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TaskStatus" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "boardId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TaskStatus_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Task_nextTaskId_key" ON "Task"("nextTaskId");

-- AddForeignKey
ALTER TABLE "Invite" ADD CONSTRAINT "Invite_updatedById_fkey" FOREIGN KEY ("updatedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InformationTab" ADD CONSTRAINT "InformationTab_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Board" ADD CONSTRAINT "Board_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Task" ADD CONSTRAINT "Task_boardId_fkey" FOREIGN KEY ("boardId") REFERENCES "Board"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Task" ADD CONSTRAINT "Task_nextTaskId_fkey" FOREIGN KEY ("nextTaskId") REFERENCES "Task"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Task" ADD CONSTRAINT "Task_statusId_fkey" FOREIGN KEY ("statusId") REFERENCES "TaskStatus"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TaskStatus" ADD CONSTRAINT "TaskStatus_boardId_fkey" FOREIGN KEY ("boardId") REFERENCES "Board"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Upload" ADD CONSTRAINT "Upload_taskId_fkey" FOREIGN KEY ("taskId") REFERENCES "Task"("id") ON DELETE SET NULL ON UPDATE CASCADE;
