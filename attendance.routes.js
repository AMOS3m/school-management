

const express = require("express");

const attendanceController = require("./attendance.controller");

const authenticate = require("../../middleware/auth.middleware");
const requirePermission = require("../../middleware/permission.middleware");

const router = express.Router();


/*
|--------------------------------------------------------------------------
| TEACHER ATTENDANCE WORKFLOW
|--------------------------------------------------------------------------
*/






/*
 * 1. Teacher gets their own timetable
 *
 * GET /api/attendance/teacher/timetable
 */
router.get(
  "/teacher/timetable",
  authenticate,
  requirePermission("ATTENDANCE_CREATE"),
  attendanceController.getTeacherTimetable
);





/*
 * 2. Teacher selects academic year, term, grade and stream
 *    and gets learners enrolled in that stream.
 *
 * GET /api/attendance/teacher/learners
 */

router.get(
  "/teacher/learners",
  authenticate,
  requirePermission("ATTENDANCE_CREATE"),
  attendanceController.getTeacherLearners
);



router.get(
  "/teacher/history",
  authenticate,
  requirePermission("ATTENDANCE_VIEW"),
  attendanceController.getTeacherAttendanceHistory
);




/*
 * 2. Teacher selects a timetable entry
 *    and gets the students in that class/stream.
 *
 * GET /api/attendance/teacher/timetable/:timetableEntryId/students
 */
router.get(
  "/teacher/timetable/:timetableEntryId/students",
  authenticate,
  requirePermission("ATTENDANCE_CREATE"),
  attendanceController.getStudentsForTimetableEntry
);


/*
 * 3. Teacher records attendance
 *
 * POST /api/attendance
 */
router.post(
  "/",
  authenticate,
  requirePermission("ATTENDANCE_CREATE"),
  attendanceController.recordAttendance
);


/*
|--------------------------------------------------------------------------
| STUDENT ATTENDANCE
|--------------------------------------------------------------------------
*/


/*
 * GET /api/attendance/student/:studentId
 */
router.get(
  "/student/:studentId",
  authenticate,
  requirePermission("ATTENDANCE_VIEW"),
  attendanceController.getStudentAttendance
);


module.exports = router;

