-- CreateTable
CREATE TABLE "TeacherLearningArea" (
    "id" TEXT NOT NULL,
    "teacherId" TEXT NOT NULL,
    "learningAreaId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TeacherLearningArea_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TeacherStream" (
    "id" TEXT NOT NULL,
    "teacherId" TEXT NOT NULL,
    "streamId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TeacherStream_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "TeacherLearningArea_teacherId_idx" ON "TeacherLearningArea"("teacherId");

-- CreateIndex
CREATE INDEX "TeacherLearningArea_learningAreaId_idx" ON "TeacherLearningArea"("learningAreaId");

-- CreateIndex
CREATE UNIQUE INDEX "TeacherLearningArea_teacherId_learningAreaId_key" ON "TeacherLearningArea"("teacherId", "learningAreaId");

-- CreateIndex
CREATE INDEX "TeacherStream_teacherId_idx" ON "TeacherStream"("teacherId");

-- CreateIndex
CREATE INDEX "TeacherStream_streamId_idx" ON "TeacherStream"("streamId");

-- CreateIndex
CREATE UNIQUE INDEX "TeacherStream_teacherId_streamId_key" ON "TeacherStream"("teacherId", "streamId");

-- AddForeignKey
ALTER TABLE "TeacherLearningArea" ADD CONSTRAINT "TeacherLearningArea_teacherId_fkey" FOREIGN KEY ("teacherId") REFERENCES "Teacher"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TeacherLearningArea" ADD CONSTRAINT "TeacherLearningArea_learningAreaId_fkey" FOREIGN KEY ("learningAreaId") REFERENCES "LearningArea"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TeacherStream" ADD CONSTRAINT "TeacherStream_teacherId_fkey" FOREIGN KEY ("teacherId") REFERENCES "Teacher"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TeacherStream" ADD CONSTRAINT "TeacherStream_streamId_fkey" FOREIGN KEY ("streamId") REFERENCES "Stream"("id") ON DELETE CASCADE ON UPDATE CASCADE;
