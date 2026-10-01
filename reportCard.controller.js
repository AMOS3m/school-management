
const reportCardService = require("./reportCard.service");


/*
|--------------------------------------------------------------------------
| GET REPORT-CARD ELIGIBLE ASSESSMENTS
|--------------------------------------------------------------------------
|
| Academic Admin uses this to see which published assessments have been
| included or excluded from the official report card.
|
| Query parameters:
|
| academicYearId
| termId
| gradeId
| streamId (optional)
|
|--------------------------------------------------------------------------
*/

async function getAssessmentReportCardControl(req, res, next) {
  try {
    const {
      academicYearId,
      termId,
      gradeId,
      streamId,
    } = req.query;

    if (
      !academicYearId ||
      !termId ||
      !gradeId
    ) {
      return res.status(400).json({
        success: false,
        message:
          "academicYearId, termId and gradeId are required",
      });
    }

    const result =
      await reportCardService.getAssessmentReportCardControl({
        academicYearId,
        termId,
        gradeId,
        streamId:
          streamId || undefined,
      });

    return res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
}


/*
|--------------------------------------------------------------------------
| GENERATE REPORT CARD
|--------------------------------------------------------------------------
|
| This generates a DRAFT report card.
|
| It does NOT publish the report card.
|
| Body:
|
| {
|   "studentId": "...",
|   "academicYearId": "...",
|   "termId": "..."
| }
|
|--------------------------------------------------------------------------
*/

async function generateReportCard(req, res, next) {
  try {
    const {
      studentId,
      academicYearId,
      termId,
    } = req.body;

    if (
      !studentId ||
      !academicYearId ||
      !termId
    ) {
      return res.status(400).json({
        success: false,
        message:
          "studentId, academicYearId and termId are required",
      });
    }

    const reportCard =
      await reportCardService.generateReportCard({
        studentId,
        academicYearId,
        termId,
      });

    return res.status(201).json({
      success: true,
      message:
        "Report card generated successfully",
      data: reportCard,
    });
  } catch (error) {
    next(error);
  }
}


/*
|--------------------------------------------------------------------------
| GET REPORT CARD BY ID
|--------------------------------------------------------------------------
*/

async function getReportCardById(req, res, next) {
  try {
    const { reportCardId } = req.params;

    if (!reportCardId) {
      return res.status(400).json({
        success: false,
        message:
          "reportCardId is required",
      });
    }

    const reportCard =
      await reportCardService.getReportCardById(
        reportCardId
      );

    return res.status(200).json({
      success: true,
      data: reportCard,
    });
  } catch (error) {
    next(error);
  }
}


/*
|--------------------------------------------------------------------------
| GET ALL REPORT CARDS FOR A STUDENT
|--------------------------------------------------------------------------
|
| Useful for the parent portal.
|
|--------------------------------------------------------------------------
*/

async function getStudentReportCards(req, res, next) {
  try {
    const { studentId } = req.params;

    if (!studentId) {
      return res.status(400).json({
        success: false,
        message:
          "studentId is required",
      });
    }

    const reportCards =
      await reportCardService.getStudentReportCards(
        studentId
      );

    return res.status(200).json({
      success: true,
      data: reportCards,
    });
  } catch (error) {
    next(error);
  }
}


/*
|--------------------------------------------------------------------------
| PUBLISH REPORT CARD
|--------------------------------------------------------------------------
|
| Academic Admin publishes the completed report card.
|
| POST /report-cards/:reportCardId/publish
|
|--------------------------------------------------------------------------
*/

async function publishReportCard(req, res, next) {
  try {
    const { reportCardId } = req.params;

    if (!reportCardId) {
      return res.status(400).json({
        success: false,
        message:
          "reportCardId is required",
      });
    }

    const reportCard =
      await reportCardService.publishReportCard(
        reportCardId
      );

    return res.status(200).json({
      success: true,
      message:
        "Report card published successfully",
      data: reportCard,
    });
  } catch (error) {
    next(error);
  }
}


/*
|--------------------------------------------------------------------------
| UPDATE REPORT CARD COMMENTS
|--------------------------------------------------------------------------
|
| Body:
|
| {
|   "classTeacherComment": "...",
|   "headTeacherComment": "..."
| }
|
|--------------------------------------------------------------------------
*/

async function updateReportCardComments(
  req,
  res,
  next
) {
  try {
    const { reportCardId } = req.params;

    const {
      classTeacherComment,
      headTeacherComment,
    } = req.body;

    if (!reportCardId) {
      return res.status(400).json({
        success: false,
        message:
          "reportCardId is required",
      });
    }

    /*
    |--------------------------------------------------------------------------
    | At least one comment must be supplied.
    |--------------------------------------------------------------------------
    */

    if (
      classTeacherComment === undefined &&
      headTeacherComment === undefined
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Provide classTeacherComment or headTeacherComment",
      });
    }

    const reportCard =
      await reportCardService.updateReportCardComments({
        reportCardId,

        classTeacherComment,

        headTeacherComment,
      });

    return res.status(200).json({
      success: true,
      message:
        "Report card comments updated successfully",
      data: reportCard,
    });
  } catch (error) {
    next(error);
  }
}

/*
|--------------------------------------------------------------------------
| UPDATE CLASS TEACHER COMMENT
|--------------------------------------------------------------------------
*/

async function updateClassTeacherComment(req, res, next) {
  try {
    const { reportCardId } = req.params;

    const { comment } = req.body;

    const userId = req.user.id;

    if (!reportCardId) {
      return res.status(400).json({
        success: false,
        message: "reportCardId is required",
      });
    }

    const reportCard =
      await reportCardService.updateClassTeacherComment({
        reportCardId,
        comment,
        userId,
      });

    return res.status(200).json({
      success: true,
      message:
        "Class teacher comment updated successfully",

      data: reportCard,
    });
  } catch (error) {
    next(error);
  }
}


/*
|--------------------------------------------------------------------------
| UPDATE HEAD OF INSTITUTION COMMENT
|--------------------------------------------------------------------------
*/

async function updateHeadTeacherComment(req, res, next) {
  try {
    const { reportCardId } = req.params;

    const { comment } = req.body;

    const userId = req.user.id;

    if (!reportCardId) {
      return res.status(400).json({
        success: false,
        message: "reportCardId is required",
      });
    }

    const reportCard =
      await reportCardService.updateHeadTeacherComment({
        reportCardId,
        comment,
        userId,
      });

    return res.status(200).json({
      success: true,
      message:
        "Head of Institution comment updated successfully",

      data: reportCard,
    });
  } catch (error) {
    next(error);
  }
}


/*
|--------------------------------------------------------------------------
| PUBLISH REPORT CARD
|--------------------------------------------------------------------------
*/

async function publishReportCard(req, res, next) {
  try {
    const { reportCardId } = req.params;

    const userId = req.user.id;

    if (!reportCardId) {
      return res.status(400).json({
        success: false,
        message: "reportCardId is required",
      });
    }

    const reportCard =
      await reportCardService.publishReportCard({
        reportCardId,
        userId,
      });

    return res.status(200).json({
      success: true,

      message:
        "Report card published successfully",

      data: reportCard,
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
  getAssessmentReportCardControl,

  generateReportCard,

  getReportCardById,

  getStudentReportCards,
  
  updateClassTeacherComment,
  
  updateHeadTeacherComment,

  publishReportCard,

  
};

