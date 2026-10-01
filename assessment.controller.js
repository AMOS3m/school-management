const assessmentService = require("./assessment.service");

/*
|--------------------------------------------------------------------------
| CREATE ASSESSMENT
|--------------------------------------------------------------------------
*/

async function createAssessment(req, res) {
  try {
    const {
      name,
      description,
      type,
      academicYearId,
      termId,
      gradeId,
      streamId,
      learningAreaId,
      assessmentDate,
      totalMarks,
    } = req.body;

    const assessment =
      await assessmentService.createAssessment({
        name,
        description,
        type,
        academicYearId,
        termId,
        gradeId,
        streamId,
        learningAreaId,
        userId: req.user.sub,
        assessmentDate,
        totalMarks,
      });

    res.status(201).json({
      message: "Assessment created successfully",
      assessment,
    });
  } catch (error) {
    console.error(error);

    res.status(error.statusCode || 500).json({
      message:
        error.message ||
        "Failed to create assessment",
    });
  }
}


/*
|--------------------------------------------------------------------------
| GET TEACHER ASSESSMENTS
|--------------------------------------------------------------------------
*/

async function getTeacherAssessments(req, res) {
  try {
    const assessments =
      await assessmentService.getTeacherAssessments(
        req.user.sub
      );

    res.status(200).json({
      message: "Teacher assessments retrieved successfully",
      assessments,
    });
  } catch (error) {
    console.error(error);

    res.status(error.statusCode || 500).json({
      message:
        error.message ||
        "Failed to retrieve assessments",
    });
  }
}


/*
|--------------------------------------------------------------------------
| GET ASSESSMENT BY ID
|--------------------------------------------------------------------------
*/

async function getAssessmentById(req, res) {
  try {
    const { assessmentId } = req.params;

    const assessment =
      await assessmentService.getAssessmentById({
        assessmentId,
        userId: req.user.sub,
      });

    res.status(200).json({
      message: "Assessment retrieved successfully",
      assessment,
    });
  } catch (error) {
    console.error(error);

    res.status(error.statusCode || 500).json({
      message:
        error.message ||
        "Failed to retrieve assessment",
    });
  }
}

/*
|--------------------------------------------------------------------------
| GET STUDENTS FOR ASSESSMENT
|--------------------------------------------------------------------------
*/

async function getAssessmentStudents(req, res) {
  try {
    const { assessmentId } = req.params;

    const students =
      await assessmentService.getAssessmentStudents({
        assessmentId,
        userId: req.user.sub,
      });

    res.status(200).json({
      message: "Assessment students retrieved successfully",
      students,
    });
  } catch (error) {
    console.error(error);

    res.status(error.statusCode || 500).json({
      message:
        error.message ||
        "Failed to retrieve assessment students",
    });
  }
}
/*
|--------------------------------------------------------------------------
| CREATE ASSESSMENT ITEM
|--------------------------------------------------------------------------
*/

async function createAssessmentItem(req, res) {
  try {
    const { assessmentId } = req.params;

    const {
      learningOutcomeId,
      questionNumber,
      description,
      maxMarks,
    } = req.body;

    const item =
      await assessmentService.createAssessmentItem({
        assessmentId,
        userId: req.user.sub,
        learningOutcomeId,
        questionNumber,
        description,
        maxMarks,
      });

    res.status(201).json({
      message: "Assessment item created successfully",
      item,
    });
  } catch (error) {
    console.error(error);

    res.status(error.statusCode || 500).json({
      message:
        error.message ||
        "Failed to create assessment item",
    });
  }
}


/*
|--------------------------------------------------------------------------
| RECORD ASSESSMENT RESULT
|--------------------------------------------------------------------------
*/

async function recordAssessmentResult(req, res) {
  try {
    const { assessmentId } = req.params;

    const {
      studentId,
      marks,
      performanceLevel,
      teacherComment,
    } = req.body;

    const result =
      await assessmentService.recordAssessmentResult({
        assessmentId,
        studentId,
        marks,
        performanceLevel,
        teacherComment,
        userId: req.user.sub,
      });

    res.status(201).json({
      message: "Assessment result recorded successfully",
      result,
    });
  } catch (error) {
    console.error(error);

    res.status(error.statusCode || 500).json({
      message:
        error.message ||
        "Failed to record assessment result",
    });
  }
}


/*
|--------------------------------------------------------------------------
| RECORD ASSESSMENT ITEM RESULT
|--------------------------------------------------------------------------
*/

async function recordAssessmentItemResult(req, res) {
  try {
    const { assessmentItemId } = req.params;

    const {
      studentId,
      marks,
      performanceLevel,
      comment,
    } = req.body;

    const result =
      await assessmentService.recordAssessmentItemResult({
        assessmentItemId,
        studentId,
        marks,
        performanceLevel,
        comment,
        userId: req.user.sub  ,
      });

    res.status(201).json({
      message:
        "Assessment item result recorded successfully",
      result,
    });
  } catch (error) {
    console.error(error);

    res.status(error.statusCode || 500).json({
      message:
        error.message ||
        "Failed to record assessment item result",
    });
  }
}


/*
|--------------------------------------------------------------------------
| PUBLISH ASSESSMENT
|--------------------------------------------------------------------------
*/

async function publishAssessment(req, res) {
  try {
    const { assessmentId } = req.params;

    const assessment =
      await assessmentService.publishAssessment({
        assessmentId,
        userId: req.user.sub  ,
      });

    res.status(200).json({
      message: "Assessment published successfully",
      assessment,
    });
  } catch (error) {
    console.error(error);

    res.status(error.statusCode || 500).json({
      message:
        error.message ||
        "Failed to publish assessment",
    });
  }
}


/*
|--------------------------------------------------------------------------
| INCLUDE / EXCLUDE FROM REPORT CARD
|--------------------------------------------------------------------------
*/

async function setIncludeInReportCard(req, res) {
  try {
    const { assessmentId } = req.params;

    const { includeInReportCard } = req.body;

    const assessment =
      await assessmentService.setIncludeInReportCard({
        assessmentId,
        includeInReportCard,
        userId: req.user.sub,
      });

    res.status(200).json({
      message: includeInReportCard
        ? "Assessment included in report card"
        : "Assessment excluded from report card",
      assessment,
    });
  } catch (error) {
    console.error(error);

    res.status(error.statusCode || 500).json({
      message:
        error.message ||
        "Failed to update report card inclusion",
    });
  }
}


/*
|--------------------------------------------------------------------------
| EXPORTS
|--------------------------------------------------------------------------
*/

module.exports = {
  createAssessment,
  getTeacherAssessments,
  getAssessmentById,
  getAssessmentStudents,
  createAssessmentItem,
  recordAssessmentResult,
  recordAssessmentItemResult,
  publishAssessment,
  setIncludeInReportCard,
};