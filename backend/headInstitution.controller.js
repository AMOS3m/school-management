
const headInstitutionService = require("./headInstitution.service");


async function getHeadInstitutionDashboard(req, res, next) {
  try {
    const dashboard =
      await headInstitutionService.getHeadInstitutionDashboard();

    return res.status(200).json({
      success: true,
      message: "Head of Institution dashboard retrieved successfully",
      data: dashboard,
    });
  } catch (error) {
    next(error);
  }
}


/*
|--------------------------------------------------------------------------
| GET SCHOOL SUMMARY
|--------------------------------------------------------------------------
|
| Returns the main school-level statistics.
|
| GET /api/head-institution/school-summary
|
|--------------------------------------------------------------------------
*/

async function getSchoolSummary(req, res, next) {
  try {
    const summary =
      await headInstitutionService.getSchoolSummary();

    return res.status(200).json({
      success: true,
      message: "School summary retrieved successfully",
      data: summary,
    });
  } catch (error) {
    next(error);
  }
}


/*
|--------------------------------------------------------------------------
| GET ACADEMIC PROGRESS
|--------------------------------------------------------------------------
|
| Returns academic progress information for the school.
|
| GET /api/head-institution/academic-progress
|
|--------------------------------------------------------------------------
*/

async function getAcademicProgress(req, res, next) {
  try {
    const progress =
      await headInstitutionService.getAcademicProgress();

    return res.status(200).json({
      success: true,
      message: "Academic progress retrieved successfully",
      data: progress,
    });
  } catch (error) {
    next(error);
  }
}


/*
|--------------------------------------------------------------------------
| EXPORTS
|--------------------------------------------------------------------------
*/

module.exports = {
  getHeadInstitutionDashboard,
  getSchoolSummary,
  getAcademicProgress,
};


