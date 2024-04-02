-- AlterEnum
ALTER TYPE "WorkspaceVisibilityEnum" ADD VALUE 'ORGANIZATION';

-- AlterTable
ALTER TABLE "Workspace" ALTER COLUMN "description" DROP NOT NULL;
