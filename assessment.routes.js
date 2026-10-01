const express = require("express");

const assessmentController = require("./assessment.controller");

const authenticate = require("../../middleware/auth.middleware");
const requirePermission = require("../../middleware/permission.middleware");

const router = express.Router();

/*
|--------------------------------------------------------------------------
| ASSESSMENTS
|--------------------------------------------------------------------------
*/

/*
|--------------------------------------------------------------------------
| CREATE ASSESSMENT
|--------------------------------------------------------------------------
| Teacher creates an assessment for their assigned class/learning area.
*/
router.post(
  "/",
  authenticate,
  requirePermission("ASSESSMENT_CREATE"),
  assessmentController.createAssessment
);


/*
|--------------------------------------------------------------------------
| GET TEACHER ASSESSMENTS
|--------------------------------------------------------------------------
| Returns assessments belonging to the authenticated teacher.
*/
router.get(
  "/teacher",
  authenticate,
  requirePermission("ASSESSMENT_VIEW"),
  assessmentController.getTeacherAssessments
);


/*
|--------------------------------------------------------------------------
| GET STUDENTS FOR ASSESSMENT
|--------------------------------------------------------------------------
| Returns learners belonging to the assessment's
| Grade + Stream + Academic Year + Term.
|--------------------------------------------------------------------------
*/

router.get(
  "/:assessmentId/students",
  authenticate,
  requirePermission("ASSESSMENT_VIEW"),
  assessmentController.getAssessmentStudents
);


/*
|--------------------------------------------------------------------------
| GET ASSESSMENT BY ID
|--------------------------------------------------------------------------
*/
router.get(
  "/:assessmentId",
  authenticate,
  requirePermission("ASSESSMENT_VIEW"),
  assessmentController.getAssessmentById
);


/*
|--------------------------------------------------------------------------
| CREATE ASSESSMENT ITEM
|--------------------------------------------------------------------------
| Adds questions/items to an assessment.
*/
router.post(
  "/:assessmentId/items",
  authenticate,
  requirePermission("ASSESSMENT_CREATE"),
  assessmentController.createAssessmentItem
);


/*
|--------------------------------------------------------------------------
| RECORD ASSESSMENT RESULT
|--------------------------------------------------------------------------
| Records the overall assessment mark for a student.
*/
router.post(
  "/:assessmentId/results",
  authenticate,
  requirePermission("ASSESSMENT_MARK"),
  assessmentController.recordAssessmentResult
);


/*
|--------------------------------------------------------------------------
| RECORD ASSESSMENT ITEM RESULT
|--------------------------------------------------------------------------
| Records marks for an individual assessment item/question.
*/
router.post(
  "/items/:assessmentItemId/results",
  authenticate,
  requirePermission("ASSESSMENT_MARK"),
  assessmentController.recordAssessmentItemResult
);


/*
|--------------------------------------------------------------------------
| PUBLISH ASSESSMENT
|--------------------------------------------------------------------------
| Once published, the assessment can no longer be modified.
*/
router.put(
  "/:assessmentId/publish",
  authenticate,
  requirePermission("ASSESSMENT_PUBLISH"),
  assessmentController.publishAssessment
);


/*
|--------------------------------------------------------------------------
| INCLUDE / EXCLUDE FROM REPORT CARD
|--------------------------------------------------------------------------
| Controls whether the published assessment contributes to
| the student's term report card.
*/
router.put(
  "/:assessmentId/report-card",
  authenticate,
  requirePermission("ASSESSMENT_REPORT_CARD_CONTROL"),
  assessmentController.setIncludeInReportCard
);


module.exports = router;