
const express = require("express");

const parentController = require("./parent.controller");

// Authentication / authorization middleware
const authenticate = require("../../middleware/auth.middleware");
const requirePermission = require("../../middleware/permission.middleware");

const router = express.Router();



router.get(
  "/search",
  authenticate,
  requirePermission("PARENT_VIEW"),
  parentController.searchParents
);

router.get(
  "/",
  authenticate,
  requirePermission("PARENT_VIEW"),
  parentController.getParents
);


router.get(
  "/me",
  authenticate,
  requirePermission("PARENT_PROFILE_VIEW"),
  parentController.getMyProfile
);


/*
|--------------------------------------------------------------------------
| GET PARENT'S CHILDREN
|--------------------------------------------------------------------------
|
| GET /api/parents/me/children
|
| Returns all children linked to the logged-in parent.
|
*/

router.get(
  "/me/children",
  authenticate,
  requirePermission("CHILDREN_VIEW"),
  parentController.getMyChildren
);


/*
|--------------------------------------------------------------------------
| GET INDIVIDUAL CHILD
|--------------------------------------------------------------------------
|
| GET /api/parents/me/children/:studentId
|
| Returns detailed information about a child belonging to
| the authenticated parent.
|
*/

router.get(
  "/me/children/:studentId",
  authenticate,
  requirePermission("CHILD_VIEW"),
  parentController.getMyChildren
);


/*
|--------------------------------------------------------------------------
| GET CHILD ACADEMIC PERFORMANCE
|--------------------------------------------------------------------------
|
| GET /api/parents/me/children/:studentId/performance
|
| Returns the child's assessment and academic performance.
|
*/

router.get(
  "/me/children/:studentId/performance",
  authenticate,
  requirePermission("CHILDREN_PERFORMANCE_VIEW"),
  parentController.getChildAssessments
);


/*
|--------------------------------------------------------------------------
| GET CHILD REPORT CARDS
|--------------------------------------------------------------------------
|
| GET /api/parents/me/children/:studentId/report-cards
|
| Returns published report cards belonging to the child.
|
*/

router.get(
  "/me/children/:studentId/report-cards",
  authenticate,
  requirePermission("REPORT_CARD_VIEW"),
  parentController.getChildReportCards
);


/*
|--------------------------------------------------------------------------
| GET SPECIFIC REPORT CARD
|--------------------------------------------------------------------------
|
| GET /api/parents/me/children/:studentId/report-cards/:reportCardId
|
| Returns one report card.
|
*/

router.get(
  "/me/children/:studentId/report-cards/:reportCardId",
  authenticate,
  requirePermission("REPORT_CARD_VIEW"),
  parentController.getChildReportCards
);


/*
|--------------------------------------------------------------------------
| GET CHILD ATTENDANCE
|--------------------------------------------------------------------------
|
| GET /api/parents/me/children/:studentId/attendance
|
| Returns attendance records for the child.
|
*/

router.get(
  "/me/children/:studentId/attendance",
  authenticate,
  requirePermission("ATTENDANCE_VIEW"),
  parentController.getChildAttendance
);


/*
|--------------------------------------------------------------------------
| GET CHILD FEES
|--------------------------------------------------------------------------
|
| GET /api/parents/me/children/:studentId/fees
|
| Returns the child's fee account, charges, payments,
| adjustments and balance.
|
*/

router.get(
  "/me/children/:studentId/fees",
  authenticate,
  requirePermission("FEE_VIEW"),
  parentController.getChildFees
);


/*
|--------------------------------------------------------------------------
| GET CHILD TIMETABLE
|--------------------------------------------------------------------------
|
| GET /api/parents/me/children/:studentId/timetable
|
| Returns the child's timetable.
|
*/

/*
|--------------------------------------------------------------------------
| GET PARENT ANNOUNCEMENTS
|--------------------------------------------------------------------------
|
| GET /api/parents/me/announcements
|
| Returns announcements available to parents.
|
*/


/*
|--------------------------------------------------------------------------
| GET UPCOMING EVENTS
|--------------------------------------------------------------------------
|
| GET /api/parents/me/events
|
| Returns upcoming school events relevant to the parent.
|
*/


/*
|--------------------------------------------------------------------------
| EXPORT ROUTER
|--------------------------------------------------------------------------
*/

module.exports = router;

