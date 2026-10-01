
const express = require("express");

const router = express.Router();

const classTeacherController =
  require("./classTeacher.controller");

const authenticate = require("../../middleware/auth.middleware");

const requirePermission = require("../../middleware/permission.middleware");



router.get(
  "/me",
  authenticate,
  requirePermission("CLASS_TEACHER_VIEW"),
  classTeacherController.getClassTeacher
);

router.get(
  "/students",
  authenticate,
  requirePermission("STUDENT_VIEW"),
  classTeacherController.getClassTeacherStudents
);

router.get(
  "/report-cards",
  authenticate,
  requirePermission("REPORT_CARD_VIEW"),
  classTeacherController.getClassTeacherReportCards
);


router.get(
  "/report-cards/:reportCardId",
  authenticate,
  requirePermission("REPORT_CARD_VIEW"),
  classTeacherController.getClassTeacherReportCard
);

router.patch(
  "/report-cards/:reportCardId/comment",
  authenticate,
  requirePermission("REPORT_CARD_UPDATE"),
  classTeacherController.updateClassTeacherComment
);

router.post(
  "/",
  authenticate,
  requirePermission("CLASS_TEACHER_CREATE"),
  classTeacherController.assignClassTeacher
);


router.get(
  "/",
  authenticate,
  requirePermission("CLASS_TEACHER_VIEW"),
  classTeacherController.getClassTeacherAssignments
);

router.patch(
  "/:assignmentId",
  authenticate,
  requirePermission("CLASS_TEACHER_UPDATE"),
  classTeacherController.updateClassTeacherAssignment
);

router.delete(
  "/:assignmentId",
  authenticate,
  requirePermission("CLASS_TEACHER_DELETE"),
  classTeacherController.removeClassTeacherAssignment
);



module.exports = router;
