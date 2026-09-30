const express = require("express");

const router = express.Router();

const examinationTimetableController =
  require("./examinationTimetable.controller");


const authenticate = require("../../middleware/auth.middleware");
const requirePermission = require("../../middleware/permission.middleware");



/*
|--------------------------------------------------------------------------
| EXAMINATION TIMETABLE
|--------------------------------------------------------------------------
*/

// Create timetable
router.post(
  "/",
  authenticate,
  requirePermission("TIMETABLE_CREATE"),
  examinationTimetableController.createExaminationTimetable
);


// Get all timetables
router.get(
  "/",
  authenticate,
  requirePermission("TIMETABLE_VIEW"),
  examinationTimetableController.getExaminationTimetables
);


// Get one timetable
router.get(
  "/:id",
  authenticate,
  requirePermission("TIMETABLE_VIEW"),
  examinationTimetableController.getExaminationTimetable
);


// Update timetable
router.put(
  "/:id",
  authenticate,
  requirePermission("TIMETABLE_UPDATE"),
  examinationTimetableController.updateExaminationTimetable
);


// Delete timetable
router.delete(
  "/:id",
  authenticate,
  requirePermission("TIMETABLE_UPDATE"),
  examinationTimetableController.deleteExaminationTimetable
);


/*
|--------------------------------------------------------------------------
| EXAMINATION ENTRIES
|--------------------------------------------------------------------------
*/

// Create entry
router.post(
  "/:id/entries",
  authenticate,
  requirePermission("TIMETABLE_CREATE"),
  examinationTimetableController.createExaminationEntry
);


// Get entries
router.get(
  "/:id/entries",
  authenticate,
  requirePermission("TIMETABLE_VIEW"),
  examinationTimetableController.getExaminationEntries
);


// Update entry
router.put(
  "/entries/:entryId",
  authenticate,
  requirePermission("TIMETABLE_UPDATE"),
  examinationTimetableController.updateExaminationEntry
);


// Delete entry
router.delete(
  "/entries/:entryId",
  authenticate,
  requirePermission("TIMETABLE_UPDATE"),
  examinationTimetableController.deleteExaminationEntry
);


module.exports = router;