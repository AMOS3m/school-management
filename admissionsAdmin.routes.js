
const express = require("express");

const router = express.Router();

const admissionsAdminController =
  require("./admissionsAdmin.controller");

const authMiddleware =
  require("../../middleware/auth.middleware");

const requirePermission = require("../../middleware/permission.middleware");


/*
|--------------------------------------------------------------------------
| ADMISSIONS ADMIN DASHBOARD
|--------------------------------------------------------------------------
|
| GET /admissions-admin/dashboard
|
|--------------------------------------------------------------------------
*/

router.get(
  "/dashboard",

  authMiddleware,

  requirePermission("ADMISSIONS_VIEW"),

  admissionsAdminController.getDashboard
);


/*
|--------------------------------------------------------------------------
| GET ALL STUDENTS
|--------------------------------------------------------------------------
|
| GET /admissions-admin/students
|
| Optional query parameters:
|
| ?search=
| ?gradeId=
| ?streamId=
| ?academicYearId=
| ?isActive=true
|
|--------------------------------------------------------------------------
*/

router.get(
  "/students",

  authMiddleware,

  requirePermission("STUDENT_VIEW"),

  admissionsAdminController.getStudents
);


/*
|--------------------------------------------------------------------------
| SEARCH STUDENTS
|--------------------------------------------------------------------------
|
| GET /admissions-admin/students/search?search=John
|
|--------------------------------------------------------------------------
*/

router.get(
  "/students/search",

  authMiddleware,

  requirePermission("STUDENT_VIEW"),

  admissionsAdminController.searchStudents
);


/*
|--------------------------------------------------------------------------
| GET INDIVIDUAL STUDENT
|--------------------------------------------------------------------------
|
| GET /admissions-admin/students/:studentId
|
|--------------------------------------------------------------------------
*/

router.get(
  "/students/:studentId",

  authMiddleware,

  requirePermission("STUDENT_VIEW"),

  admissionsAdminController.getStudentById
);


/*
|--------------------------------------------------------------------------
| ADMIT STUDENT
|--------------------------------------------------------------------------
|
| POST /admissions-admin/students
|
|--------------------------------------------------------------------------
*/

router.post(
  "/students",

  authMiddleware,

  requirePermission("STUDENT_CREATE"),

  admissionsAdminController.admitStudent
);


/*
|--------------------------------------------------------------------------
| UPDATE STUDENT
|--------------------------------------------------------------------------
|
| PATCH /admissions-admin/students/:studentId
|
|--------------------------------------------------------------------------
*/

router.patch(
  "/students/:studentId",

  authMiddleware,

  requirePermission("STUDENT_UPDATE"),

  admissionsAdminController.updateStudent
);


/*
|--------------------------------------------------------------------------
| ENROLL STUDENT
|--------------------------------------------------------------------------
|
| POST /admissions-admin/students/:studentId/enrollments
|
|--------------------------------------------------------------------------
*/

router.post(
  "/students/:studentId/enrollments",

  authMiddleware,

  requirePermission("STUDENT_ENROLLMENTS_CREATE"),

  admissionsAdminController.enrollStudent
);


/*
|--------------------------------------------------------------------------
| UPDATE ENROLLMENT
|--------------------------------------------------------------------------
|
| PATCH /admissions-admin/enrollments/:enrollmentId
|
|--------------------------------------------------------------------------
*/

router.patch(
  "/enrollments/:enrollmentId",

  authMiddleware,

  requirePermission("STUDENT_ENROLLMENTS_UPDATE"),

  admissionsAdminController.updateEnrollment
);


/*
|--------------------------------------------------------------------------
| REMOVE / END ENROLLMENT
|--------------------------------------------------------------------------
|
| PATCH /admissions-admin/enrollments/:enrollmentId/remove
|
|--------------------------------------------------------------------------
*/

router.patch(
  "/enrollments/:enrollmentId/remove",

  authMiddleware,

  requirePermission("STUDENT_ENROLLMENTS_UPDATE"),

  admissionsAdminController.removeEnrollment
);


/*
|--------------------------------------------------------------------------
| CREATE PARENT ACCOUNT
|--------------------------------------------------------------------------
|
| POST /admissions-admin/parents
|
| Creates:
|
| - User account
| - Parent profile
| - PARENT role
| - Student-parent relationship
|
|--------------------------------------------------------------------------
*/

router.post(
  "/parents",

  authMiddleware,

  requirePermission("PARENT_CREATE"),

  admissionsAdminController.createParentAccount
);


/*
|--------------------------------------------------------------------------
| UPDATE PARENT-STUDENT RELATIONSHIP
|--------------------------------------------------------------------------
|
| PATCH /admissions-admin/students/:studentId/parents/:parentId
|
|--------------------------------------------------------------------------
*/

router.patch(
  "/students/:studentId/parents/:parentId",

  authMiddleware,

  requirePermission("PARENT_UPDATE"),

  admissionsAdminController.updateParentStudentLink
);


/*
|--------------------------------------------------------------------------
| REMOVE PARENT FROM STUDENT
|--------------------------------------------------------------------------
|
| DELETE /admissions-admin/students/:studentId/parents/:parentId
|
|--------------------------------------------------------------------------
*/

router.delete(
  "/students/:studentId/parents/:parentId",

  authMiddleware,

  requirePermission("PARENT_UPDATE"),

  admissionsAdminController.removeParentFromStudent
);


/*
|--------------------------------------------------------------------------
| GET STUDENT PARENTS
|--------------------------------------------------------------------------
|
| GET /admissions-admin/students/:studentId/parents
|
|--------------------------------------------------------------------------
*/

router.get(
  "/students/:studentId/parents",

  authMiddleware,

  requirePermission("PARENT_VIEW"),

  admissionsAdminController.getStudentParents
);


/*
|--------------------------------------------------------------------------
| EXPORT ROUTER
|--------------------------------------------------------------------------
*/

module.exports = router;

