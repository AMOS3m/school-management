 
const timetableService = require("./timetable.service");


async function createTimetable(req, res) {
  try {
    const timetable = await timetableService.createTimetable(req.body);

    return res.status(201).json({
      message: "Timetable created successfully",
      timetable,
    });
  } catch (error) {
    console.error(error);

    return res.status(error.statusCode || 500).json({
      message: error.message || "Failed to create timetable",
    });
  }
}



/* 
|--------------------------------------------------------------------------
| GET ALL TIMETABLES
|--------------------------------------------------------------------------
*/

async function getTimetables(req, res) {
  try {
    const timetables =
      await timetableService.getTimetables();

    return res.status(200).json({
      success: true,
      data: timetables,
    });
  } catch (error) {
    console.error(error);

    return res.status(error.statusCode || 500).json({
      success: false,
      message:
        error.message ||
        "Failed to get timetables",
    });
  }
}

/*
|--------------------------------------------------------------------------
| CREATE TIMETABLE ENTRY
|--------------------------------------------------------------------------
*/

async function createTimetableEntry(req, res) {
  try {
    const { timetableId } = req.params;

    const entry = await timetableService.createTimetableEntry({
      timetableId,
      ...req.body,
    });

    return res.status(201).json({
      message: "Timetable entry created successfully",
      entry,
    });
  } catch (error) {
    console.error(error);

    return res.status(error.statusCode || 500).json({
      message: error.message || "Failed to create timetable entry",
    });
  }
}


/*
|--------------------------------------------------------------------------
| GET TIMETABLE ENTRIES
|--------------------------------------------------------------------------
*/

async function getTimetableEntries(req, res) {
  try {
    const { timetableId } = req.params;

    const entries =
      await timetableService.getTimetableEntries(timetableId);

    return res.status(200).json({
      timetableId,
      count: entries.length,
      entries,
    });
  } catch (error) {
    console.error(error);

    return res.status(error.statusCode || 500).json({
      message: error.message || "Failed to get timetable entries",
    });
  }
}


/*
|--------------------------------------------------------------------------
| UPDATE TIMETABLE ENTRY
|--------------------------------------------------------------------------
*/

async function updateTimetableEntry(req, res) {
  try {
    const { entryId } = req.params;

    const entry =
      await timetableService.updateTimetableEntry(
        entryId,
        req.body
      );

    return res.status(200).json({
      message: "Timetable entry updated successfully",
      entry,
    });
  } catch (error) {
    console.error(error);

    return res.status(error.statusCode || 500).json({
      message: error.message || "Failed to update timetable entry",
    });
  }
}


/*
|--------------------------------------------------------------------------
| DELETE TIMETABLE ENTRY
|--------------------------------------------------------------------------
*/

async function deleteTimetableEntry(req, res) {
  try {
    const { entryId } = req.params;

    const result =
      await timetableService.deleteTimetableEntry(entryId);

    return res.status(200).json(result);
  } catch (error) {
    console.error(error);

    return res.status(error.statusCode || 500).json({
      message: error.message || "Failed to delete timetable entry",
    });
  }
}


module.exports = {
  createTimetable,
  getTimetables,
  createTimetableEntry,
  getTimetableEntries,
  updateTimetableEntry,
  deleteTimetableEntry,
};

