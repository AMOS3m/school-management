
const teacherTeachingAssignmentService = require(
  "./teacherTeachingAssignment.service"
);


/*
|--------------------------------------------------------------------------
| CREATE TEACHING ASSIGNMENT
|--------------------------------------------------------------------------
*/

async function createTeachingAssignment(
  req,
  res,
  next
) {
  try {
    const {
      teacherId,
      learningArea,
      gradeId,
      streamId,
    } = req.body;

    const assignment =
      await teacherTeachingAssignmentService.createTeachingAssignment({
        teacherId,
        learningArea,
        gradeId,
        streamId,
      });

    return res.status(201).json({
      success: true,
      message:
        "Teacher teaching assignment created successfully",
      data: assignment,
    });
  } catch (error) {
    next(error);
  }
}

/*
|--------------------------------------------------------------------------
| GET TEACHING ASSIGNMENTS
|--------------------------------------------------------------------------
*/

async function getTeachingAssignments(
  req,
  res,
  next
) {
  try {
    const {
      teacherId,
      learningAreaId,
      gradeId,
      streamId,
    } = req.query;

    const assignments =
      await teacherTeachingAssignmentService.getTeachingAssignments({
        teacherId,
        learningAreaId,
        gradeId,
        streamId,
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
| GET TEACHING ASSIGNMENT BY ID
|--------------------------------------------------------------------------
*/

async function getTeachingAssignmentById(
  req,
  res,
  next
) {
  try {
    const { assignmentId } = req.params;

    if (!assignmentId) {
      return res.status(400).json({
        success: false,
        message: "assignmentId is required",
      });
    }

    const assignment =
      await teacherTeachingAssignmentService.getTeachingAssignmentById(
        assignmentId
      );

    return res.status(200).json({
      success: true,
      data: assignment,
    });
  } catch (error) {
    next(error);
  }
}


/*
|--------------------------------------------------------------------------
| UPDATE TEACHING ASSIGNMENT
|--------------------------------------------------------------------------
*/

async function updateTeachingAssignment(
  req,
  res,
  next
) {
  try {
    const { assignmentId } = req.params;

    const {
      teacherId,
      learningArea,
      gradeId,
      streamId,
    } = req.body;

    if (!assignmentId) {
      return res.status(400).json({
        success: false,
        message: "assignmentId is required",
      });
    }

    const assignment =
      await teacherTeachingAssignmentService.updateTeachingAssignment({
        assignmentId,
        teacherId,
        learningArea,
        gradeId,
        streamId,
      });

    return res.status(200).json({
      success: true,
      message:
        "Teacher teaching assignment updated successfully",
      data: assignment,
    });
  } catch (error) {
    next(error);
  }
}
/*
|--------------------------------------------------------------------------
| REMOVE TEACHING ASSIGNMENT
|--------------------------------------------------------------------------
*/

async function removeTeachingAssignment(
  req,
  res,
  next
) {
  try {
    const { assignmentId } = req.params;

    if (!assignmentId) {
      return res.status(400).json({
        success: false,
        message: "assignmentId is required",
      });
    }

    const result =
      await teacherTeachingAssignmentService.removeTeachingAssignment(
        assignmentId
      );

    return res.status(200).json({
      success: true,
      message:
        "Teacher teaching assignment removed successfully",
      data: result,
    });
  } catch (error) {
    next(error);
  }
}


module.exports = {
  createTeachingAssignment,
  getTeachingAssignments,
  getTeachingAssignmentById,
  updateTeachingAssignment,
  removeTeachingAssignment,
};

