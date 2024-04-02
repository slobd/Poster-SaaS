-- CreateTable
CREATE TABLE "Skill" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR NOT NULL,

    CONSTRAINT "Skill_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_SkillToUser" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "Skill_name_key" ON "Skill"("name");

-- CreateIndex
CREATE UNIQUE INDEX "_SkillToUser_AB_unique" ON "_SkillToUser"("A", "B");

-- CreateIndex
CREATE INDEX "_SkillToUser_B_index" ON "_SkillToUser"("B");

-- AddForeignKey
ALTER TABLE "_SkillToUser" ADD FOREIGN KEY ("A") REFERENCES "Skill"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_SkillToUser" ADD FOREIGN KEY ("B") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
