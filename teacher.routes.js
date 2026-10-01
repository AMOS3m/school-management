const express = require("express");

const teacherController = require("./teacher.controller");
const authenticate = require("../../middleware/auth.middleware");
const requirePermission = require("../../middleware/permission.middleware");

const router = express.Router();

router.get( "/me/dashboard", 
  authenticate, 
  teacherController.getMyDashboard); 

router.get(
  "/me",
  authenticate,
  requirePermission("MY_PROFILE_VIEW"),
  teacherController.getMyProfile
);

router.patch(
  "/me",
  authenticate,
  requirePermission("MY_PROFILE_UPDATE"),
  teacherController.updateMyProfile
);

     
router.get(
  "/search",
  authenticate,
  requirePermission("TEACHER_VIEW"),
  teacherController.searchTeachers
);


router.get(
  "/",
  authenticate,
  requirePermission("TEACHER_VIEW"),
  teacherController.getTeachers
);

router.get(
  "/:id",
  authenticate,
  requirePermission("TEACHER_VIEW"),
  teacherController.getTeacherById
);

router.post(
  "/",
  authenticate,
  requirePermission("TEACHER_CREATE"),
  teacherController.createTeacher
);

router.put(
  "/:id",
  authenticate,
  requirePermission("TEACHER_UPDATE"),
  teacherController.updateTeacher
);


router.post(
  "/:teacherId/learning-areas",
  authenticate,
  requirePermission("TEACHER_UPDATE"),
  teacherController.assignLearningArea
);


router.post(
  "/:teacherId/streams",
 authenticate,
  requirePermission("TEACHER_UPDATE"),
  teacherController.assignStream
);

router.post(
  "/:teacherId/teaching-assignments",
  authenticate,
  requirePermission("TEACHER_ASSIGNMENT_CREATE"),
  teacherController.createTeachingAssignment
);

module.exports = router;