

const attendanceService = require("./attendance.service");


/*
|--------------------------------------------------------------------------
| RECORD ATTENDANCE
|--------------------------------------------------------------------------
*/

async function recordAttendance(req, res) {
  try {
    const {
      studentId,
      academicYearId,
      termId,
      timetableEntryId,
      date,
      type,
      status,
      remarks,
    } = req.body;

    /*
     * IMPORTANT:
     * We get the user ID from the authenticated JWT.
     * The frontend should NOT be allowed to choose recordedById.
     */
    const recordedById = req.user.sub;

    const attendance =
      await attendanceService.recordAttendance({
        studentId,
        academicYearId,
        termId,
        timetableEntryId,
        date,
        type,
        status,
        remarks,
        recordedById,
      });

    res.status(201).json({
      message: "Attendance recorded successfully",
      attendance,
    });
  } catch (error) {
    console.error(error);

    res.status(error.statusCode || 500).json({
      message:
        error.message ||
        "Failed to record attendance",
    });
  }
}


/*
|--------------------------------------------------------------------------
| GET TEACHER TIMETABLE
|--------------------------------------------------------------------------
*/

async function getTeacherTimetable(req, res) {
  try {
    /*
     * The authenticated user's ID comes from JWT.
     */
    const userId = req.user.sub;

    const timetable =
      await attendanceService.getTeacherTimetable(userId);

    res.status(200).json({
      message: "Teacher timetable retrieved successfully",
      timetable,
    });
  } catch (error) {
    console.error(error);

    res.status(error.statusCode || 500).json({
      message:
        error.message ||
        "Failed to retrieve teacher timetable",
    });
  }
}




/*
|--------------------------------------------------------------------------
| GET TEACHER LEARNERS BY ACADEMIC YEAR / TERM / GRADE / STREAM
|--------------------------------------------------------------------------
*/

async function getTeacherLearners(req, res) {
  try {
    const {
      academicYearId,
      termId,
      gradeId,
      streamId,
    } = req.query;

    const userId = req.user.sub;

    const result =
      await attendanceService.getTeacherLearners({
        academicYearId,
        termId,
        gradeId,
        streamId,
        userId,
      });

    res.status(200).json({
      message: "Learners retrieved successfully",
      learners: result,
    });

  } catch (error) {
    console.error(error);

    res.status(error.statusCode || 500).json({
      message:
        error.message ||
        "Failed to retrieve learners",
    });
  }
}



async function getTeacherAttendanceHistory(req, res) {
  try {
    const {
      academicYearId,
      termId,
      gradeId,
      streamId,
    } = req.query;

    const userId = req.user.sub;

    const history =
      await attendanceService.getTeacherAttendanceHistory({
        userId,
        academicYearId,
        termId,
        gradeId,
        streamId,
      });

    res.status(200).json({
      message: "Teacher attendance history retrieved successfully",
      history,
    });
  } catch (error) {
    console.error(error);

    res.status(error.statusCode || 500).json({
      message:
        error.message ||
        "Failed to retrieve teacher attendance history",
    });
  }
}

/*
|--------------------------------------------------------------------------
| GET STUDENTS FOR TIMETABLE ENTRY
|--------------------------------------------------------------------------
*/

async function getStudentsForTimetableEntry(req, res) {
  try {
    const { timetableEntryId } = req.params;

    /*
     * Again, get the teacher/user from the JWT.
     * Do not accept userId from the frontend.
     */
    const userId = req.user.sub;

    const result =
      await attendanceService.getStudentsForTimetableEntry({
        timetableEntryId,
        userId,
      });

    res.status(200).json({
      message: "Students retrieved successfully",
      timetableEntry: result.timetableEntry,
      students: result.students,
    });
  } catch (error) {
    console.error(error);

    res.status(error.statusCode || 500).json({
      message:
        error.message ||
        "Failed to retrieve students",
    });
  }
}


/*
|--------------------------------------------------------------------------
| GET STUDENT ATTENDANCE
|--------------------------------------------------------------------------
*/

async function getStudentAttendance(req, res) {
  try {
    const { studentId } = req.params;

    const attendance =
      await attendanceService.getStudentAttendance(studentId);

    res.status(200).json({
      message: "Student attendance retrieved successfully",
      attendance,
    });
  } catch (error) {
    console.error(error);

    res.status(error.statusCode || 500).json({
      message:
        error.message ||
        "Failed to retrieve student attendance",
    });
  }
}


module.exports = {
  recordAttendance,
  getTeacherTimetable,
  getTeacherLearners,
  getTeacherAttendanceHistory,
  getStudentsForTimetableEntry,
  getStudentAttendance,
};

