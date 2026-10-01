
const express = require("express");

const studentController = require("./student.controller");

const authenticate = require("../../middleware/auth.middleware");
const requirePermission = require("../../middleware/permission.middleware");

const router = express.Router();


router.get(
  "/search",
  authenticate,
  requirePermission("STUDENT_VIEW"),
  studentController.searchStudents
);



router.get(
  "/",
  authenticate,
  requirePermission("STUDENT_VIEW"),
  studentController.getStudents
);


/*
|--------------------------------------------------------------------------
| CREATE STUDENT
|--------------------------------------------------------------------------
|
| POST /students
|
|--------------------------------------------------------------------------
*/

router.post(
  "/",
  authenticate,
  requirePermission("STUDENT_CREATE"),
  studentController.createStudent
);


/*
|--------------------------------------------------------------------------
| GET STUDENT BY ID
|--------------------------------------------------------------------------
|
| GET /students/:studentId
|
| IMPORTANT:
| Keep this route AFTER the specific routes below.
|--------------------------------------------------------------------------
*/


/*
|--------------------------------------------------------------------------
| GET STUDENT PARENTS
|--------------------------------------------------------------------------
|
| GET /students/:studentId/parents
|
|--------------------------------------------------------------------------
*/

router.get(
  "/:studentId/parents",
  authenticate,
  requirePermission("STUDENT_VIEW"),
  studentController.getStudentParents
);


/*
|--------------------------------------------------------------------------
| GET STUDENT ASSESSMENTS
|--------------------------------------------------------------------------
|
| GET /students/:studentId/assessments
|
|--------------------------------------------------------------------------
*/

router.get(
  "/:studentId/assessments",
  authenticate,
  requirePermission("STUDENT_VIEW"),
  studentController.getStudentAssessments
);


/*
|--------------------------------------------------------------------------
| GET STUDENT REPORT CARDS
|--------------------------------------------------------------------------
|
| GET /students/:studentId/report-cards
|
|--------------------------------------------------------------------------
*/

router.get(
  "/:studentId/report-cards",
  authenticate,
  requirePermission("STUDENT_VIEW"),
  studentController.getStudentReportCards
);


/*
|--------------------------------------------------------------------------
| GET STUDENT FEES
|--------------------------------------------------------------------------
|
| GET /students/:studentId/fees
|
|--------------------------------------------------------------------------
*/

router.get(
  "/:studentId/fees",
  authenticate,
  requirePermission("STUDENT_VIEW"),
  studentController.getStudentFees
);


/*
|--------------------------------------------------------------------------
| GET COMPLETE STUDENT PROFILE
|--------------------------------------------------------------------------
|
| GET /students/:studentId
|
| This should come after the more specific routes.
|
|--------------------------------------------------------------------------
*/

router.get(
  "/:studentId",
  authenticate,
  requirePermission("STUDENT_VIEW"),
  studentController.getStudentById
);


/*
|--------------------------------------------------------------------------
| UPDATE STUDENT
|--------------------------------------------------------------------------
|
| PUT /students/:studentId
|
|--------------------------------------------------------------------------
*/

router.put(
  "/:studentId",
  authenticate,
  requirePermission("STUDENT_UPDATE"),
  studentController.updateStudent
);


/*
|--------------------------------------------------------------------------
| DELETE STUDENT
|--------------------------------------------------------------------------
|
| DELETE /students/:studentId
|
|--------------------------------------------------------------------------
*/

router.delete(
  "/:studentId",
  authenticate,
  requirePermission("STUDENT_DELETE"),
  studentController.deleteStudent
);


module.exports = router;

