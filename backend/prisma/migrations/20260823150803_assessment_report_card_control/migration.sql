/*
  Warnings:

  - The values [SATURDAY] on the enum `DayOfWeek` will be removed. If these variants are still used in the database, this will fail.
  - Added the required column `academicYearId` to the `TimetableEntry` table without a default value. This is not possible if the table is not empty.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "DayOfWeek_new" AS ENUM ('MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY');
ALTER TABLE "TimetableEntry" ALTER COLUMN "dayOfWeek" TYPE "DayOfWeek_new" USING ("dayOfWeek"::text::"DayOfWeek_new");
ALTER TYPE "DayOfWeek" RENAME TO "DayOfWeek_old";
ALTER TYPE "DayOfWeek_new" RENAME TO "DayOfWeek";
DROP TYPE "public"."DayOfWeek_old";
COMMIT;

-- AlterTable
ALTER TABLE "Assessment" ADD COLUMN     "includeInReportCard" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "Timetable" ADD COLUMN     "isActive" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "isPublished" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "TimetableEntry" ADD COLUMN     "academicYearId" TEXT NOT NULL,
ADD COLUMN     "isActive" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "termId" TEXT;

-- CreateIndex
CREATE INDEX "Timetable_isPublished_idx" ON "Timetable"("isPublished");

-- CreateIndex
CREATE INDEX "Timetable_isActive_idx" ON "Timetable"("isActive");

-- CreateIndex
CREATE INDEX "TimetableEntry_timetableId_idx" ON "TimetableEntry"("timetableId");

-- AddForeignKey
ALTER TABLE "TimetableEntry" ADD CONSTRAINT "TimetableEntry_academicYearId_fkey" FOREIGN KEY ("academicYearId") REFERENCES "AcademicYear"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TimetableEntry" ADD CONSTRAINT "TimetableEntry_termId_fkey" FOREIGN KEY ("termId") REFERENCES "Term"("id") ON DELETE SET NULL ON UPDATE CASCADE;
