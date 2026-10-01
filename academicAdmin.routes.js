
const express = require("express");


const academicAdminController =
  require("./academicAdmin.controller");

const authenticate = require("../../middleware/auth.middleware");

 const requirePermission = require("../../middleware/permission.middleware");
const { AssessmentType } = require("@prisma/client");

const router = express.Router();



router.get(
  "/dashboard",
  authenticate,
  requirePermission
  ("ACADEMIC_DASHBOARD_VIEW"),
  academicAdminController.getAcademicDashboard
);


/*
|--------------------------------------------------------------------------
| ACADEMIC OVERVIEW
|--------------------------------------------------------------------------
|
| GET /academic-admin/overview
|
| Returns academic summary information.
|
|--------------------------------------------------------------------------
*/

router.get(
  "/overview",
  authenticate,
  requirePermission
  ("ACADEMIC_OVERVIEW_VIEW"),
  academicAdminController.getAcademicOverview
);


/*
|--------------------------------------------------------------------------
| ASSESSMENT REVIEWS
|--------------------------------------------------------------------------
|
| GET /academic-admin/assessment-reviews
|
| Allows the Academic Admin to see assessments submitted by teachers
| for academic/report-card review.
|
| Optional query parameters:
|
| ?academicYearId=...
| &termId=...
| &gradeId=...
| &streamId=...
|
|--------------------------------------------------------------------------
*/

router.get(
  "/assessment-reviews",
  authenticate,
  requirePermission
  ("ASSESSMENT_VIEW"),
  academicAdminController.getPendingAssessmentReviews
);


/*
|--------------------------------------------------------------------------
| REPORT CARD OVERVIEW
|--------------------------------------------------------------------------
|
| GET /academic-admin/report-cards
|
| Allows the Academic Admin to monitor report cards.
|
| Optional query parameters:
|
| ?academicYearId=...
| &termId=...
| &gradeId=...
| &streamId=...
| &status=DRAFT
|
| or
|
| ?status=PUBLISHED
|
|--------------------------------------------------------------------------
*/

router.get(
  "/report-cards",
  authenticate,
  requirePermission
  ("REPORT_CARD_VIEW"),
  academicAdminController.getReportCardOverview
);

router.get( 
  "/academic-years",
  authenticate,
  requirePermission
  ("ACADEMIC_YEAR_VIEW"),
   academicAdminController.getAcademicYears );


router.post( 
  "/academic-years",
  authenticate,
  requirePermission
  ("ACADEMIC_YEAR_CREATE"),
  academicAdminController.createAcademicYear );


router.patch(
   "/academic-years/:academicYearId",
   authenticate,
   requirePermission
   ("ACADEMIC_YEAR_UPDATE"),
   academicAdminController.updateAcademicYear );

router.get(
   "/terms",
   authenticate,
   requirePermission
   ("TERM_VIEW"),
   academicAdminController.getTerms );

router.post(
   "/terms",
   authenticate,
   requirePermission
   ("TERM_CREATE"),
    academicAdminController.createTerm );

router.patch( 
  "/terms/:termId",
   authenticate,
   requirePermission
   ("TERM_UPDATE"),
   academicAdminController.updateTerm );


   router.get(
  "/education-levels",
  authenticate,
  requirePermission
  ("EDUCATION_LEVEL_VIEW"),
  academicAdminController.getEducationLevels
);

router.post(
  "/education-levels",
  authenticate,
  requirePermission
  ("EDUCATION_LEVEL_CREATE"),
  academicAdminController.createEducationLevel
);



router.get(
   "/grades",
   authenticate,
   requirePermission
   ("GRADE_VIEW"),
    academicAdminController.getGrades );

router.post(
   "/grades",
   authenticate,
   requirePermission
   ("GRADE_CREATE"),
    academicAdminController.createGrade );

router.patch(
   "/grades/:gradeId",
   authenticate,
    requirePermission
    ("GRADE_UPDATE"),
    academicAdminController.updateGrade );

router.get(
   "/streams",
   authenticate,
   requirePermission
  ("STREAM_CREATE"),
   academicAdminController.getStreams );

router.post( "/streams",
  authenticate,
    requirePermission
    ("STREAM_VIEW"),
   academicAdminController.createStream );

router.patch(
   "/streams/:streamId",
    authenticate,
    requirePermission
    ("STREAM_UPDATE"),
    academicAdminController.updateStream );


    /*
|--------------------------------------------------------------------------
| LEARNING AREAS
|--------------------------------------------------------------------------
*/

router.get(
  "/learning-areas",
  authenticate,
  requirePermission("LEARNING_AREA_VIEW"),
  academicAdminController.getLearningAreas
);

router.post(
  "/learning-areas",
  authenticate,
  requirePermission("LEARNING_AREA_CREATE"),
  academicAdminController.createLearningArea
);



/*
|--------------------------------------------------------------------------
| EXPORT ROUTER
|--------------------------------------------------------------------------
*/

module.exports = router;

