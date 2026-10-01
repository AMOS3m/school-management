
const express = require("express");

const router = express.Router();

const headInstitutionController = require("./headInstitution.controller");

const authenticate = require("../../middleware/auth.middleware");


router.get(
  "/dashboard",
  authenticate,
  headInstitutionController.getHeadInstitutionDashboard
);


/*
|--------------------------------------------------------------------------
| SCHOOL SUMMARY
|--------------------------------------------------------------------------
|
| GET /api/head-institution/school-summary
|
|--------------------------------------------------------------------------
*/

router.get(
  "/school-summary",
  authenticate,
  headInstitutionController.getSchoolSummary
);


/*
|--------------------------------------------------------------------------
| ACADEMIC PROGRESS
|--------------------------------------------------------------------------
|
| GET /api/head-institution/academic-progress
|
|--------------------------------------------------------------------------
*/

router.get(
  "/academic-progress",
  authenticate,
  headInstitutionController.getAcademicProgress
);


/*
|--------------------------------------------------------------------------
| EXPORT ROUTER
|--------------------------------------------------------------------------
*/

module.exports = router;

