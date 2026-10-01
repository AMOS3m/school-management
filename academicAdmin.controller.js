
const academicAdminService = require("./academicAdmin.service");



async function getAcademicDashboard(req, res, next) {
  try {

    const dashboard =
      await academicAdminService.getAcademicDashboard();

    return res.status(200).json({

      success: true,

      message:
        "Academic dashboard retrieved successfully",

      data: dashboard,

    });

  } catch (error) {

    next(error);

  }
}



/*
|--------------------------------------------------------------------------
| GET ACADEMIC OVERVIEW
|--------------------------------------------------------------------------
|
| GET /academic-admin/overview
|
| Returns summary counts for the Academic Admin dashboard.
|
|--------------------------------------------------------------------------
*/

async function getAcademicOverview(req, res, next) {
  try {

    const overview =
      await academicAdminService.getAcademicOverview();

    return res.status(200).json({

      success: true,

      message:
        "Academic overview retrieved successfully",

      data: overview,

    });

  } catch (error) {

    next(error);

  }
}


async function getPendingAssessmentReviews(
  req,
  res,
  next
) {

  try {

    const {
      academicYearId,
      termId,
      gradeId,
      streamId,
    } = req.query;


    const assessments =
      await academicAdminService
        .getPendingAssessmentReviews({

          academicYearId:
            academicYearId || undefined,

          termId:
            termId || undefined,

          gradeId:
            gradeId || undefined,

          streamId:
            streamId || undefined,

        });


    return res.status(200).json({

      success: true,

      message:
        "Assessment reviews retrieved successfully",

      data: assessments,

    });

  } catch (error) {

    next(error);

  }

}



/*
|--------------------------------------------------------------------------
| GET REPORT CARD OVERVIEW
|--------------------------------------------------------------------------
|
| GET /academic-admin/report-cards
|
| Query parameters:
|
| academicYearId
| termId
| gradeId
| streamId
| status
|
| status:
|
| DRAFT
| PUBLISHED
|
|--------------------------------------------------------------------------
*/

async function getReportCardOverview(
  req,
  res,
  next
) {

  try {

    const {
      academicYearId,
      termId,
      gradeId,
      streamId,
      status,
    } = req.query;

    if (
      status &&
      !["DRAFT", "PUBLISHED"].includes(status)
    ) {

      return res.status(400).json({

        success: false,

        message:
          "status must be either DRAFT or PUBLISHED",

      });

    }


    const reportCards =
      await academicAdminService
        .getReportCardOverview({

          academicYearId:
            academicYearId || undefined,

          termId:
            termId || undefined,

          gradeId:
            gradeId || undefined,

          streamId:
            streamId || undefined,

          status:
            status || undefined,

        });


    return res.status(200).json({

      success: true,

      message:
        "Report card overview retrieved successfully",

      data: reportCards,

    });

  } catch (error) {

    next(error);

  }

}




/*
|--------------------------------------------------------------------------
| CREATE ACADEMIC YEAR
|--------------------------------------------------------------------------
*/

async function createAcademicYear(req, res, next) {
  try {
    const {
      name,
      startDate,
      endDate,
    } = req.body;

    if (!name || !startDate || !endDate) {
      return res.status(400).json({
        success: false,
        message:
          "name, startDate and endDate are required",
      });
    }

    const academicYear =
      await academicAdminService.createAcademicYear({
        name,
        startDate,
        endDate,
      });

    return res.status(201).json({
      success: true,
      message:
        "Academic year created successfully",
      data: academicYear,
    });
  } catch (error) {
    next(error);
  }
}


/*
|--------------------------------------------------------------------------
| GET ACADEMIC YEARS
|--------------------------------------------------------------------------
*/

async function getAcademicYears(req, res, next) {
  try {
    const academicYears =
      await academicAdminService.getAcademicYears();

    return res.status(200).json({
      success: true,
      data: academicYears,
    });
  } catch (error) {
    next(error);
  }
}


/*
|--------------------------------------------------------------------------
| UPDATE ACADEMIC YEAR
|--------------------------------------------------------------------------
*/

async function updateAcademicYear(req, res, next) {
  try {
    const { academicYearId } = req.params;

    const {
      name,
      startDate,
      endDate,
    } = req.body;

    if (!academicYearId) {
      return res.status(400).json({
        success: false,
        message:
          "academicYearId is required",
      });
    }

    const academicYear =
      await academicAdminService.updateAcademicYear(
        academicYearId,
        {
          name,
          startDate,
          endDate,
        }
      );

    return res.status(200).json({
      success: true,
      message:
        "Academic year updated successfully",
      data: academicYear,
    });
  } catch (error) {
    next(error);
  }
}


/*
|--------------------------------------------------------------------------
| CREATE TERM
|--------------------------------------------------------------------------
*/

async function createTerm(req, res, next) {
  try {
    const {
      academicYearId,
      termNumber,
      name,
      startDate,
      endDate,
    } = req.body;

    if (
      !academicYearId ||
      !termNumber ||
      !name ||
      !startDate ||
      !endDate
    ) {
      return res.status(400).json({
        success: false,
        message:
          "academicYearId, termNumber, name, startDate and endDate are required",
      });
    }

    const term =
      await academicAdminService.createTerm({
        academicYearId,
        termNumber,
        name,
        startDate,
        endDate,
      });

    return res.status(201).json({
      success: true,
      message:
        "Term created successfully",
      data: term,
    });
  } catch (error) {
    next(error);
  }
}


/*
|--------------------------------------------------------------------------
| GET TERMS
|--------------------------------------------------------------------------
*/

async function getTerms(req, res, next) {
  try {
    const {
      academicYearId,
    } = req.query;

    const terms =
      await academicAdminService.getTerms({
        academicYearId,
      });

    return res.status(200).json({
      success: true,
      data: terms,
    });
  } catch (error) {
    next(error);
  }
}


/*
|--------------------------------------------------------------------------
| UPDATE TERM
|--------------------------------------------------------------------------
*/

async function updateTerm(req, res, next) {
  try {
    const { termId } = req.params;

    const {
      termNumber,
      name,
      startDate,
      endDate,
    } = req.body;

    if (!termId) {
      return res.status(400).json({
        success: false,
        message:
          "termId is required",
      });
    }

    const term =
      await academicAdminService.updateTerm(
        termId,
        {
          termNumber,
          name,
          startDate,
          endDate,
        }
      );

    return res.status(200).json({
      success: true,
      message:
        "Term updated successfully",
      data: term,
    });
  } catch (error) {
    next(error);
  }
}

/*
|--------------------------------------------------------------------------
| EDUCATION LEVELS
|--------------------------------------------------------------------------
*/

async function createEducationLevel(req, res, next) {
  try {
    const { name, code } = req.body;

    if (!name) {
      return res.status(400).json({
        success: false,
        message: "name is required",
      });
    }

    const educationLevel =
      await academicAdminService.createEducationLevel({
        name,
        code,
      });

    return res.status(201).json({
      success: true,
      message: "Education level created successfully",
      data: educationLevel,
    });
  } catch (error) {
    next(error);
  }
}


async function getEducationLevels(req, res, next) {
  try {
    const educationLevels =
      await academicAdminService.getEducationLevels();

    return res.status(200).json({
      success: true,
      data: educationLevels,
    });
  } catch (error) {
    next(error);
  }
}


async function updateEducationLevel(req, res, next) {
  try {
    const { educationLevelId } = req.params;
    const { name, code } = req.body;

    if (!educationLevelId) {
      return res.status(400).json({
        success: false,
        message: "educationLevelId is required",
      });
    }

    const educationLevel =
      await academicAdminService.updateEducationLevel(
        educationLevelId,
        {
          name,
          code,
        }
      );

    return res.status(200).json({
      success: true,
      message: "Education level updated successfully",
      data: educationLevel,
    });
  } catch (error) {
    next(error);
  }
}


async function deleteEducationLevel(req, res, next) {
  try {
    const { educationLevelId } = req.params;

    if (!educationLevelId) {
      return res.status(400).json({
        success: false,
        message: "educationLevelId is required",
      });
    }

    const result =
      await academicAdminService.deleteEducationLevel(
        educationLevelId
      );

    return res.status(200).json({
      success: true,
      message: result.message,
    });
  } catch (error) {
    next(error);
  }
}


/*
|--------------------------------------------------------------------------
| CREATE GRADE
|--------------------------------------------------------------------------
*/

async function createGrade(req, res, next) {
  try {
    const {
      name,
      educationLevelId,
    } = req.body;

    if (!name || !educationLevelId) {
      return res.status(400).json({
        success: false,
        message:
          "name and educationLevelId are required",
      });
    }

    const grade =
      await academicAdminService.createGrade({
        name,
        educationLevelId,
      });

    return res.status(201).json({
      success: true,
      message:
        "Grade created successfully",
      data: grade,
    });
  } catch (error) {
    next(error);
  }
}


/*
|--------------------------------------------------------------------------
| GET GRADES
|--------------------------------------------------------------------------
*/

async function getGrades(req, res, next) {
  try {
    const grades =
      await academicAdminService.getGrades();

    return res.status(200).json({
      success: true,
      data: grades,
    });
  } catch (error) {
    next(error);
  }
}


/*
|--------------------------------------------------------------------------
| UPDATE GRADE
|--------------------------------------------------------------------------
*/

async function updateGrade(req, res, next) {
  try {
    const { gradeId } = req.params;

    const {
      name,
      educationLevelId,
    } = req.body;

    if (!gradeId) {
      return res.status(400).json({
        success: false,
        message:
          "gradeId is required",
      });
    }

    const grade =
      await academicAdminService.updateGrade(
        gradeId,
        {
          name,
          educationLevelId,
        }
      );

    return res.status(200).json({
      success: true,
      message:
        "Grade updated successfully",
      data: grade,
    });
  } catch (error) {
    next(error);
  }
}


/*
|--------------------------------------------------------------------------
| CREATE STREAM
|--------------------------------------------------------------------------
*/

async function createStream(req, res, next) {
  try {
    const {
      name,
      gradeId,
    } = req.body;

    if (!name || !gradeId) {
      return res.status(400).json({
        success: false,
        message:
          "name and gradeId are required",
      });
    }

    const stream =
      await academicAdminService.createStream({
        name,
        gradeId,
      });

    return res.status(201).json({
      success: true,
      message:
        "Stream created successfully",
      data: stream,
    });
  } catch (error) {
    next(error);
  }
}


/*
|--------------------------------------------------------------------------
| GET STREAMS
|--------------------------------------------------------------------------
*/

async function getStreams(req, res, next) {
  try {
    const {
      gradeId,
    } = req.query;

    const streams =
      await academicAdminService.getStreams({
        gradeId,
      });

    return res.status(200).json({
      success: true,
      data: streams,
    });
  } catch (error) {
    next(error);
  }
}


/*
|--------------------------------------------------------------------------
| UPDATE STREAM
|--------------------------------------------------------------------------
*/

async function updateStream(req, res, next) {
  try {
    const { streamId } = req.params;

    const {
      name,
      gradeId,
    } = req.body;

    if (!streamId) {
      return res.status(400).json({
        success: false,
        message:
          "streamId is required",
      });
    }

    const stream =
      await academicAdminService.updateStream(
        streamId,
        {
          name,
          gradeId,
        }
      );

    return res.status(200).json({
      success: true,
      message:
        "Stream updated successfully",
      data: stream,
    });
  } catch (error) {
    next(error);
  }
}


/*
|--------------------------------------------------------------------------
| CREATE LEARNING AREA
|--------------------------------------------------------------------------
*/

async function createLearningArea(req, res) {
  try {
    const {
      name,
      code,
      curriculumType,
      description,
    } = req.body;

    const learningArea =
      await academicAdminService.createLearningArea({
        name,
        code,
        curriculumType,
        description,
      });

    return res.status(201).json({
      message: "Learning area created successfully.",
      learningArea,
    });

  } catch (error) {
    console.error(
      "Create learning area error:",
      error
    );

    return res.status(
      error.statusCode || 500
    ).json({
      message:
        error.message ||
        "Failed to create learning area.",
    });
  }
}


/*
|--------------------------------------------------------------------------
| GET LEARNING AREAS
|--------------------------------------------------------------------------
*/

async function getLearningAreas(req, res) {
  try {
    const {
      curriculumType,
    } = req.query;

    const learningAreas =
      await academicAdminService.getLearningAreas({
        curriculumType,
      });

    return res.status(200).json({
      message:
        "Learning areas retrieved successfully.",
      learningAreas,
    });

  } catch (error) {
    console.error(
      "Get learning areas error:",
      error
    );

    return res.status(
      error.statusCode || 500
    ).json({
      message:
        error.message ||
        "Failed to retrieve learning areas.",
    });
  }
}




/*
|--------------------------------------------------------------------------
| EXPORTS
|--------------------------------------------------------------------------
*/

module.exports = {

  getAcademicDashboard,

  getAcademicOverview,

  getPendingAssessmentReviews,

  getReportCardOverview,

  createAcademicYear,

  getAcademicYears,

  updateAcademicYear,

  createTerm,

  getTerms,

  updateTerm,

  createEducationLevel,

  getEducationLevels,

  updateEducationLevel,

  deleteEducationLevel,

  createGrade,

  getGrades,

  updateGrade,

  createStream,

  getStreams,

  updateStream,

  createLearningArea,

  getLearningAreas,

};

