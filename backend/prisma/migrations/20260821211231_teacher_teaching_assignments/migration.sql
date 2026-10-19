-- CreateTable
CREATE TABLE "TeacherTeachingAssignment" (
    "id" TEXT NOT NULL,
    "teacherId" TEXT NOT NULL,
    "learningAreaId" TEXT NOT NULL,
    "streamId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TeacherTeachingAssignment_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "TeacherTeachingAssignment_teacherId_idx" ON "TeacherTeachingAssignment"("teacherId");

-- CreateIndex
CREATE INDEX "TeacherTeachingAssignment_learningAreaId_idx" ON "TeacherTeachingAssignment"("learningAreaId");

-- CreateIndex
CREATE INDEX "TeacherTeachingAssignment_streamId_idx" ON "TeacherTeachingAssignment"("streamId");

-- CreateIndex
CREATE UNIQUE INDEX "TeacherTeachingAssignment_teacherId_learningAreaId_streamId_key" ON "TeacherTeachingAssignment"("teacherId", "learningAreaId", "streamId");

-- AddForeignKey
ALTER TABLE "TeacherTeachingAssignment" ADD CONSTRAINT "TeacherTeachingAssignment_teacherId_fkey" FOREIGN KEY ("teacherId") REFERENCES "Teacher"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TeacherTeachingAssignment" ADD CONSTRAINT "TeacherTeachingAssignment_learningAreaId_fkey" FOREIGN KEY ("learningAreaId") REFERENCES "LearningArea"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TeacherTeachingAssignment" ADD CONSTRAINT "TeacherTeachingAssignment_streamId_fkey" FOREIGN KEY ("streamId") REFERENCES "Stream"("id") ON DELETE CASCADE ON UPDATE CASCADE;
