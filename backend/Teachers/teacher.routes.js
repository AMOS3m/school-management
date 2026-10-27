const express = require("express");

const teacherController = require("./teacher.controller");
const authenticate = require("../auth.middleware");
const requirePermission = require("../permission.middleware");

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
  "/us",
  authenticate,
  requirePermission("TEACHER_VIEW"),
  teacherController.getTeachers
);

router.get(
  "/us:id",
  authenticate,
  requirePermission("TEACHER_VIEW"),
  teacherController.getTeacherById
);

router.post(
  "/us",
  authenticate,
  requirePermission("TEACHER_CREATE"),
  teacherController.createTeacher
);

router.put(
  "/us:id",
  authenticate,
  requirePermission("TEACHER_UPDATE"),
  teacherController.updateTeacher
);


router.post(
  "/us:teacherId/learning-areas",
  authenticate,
  requirePermission("TEACHER_UPDATE"),
  teacherController.assignLearningArea
);


router.post(
  "/us:teacherId/streams",
 authenticate,
  requirePermission("TEACHER_UPDATE"),
  teacherController.assignStream
);

router.post(
  "/us:teacherId/teaching-assignments",
  authenticate,
  requirePermission("TEACHER_ASSIGNMENT_CREATE"),
  teacherController.createTeachingAssignment
);

module.exports = router;
