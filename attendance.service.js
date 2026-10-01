
const  prisma  = require("../../lib/prisma");


/*
|--------------------------------------------------------------------------
| RECORD ATTENDANCE
|--------------------------------------------------------------------------
*/

async function recordAttendance({
  studentId,
  academicYearId,
  termId,
  timetableEntryId,
  date,
  type,
  status,
  remarks,
  recordedById,
}) {
  /*
  |--------------------------------------------------------------------------
  | Required fields
  |--------------------------------------------------------------------------
  */

  if (
    !studentId ||
    !academicYearId ||
    !date ||
    !type ||
    !status ||
    !recordedById
  ) {
    const error = new Error(
      "studentId, academicYearId, date, type, status and recordedById are required"
    );

    error.statusCode = 400;
    throw error;
  }


  /*
  |--------------------------------------------------------------------------
  | Check student
  |--------------------------------------------------------------------------
  */

  const student = await prisma.student.findUnique({
    where: {
      id: studentId,
    },
  });

  if (!student) {
    const error = new Error("Student not found");

    error.statusCode = 404;
    throw error;
  }


  /*
  |--------------------------------------------------------------------------
  | Check academic year
  |--------------------------------------------------------------------------
  */

  const academicYear = await prisma.academicYear.findUnique({
    where: {
      id: academicYearId,
    },
  });

  if (!academicYear) {
    const error = new Error("Academic year not found");

    error.statusCode = 404;
    throw error;
  }


  /*
  |--------------------------------------------------------------------------
  | Check term
  |--------------------------------------------------------------------------
  */

  if (termId) {
    const term = await prisma.term.findUnique({
      where: {
        id: termId,
      },
    });

    if (!term) {
      const error = new Error("Term not found");

      error.statusCode = 404;
      throw error;
    }
  }


  /*
  |--------------------------------------------------------------------------
  | Check timetable entry
  |--------------------------------------------------------------------------
  */

  let timetableEntry = null;

  if (timetableEntryId) {
    timetableEntry = await prisma.timetableEntry.findUnique({
      where: {
        id: timetableEntryId,
      },
      include: {
        teacher: true,
        grade: true,
        stream: true,
        learningArea: true,
      },
    });

    if (!timetableEntry) {
      const error = new Error("Timetable entry not found");

      error.statusCode = 404;
      throw error;
    }
  }


  /*
  |--------------------------------------------------------------------------
  | Verify teacher can record attendance for this lesson
  |--------------------------------------------------------------------------
  */

  if (timetableEntry) {
    if (timetableEntry.teacher.userId !== recordedById) {
      const error = new Error(
        "You are not the teacher assigned to this timetable entry"
      );

      error.statusCode = 403;
      throw error;
    }
  }


  /*
  |--------------------------------------------------------------------------
  | Check duplicate attendance
  |--------------------------------------------------------------------------
  */

  const attendanceDate = new Date(date);

  const startOfDay = new Date(attendanceDate);
  startOfDay.setHours(0, 0, 0, 0);

  const endOfDay = new Date(attendanceDate);
  endOfDay.setHours(23, 59, 59, 999);


  const existingAttendance = await prisma.attendance.findFirst({
    where: {
      studentId,
      timetableEntryId: timetableEntryId || null,
      date: {
        gte: startOfDay,
        lte: endOfDay,
      },
    },
  });


  if (existingAttendance) {
    const error = new Error(
      "Attendance has already been recorded for this student"
    );

    error.statusCode = 409;
    throw error;
  }


  /*
  |--------------------------------------------------------------------------
  | Create attendance
  |--------------------------------------------------------------------------
  */

  return prisma.attendance.create({
    data: {
      studentId,
      academicYearId,
      termId: termId || null,
      timetableEntryId: timetableEntryId || null,
      date: attendanceDate,
      type,
      status,
      remarks: remarks || null,
      recordedById,
    },
    include: {
      student: true,
      academicYear: true,
      term: true,
      timetableEntry: {
        include: {
          teacher: true,
          grade: true,
          stream: true,
          learningArea: true,
        },
      },
      recordedBy: true,
    },
  });
}


/*
|--------------------------------------------------------------------------
| GET STUDENT ATTENDANCE
|--------------------------------------------------------------------------
*/

async function getStudentAttendance(studentId) {
  const student = await prisma.student.findUnique({
    where: {
      id: studentId,
    },
  });

  if (!student) {
    const error = new Error("Student not found");

    error.statusCode = 404;
    throw error;
  }

  return prisma.attendance.findMany({
    where: {
      studentId,
    },
    include: {
      academicYear: true,
      term: true,
      timetableEntry: {
        include: {
          teacher: true,
          grade: true,
          stream: true,
          learningArea: true,
        },
      },
    },
    orderBy: {
      date: "desc",
    },
  });
}

async function getTeacherTimetable(userId) {
  const teacher = await prisma.teacher.findUnique({
    where: {
      userId,
    },
  });

  if (!teacher) {
    const error = new Error("Teacher profile not found");
    error.statusCode = 404;
    throw error;
  }

  return prisma.timetableEntry.findMany({
    where: {
      teacherId: teacher.id,
    },
    include: {
      timetable: {
        include: {
          academicYear: true,
          term: true,
        },
      },
      grade: true,
      stream: true,
      learningArea: true,
    },
    orderBy: [
      {
        dayOfWeek: "asc",
      },
      {
        startTime: "asc",
      },
    ],
  });
}


/*
|--------------------------------------------------------------------------
| GET TEACHER LEARNERS
|--------------------------------------------------------------------------
*/

async function getTeacherLearners({
  academicYearId,
  termId,
  gradeId,
  streamId,
  userId,
}) {

  if (
    !academicYearId ||
    !termId ||
    !gradeId ||
    !streamId
  ) {
    const error = new Error(
      "academicYearId, termId, gradeId and streamId are required"
    );

    error.statusCode = 400;
    throw error;
  }


  /*
  |--------------------------------------------------------------------------
  | Check teacher
  |--------------------------------------------------------------------------
  */

  const teacher = await prisma.teacher.findUnique({
    where: {
      userId,
    },
  });

  if (!teacher) {
    const error = new Error(
      "Teacher profile not found"
    );

    error.statusCode = 404;
    throw error;
  }


  /*
  |--------------------------------------------------------------------------
  | Check academic year
  |--------------------------------------------------------------------------
  */

  const academicYear =
    await prisma.academicYear.findUnique({
      where: {
        id: academicYearId,
      },
    });

  if (!academicYear) {
    const error = new Error(
      "Academic year not found"
    );

    error.statusCode = 404;
    throw error;
  }


  /*
  |--------------------------------------------------------------------------
  | Check term
  |--------------------------------------------------------------------------
  */

  const term =
    await prisma.term.findUnique({
      where: {
        id: termId,
      },
    });

  if (!term) {
    const error = new Error(
      "Term not found"
    );

    error.statusCode = 404;
    throw error;
  }


  /*
  |--------------------------------------------------------------------------
  | Check grade
  |--------------------------------------------------------------------------
  */

  const grade =
    await prisma.grade.findUnique({
      where: {
        id: gradeId,
      },
    });

  if (!grade) {
    const error = new Error(
      "Grade not found"
    );

    error.statusCode = 404;
    throw error;
  }


  /*
  |--------------------------------------------------------------------------
  | Check stream
  |--------------------------------------------------------------------------
  */

  const stream =
    await prisma.stream.findUnique({
      where: {
        id: streamId,
      },
    });

  if (!stream) {
    const error = new Error(
      "Stream not found"
    );

    error.statusCode = 404;
    throw error;
  }


  /*
  |--------------------------------------------------------------------------
  | Make sure stream belongs to selected grade
  |--------------------------------------------------------------------------
  */

  if (stream.gradeId !== gradeId) {
    const error = new Error(
      "Selected stream does not belong to the selected grade"
    );

    error.statusCode = 400;
    throw error;
  }


  /*
  |--------------------------------------------------------------------------
  | Find learners through StudentEnrollment
  |--------------------------------------------------------------------------
  |
  | This is important because Student does NOT contain gradeId
  | or streamId in your Prisma schema.
  |
  */

  const enrollments =
    await prisma.studentEnrollment.findMany({

      where: {
        academicYearId,
        termId,
        gradeId,
        streamId,
        isActive: true,
      },

      include: {
        student: true,
        grade: true,
        stream: true,
      },

      orderBy: {
        student: {
          lastName: "asc",
        },
      },
    });


  /*
  |--------------------------------------------------------------------------
  | Return learners
  |--------------------------------------------------------------------------
  */

  return enrollments.map(enrollment => ({
    enrollmentId: enrollment.id,

    student: enrollment.student,

    grade: enrollment.grade,

    stream: enrollment.stream,
  }));
}


async function getTeacherAttendanceHistory({
  userId,
  academicYearId,
  termId,
  gradeId,
  streamId,
}) {
  /*
  |--------------------------------------------------------------------------
  | Find teacher
  |--------------------------------------------------------------------------
  */

  const teacher = await prisma.teacher.findUnique({
    where: {
      userId,
    },
  });

  if (!teacher) {
    const error = new Error(
      "Teacher profile not found"
    );

    error.statusCode = 404;
    throw error;
  }

  /*
  |--------------------------------------------------------------------------
  | Build filters
  |--------------------------------------------------------------------------
  */

  const where = {
    recordedById: userId,
  };

  if (academicYearId) {
    where.academicYearId = academicYearId;
  }

  if (termId) {
    where.termId = termId;
  }

  /*
  |--------------------------------------------------------------------------
  | Filter by learner enrollment
  |--------------------------------------------------------------------------
  */

  if (gradeId || streamId) {
    where.student = {
      enrollments: {
        some: {
          ...(academicYearId
            ? { academicYearId }
            : {}),

          ...(termId
            ? { termId }
            : {}),

          ...(gradeId
            ? { gradeId }
            : {}),

          ...(streamId
            ? { streamId }
            : {}),

          isActive: true,
        },
      },
    };
  }

  /*
  |--------------------------------------------------------------------------
  | Retrieve attendance
  |--------------------------------------------------------------------------
  */

  const attendance =
    await prisma.attendance.findMany({
      where,

      include: {
        student: true,

        academicYear: true,

        term: true,

        timetableEntry: {
          include: {
            teacher: true,
            grade: true,
            stream: true,
            learningArea: true,
          },
        },

        recordedBy: true,
      },

      orderBy: [
        {
          date: "desc",
        },
      ],
    });

  return attendance;
}


async function getStudentsForTimetableEntry({
  timetableEntryId,
  userId,
}) {
  const teacher = await prisma.teacher.findUnique({
    where: {
      userId,
    },
  });

  if (!teacher) {
    const error = new Error("Teacher profile not found");
    error.statusCode = 404;
    throw error;
  }

  const timetableEntry =
    await prisma.timetableEntry.findUnique({
      where: {
        id: timetableEntryId,
      },
      include: {
        grade: true,
        stream: true,
        teacher: true,
        learningArea: true,
      },
    });

  if (!timetableEntry) {
    const error = new Error("Timetable entry not found");
    error.statusCode = 404;
    throw error;
  }

  if (timetableEntry.teacherId !== teacher.id) {
    const error = new Error(
      "You are not assigned to this timetable entry"
    );

    error.statusCode = 403;
    throw error;
  }

  const students = await prisma.student.findMany({
    where: {
      gradeId: timetableEntry.gradeId,

      ...(timetableEntry.streamId
        ? {
            streamId: timetableEntry.streamId,
          }
        : {}),
    },

    orderBy: [
      {
        lastName: "asc",
      },
      {
        firstName: "asc",
      },
    ],
  });

  return {
    timetableEntry,
    students,
  };
}


module.exports = {
  recordAttendance,
  getStudentAttendance,
  getTeacherTimetable,
  getTeacherLearners,
  getTeacherAttendanceHistory,
  getStudentsForTimetableEntry,
};

