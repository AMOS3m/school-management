-- CreateTable
CREATE TABLE "ExaminationTimetable" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "examinationType" TEXT,
    "academicYearId" TEXT NOT NULL,
    "termId" TEXT,
    "status" TEXT NOT NULL DEFAULT 'DRAFT',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ExaminationTimetable_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ExaminationTimetableEntry" (
    "id" TEXT NOT NULL,
    "examinationTimetableId" TEXT NOT NULL,
    "academicYearId" TEXT NOT NULL,
    "termId" TEXT,
    "gradeId" TEXT NOT NULL,
    "learningAreaId" TEXT NOT NULL,
    "examDate" TIMESTAMP(3) NOT NULL,
    "startTime" TEXT NOT NULL,
    "endTime" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ExaminationTimetableEntry_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ExaminationTimetable_academicYearId_idx" ON "ExaminationTimetable"("academicYearId");

-- CreateIndex
CREATE INDEX "ExaminationTimetable_termId_idx" ON "ExaminationTimetable"("termId");

-- CreateIndex
CREATE INDEX "ExaminationTimetableEntry_examinationTimetableId_idx" ON "ExaminationTimetableEntry"("examinationTimetableId");

-- CreateIndex
CREATE INDEX "ExaminationTimetableEntry_academicYearId_idx" ON "ExaminationTimetableEntry"("academicYearId");

-- CreateIndex
CREATE INDEX "ExaminationTimetableEntry_termId_idx" ON "ExaminationTimetableEntry"("termId");

-- CreateIndex
CREATE INDEX "ExaminationTimetableEntry_gradeId_idx" ON "ExaminationTimetableEntry"("gradeId");

-- CreateIndex
CREATE INDEX "ExaminationTimetableEntry_learningAreaId_idx" ON "ExaminationTimetableEntry"("learningAreaId");

-- CreateIndex
CREATE INDEX "ExaminationTimetableEntry_examDate_idx" ON "ExaminationTimetableEntry"("examDate");

-- AddForeignKey
ALTER TABLE "ExaminationTimetable" ADD CONSTRAINT "ExaminationTimetable_academicYearId_fkey" FOREIGN KEY ("academicYearId") REFERENCES "AcademicYear"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExaminationTimetable" ADD CONSTRAINT "ExaminationTimetable_termId_fkey" FOREIGN KEY ("termId") REFERENCES "Term"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExaminationTimetableEntry" ADD CONSTRAINT "ExaminationTimetableEntry_examinationTimetableId_fkey" FOREIGN KEY ("examinationTimetableId") REFERENCES "ExaminationTimetable"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExaminationTimetableEntry" ADD CONSTRAINT "ExaminationTimetableEntry_academicYearId_fkey" FOREIGN KEY ("academicYearId") REFERENCES "AcademicYear"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExaminationTimetableEntry" ADD CONSTRAINT "ExaminationTimetableEntry_termId_fkey" FOREIGN KEY ("termId") REFERENCES "Term"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExaminationTimetableEntry" ADD CONSTRAINT "ExaminationTimetableEntry_gradeId_fkey" FOREIGN KEY ("gradeId") REFERENCES "Grade"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExaminationTimetableEntry" ADD CONSTRAINT "ExaminationTimetableEntry_learningAreaId_fkey" FOREIGN KEY ("learningAreaId") REFERENCES "LearningArea"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
