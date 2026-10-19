
const studentService = require("./student.service");




async function getStudents(req, res, next) {
  try {
    const students = await studentService.getStudents();

    return res.status(200).json({
      success: true,
      data: students,
    });
  } catch (error) {
    next(error);
  }
}

/*
|--------------------------------------------------------------------------
| SEARCH STUDENTS
|--------------------------------------------------------------------------
| GET /api/students/search?search=John
|--------------------------------------------------------------------------
*/




/*
|--------------------------------------------------------------------------
| GET STUDENT BY ID
|--------------------------------------------------------------------------
|
| GET /students/:studentId
|
| Returns the complete individual student profile:
|
| - Personal details
| - Parents
| - Class / stream
| - Assessments
| - Assessment results
| - CBC learning outcomes
| - Report cards
| - Fees
|
|--------------------------------------------------------------------------
*/

async function getStudentById(req, res, next) {
  try {
    const { studentId } = req.params;

    if (!studentId) {
      return res.status(400).json({
        success: false,
        message: "studentId is required",
      });
    }

    const student =
      await studentService.getStudentById(studentId);

    return res.status(200).json({
      success: true,
      data: student,
    });
  } catch (error) {
    next(error);
  }
}


/*
|--------------------------------------------------------------------------
| CREATE STUDENT
|--------------------------------------------------------------------------
|
| POST /students
|
| The authenticated user becomes createdById.
|
|--------------------------------------------------------------------------
*/

async function createStudent(req, res, next) {
  try {
    const {
      admissionNumber,
      firstName,
      middleName,
      lastName,
      dateOfBirth,
      gender,
    } = req.body;

    if (
      !admissionNumber ||
      !firstName ||
      !lastName
    ) {
      return res.status(400).json({
        success: false,
        message:
          "admissionNumber, firstName and lastName are required",
      });
    }

    const createdById = req.user.id;

    const student =
      await studentService.createStudent(
        {
          admissionNumber,
          firstName,
          middleName,
          lastName,
          dateOfBirth,
          gender,
        },
        createdById
      );

    return res.status(201).json({
      success: true,
      message: "Student created successfully",
      data: student,
    });
  } catch (error) {
    next(error);
  }
}


/*
|--------------------------------------------------------------------------
| UPDATE STUDENT
|--------------------------------------------------------------------------
|
| PUT /students/:studentId
|
|--------------------------------------------------------------------------
*/

async function updateStudent(req, res, next) {
  try {
    const { studentId } = req.params;

    if (!studentId) {
      return res.status(400).json({
        success: false,
        message: "studentId is required",
      });
    }

    const student =
      await studentService.updateStudent(
        studentId,
        req.body
      );

    return res.status(200).json({
      success: true,
      message: "Student updated successfully",
      data: student,
    });
  } catch (error) {
    next(error);
  }
}


/*
|--------------------------------------------------------------------------
| DELETE STUDENT
|--------------------------------------------------------------------------
|
| DELETE /students/:studentId
|
| This should normally be restricted to authorized administrators.
|
|--------------------------------------------------------------------------
*/

async function deleteStudent(req, res, next) {
  try {
    const { studentId } = req.params;

    if (!studentId) {
      return res.status(400).json({
        success: false,
        message: "studentId is required",
      });
    }

    const student =
      await studentService.deleteStudent(studentId);

    return res.status(200).json({
      success: true,
      message: "Student deleted successfully",
      data: student,
    });
  } catch (error) {
    next(error);
  }
}


/*
|--------------------------------------------------------------------------
| GET STUDENT PARENTS
|--------------------------------------------------------------------------
|
| GET /students/:studentId/parents
|
|--------------------------------------------------------------------------
*/

async function getStudentParents(req, res, next) {
  try {
    const { studentId } = req.params;

    if (!studentId) {
      return res.status(400).json({
        success: false,
        message: "studentId is required",
      });
    }

    const parents =
      await studentService.getStudentParents(
        studentId
      );

    return res.status(200).json({
      success: true,
      data: parents,
    });
  } catch (error) {
    next(error);
  }
}


/*
|--------------------------------------------------------------------------
| GET STUDENT ASSESSMENTS
|--------------------------------------------------------------------------
|
| GET /students/:studentId/assessments
|
| Includes:
|
| - Assessment
| - Learning Area
| - Teacher
| - Marks
| - Performance Level
| - Learning Outcomes
| - Assessment Item Results
|
|--------------------------------------------------------------------------
*/

async function getStudentAssessments(req, res, next) {
  try {
    const { studentId } = req.params;

    if (!studentId) {
      return res.status(400).json({
        success: false,
        message: "studentId is required",
      });
    }

    const assessments =
      await studentService.getStudentAssessments(
        studentId
      );

    return res.status(200).json({
      success: true,
      data: assessments,
    });
  } catch (error) {
    next(error);
  }
}


/*
|--------------------------------------------------------------------------
| GET STUDENT REPORT CARDS
|--------------------------------------------------------------------------
|
| GET /students/:studentId/report-cards
|
|--------------------------------------------------------------------------
*/

async function getStudentReportCards(req, res, next) {
  try {
    const { studentId } = req.params;

    if (!studentId) {
      return res.status(400).json({
        success: false,
        message: "studentId is required",
      });
    }

    const reportCards =
      await studentService.getStudentReportCards(
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
| GET STUDENT FEES
|--------------------------------------------------------------------------
|
| GET /students/:studentId/fees
|
| Returns:
|
| - Fee charges
| - Payments
| - Adjustments
|
|--------------------------------------------------------------------------
*/

async function getStudentFees(req, res, next) {
  try {
    const { studentId } = req.params;

    if (!studentId) {
      return res.status(400).json({
        success: false,
        message: "studentId is required",
      });
    }

    const fees =
      await studentService.getStudentFees(
        studentId
      );

    return res.status(200).json({
      success: true,
      data: fees,
    });
  } catch (error) {
    next(error);
  }
}


/*
|--------------------------------------------------------------------------
| SEARCH STUDENTS
|--------------------------------------------------------------------------
| GET /api/students/search?search=John
|--------------------------------------------------------------------------
*/

async function searchStudents(req, res, next) {
  try {
    const { search } = req.query;

    if (!search || !search.trim()) {
      return res.status(400).json({
        success: false,
        message: "Search term is required",
      });
    }

    const students =
      await studentService.searchStudents(search);

    return res.status(200).json({
      success: true,
      count: students.length,
      data: students,
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
  getStudents,
  getStudentById,
  createStudent,
  updateStudent,
  deleteStudent,
  getStudentParents,
  getStudentAssessments,
  getStudentReportCards,
  getStudentFees,
  searchStudents,
};

