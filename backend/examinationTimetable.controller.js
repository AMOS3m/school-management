const examinationTimetableService = require("./examinationTimetable.service");


/*
|--------------------------------------------------------------------------
| CREATE EXAMINATION TIMETABLE
|--------------------------------------------------------------------------
*/

async function createExaminationTimetable(req, res) {
  try {
    const timetable =
      await examinationTimetableService.createExaminationTimetable(
        req.body
      );

    return res.status(201).json({
      message:
        "Examination timetable created successfully",
      timetable,
    });
  } catch (error) {
    console.error(error);

    return res.status(error.statusCode || 500).json({
      message:
        error.message ||
        "Failed to create examination timetable",
    });
  }
}


/*
|--------------------------------------------------------------------------
| GET ALL EXAMINATION TIMETABLES
|--------------------------------------------------------------------------
*/

async function getExaminationTimetables(req, res) {
  try {
    const timetables =
      await examinationTimetableService.getExaminationTimetables();

    return res.status(200).json({
      count: timetables.length,
      timetables,
    });
  } catch (error) {
    console.error(error);

    return res.status(error.statusCode || 500).json({
      message:
        error.message ||
        "Failed to get examination timetables",
    });
  }
}


/*
|--------------------------------------------------------------------------
| GET ONE EXAMINATION TIMETABLE
|--------------------------------------------------------------------------
*/

async function getExaminationTimetable(req, res) {
  try {
    const { id } = req.params;

    const timetable =
      await examinationTimetableService.getExaminationTimetable(
        id
      );

    return res.status(200).json({
      timetable,
    });
  } catch (error) {
    console.error(error);

    return res.status(error.statusCode || 500).json({
      message:
        error.message ||
        "Failed to get examination timetable",
    });
  }
}


/*
|--------------------------------------------------------------------------
| UPDATE EXAMINATION TIMETABLE
|--------------------------------------------------------------------------
*/

async function updateExaminationTimetable(req, res) {
  try {
    const { id } = req.params;

    const timetable =
      await examinationTimetableService.updateExaminationTimetable(
        id,
        req.body
      );

    return res.status(200).json({
      message:
        "Examination timetable updated successfully",
      timetable,
    });
  } catch (error) {
    console.error(error);

    return res.status(error.statusCode || 500).json({
      message:
        error.message ||
        "Failed to update examination timetable",
    });
  }
}


/*
|--------------------------------------------------------------------------
| DELETE EXAMINATION TIMETABLE
|--------------------------------------------------------------------------
*/

async function deleteExaminationTimetable(req, res) {
  try {
    const { id } = req.params;

    const result =
      await examinationTimetableService.deleteExaminationTimetable(
        id
      );

    return res.status(200).json(result);
  } catch (error) {
    console.error(error);

    return res.status(error.statusCode || 500).json({
      message:
        error.message ||
        "Failed to delete examination timetable",
    });
  }
}


/*
|--------------------------------------------------------------------------
| CREATE EXAMINATION ENTRY
|--------------------------------------------------------------------------
*/

async function createExaminationEntry(req, res) {
  try {
    const { id } = req.params;

    const entry =
      await examinationTimetableService.createExaminationEntry(
        {
          examinationTimetableId: id,
          ...req.body,
        }
      );

    return res.status(201).json({
      message:
        "Examination timetable entry created successfully",
      entry,
    });
  } catch (error) {
    console.error(error);

    return res.status(error.statusCode || 500).json({
      message:
        error.message ||
        "Failed to create examination timetable entry",
    });
  }
}


/*
|--------------------------------------------------------------------------
| GET EXAMINATION ENTRIES
|--------------------------------------------------------------------------
*/

async function getExaminationEntries(req, res) {
  try {
    const { id } = req.params;

    const entries =
      await examinationTimetableService.getExaminationEntries(
        id
      );

    return res.status(200).json({
      examinationTimetableId: id,
      count: entries.length,
      entries,
    });
  } catch (error) {
    console.error(error);

    return res.status(error.statusCode || 500).json({
      message:
        error.message ||
        "Failed to get examination timetable entries",
    });
  }
}


/*
|--------------------------------------------------------------------------
| UPDATE EXAMINATION ENTRY
|--------------------------------------------------------------------------
*/

async function updateExaminationEntry(req, res) {
  try {
    const { entryId } = req.params;

    const entry =
      await examinationTimetableService.updateExaminationEntry(
        entryId,
        req.body
      );

    return res.status(200).json({
      message:
        "Examination timetable entry updated successfully",
      entry,
    });
  } catch (error) {
    console.error(error);

    return res.status(error.statusCode || 500).json({
      message:
        error.message ||
        "Failed to update examination timetable entry",
    });
  }
}


/*
|--------------------------------------------------------------------------
| DELETE EXAMINATION ENTRY
|--------------------------------------------------------------------------
*/

async function deleteExaminationEntry(req, res) {
  try {
    const { entryId } = req.params;

    const result =
      await examinationTimetableService.deleteExaminationEntry(
        entryId
      );

    return res.status(200).json(result);
  } catch (error) {
    console.error(error);

    return res.status(error.statusCode || 500).json({
      message:
        error.message ||
        "Failed to delete examination timetable entry",
    });
  }
}


module.exports = {
  createExaminationTimetable,
  getExaminationTimetables,
  getExaminationTimetable,
  updateExaminationTimetable,
  deleteExaminationTimetable,

  createExaminationEntry,
  getExaminationEntries,
  updateExaminationEntry,
  deleteExaminationEntry,
};