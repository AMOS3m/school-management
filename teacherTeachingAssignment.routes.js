
const express = require("express");

const router = express.Router();

const teacherTeachingAssignmentController =
  require(
    "./teacherTeachingAssignment.controller"
  );
const authenticate = require("../../middleware/auth.middleware");

const requirePermission = require("../../middleware/permission.middleware");


/*
|--------------------------------------------------------------------------
| CREATE TEACHING ASSIGNMENT
|--------------------------------------------------------------------------
|
| POST /teacher-teaching-assignments
|
| Body:
|
| {
|   "teacherId": "...",
|   "learningAreaId": "...",
|   "gradeId": "...",
|   "streamId": "..."
| }
|
|--------------------------------------------------------------------------
*/

router.post(
  "/",
  authenticate,
  requirePermission("TEACHER_ASSIGNMENT_CREATE"),
  teacherTeachingAssignmentController.createTeachingAssignment
);


/*
|--------------------------------------------------------------------------
| GET ALL TEACHING ASSIGNMENTS
|--------------------------------------------------------------------------
|
| GET /teacher-teaching-assignments
|
| Optional query parameters:
|
| ?teacherId=
| ?learningAreaId=
| ?gradeId=
| ?streamId=
|
|--------------------------------------------------------------------------
*/

router.get(
  "/",
  authenticate,
  requirePermission("TEACHER_ASSIGNMENT_VIEW"),
  teacherTeachingAssignmentController.getTeachingAssignments
);




router.get(
  "/:assignmentId",
  authenticate, 
  requirePermission("TEACHER_ASSIGNMENT_VIEW"),
  teacherTeachingAssignmentController.getTeachingAssignmentById
);



router.put(
  "/:assignmentId",
  authenticate,
  requirePermission("TEACHER_ASSIGNMENT_UPDATE"),
  teacherTeachingAssignmentController.updateTeachingAssignment
);

router.delete(
  "/:assignmentId",
   authenticate,
  requirePermission("TEACHER_ASSIGNMENT_DELETE"),
  teacherTeachingAssignmentController.removeTeachingAssignment
);


module.exports = router;
