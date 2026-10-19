
const classTeacherService = require("./classTeacher.service");


/*
|--------------------------------------------------------------------------
| GET CLASS TEACHER PROFILE
|--------------------------------------------------------------------------
*/

async function getClassTeacher(req, res, next) {
  try {
    const userId = req.user.id;

    const teacher =
      await classTeacherService.getClassTeacher(
        userId
      );

    return res.status(200).json({
      success: true,
      data: teacher,
    });
  } catch (error) {
    next(error);
  }
}


/*
|--------------------------------------------------------------------------
| GET CLASS TEACHER STUDENTS
|--------------------------------------------------------------------------
|
| GET /class-teacher/students
|
| Query:
|
| academicYearId
| termId
| gradeId
| streamId
|
*/

async function getClassTeacherStudents(
  req,
  res,
  next
) {
  try {
    const userId = req.user.id;

    const {
      academicYearId,
      termId,
      gradeId,
      streamId,
    } = req.query;

    const result =
      await classTeacherService.getClassTeacherStudents({
        userId,
        academicYearId,
        termId,
        gradeId,
        streamId,
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
| GET CLASS TEACHER REPORT CARDS
|--------------------------------------------------------------------------
*/

async function getClassTeacherReportCards(
  req,
  res,
  next
) {
  try {
    const userId = req.user.id;

    const {
      academicYearId,
      termId,
      gradeId,
      streamId,
    } = req.query;

    if (!academicYearId || !termId) {
      return res.status(400).json({
        success: false,
        message:
          "academicYearId and termId are required",
      });
    }

    const result =
      await classTeacherService.getClassTeacherReportCards({
        userId,
        academicYearId,
        termId,
        gradeId,
        streamId,
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
| GET SINGLE CLASS TEACHER REPORT CARD
|--------------------------------------------------------------------------
*/

async function getClassTeacherReportCard(
  req,
  res,
  next
) {
  try {
    const { reportCardId } = req.params;

    const userId = req.user.id;

    if (!reportCardId) {
      return res.status(400).json({
        success: false,
        message:
          "reportCardId is required",
      });
    }

    const reportCard =
      await classTeacherService.getClassTeacherReportCard({
        reportCardId,
        userId,
      });

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
| UPDATE CLASS TEACHER COMMENT
|--------------------------------------------------------------------------
|
| PATCH /class-teacher/report-cards/:reportCardId/comment
|
| Body:
|
| {
|   "comment": "The learner has shown..."
| }
|
*/

async function updateClassTeacherComment(
  req,
  res,
  next
) {
  try {
    const { reportCardId } = req.params;

    const { comment } = req.body;

    const userId = req.user.id;

    if (!reportCardId) {
      return res.status(400).json({
        success: false,
        message:
          "reportCardId is required",
      });
    }

    if (comment === undefined) {
      return res.status(400).json({
        success: false,
        message:
          "comment is required",
      });
    }

    const reportCard =
      await classTeacherService.updateClassTeacherComment({
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



async function assignClassTeacher(req, res, next) {
  try {
    const {
      teacherId,
      gradeId,
      streamId,
      academicYearId,
      termId,
    } = req.body;

    const userId = req.user.id;

    const assignment =
      await classTeacherService.assignClassTeacher({
        teacherId,
        gradeId,
        streamId,
        academicYearId,
        termId,
        userId,
      });

    return res.status(201).json({
      success: true,
      message: "Class teacher assigned successfully",
      data: assignment,
    });
  } catch (error) {
    next(error);
  }
}




async function getClassTeacherAssignments(req, res, next) {
  try {
    const {
      academicYearId,
      termId,
      gradeId,
      streamId,
      teacherId,
    } = req.query;

    const userId = req.user.id;

    const assignments =
      await classTeacherService.getClassTeacherAssignments({
        academicYearId,
        termId,
        gradeId,
        streamId,
        teacherId,
        userId,
      });

    return res.status(200).json({
      success: true,
      data: assignments,
    });
  } catch (error) {
    next(error);
  }
}


/*
|--------------------------------------------------------------------------
| UPDATE CLASS TEACHER ASSIGNMENT
|--------------------------------------------------------------------------
|
| Academic Admin can change the teacher, class, stream,
| academic year or term.
|
| PATCH /class-teachers/:assignmentId
|
|--------------------------------------------------------------------------
*/

async function updateClassTeacherAssignment(req, res, next) {
  try {
    const { assignmentId } = req.params;

    const {
      teacherId,
      gradeId,
      streamId,
      academicYearId,
      termId,
    } = req.body;

    const userId = req.user.id;

    if (!assignmentId) {
      return res.status(400).json({
        success: false,
        message: "assignmentId is required",
      });
    }

    const assignment =
      await classTeacherService.updateClassTeacherAssignment({
        assignmentId,
        teacherId,
        gradeId,
        streamId,
        academicYearId,
        termId,
        userId,
      });

    return res.status(200).json({
      success: true,
      message: "Class teacher assignment updated successfully",
      data: assignment,
    });
  } catch (error) {
    next(error);
  }
}



async function removeClassTeacherAssignment(req, res, next) {
  try {
    const { assignmentId } = req.params;

    const userId = req.user.id;

    if (!assignmentId) {
      return res.status(400).json({
        success: false,
        message: "assignmentId is required",
      });
    }

    const assignment =
      await classTeacherService.removeClassTeacherAssignment({
        assignmentId,
        userId,
      });

    return res.status(200).json({
      success: true,
      message: "Class teacher assignment removed successfully",
      data: assignment,
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getClassTeacher,
  getClassTeacherStudents,
  getClassTeacherReportCards,
  getClassTeacherReportCard,
  updateClassTeacherComment,
  assignClassTeacher,
  getClassTeacherAssignments,
  updateClassTeacherAssignment,
  removeClassTeacherAssignment,
};

