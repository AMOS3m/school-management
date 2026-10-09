const prisma  = require("./prisma");

/*
|--------------------------------------------------------------------------
| CREATE ASSESSMENT
|--------------------------------------------------------------------------
*/

async function createAssessment({
  name,
  description,
  type,
  academicYearId,
  termId,
  gradeId,
  streamId,
  learningAreaId,
  userId,
  assessmentDate,
  totalMarks,
}) {
  if (
    !name ||
    !type ||
    !academicYearId ||
    !termId ||
    !gradeId ||
    !learningAreaId ||
    !userId ||
    !assessmentDate ||
    totalMarks === undefined
  ) {
    const error = new Error(
      "name, type, academicYearId, termId, gradeId, learningAreaId, userId, assessmentDate and totalMarks are required"
    );

    error.statusCode = 400;
    throw error;
  }

  if (Number(totalMarks) <= 0) {
    const error = new Error("totalMarks must be greater than zero");

    error.statusCode = 400;
    throw error;
  }

  /*
  |--------------------------------------------------------------------------
  | Find teacher using authenticated user
  |--------------------------------------------------------------------------
  */

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
  }

  /*
  |--------------------------------------------------------------------------
  | Check learning area
  |--------------------------------------------------------------------------
  */

  const learningArea = await prisma.learningArea.findUnique({
    where: {
      id: learningAreaId,
    },
  });

  if (!learningArea) {
    const error = new Error("Learning area not found");

    error.statusCode = 404;
    throw error;
  }

  /*
  |--------------------------------------------------------------------------
  | Verify teacher is actually assigned to this learning area/class
  |--------------------------------------------------------------------------
  */

  const teachingAssignment =
    await prisma.teacherTeachingAssignment.findFirst({
      where: {
        teacherId: teacher.id,
        learningAreaId,
        ...(streamId
          ? {
              streamId,
            }
          : {}),
      },
    });

  if (!teachingAssignment) {
    const error = new Error(
      "You are not assigned to teach this learning area and class"
    );

    error.statusCode = 403;
    throw error;
  }

  /*
  |--------------------------------------------------------------------------
  | Create assessment
  |--------------------------------------------------------------------------
  */

  return prisma.assessment.create({
    data: {
      name,
      description: description || null,
      type,
      academicYearId,
      termId,
      gradeId,
      streamId: streamId || null,
      learningAreaId,
      teacherId: teacher.id,
      assessmentDate: new Date(assessmentDate),
      totalMarks: Number(totalMarks),

      /*
      | Assessment is NOT automatically part of the report card.
      */
      includeInReportCard: false,

      isPublished: false,
    },

    include: {
      academicYear: true,
      term: true,
      grade: true,
      stream: true,
      learningArea: true,
      teacher: {
        include: {
          user: true,
        },
      },
      items: true,
    },
  });
}


/*
|--------------------------------------------------------------------------
| GET TEACHER ASSESSMENTS
|--------------------------------------------------------------------------
*/

async function getTeacherAssessments(userId) {
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

  return prisma.assessment.findMany({
    where: {
      teacherId: teacher.id,
    },

    include: {
      academicYear: true,
      term: true,
      grade: true,
      stream: true,
      learningArea: true,

      items: {
        include: {
          learningOutcome: {
            include: {
              subStrand: {
                include: {
                  strand: true,
                },
              },
            },
          },
        },
        orderBy: {
          questionNumber: "asc",
        },
      },
    },

    orderBy: {
      assessmentDate: "desc",
    },
  });
}


/*
|--------------------------------------------------------------------------
| GET ASSESSMENT BY ID
|--------------------------------------------------------------------------
*/

async function getAssessmentById({
  assessmentId,
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

  const assessment = await prisma.assessment.findUnique({
    where: {
      id: assessmentId,
    },

    include: {
      academicYear: true,
      term: true,
      grade: true,
      stream: true,
      learningArea: true,

      teacher: {
        include: {
          user: true,
        },
      },

      items: {
        include: {
          learningOutcome: {
            include: {
              subStrand: {
                include: {
                  strand: true,
                },
              },
            },
          },
          assessmentItemResults: {
            include: {
              student: true,
            },
          },
        },

        orderBy: {
          questionNumber: "asc",
        },
      },

      results: {
        include: {
          student: true,
        },
      },
    },
  });

  if (!assessment) {
    const error = new Error("Assessment not found");

    error.statusCode = 404;
    throw error;
  }


  /*
|--------------------------------------------------------------------------
| GET STUDENTS FOR ASSESSMENT
|--------------------------------------------------------------------------
| Returns learners who are actively enrolled in the assessment's
| academic year, term, grade and stream.
|--------------------------------------------------------------------------
*/

async function getAssessmentStudents({
  assessmentId,
  userId,
}) {
  // Find teacher
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

  // Find assessment
  const assessment = await prisma.assessment.findUnique({
    where: {
      id: assessmentId,
    },
  });

  if (!assessment) {
    const error = new Error("Assessment not found");
    error.statusCode = 404;
    throw error;
  }

  // Only the teacher who created the assessment can access
  // its learner list.
  if (assessment.teacherId !== teacher.id) {
    const error = new Error(
      "You are not authorized to access this assessment"
    );

    error.statusCode = 403;
    throw error;
  }

  /*
  |--------------------------------------------------------------------------
  | BUILD ENROLLMENT FILTER
  |--------------------------------------------------------------------------
  */

  const enrollmentWhere = {
    isActive: true,

    academicYearId: assessment.academicYearId,

    gradeId: assessment.gradeId,

    // Assessment without a stream = all students in the grade
    ...(assessment.streamId
      ? {
          streamId: assessment.streamId,
        }
      : {}),
  };

  /*
  |--------------------------------------------------------------------------
  | TERM FILTER
  |--------------------------------------------------------------------------
  |
  | If the assessment has a term, prefer enrollments belonging to
  | that term, but also allow an enrollment that is not tied to a
  | specific term.
  |--------------------------------------------------------------------------
  */

  if (assessment.termId) {
    enrollmentWhere.OR = [
      {
        termId: assessment.termId,
      },
      {
        termId: null,
      },
    ];
  } else {
    enrollmentWhere.termId = null;
  }

  /*
  |--------------------------------------------------------------------------
  | GET STUDENTS
  |--------------------------------------------------------------------------
  */

  const enrollments =
    await prisma.studentEnrollment.findMany({
      where: enrollmentWhere,

      include: {
        student: {
          select: {
            id: true,
            admissionNumber: true,
            firstName: true,
            middleName: true,
            lastName: true,
          },
        },

        grade: {
          select: {
            id: true,
            name: true,
            code: true,
          },
        },

        stream: {
          select: {
            id: true,
            name: true,
            code: true,
          },
        },
      },

      orderBy: {
        student: {
          lastName: "asc",
        },
      },
    });

  /*
  |--------------------------------------------------------------------------
  | REMOVE POSSIBLE DUPLICATE STUDENTS
  |--------------------------------------------------------------------------
  |
  | A student should appear only once in the assessment workspace.
  |--------------------------------------------------------------------------
  */

  const uniqueStudents = [];
  const seenStudentIds = new Set();

  for (const enrollment of enrollments) {
    if (seenStudentIds.has(enrollment.student.id)) {
      continue;
    }

    seenStudentIds.add(enrollment.student.id);

    uniqueStudents.push({
      enrollmentId: enrollment.id,

      student: enrollment.student,

      grade: enrollment.grade,

      stream: enrollment.stream,
    });
  }

  return uniqueStudents;
}

  /*
  |--------------------------------------------------------------------------
  | Teacher can only access their own assessments
  |--------------------------------------------------------------------------
  */

  if (assessment.teacherId !== teacher.id) {
    const error = new Error(
      "You are not allowed to access this assessment"
    );

    error.statusCode = 403;
    throw error;
  }

  return assessment;
}


/*
|--------------------------------------------------------------------------
| GET STUDENTS FOR ASSESSMENT
|--------------------------------------------------------------------------
| Returns learners who are actively enrolled in the assessment's
| academic year, term, grade and stream.
|--------------------------------------------------------------------------
*/

async function getAssessmentStudents({
  assessmentId,
  userId,
}) {
  // Find teacher
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

  // Find assessment
  const assessment = await prisma.assessment.findUnique({
    where: {
      id: assessmentId,
    },
  });

  if (!assessment) {
    const error = new Error("Assessment not found");
    error.statusCode = 404;
    throw error;
  }

  // Only the teacher who created the assessment can access
  // its learner list.
  if (assessment.teacherId !== teacher.id) {
    const error = new Error(
      "You are not authorized to access this assessment"
    );

    error.statusCode = 403;
    throw error;
  }

  /*
  |--------------------------------------------------------------------------
  | BUILD ENROLLMENT FILTER
  |--------------------------------------------------------------------------
  */

  const enrollmentWhere = {
    isActive: true,

    academicYearId: assessment.academicYearId,

    gradeId: assessment.gradeId,

    // Assessment without a stream = all students in the grade
    ...(assessment.streamId
      ? {
          streamId: assessment.streamId,
        }
      : {}),
  };

  /*
  |--------------------------------------------------------------------------
  | TERM FILTER
  |--------------------------------------------------------------------------
  |
  | If the assessment has a term, prefer enrollments belonging to
  | that term, but also allow an enrollment that is not tied to a
  | specific term.
  |--------------------------------------------------------------------------
  */

  if (assessment.termId) {
    enrollmentWhere.OR = [
      {
        termId: assessment.termId,
      },
      {
        termId: null,
      },
    ];
  } else {
    enrollmentWhere.termId = null;
  }

  /*
  |--------------------------------------------------------------------------
  | GET STUDENTS
  |--------------------------------------------------------------------------
  */

  const enrollments =
    await prisma.studentEnrollment.findMany({
      where: enrollmentWhere,

      include: {
        student: {
          select: {
            id: true,
            admissionNumber: true,
            firstName: true,
            middleName: true,
            lastName: true,
          },
        },

        grade: {
          select: {
            id: true,
            name: true,
            code: true,
          },
        },

        stream: {
          select: {
            id: true,
            name: true,
            code: true,
          },
        },
      },

      orderBy: {
        student: {
          lastName: "asc",
        },
      },
    });

  /*
  |--------------------------------------------------------------------------
  | REMOVE POSSIBLE DUPLICATE STUDENTS
  |--------------------------------------------------------------------------
  |
  | A student should appear only once in the assessment workspace.
  |--------------------------------------------------------------------------
  */

  const uniqueStudents = [];
  const seenStudentIds = new Set();

  for (const enrollment of enrollments) {
    if (seenStudentIds.has(enrollment.student.id)) {
      continue;
    }

    seenStudentIds.add(enrollment.student.id);

    uniqueStudents.push({
      enrollmentId: enrollment.id,

      student: enrollment.student,

      grade: enrollment.grade,

      stream: enrollment.stream,
    });
  }

  return uniqueStudents;
}


/*
|--------------------------------------------------------------------------
| CREATE ASSESSMENT ITEM
|--------------------------------------------------------------------------
*/

async function createAssessmentItem({
  assessmentId,
  userId,
  learningOutcomeId,
  questionNumber,
  description,
  maxMarks,
}) {
  if (
    !assessmentId ||
    !userId ||
    !questionNumber ||
    !description ||
    maxMarks === undefined
  ) {
    const error = new Error(
      "assessmentId, userId, questionNumber, description and maxMarks are required"
    );

    error.statusCode = 400;
    throw error;
  }

  if (Number(maxMarks) <= 0) {
    const error = new Error("maxMarks must be greater than zero");

    error.statusCode = 400;
    throw error;
  }

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
    const error = new Error("Teacher profile not found");

    error.statusCode = 404;
    throw error;
  }

  /*
  |--------------------------------------------------------------------------
  | Find assessment
  |--------------------------------------------------------------------------
  */

  const assessment = await prisma.assessment.findUnique({
    where: {
      id: assessmentId,
    },
  });

  if (!assessment) {
    const error = new Error("Assessment not found");

    error.statusCode = 404;
    throw error;
  }

  /*
  |--------------------------------------------------------------------------
  | Only assessment owner can add items
  |--------------------------------------------------------------------------
  */

  if (assessment.teacherId !== teacher.id) {
    const error = new Error(
      "You are not allowed to modify this assessment"
    );

    error.statusCode = 403;
    throw error;
  }

  /*
  |--------------------------------------------------------------------------
  | Don't modify published assessments
  |--------------------------------------------------------------------------
  */

  if (assessment.isPublished) {
    const error = new Error(
      "Published assessments cannot be modified"
    );

    error.statusCode = 400;
    throw error;
  }

  /*
  |--------------------------------------------------------------------------
  | Check learning outcome
  |--------------------------------------------------------------------------
  */

  if (learningOutcomeId) {
    const learningOutcome =
      await prisma.learningOutcome.findUnique({
        where: {
          id: learningOutcomeId,
        },
      });

    if (!learningOutcome) {
      const error = new Error(
        "Learning outcome not found"
      );

      error.statusCode = 404;
      throw error;
    }
  }

  /*
  |--------------------------------------------------------------------------
  | Prevent duplicate question number
  |--------------------------------------------------------------------------
  */

  const existingItem =
    await prisma.assessmentItem.findFirst({
      where: {
        assessmentId,
        questionNumber: Number(questionNumber),
      },
    });

  if (existingItem) {
    const error = new Error(
      "This question number already exists in the assessment"
    );

    error.statusCode = 409;
    throw error;
  }

  /*
  |--------------------------------------------------------------------------
  | Create item
  |--------------------------------------------------------------------------
  */

  return prisma.assessmentItem.create({
    data: {
      assessmentId,
      learningOutcomeId: learningOutcomeId || null,
      questionNumber: Number(questionNumber),
      description,
      maxMarks: Number(maxMarks),
    },

    include: {
      learningOutcome: {
        include: {
          subStrand: {
            include: {
              strand: true,
            },
          },
        },
      },
    },
  });
}


/*
|--------------------------------------------------------------------------
| RECORD ASSESSMENT RESULT
|--------------------------------------------------------------------------
*/

async function recordAssessmentResult({
  assessmentId,
  studentId,
  marks,
  performanceLevel,
  teacherComment,
  userId,
}) {
  if (
    !assessmentId ||
    !studentId ||
    marks === undefined ||
    !userId
  ) {
    const error = new Error(
      "assessmentId, studentId, marks and userId are required"
    );

    error.statusCode = 400;
    throw error;
  }

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

  const assessment = await prisma.assessment.findUnique({
    where: {
      id: assessmentId,
    },
  });

  if (!assessment) {
    const error = new Error("Assessment not found");

    error.statusCode = 404;
    throw error;
  }

  if (assessment.teacherId !== teacher.id) {
    const error = new Error(
      "You are not allowed to record results for this assessment"
    );

    error.statusCode = 403;
    throw error;
  }

  if (assessment.isPublished) {
    const error = new Error(
      "Published assessments cannot be modified"
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
  | Verify learner belongs to assessment class
  |--------------------------------------------------------------------------
  */

  if (student.gradeId !== assessment.gradeId) {
    const error = new Error(
      "Student does not belong to the assessment grade"
    );

    error.statusCode = 400;
    throw error;
  }

  if (
    assessment.streamId &&
    student.streamId !== assessment.streamId
  ) {
    const error = new Error(
      "Student does not belong to the assessment stream"
    );

    error.statusCode = 400;
    throw error;
  }

  /*
  |--------------------------------------------------------------------------
  | Validate marks
  |--------------------------------------------------------------------------
  */

  if (Number(marks) < 0) {
    const error = new Error(
      "Marks cannot be negative"
    );

    error.statusCode = 400;
    throw error;
  }

  if (Number(marks) > assessment.totalMarks) {
    const error = new Error(
      `Marks cannot exceed ${assessment.totalMarks}`
    );

    error.statusCode = 400;
    throw error;
  }

  /*
  |--------------------------------------------------------------------------
  | Create or update result
  |--------------------------------------------------------------------------
  */

  return prisma.assessmentResult.upsert({
    where: {
      assessmentId_studentId: {
        assessmentId,
        studentId,
      },
    },

    update: {
      marks: Number(marks),
      performanceLevel:
        performanceLevel || null,
      teacherComment:
        teacherComment || null,
    },

    create: {
      assessmentId,
      studentId,
      marks: Number(marks),
      performanceLevel:
        performanceLevel || null,
      teacherComment:
        teacherComment || null,
    },

    include: {
      student: true,
      assessment: true,
    },
  });
}


/*
|--------------------------------------------------------------------------
| RECORD ASSESSMENT ITEM RESULT
|--------------------------------------------------------------------------
*/

async function recordAssessmentItemResult({
  assessmentItemId,
  studentId,
  marks,
  performanceLevel,
  comment,
  userId,
}) {
  if (
    !assessmentItemId ||
    !studentId ||
    !userId ||
    marks === undefined
  ) {
    const error = new Error(
      "assessmentItemId, studentId, marks and userId are required"
    );

    error.statusCode = 400;
    throw error;
  }

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

  const item = await prisma.assessmentItem.findUnique({
    where: {
      id: assessmentItemId,
    },

    include: {
      assessment: true,
    },
  });

  if (!item) {
    const error = new Error(
      "Assessment item not found"
    );

    error.statusCode = 404;
    throw error;
  }

  if (item.assessment.teacherId !== teacher.id) {
    const error = new Error(
      "You are not allowed to record this result"
    );

    error.statusCode = 403;
    throw error;
  }

  if (item.assessment.isPublished) {
    const error = new Error(
      "Published assessments cannot be modified"
    );

    error.statusCode = 400;
    throw error;
  }

  /*
  |--------------------------------------------------------------------------
  | Validate marks against item maximum
  |--------------------------------------------------------------------------
  */

  if (Number(marks) < 0) {
    const error = new Error(
      "Marks cannot be negative"
    );

    error.statusCode = 400;
    throw error;
  }

  if (Number(marks) > item.maxMarks) {
    const error = new Error(
      `Marks cannot exceed ${item.maxMarks}`
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
  | Verify student belongs to assessment class
  |--------------------------------------------------------------------------
  */

  if (
    student.gradeId !== item.assessment.gradeId
  ) {
    const error = new Error(
      "Student does not belong to the assessment grade"
    );

    error.statusCode = 400;
    throw error;
  }

  if (
    item.assessment.streamId &&
    student.streamId !== item.assessment.streamId
  ) {
    const error = new Error(
      "Student does not belong to the assessment stream"
    );

    error.statusCode = 400;
    throw error;
  }

  /*
  |--------------------------------------------------------------------------
  | Create or update item result
  |--------------------------------------------------------------------------
  */

  return prisma.assessmentItemResult.upsert({
    where: {
      assessmentItemId_studentId: {
        assessmentItemId,
        studentId,
      },
    },

    update: {
      marks: Number(marks),
      performanceLevel:
        performanceLevel || null,
      comment: comment || null,
    },

    create: {
      assessmentItemId,
      studentId,
      marks: Number(marks),
      performanceLevel:
        performanceLevel || null,
      comment: comment || null,
    },

    include: {
      student: true,
      assessmentItem: {
        include: {
          assessment: true,
          learningOutcome: true,
        },
      },
    },
  });
}


/*
|--------------------------------------------------------------------------
| PUBLISH ASSESSMENT
|--------------------------------------------------------------------------
*/

/*
|--------------------------------------------------------------------------
| PUBLISH ASSESSMENT
|--------------------------------------------------------------------------
| An assessment can be published in either mode:
|
| 1. Overall assessment:
|    AssessmentResult records exist for learners.
|
| 2. Item-based assessment:
|    AssessmentItemResult records exist for learners.
|
| Assessment items are OPTIONAL.
|--------------------------------------------------------------------------
*/

async function publishAssessment({ assessmentId, userId }) {
  // Find the teacher
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

  // Find the assessment
  const assessment = await prisma.assessment.findUnique({
    where: {
      id: assessmentId,
    },
    include: {
      items: true,
      results: true,
    },
  });

  if (!assessment) {
    const error = new Error("Assessment not found");
    error.statusCode = 404;
    throw error;
  }

  // Only the teacher who created the assessment can publish it
  if (assessment.teacherId !== teacher.id) {
    const error = new Error(
      "You are not authorized to publish this assessment"
    );
    error.statusCode = 403;
    throw error;
  }

  // Prevent publishing an already published assessment
  if (assessment.isPublished) {
    const error = new Error("Assessment is already published");
    error.statusCode = 400;
    throw error;
  }

  /*
  |--------------------------------------------------------------------------
  | CHECK FOR LEARNER RESULTS
  |--------------------------------------------------------------------------
  |
  | AssessmentResult is used for the simple/overall assessment mode.
  |
  | Example:
  |
  | Student A → 75/100
  | Student B → 68/100
  | Student C → 82/100
  |
  | AssessmentItemResult is used when the teacher created detailed
  | assessment items/questions.
  |--------------------------------------------------------------------------
  */

  const hasOverallResults =
    assessment.results &&
    assessment.results.length > 0;

  /*
  |--------------------------------------------------------------------------
  | CHECK ITEM RESULTS
  |--------------------------------------------------------------------------
  |
  | If the assessment has items, we check whether at least one result
  | has been recorded for those items.
  |--------------------------------------------------------------------------
  */

  let hasItemResults = false;

  if (assessment.items && assessment.items.length > 0) {
    const itemResultCount =
      await prisma.assessmentItemResult.count({
        where: {
          assessmentItem: {
            assessmentId: assessment.id,
          },
        },
      });

    hasItemResults = itemResultCount > 0;
  }

  /*
  |--------------------------------------------------------------------------
  | REQUIRE AT LEAST ONE RESULT
  |--------------------------------------------------------------------------
  |
  | The teacher must have entered learner marks before publishing.
  |
  | Assessment items themselves are NOT mandatory.
  |--------------------------------------------------------------------------
  */

  if (!hasOverallResults && !hasItemResults) {
    const error = new Error(
      "Cannot publish assessment. Record at least one learner result before publishing."
    );

    error.statusCode = 400;
    throw error;
  }

  /*
  |--------------------------------------------------------------------------
  | PUBLISH
  |--------------------------------------------------------------------------
  */

  const publishedAssessment =
    await prisma.assessment.update({
      where: {
        id: assessment.id,
      },
      data: {
        isPublished: true,
      },
      include: {
        academicYear: true,
        term: true,
        grade: true,
        stream: true,
        learningArea: true,
        teacher: {
          include: {
            user: true,
          },
        },
        items: {
          orderBy: {
            questionNumber: "asc",
          },
        },
        results: {
          include: {
            student: true,
          },
        },
      },
    });

  return publishedAssessment;
}
/*
|--------------------------------------------------------------------------
| INCLUDE / EXCLUDE FROM REPORT CARD
|--------------------------------------------------------------------------
*/

async function setIncludeInReportCard({
  assessmentId,
  includeInReportCard,
  userId,
}) {
  if (
    !assessmentId ||
    includeInReportCard === undefined ||
    !userId
  ) {
    const error = new Error(
      "assessmentId, includeInReportCard and userId are required"
    );

    error.statusCode = 400;
    throw error;
  }

  const assessment = await prisma.assessment.findUnique({
    where: {
      id: assessmentId,
    },

    include: {
      teacher: true,
    },
  });

  if (!assessment) {
    const error = new Error("Assessment not found");

    error.statusCode = 404;
    throw error;
  }

  /*
  |--------------------------------------------------------------------------
  | At this stage the teacher can control their own assessment.
  |
  | Later we can add Head of Institution / admin approval
  | so that the school has the final authority.
  |--------------------------------------------------------------------------
  */

  if (assessment.teacher.userId !== userId) {
    const error = new Error(
      "You are not allowed to change this assessment"
    );

    error.statusCode = 403;
    throw error;
  }

  if (!assessment.isPublished) {
    const error = new Error(
      "Publish the assessment before including it in the report card"
    );

    error.statusCode = 400;
    throw error;
  }

  return prisma.assessment.update({
    where: {
      id: assessmentId,
    },

    data: {
      includeInReportCard:
        Boolean(includeInReportCard),
    },

    include: {
      academicYear: true,
      term: true,
      grade: true,
      stream: true,
      learningArea: true,
      teacher: true,
    },
  });
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
