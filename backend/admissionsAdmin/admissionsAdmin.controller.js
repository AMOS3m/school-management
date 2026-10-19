const admissionsAdminService = require("./admissionsAdmin.service");


/*
|--------------------------------------------------------------------------
| GET ADMISSIONS DASHBOARD
|--------------------------------------------------------------------------
*/

async function getDashboard(req, res, next) {
  try {
    const data = await admissionsAdminService.getDashboard();

    res.json({
      success: true,
      data,
    });
  } catch (error) {
    next(error);
  }
}


/*
|--------------------------------------------------------------------------
| GET ALL STUDENTS
|--------------------------------------------------------------------------
|
| Query parameters:
|
| ?search=
| ?gradeId=
| ?streamId=
| ?academicYearId=
| ?isActive=true
|
|--------------------------------------------------------------------------
*/

async function getStudents(req, res, next) {
  try {
    const {
      search,
      gradeId,
      streamId,
      academicYearId,
      isActive,
    } = req.query;

    const students =
      await admissionsAdminService.getStudents({
        search,
        gradeId,
        streamId,
        academicYearId,
        isActive,
      });

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
|
| GET /admissions-admin/students/search?search=John
|
|--------------------------------------------------------------------------
*/

async function searchStudents(req, res, next) {
  try {
    const { search } = req.query;

    if (!search) {
      return res.status(400).json({
        success: false,
        message: "Search term is required",
      });
    }

    const students =
      await admissionsAdminService.searchStudents(search);

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
| GET STUDENT BY ID
|--------------------------------------------------------------------------
|
| Admissions Admin gets the complete admissions profile:
|
| - Student information
| - Parents
| - Enrollment history
| - Assessments
| - Assessment results
| - Report cards
| - Fee account
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
      await admissionsAdminService.getStudentById(
        studentId
      );

    if (!student) {
      return res.status(404).json({
        success: false,
        message: "Student not found",
      });
    }

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
| ADMIT STUDENT
|--------------------------------------------------------------------------
|
| Body:
|
| {
|   "student": {
|     "admissionNumber": "...",
|     "firstName": "...",
|     "middleName": "...",
|     "lastName": "...",
|     "dateOfBirth": "...",
|     "gender": "..."
|   },
|
|   "enrollment": {
|     "gradeId": "...",
|     "streamId": "...",
|     "academicYearId": "...",
|     "termId": "...",
|     "admissionDate": "..."
|   }
| }
|
|--------------------------------------------------------------------------
*/

async function admitStudent(req, res, next) {
  try {
    const {
      student,
      enrollment,
    } = req.body;

    if (!student) {
      return res.status(400).json({
        success: false,
        message: "student information is required",
      });
    }

    if (!student.admissionNumber) {
      return res.status(400).json({
        success: false,
        message: "admissionNumber is required",
      });
    }

    if (!student.firstName) {
      return res.status(400).json({
        success: false,
        message: "firstName is required",
      });
    }

    if (!student.lastName) {
      return res.status(400).json({
        success: false,
        message: "lastName is required",
      });
    }

    const createdById = req.user.id;

    const result =
      await admissionsAdminService.admitStudent({
        student,
        enrollment,
        createdById,
      });

    return res.status(201).json({
      success: true,
      message: "Student admitted successfully",
      data: result,
    });
  } catch (error) {
    next(error);
  }
}


/*
|--------------------------------------------------------------------------
| UPDATE STUDENT
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
      await admissionsAdminService.updateStudent(
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
| ENROLL STUDENT
|--------------------------------------------------------------------------
|
| Body:
|
| {
|   "gradeId": "...",
|   "streamId": "...",
|   "academicYearId": "...",
|   "termId": "...",
|   "admissionDate": "..."
| }
|
|--------------------------------------------------------------------------
*/

async function enrollStudent(req, res, next) {
  try {
    const { studentId } = req.params;

    const {
      gradeId,
      streamId,
      academicYearId,
      termId,
      admissionDate,
    } = req.body;

    if (!studentId) {
      return res.status(400).json({
        success: false,
        message: "studentId is required",
      });
    }

    if (!gradeId) {
      return res.status(400).json({
        success: false,
        message: "gradeId is required",
      });
    }

    if (!academicYearId) {
      return res.status(400).json({
        success: false,
        message: "academicYearId is required",
      });
    }

    const enrollment =
      await admissionsAdminService.enrollStudent({
        studentId,
        gradeId,
        streamId,
        academicYearId,
        termId,
        admissionDate,
      });

    return res.status(201).json({
      success: true,
      message: "Student enrolled successfully",
      data: enrollment,
    });
  } catch (error) {
    next(error);
  }
}


/*
|--------------------------------------------------------------------------
| UPDATE ENROLLMENT
|--------------------------------------------------------------------------
*/

async function updateEnrollment(req, res, next) {
  try {
    const { enrollmentId } = req.params;

    if (!enrollmentId) {
      return res.status(400).json({
        success: false,
        message: "enrollmentId is required",
      });
    }

    const enrollment =
      await admissionsAdminService.updateEnrollment(
        enrollmentId,
        req.body
      );

    return res.status(200).json({
      success: true,
      message: "Enrollment updated successfully",
      data: enrollment,
    });
  } catch (error) {
    next(error);
  }
}


/*
|--------------------------------------------------------------------------
| REMOVE / END ENROLLMENT
|--------------------------------------------------------------------------
|
| Body:
|
| {
|   "exitDate": "2026-08-26"
| }
|
|--------------------------------------------------------------------------
*/

async function removeEnrollment(req, res, next) {
  try {
    const { enrollmentId } = req.params;

    const { exitDate } = req.body;

    if (!enrollmentId) {
      return res.status(400).json({
        success: false,
        message: "enrollmentId is required",
      });
    }

    const enrollment =
      await admissionsAdminService.removeEnrollment(
        enrollmentId,
        exitDate
      );

    return res.status(200).json({
      success: true,
      message: "Enrollment ended successfully",
      data: enrollment,
    });
  } catch (error) {
    next(error);
  }
}


/*
|--------------------------------------------------------------------------
| CREATE PARENT ACCOUNT
|--------------------------------------------------------------------------
|
| Creates:
|
| 1. User
| 2. Parent profile
| 3. PARENT role
| 4. Student-parent relationship
|
|--------------------------------------------------------------------------
*/

async function createParentAccount(req, res, next) {
  try {
    const {
      firstName,
      middleName,
      lastName,
      email,
      phone,
      password,
      relationship,
      studentId,
      isPrimary,
    } = req.body;

    if (!firstName) {
      return res.status(400).json({
        success: false,
        message: "firstName is required",
      });
    }

    if (!lastName) {
      return res.status(400).json({
        success: false,
        message: "lastName is required",
      });
    }

    if (!email && !phone) {
      return res.status(400).json({
        success: false,
        message: "Email or phone is required",
      });
    }

    if (!password) {
      return res.status(400).json({
        success: false,
        message: "password is required",
      });
    }

    if (!studentId) {
      return res.status(400).json({
        success: false,
        message: "studentId is required",
      });
    }

    const result =
      await admissionsAdminService.createParentAccount({
        firstName,
        middleName,
        lastName,
        email,
        phone,
        password,
        relationship,
        studentId,
        isPrimary,
      });

    return res.status(201).json({
      success: true,
      message: "Parent account created successfully",
      data: result,
    });
  } catch (error) {
    next(error);
  }
}


/*
|--------------------------------------------------------------------------
| UPDATE PARENT-STUDENT LINK
|--------------------------------------------------------------------------
|
| Body:
|
| {
|   "relationship": "Mother",
|   "isPrimary": true
| }
|
|--------------------------------------------------------------------------
*/

async function updateParentStudentLink(req, res, next) {
  try {
    const {
      studentId,
      parentId,
    } = req.params;

    if (!studentId || !parentId) {
      return res.status(400).json({
        success: false,
        message:
          "studentId and parentId are required",
      });
    }

    const result =
      await admissionsAdminService.updateParentStudentLink(
        studentId,
        parentId,
        req.body
      );

    return res.status(200).json({
      success: true,
      message:
        "Parent-student relationship updated successfully",
      data: result,
    });
  } catch (error) {
    next(error);
  }
}


/*
|--------------------------------------------------------------------------
| REMOVE PARENT FROM STUDENT
|--------------------------------------------------------------------------
*/

async function removeParentFromStudent(req, res, next) {
  try {
    const {
      studentId,
      parentId,
    } = req.params;

    if (!studentId || !parentId) {
      return res.status(400).json({
        success: false,
        message:
          "studentId and parentId are required",
      });
    }

    const result =
      await admissionsAdminService.removeParentFromStudent(
        studentId,
        parentId
      );

    return res.status(200).json({
      success: true,
      message:
        "Parent removed from student successfully",
      data: result,
    });
  } catch (error) {
    next(error);
  }
}


/*
|--------------------------------------------------------------------------
| GET STUDENT PARENTS
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
      await admissionsAdminService.getStudentParents(
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
| EXPORTS
|--------------------------------------------------------------------------
*/

module.exports = {

  getDashboard,

  getStudents,

  searchStudents,

  getStudentById,

  admitStudent,

  updateStudent,

  enrollStudent,

  updateEnrollment,

  removeEnrollment,

  createParentAccount,

  updateParentStudentLink,

  removeParentFromStudent,

  getStudentParents,

};