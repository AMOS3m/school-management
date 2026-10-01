


const express = require("express");

const router = express.Router();

const reportCardController = require("./reportCard.controller");

const authenticate = require("../../middleware/auth.middleware");

const requirePermission = require("../../middleware/permission.middleware");


router.get(
  "/assessment-control",
  authenticate,
  requirePermission("ASSESSMENT_VIEW"),
  reportCardController.getAssessmentReportCardControl
);



router.post(
  "/generate",
  authenticate,
  requirePermission("REPORT_CARD_CREATE"),
  reportCardController.generateReportCard
);



router.get(
  "/student/:studentId",
  authenticate,
  requirePermission("REPORT_CARD_VIEW"),
  reportCardController.getStudentReportCards
);



router.get(
  "/:reportCardId",
  authenticate,
  requirePermission("REPORT_CARD_VIEW"),
  reportCardController.getReportCardById
);



router.patch(
  "/:reportCardId/class-teacher-comment",
  authenticate,
  requirePermission("REPORT_CARD_UPDATE"),
  reportCardController.updateClassTeacherComment
);


router.patch(
  "/:reportCardId/head-comment",
  authenticate,
  requirePermission("REPORT_CARD_UPDATE"),
  reportCardController.updateHeadTeacherComment
);

router.post(
  "/:reportCardId/publish",
  authenticate,
  requirePermission("REPORT_PUBLISH"),
  reportCardController.publishReportCard
);


module.exports = router;

