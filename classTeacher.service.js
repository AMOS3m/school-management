
const { prisma } = require("/prisma");


/*
|--------------------------------------------------------------------------
| GET CLASS TEACHER PROFILE
|--------------------------------------------------------------------------
|
| Finds the teacher profile belonging to the authenticated user.
|
*/

async function getClassTeacher(userId) {
  if (!userId) {
    const error = new Error("Authenticated user is required");
    error.statusCode = 401;
    throw error;
  }

  const teacher = await prisma.teacher.findUnique({
    where: {
      userId,
    },

    include: {
      user: true,
    },
  });

  if (!teacher) {
    const error = new Error("Teacher profile not found");
    error.statusCode = 404;
    throw error;
  }

  return teacher;
}


/*
|--------------------------------------------------------------------------
| GET CLASS TEACHER REPORT CARDS
|--------------------------------------------------------------------------
|
| Returns report cards for learners in classes/streams assigned to
| the authenticated teacher as class teacher.
|
| NOTE:
| This assumes the ClassTeacher model has:
|
| teacherId
| gradeId
| streamId
|
| We will create that model if it does not already exist.
|
*/

async function getClassTeacherReportCards({
  userId,
  academicYearId,
  termId,
  gradeId,
  streamId,
}) {
  const teacher = await getClassTeacher(userId);

  const assignments = await prisma.classTeacher.findMany({
    where: {
      teacherId: teacher.id,

      ...(academicYearId
        ? {
            academicYearId,
          }
        : {}),

      ...(termId
        ? {
            termId,
          }
        : {}),

      ...(gradeId
        ? {
            gradeId,
          }
        : {}),

      ...(streamId
        ? {
            streamId,
          }
        : {}),
    },

    include: {
      grade: true,
      stream: true,
      academicYear: true,
      term: true,
    },
  });

  if (assignments.length === 0) {
    const error = new Error(
      "You are not assigned as a class teacher for the requested class"
    );

    error.statusCode = 403;
    throw error;
  }

  const reportCards = await prisma.reportCard.
  findMany({
    where: {
      academicYearId:
        academicYearId || assignments[0].academicYearId,

      termId:
        termId || assignments[0].termId,

      student: {
        enrollments: {
          some: {
            gradeId:
              gradeId || assignments[0].gradeId,

            ...(streamId || assignments[0].streamId
              ? {
                  streamId:
                    streamId || assignments[0].streamId,
                }
              : {}),

            isActive: true,
          },
        },
      },
    },

    include: {
      student: true,

      academicYear: true,

      term: true,

      results: {
        include: {
          learningArea: true,
        },
      },
    },

    orderBy: {
      student: {
        lastName: "asc",
      },
    },
  });

  return {
    classTeacher: teacher,
    assignments,
    reportCards,
  };
}


/*
|--------------------------------------------------------------------------
| GET SINGLE REPORT CARD
|--------------------------------------------------------------------------
|
| The class teacher can only access a report card belonging to
| one of their assigned classes.
|
*/

async function getClassTeacherReportCard({
  reportCardId,
  userId,
}) {
  if (!reportCardId) {
    const error = new Error("reportCardId is required");
    error.statusCode = 400;
    throw error;
  }

  const teacher = await getClassTeacher(userId);

  const reportCard = await prisma.reportCard.findUnique({
    where: {
      id: reportCardId,
    },

    include: {
      student: {
        include: {
          enrollments: {
            include: {
              grade: true,
              stream: true,
              academicYear: true,
              term: true,
            },
          },
        },
      },

      academicYear: true,
      term: true,

      results: {
        include: {
          learningArea: true,
        },
      },
    },
  });

  if (!reportCard) {
    const error = new Error("Report card not found");
    error.statusCode = 404;
    throw error;
  }

  /*
  |--------------------------------------------------------------------------
  | Verify that this teacher is the class teacher
  |--------------------------------------------------------------------------
  */

  const assignment = await prisma.classTeacher.findFirst({
    where: {
      teacherId: teacher.id,
      academicYearId: reportCard.academicYearId,
      termId: reportCard.termId,

      gradeId: {
        in: reportCard.student.enrollments.map(
          (enrollment) => enrollment.gradeId
        ),
      },

      ...(reportCard.student.enrollments.some(
        (enrollment) => enrollment.streamId
      )
        ? {
            streamId: {
              in: reportCard.student.enrollments
                .filter(
                  (enrollment) => enrollment.streamId
                )
                .map(
                  (enrollment) =>
                    enrollment.streamId
                ),
            },
          }
        : {}),
    },
  });

  if (!assignment) {
    const error = new Error(
      "You are not the class teacher for this learner"
    );

    error.statusCode = 403;
    throw error;
  }

  return reportCard;
}


/*
|--------------------------------------------------------------------------
| UPDATE CLASS TEACHER COMMENT
|--------------------------------------------------------------------------
|
| This is the actual operation used by the report-card workflow.
|
*/

async function updateClassTeacherComment({
  reportCardId,
  comment,
  userId,
}) {
  if (!reportCardId) {
    const error = new Error("reportCardId is required");
    error.statusCode = 400;
    throw error;
  }

  if (comment === undefined) {
    const error = new Error("comment is required");
    error.statusCode = 400;
    throw error;
  }

  const teacher = await getClassTeacher(userId);

  const reportCard = await prisma.reportCard.findUnique({
    where: {
      id: reportCardId,
    },

    include: {
      student: {
        include: {
          enrollments: true,
        },
      },

      academicYear: true,
      term: true,
    },
  });

  if (!reportCard) {
    const error = new Error("Report card not found");
    error.statusCode = 404;
    throw error;
  }

  /*
  |--------------------------------------------------------------------------
  | Do not modify a published report card
  |--------------------------------------------------------------------------
  */

  if (reportCard.status === "PUBLISHED") {
    const error = new Error(
      "Published report cards cannot be modified"
    );

    error.statusCode = 400;
    throw error;
  }

  /*
  |--------------------------------------------------------------------------
  | Check whether teacher is assigned as class teacher
  |--------------------------------------------------------------------------
  */

  const assignment = await prisma.classTeacher.findFirst({
    where: {
      teacherId: teacher.id,

      academicYearId:
        reportCard.academicYearId,

      termId:
        reportCard.termId,

      gradeId: {
        in: reportCard.student.enrollments.map(
          (enrollment) => enrollment.gradeId
        ),
      },

      ...(reportCard.student.enrollments.some(
        (enrollment) => enrollment.streamId
      )
        ? {
            streamId: {
              in: reportCard.student.enrollments
                .filter(
                  (enrollment) => enrollment.streamId
                )
                .map(
                  (enrollment) =>
                    enrollment.streamId
                ),
            },
          }
        : {}),
    },
  });

  if (!assignment) {
    const error = new Error(
      "You are not the class teacher for this learner"
    );

    error.statusCode = 403;
    throw error;
  }

  /*
  |--------------------------------------------------------------------------
  | Update class teacher comment
  |--------------------------------------------------------------------------
  */

  return prisma.reportCard.update({
    where: {
      id: reportCardId,
    },

    data: {
      classTeacherComment:
        comment.trim() || null,
    },

    include: {
      student: true,
      academicYear: true,
      term: true,

      results: {
        include: {
          learningArea: true,
        },
      },
    },
  });
}


/*
|--------------------------------------------------------------------------
| GET CLASS TEACHER STUDENTS
|--------------------------------------------------------------------------
|
| Returns learners belonging to the teacher's assigned class.
|
*/

async function getClassTeacherStudents({
  userId,
  academicYearId,
  termId,
  gradeId,
  streamId,
}) {
  const teacher = await getClassTeacher(userId);

  const assignment = await prisma.classTeacher.findFirst({
    where: {
      teacherId: teacher.id,

      ...(academicYearId
        ? {
            academicYearId,
          }
        : {}),

      ...(termId
        ? {
            termId,
          }
        : {}),

      ...(gradeId
        ? {
            gradeId,
          }
        : {}),

      ...(streamId
        ? {
            streamId,
          }
        : {}),
    },

    include: {
      grade: true,
      stream: true,
      academicYear: true,
      term: true,
    },
  });

  if (!assignment) {
    const error = new Error(
      "You are not assigned as class teacher for this class"
    );

    error.statusCode = 403;
    throw error;
  }

  const students = await prisma.student.findMany({
    where: {
      enrollments: {
        some: {
          academicYearId:
            assignment.academicYearId,

          termId:
            assignment.termId,

          gradeId:
            assignment.gradeId,

          ...(assignment.streamId
            ? {
                streamId:
                  assignment.streamId,
              }
            : {}),

          isActive: true,
        },
      },
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
    assignment,
    students,
  };
}



async function verifyAcademicAdmin(userId) {
  if (!userId) {
    const error = new Error("Authenticated user is required");
    error.statusCode = 401;
    throw error;
  }

  const userRole = await prisma.userRole.findFirst({
    where: {
      userId,
      role: {
        code: "ACADEMIC_ADMIN",
      },
    },
    include: {
      role: true,
    },
  });

  if (!userRole) {
    const error = new Error(
      "Only the Academic Admin can manage class teacher assignments"
    );

    error.statusCode = 403;
    throw error;
  }

  return userRole;
}


/*
|--------------------------------------------------------------------------
| ASSIGN CLASS TEACHER
|--------------------------------------------------------------------------
|
| Academic Admin assigns a teacher to:
|
| Grade + optional Stream
|
| for a particular academic year and optionally a particular term.
|
|--------------------------------------------------------------------------
*/

async function assignClassTeacher({
  teacherId,
  gradeId,
  streamId,
  academicYearId,
  termId,
  userId,
}) {
  /*
  |--------------------------------------------------------------------------
  | Verify Academic Admin
  |--------------------------------------------------------------------------
  */

  await verifyAcademicAdmin(userId);


  /*
  |--------------------------------------------------------------------------
  | Validate required fields
  |--------------------------------------------------------------------------
  */

  if (
    !teacherId ||
    !gradeId ||
    !academicYearId
  ) {
    const error = new Error(
      "teacherId, gradeId and academicYearId are required"
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
      id: teacherId,
    },

    include: {
      user: true,
    },
  });

  if (!teacher) {
    const error = new Error("Teacher not found");

    error.statusCode = 404;
    throw error;
  }


  /*
  |--------------------------------------------------------------------------
  | Check grade
  |--------------------------------------------------------------------------
  */

  const grade = await prisma.grade.findUnique({
    where: {
      id: gradeId,
    },
  });

  if (!grade) {
    const error = new Error("Grade not found");

    error.statusCode = 404;
    throw error;
  }


  /*
  |--------------------------------------------------------------------------
  | Check stream
  |--------------------------------------------------------------------------
  */

  if (streamId) {
    const stream = await prisma.stream.findUnique({
      where: {
        id: streamId,
      },
    });

    if (!stream) {
      const error = new Error("Stream not found");

      error.statusCode = 404;
      throw error;
    }

    /*
    |--------------------------------------------------------------------------
    | Make sure stream belongs to the selected grade
    |--------------------------------------------------------------------------
    */

    if (stream.gradeId !== gradeId) {
      const error = new Error(
        "The selected stream does not belong to the selected grade"
      );

      error.statusCode = 400;
      throw error;
    }
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

    /*
    |--------------------------------------------------------------------------
    | Make sure term belongs to academic year
    |--------------------------------------------------------------------------
    */

    if (term.academicYearId !== academicYearId) {
      const error = new Error(
        "The selected term does not belong to the selected academic year"
      );

      error.statusCode = 400;
      throw error;
    }
  }


  /*
  |--------------------------------------------------------------------------
  | Prevent duplicate assignment
  |--------------------------------------------------------------------------
  |
  | Same teacher + same class + same academic period should not be duplicated.
  |
  |--------------------------------------------------------------------------
  */

  const existingAssignment =
    await prisma.classTeacher.findFirst({
      where: {
        teacherId,
        gradeId,
        streamId: streamId || null,
        academicYearId,
        termId: termId || null,
      },
    });

  if (existingAssignment) {
    const error = new Error(
      "This teacher is already assigned as class teacher for this class"
    );

    error.statusCode = 409;
    throw error;
  }


  /*
  |--------------------------------------------------------------------------
  | Prevent teacher from being class teacher for another class
  |--------------------------------------------------------------------------
  |
  | A teacher should not simultaneously be the class teacher of two
  | different classes during the same academic period.
  |
  |--------------------------------------------------------------------------
  */

  const conflictingAssignment =
    await prisma.classTeacher.findFirst({
      where: {
        teacherId,
        academicYearId,

        ...(termId
          ? {
              termId,
            }
          : {}),

        NOT: {
          gradeId,
          streamId: streamId || null,
        },
      },

      include: {
        grade: true,
        stream: true,
      },
    });

  if (conflictingAssignment) {
    const className = conflictingAssignment.stream
      ? `${conflictingAssignment.grade.name} - ${conflictingAssignment.stream.name}`
      : conflictingAssignment.grade.name;

    const error = new Error(
      `This teacher is already a class teacher for ${className}`
    );

    error.statusCode = 409;
    throw error;
  }


  /*
  |--------------------------------------------------------------------------
  | Create assignment
  |--------------------------------------------------------------------------
  */

  return prisma.classTeacher.create({
    data: {
      teacherId,
      gradeId,
      streamId: streamId || null,
      academicYearId,
      termId: termId || null,
    },

    include: {
      teacher: {
        include: {
          user: true,
        },
      },

      grade: true,

      stream: true,

      academicYear: true,

      term: true,
    },
  });
}


/*
|--------------------------------------------------------------------------
| GET CLASS TEACHER ASSIGNMENTS
|--------------------------------------------------------------------------
|
| Academic Admin can filter assignments by:
|
| academicYearId
| termId
| gradeId
| streamId
| teacherId
|
|--------------------------------------------------------------------------
*/

async function getClassTeacherAssignments({
  academicYearId,
  termId,
  gradeId,
  streamId,
  teacherId,
  userId,
}) {
  /*
  |--------------------------------------------------------------------------
  | Verify Academic Admin
  |--------------------------------------------------------------------------
  */

  await verifyAcademicAdmin(userId);


  /*
  |--------------------------------------------------------------------------
  | Build filters
  |--------------------------------------------------------------------------
  */

  const where = {};

  if (academicYearId) {
    where.academicYearId = academicYearId;
  }

  if (termId) {
    where.termId = termId;
  }

  if (gradeId) {
    where.gradeId = gradeId;
  }

  if (streamId) {
    where.streamId = streamId;
  }

  if (teacherId) {
    where.teacherId = teacherId;
  }


  /*
  |--------------------------------------------------------------------------
  | Get assignments
  |--------------------------------------------------------------------------
  */

  return prisma.classTeacher.findMany({
    where,

    include: {
      teacher: {
        include: {
          user: true,
        },
      },

      grade: true,

      stream: true,

      academicYear: true,

      term: true,
    },

    orderBy: [
      {
        academicYear: {
          startDate: "desc",
        },
      },
      {
        grade: {
          name: "asc",
        },
      },
    ],
  });
}


/*
|--------------------------------------------------------------------------
| UPDATE CLASS TEACHER ASSIGNMENT
|--------------------------------------------------------------------------
|
| Academic Admin can change:
|
| teacher
| grade
| stream
| academic year
| term
|
|--------------------------------------------------------------------------
*/

async function updateClassTeacherAssignment({
  assignmentId,
  teacherId,
  gradeId,
  streamId,
  academicYearId,
  termId,
  userId,
}) {
  /*
  |--------------------------------------------------------------------------
  | Verify Academic Admin
  |--------------------------------------------------------------------------
  */

  await verifyAcademicAdmin(userId);


  /*
  |--------------------------------------------------------------------------
  | Check assignment
  |--------------------------------------------------------------------------
  */

  const existingAssignment =
    await prisma.classTeacher.findUnique({
      where: {
        id: assignmentId,
      },
    });

  if (!existingAssignment) {
    const error = new Error(
      "Class teacher assignment not found"
    );

    error.statusCode = 404;
    throw error;
  }


  /*
  |--------------------------------------------------------------------------
  | Determine final values
  |--------------------------------------------------------------------------
  */

  const finalTeacherId =
    teacherId || existingAssignment.teacherId;

  const finalGradeId =
    gradeId || existingAssignment.gradeId;

  const finalAcademicYearId =
    academicYearId ||
    existingAssignment.academicYearId;

  const finalStreamId =
    streamId !== undefined
      ? streamId
      : existingAssignment.streamId;

  const finalTermId =
    termId !== undefined
      ? termId
      : existingAssignment.termId;


  /*
  |--------------------------------------------------------------------------
  | Check teacher
  |--------------------------------------------------------------------------
  */

  const teacher = await prisma.teacher.findUnique({
    where: {
      id: finalTeacherId,
    },
  });

  if (!teacher) {
    const error = new Error("Teacher not found");

    error.statusCode = 404;
    throw error;
  }


  /*
  |--------------------------------------------------------------------------
  | Check grade
  |--------------------------------------------------------------------------
  */

  const grade = await prisma.grade.findUnique({
    where: {
      id: finalGradeId,
    },
  });

  if (!grade) {
    const error = new Error("Grade not found");

    error.statusCode = 404;
    throw error;
  }


  /*
  |--------------------------------------------------------------------------
  | Check stream
  |--------------------------------------------------------------------------
  */

  if (finalStreamId) {
    const stream = await prisma.stream.findUnique({
      where: {
        id: finalStreamId,
      },
    });

    if (!stream) {
      const error = new Error("Stream not found");

      error.statusCode = 404;
      throw error;
    }

    if (stream.gradeId !== finalGradeId) {
      const error = new Error(
        "The selected stream does not belong to the selected grade"
      );

      error.statusCode = 400;
      throw error;
    }
  }


  /*
  |--------------------------------------------------------------------------
  | Check academic year
  |--------------------------------------------------------------------------
  */

  const academicYear =
    await prisma.academicYear.findUnique({
      where: {
        id: finalAcademicYearId,
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

  if (finalTermId) {
    const term = await prisma.term.findUnique({
      where: {
        id: finalTermId,
      },
    });

    if (!term) {
      const error = new Error("Term not found");

      error.statusCode = 404;
      throw error;
    }

    if (term.academicYearId !== finalAcademicYearId) {
      const error = new Error(
        "The selected term does not belong to the selected academic year"
      );

      error.statusCode = 400;
      throw error;
    }
  }


  /*
  |--------------------------------------------------------------------------
  | Check for conflicting assignment
  |--------------------------------------------------------------------------
  */

  const conflictingAssignment =
    await prisma.classTeacher.findFirst({
      where: {
        teacherId: finalTeacherId,
        academicYearId: finalAcademicYearId,

        ...(finalTermId
          ? {
              termId: finalTermId,
            }
          : {}),

        NOT: {
          id: assignmentId,
        },
      },

      include: {
        grade: true,
        stream: true,
      },
    });

  if (conflictingAssignment) {
    const className = conflictingAssignment.stream
      ? `${conflictingAssignment.grade.name} - ${conflictingAssignment.stream.name}`
      : conflictingAssignment.grade.name;

    const error = new Error(
      `This teacher is already assigned as class teacher for ${className}`
    );

    error.statusCode = 409;
    throw error;
  }


  /*
  |--------------------------------------------------------------------------
  | Update assignment
  |--------------------------------------------------------------------------
  */

  return prisma.classTeacher.update({
    where: {
      id: assignmentId,
    },

    data: {
      teacherId: finalTeacherId,
      gradeId: finalGradeId,
      streamId: finalStreamId || null,
      academicYearId: finalAcademicYearId,
      termId: finalTermId || null,
    },

    include: {
      teacher: {
        include: {
          user: true,
        },
      },

      grade: true,

      stream: true,

      academicYear: true,

      term: true,
    },
  });
}


/*
|--------------------------------------------------------------------------
| REMOVE CLASS TEACHER ASSIGNMENT
|--------------------------------------------------------------------------
|
| Removing the assignment does NOT delete the teacher, student, report card,
| or historical data. It only removes the class-teacher relationship.
|
|--------------------------------------------------------------------------
*/

async function removeClassTeacherAssignment({
  assignmentId,
  userId,
}) {
  /*
  |--------------------------------------------------------------------------
  | Verify Academic Admin
  |--------------------------------------------------------------------------
  */

  await verifyAcademicAdmin(userId);


  /*
  |--------------------------------------------------------------------------
  | Check assignment
  |--------------------------------------------------------------------------
  */

  const assignment =
    await prisma.classTeacher.findUnique({
      where: {
        id: assignmentId,
      },

      include: {
        teacher: {
          include: {
            user: true,
          },
        },

        grade: true,

        stream: true,

        academicYear: true,

        term: true,
      },
    });

  if (!assignment) {
    const error = new Error(
      "Class teacher assignment not found"
    );

    error.statusCode = 404;
    throw error;
  }


  /*
  |--------------------------------------------------------------------------
  | Delete assignment
  |--------------------------------------------------------------------------
  */

  await prisma.classTeacher.delete({
    where: {
      id: assignmentId,
    },
  });


  return assignment;
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

