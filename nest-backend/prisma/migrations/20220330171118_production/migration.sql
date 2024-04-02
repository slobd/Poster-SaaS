-- CreateEnum
CREATE TYPE "WorkspaceVisibilityEnum" AS ENUM ('PUBLIC', 'PRIVATE');

-- CreateEnum
CREATE TYPE "ProjectVisibilityEnum" AS ENUM ('PUBLIC', 'PRIVATE');

-- CreateEnum
CREATE TYPE "PosterVisibilityEnum" AS ENUM ('PUBLIC', 'PRIVATE');

-- CreateTable
CREATE TABLE "User" (
    "id" SERIAL NOT NULL,
    "objectId" VARCHAR NOT NULL,
    "firstName" VARCHAR,
    "lastName" VARCHAR,
    "email" VARCHAR NOT NULL,
    "subscribed" BOOLEAN NOT NULL DEFAULT false,
    "privacyPolicy" BOOLEAN NOT NULL,
    "termOfUse" BOOLEAN NOT NULL,
    "organizationName" VARCHAR DEFAULT E'',
    "disableNotifications" BOOLEAN NOT NULL DEFAULT false,
    "avatarId" INTEGER,
    "currentPosition" VARCHAR DEFAULT E'',
    "biography" VARCHAR DEFAULT E'',
    "createdAt" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "isDummyUser" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Invite" (
    "id" SERIAL NOT NULL,
    "token" TEXT NOT NULL,
    "email" VARCHAR NOT NULL,
    "roleId" INTEGER NOT NULL,
    "workspaceId" INTEGER NOT NULL,
    "projectId" INTEGER,
    "accepted" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Invite_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Tenant" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR NOT NULL,
    "host" VARCHAR NOT NULL,
    "themeId" INTEGER,
    "ownerId" INTEGER NOT NULL,
    "enabled" BOOLEAN DEFAULT true,
    "createdAt" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "termOfUse" BOOLEAN NOT NULL DEFAULT true,
    "logoId" INTEGER,
    "domain" TEXT,

    CONSTRAINT "Tenant_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TenantFeatures" (
    "id" SERIAL NOT NULL,
    "AccessControl" BOOLEAN NOT NULL DEFAULT true,
    "TenantManagement" BOOLEAN NOT NULL DEFAULT true,
    "Workspace" BOOLEAN NOT NULL DEFAULT true,
    "Project" BOOLEAN NOT NULL DEFAULT true,
    "Gallery" BOOLEAN NOT NULL DEFAULT true,
    "People" BOOLEAN NOT NULL DEFAULT true,
    "Comment" BOOLEAN NOT NULL DEFAULT true,
    "tenantId" INTEGER,

    CONSTRAINT "TenantFeatures_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserDirectory" (
    "id" SERIAL NOT NULL,
    "tenantId" INTEGER NOT NULL,
    "domain" TEXT,

    CONSTRAINT "UserDirectory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Workspace" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "visibility" "WorkspaceVisibilityEnum" NOT NULL,
    "tenantId" INTEGER NOT NULL,

    CONSTRAINT "Workspace_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Project" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "visibility" "ProjectVisibilityEnum" NOT NULL,
    "workspaceId" INTEGER NOT NULL,

    CONSTRAINT "Project_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "InformationTab" (
    "id" SERIAL NOT NULL,
    "description" TEXT NOT NULL,
    "projectId" INTEGER,

    CONSTRAINT "InformationTab_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "IdentityProvider" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "userDirectoryId" INTEGER,
    "domain" TEXT NOT NULL,

    CONSTRAINT "IdentityProvider_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserAccount" (
    "id" SERIAL NOT NULL,
    "identityProviderId" INTEGER NOT NULL,
    "userId" INTEGER NOT NULL,
    "objectId" TEXT NOT NULL,
    "default" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "UserAccount_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Comment" (
    "id" SERIAL NOT NULL,
    "content" VARCHAR(600) NOT NULL,
    "createdAt" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "authorId" INTEGER,
    "posterId" INTEGER,

    CONSTRAINT "Comment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DataMigration" (
    "id" SERIAL NOT NULL,
    "date" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "name" VARCHAR NOT NULL,

    CONSTRAINT "DataMigration_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Poster" (
    "id" SERIAL NOT NULL,
    "title" VARCHAR,
    "description" VARCHAR,
    "createdAt" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "imageId" INTEGER,
    "pdfId" INTEGER,
    "workspaceId" INTEGER,
    "userId" INTEGER,
    "visibility" "PosterVisibilityEnum" NOT NULL,

    CONSTRAINT "Poster_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Role" (
    "id" SERIAL NOT NULL,
    "system" BOOLEAN NOT NULL DEFAULT false,
    "name" VARCHAR NOT NULL,
    "domain" TEXT NOT NULL,
    "tenantId" INTEGER,
    "description" VARCHAR DEFAULT E'',

    CONSTRAINT "Role_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RolesOnUsers" (
    "roleId" INTEGER NOT NULL,
    "userId" INTEGER NOT NULL,

    CONSTRAINT "RolesOnUsers_pkey" PRIMARY KEY ("roleId","userId")
);

-- CreateTable
CREATE TABLE "RoleMigrations" (
    "id" SERIAL NOT NULL,
    "createdAt" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "roles" JSON NOT NULL,

    CONSTRAINT "RoleMigrations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Topic" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR NOT NULL,
    "workspaceId" INTEGER NOT NULL,

    CONSTRAINT "Topic_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Keyword" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR NOT NULL,
    "workspaceId" INTEGER NOT NULL,

    CONSTRAINT "Keyword_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Upload" (
    "id" SERIAL NOT NULL,
    "fieldname" VARCHAR,
    "originalname" VARCHAR NOT NULL,
    "encoding" VARCHAR NOT NULL,
    "mimetype" VARCHAR NOT NULL,
    "size" INTEGER NOT NULL,
    "bucket" VARCHAR NOT NULL,
    "key" VARCHAR NOT NULL,
    "acl" VARCHAR NOT NULL,
    "contentType" VARCHAR NOT NULL,
    "contentDisposition" TEXT,
    "storageClass" VARCHAR NOT NULL,
    "serverSideEncryption" TEXT,
    "metadata" JSON,
    "location" VARCHAR NOT NULL,
    "etag" VARCHAR NOT NULL,
    "informationTabId" INTEGER,

    CONSTRAINT "Upload_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Rule" (
    "id" SERIAL NOT NULL,
    "subject" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "fields" JSON,
    "options" JSON,
    "name" TEXT NOT NULL,
    "feature" TEXT NOT NULL,
    "roleId" INTEGER,
    "userId" INTEGER,

    CONSTRAINT "Rule_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_UserDirectory" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateTable
CREATE TABLE "_GuestUserDirectory" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateTable
CREATE TABLE "_UserToWorkspace" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateTable
CREATE TABLE "_ProjectToUser" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateTable
CREATE TABLE "_InformationTabToTopic" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateTable
CREATE TABLE "_InformationTabToKeyword" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateTable
CREATE TABLE "_PosterCoauthor" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateTable
CREATE TABLE "_PosterToTopic" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateTable
CREATE TABLE "_KeywordToPoster" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "User_avatarId_key" ON "User"("avatarId");

-- CreateIndex
CREATE UNIQUE INDEX "Invite_token_key" ON "Invite"("token");

-- CreateIndex
CREATE UNIQUE INDEX "Invite_email_key" ON "Invite"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Tenant_name_key" ON "Tenant"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Tenant_host_key" ON "Tenant"("host");

-- CreateIndex
CREATE UNIQUE INDEX "Tenant_themeId_key" ON "Tenant"("themeId");

-- CreateIndex
CREATE UNIQUE INDEX "Tenant_logoId_key" ON "Tenant"("logoId");

-- CreateIndex
CREATE UNIQUE INDEX "Tenant_domain_key" ON "Tenant"("domain");

-- CreateIndex
CREATE UNIQUE INDEX "TenantFeatures_tenantId_key" ON "TenantFeatures"("tenantId");

-- CreateIndex
CREATE UNIQUE INDEX "UserDirectory_tenantId_key" ON "UserDirectory"("tenantId");

-- CreateIndex
CREATE UNIQUE INDEX "UserDirectory_domain_key" ON "UserDirectory"("domain");

-- CreateIndex
CREATE UNIQUE INDEX "IdentityProvider_name_key" ON "IdentityProvider"("name");

-- CreateIndex
CREATE UNIQUE INDEX "IdentityProvider_domain_key" ON "IdentityProvider"("domain");

-- CreateIndex
CREATE UNIQUE INDEX "UserAccount_objectId_key" ON "UserAccount"("objectId");

-- CreateIndex
CREATE UNIQUE INDEX "Poster_imageId_key" ON "Poster"("imageId");

-- CreateIndex
CREATE UNIQUE INDEX "Poster_pdfId_key" ON "Poster"("pdfId");

-- CreateIndex
CREATE UNIQUE INDEX "Role_name_tenantId_domain_key" ON "Role"("name", "tenantId", "domain");

-- CreateIndex
CREATE INDEX "RolesOnUsers_userId_idx" ON "RolesOnUsers"("userId");

-- CreateIndex
CREATE INDEX "RolesOnUsers_roleId_idx" ON "RolesOnUsers"("roleId");

-- CreateIndex
CREATE UNIQUE INDEX "Topic_name_workspaceId_key" ON "Topic"("name", "workspaceId");

-- CreateIndex
CREATE UNIQUE INDEX "Keyword_name_workspaceId_key" ON "Keyword"("name", "workspaceId");

-- CreateIndex
CREATE UNIQUE INDEX "_UserDirectory_AB_unique" ON "_UserDirectory"("A", "B");

-- CreateIndex
CREATE INDEX "_UserDirectory_B_index" ON "_UserDirectory"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_GuestUserDirectory_AB_unique" ON "_GuestUserDirectory"("A", "B");

-- CreateIndex
CREATE INDEX "_GuestUserDirectory_B_index" ON "_GuestUserDirectory"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_UserToWorkspace_AB_unique" ON "_UserToWorkspace"("A", "B");

-- CreateIndex
CREATE INDEX "_UserToWorkspace_B_index" ON "_UserToWorkspace"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_ProjectToUser_AB_unique" ON "_ProjectToUser"("A", "B");

-- CreateIndex
CREATE INDEX "_ProjectToUser_B_index" ON "_ProjectToUser"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_InformationTabToTopic_AB_unique" ON "_InformationTabToTopic"("A", "B");

-- CreateIndex
CREATE INDEX "_InformationTabToTopic_B_index" ON "_InformationTabToTopic"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_InformationTabToKeyword_AB_unique" ON "_InformationTabToKeyword"("A", "B");

-- CreateIndex
CREATE INDEX "_InformationTabToKeyword_B_index" ON "_InformationTabToKeyword"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_PosterCoauthor_AB_unique" ON "_PosterCoauthor"("A", "B");

-- CreateIndex
CREATE INDEX "_PosterCoauthor_B_index" ON "_PosterCoauthor"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_PosterToTopic_AB_unique" ON "_PosterToTopic"("A", "B");

-- CreateIndex
CREATE INDEX "_PosterToTopic_B_index" ON "_PosterToTopic"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_KeywordToPoster_AB_unique" ON "_KeywordToPoster"("A", "B");

-- CreateIndex
CREATE INDEX "_KeywordToPoster_B_index" ON "_KeywordToPoster"("B");

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_avatarId_fkey" FOREIGN KEY ("avatarId") REFERENCES "Upload"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Invite" ADD CONSTRAINT "Invite_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "Workspace"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Invite" ADD CONSTRAINT "Invite_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Invite" ADD CONSTRAINT "Invite_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "Role"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Tenant" ADD CONSTRAINT "Tenant_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "Tenant" ADD CONSTRAINT "Tenant_logoId_fkey" FOREIGN KEY ("logoId") REFERENCES "Upload"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "TenantFeatures" ADD CONSTRAINT "TenantFeatures_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserDirectory" ADD CONSTRAINT "UserDirectory_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Workspace" ADD CONSTRAINT "Workspace_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Project" ADD CONSTRAINT "Project_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "Workspace"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InformationTab" ADD CONSTRAINT "InformationTab_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "IdentityProvider" ADD CONSTRAINT "IdentityProvider_userDirectoryId_fkey" FOREIGN KEY ("userDirectoryId") REFERENCES "UserDirectory"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserAccount" ADD CONSTRAINT "UserAccount_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserAccount" ADD CONSTRAINT "UserAccount_identityProviderId_fkey" FOREIGN KEY ("identityProviderId") REFERENCES "IdentityProvider"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Comment" ADD CONSTRAINT "Comment_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "Comment" ADD CONSTRAINT "Comment_posterId_fkey" FOREIGN KEY ("posterId") REFERENCES "Poster"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "Poster" ADD CONSTRAINT "Poster_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "Poster" ADD CONSTRAINT "Poster_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "Workspace"("id") ON DELETE SET NULL ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "Poster" ADD CONSTRAINT "Poster_imageId_fkey" FOREIGN KEY ("imageId") REFERENCES "Upload"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "Poster" ADD CONSTRAINT "Poster_pdfId_fkey" FOREIGN KEY ("pdfId") REFERENCES "Upload"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "Role" ADD CONSTRAINT "Role_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "RolesOnUsers" ADD CONSTRAINT "RolesOnUsers_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "RolesOnUsers" ADD CONSTRAINT "RolesOnUsers_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "Role"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "Topic" ADD CONSTRAINT "Topic_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "Workspace"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Keyword" ADD CONSTRAINT "Keyword_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "Workspace"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Upload" ADD CONSTRAINT "Upload_informationTabId_fkey" FOREIGN KEY ("informationTabId") REFERENCES "InformationTab"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Rule" ADD CONSTRAINT "Rule_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Rule" ADD CONSTRAINT "Rule_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "Role"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_UserDirectory" ADD FOREIGN KEY ("A") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_UserDirectory" ADD FOREIGN KEY ("B") REFERENCES "UserDirectory"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_GuestUserDirectory" ADD FOREIGN KEY ("A") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_GuestUserDirectory" ADD FOREIGN KEY ("B") REFERENCES "UserDirectory"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_UserToWorkspace" ADD FOREIGN KEY ("A") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_UserToWorkspace" ADD FOREIGN KEY ("B") REFERENCES "Workspace"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ProjectToUser" ADD FOREIGN KEY ("A") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ProjectToUser" ADD FOREIGN KEY ("B") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_InformationTabToTopic" ADD FOREIGN KEY ("A") REFERENCES "InformationTab"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_InformationTabToTopic" ADD FOREIGN KEY ("B") REFERENCES "Topic"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_InformationTabToKeyword" ADD FOREIGN KEY ("A") REFERENCES "InformationTab"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_InformationTabToKeyword" ADD FOREIGN KEY ("B") REFERENCES "Keyword"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_PosterCoauthor" ADD FOREIGN KEY ("A") REFERENCES "Poster"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_PosterCoauthor" ADD FOREIGN KEY ("B") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_PosterToTopic" ADD FOREIGN KEY ("A") REFERENCES "Poster"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_PosterToTopic" ADD FOREIGN KEY ("B") REFERENCES "Topic"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_KeywordToPoster" ADD FOREIGN KEY ("A") REFERENCES "Keyword"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_KeywordToPoster" ADD FOREIGN KEY ("B") REFERENCES "Poster"("id") ON DELETE CASCADE ON UPDATE CASCADE;
