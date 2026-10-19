-- AlterTable
ALTER TABLE "ReportCardResult" ADD COLUMN     "learningOutcomeAnalysis" JSONB;

-- CreateTable
CREATE TABLE "ClassTeacherAssignment" (
    "id" TEXT NOT NULL,
    "teacherId" TEXT NOT NULL,
    "gradeId" TEXT NOT NULL,
    "streamId" TEXT,
    "academicYearId" TEXT NOT NULL,
    "termId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ClassTeacherAssignment_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ClassTeacherAssignment_teacherId_idx" ON "ClassTeacherAssignment"("teacherId");

-- CreateIndex
CREATE INDEX "ClassTeacherAssignment_gradeId_idx" ON "ClassTeacherAssignment"("gradeId");

-- CreateIndex
CREATE INDEX "ClassTeacherAssignment_streamId_idx" ON "ClassTeacherAssignment"("streamId");

-- CreateIndex
CREATE INDEX "ClassTeacherAssignment_academicYearId_idx" ON "ClassTeacherAssignment"("academicYearId");

-- CreateIndex
CREATE INDEX "ClassTeacherAssignment_termId_idx" ON "ClassTeacherAssignment"("termId");

-- CreateIndex
CREATE UNIQUE INDEX "ClassTeacherAssignment_gradeId_streamId_academicYearId_term_key" ON "ClassTeacherAssignment"("gradeId", "streamId", "academicYearId", "termId");

-- AddForeignKey
ALTER TABLE "ClassTeacherAssignment" ADD CONSTRAINT "ClassTeacherAssignment_teacherId_fkey" FOREIGN KEY ("teacherId") REFERENCES "Teacher"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ClassTeacherAssignment" ADD CONSTRAINT "ClassTeacherAssignment_gradeId_fkey" FOREIGN KEY ("gradeId") REFERENCES "Grade"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ClassTeacherAssignment" ADD CONSTRAINT "ClassTeacherAssignment_streamId_fkey" FOREIGN KEY ("streamId") REFERENCES "Stream"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ClassTeacherAssignment" ADD CONSTRAINT "ClassTeacherAssignment_academicYearId_fkey" FOREIGN KEY ("academicYearId") REFERENCES "AcademicYear"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ClassTeacherAssignment" ADD CONSTRAINT "ClassTeacherAssignment_termId_fkey" FOREIGN KEY ("termId") REFERENCES "Term"("id") ON DELETE CASCADE ON UPDATE CASCADE;
