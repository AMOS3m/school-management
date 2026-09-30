

const express = require("express");

const timetableController = require("./timetable.controller");

const authenticate = require("../../middleware/auth.middleware");
const requirePermission = require("../../middleware/permission.middleware");

const router = express.Router();


/*
|--------------------------------------------------------------------------
| TIMETABLE
|--------------------------------------------------------------------------
*/

router.post(
  "/",
  authenticate,
  requirePermission("TIMETABLE_CREATE"),
  timetableController.createTimetable
);


router.get(
  "/",
  authenticate,
  requirePermission("TIMETABLE_VIEW"),
  timetableController.getTimetables
);

/*
|--------------------------------------------------------------------------
| TIMETABLE ENTRIES
|--------------------------------------------------------------------------
*/

router.post(
  "/:timetableId/entries",
  authenticate,
  requirePermission("TIMETABLE_CREATE"),
  timetableController.createTimetableEntry
);


router.get(
  "/:timetableId/entries",
  authenticate,
  requirePermission("TIMETABLE_VIEW"),
  timetableController.getTimetableEntries
);


router.put(
  "/entries/:entryId",
  authenticate,
  requirePermission("TIMETABLE_UPDATE"),
  timetableController.updateTimetableEntry
);


router.delete(
  "/entries/:entryId",
  authenticate,
  requirePermission("TIMETABLE_UPDATE"),
  timetableController.deleteTimetableEntry
);


module.exports = router;

