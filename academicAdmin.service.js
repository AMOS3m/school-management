const prisma = require("/prisma");

async function getAcademicDashboard() {

  const [
    academicYears,
    terms,
    grades,
    streams,
    teachers,
    teachingAssignments,
    classTeacherAssignments,
    pendingAssessmentReviews,
    reportCardOverview,
  ] = await Promise.all([

    /*
    |--------------------------------------------------------------------------
    | Academic Years
    |--------------------------------------------------------------------------
    */

    prisma.academicYear.findMany({
      orderBy: {
        startDate: "desc",
      },
    }),


    /*
    |--------------------------------------------------------------------------
    | Terms
    |--------------------------------------------------------------------------
    */

    prisma.term.findMany({
      include: {
        academicYear: true,
      },

      orderBy: [
        {
          academicYear: {
            startDate: "desc",
          },
        },
        {
          termNumber: "asc",
        },
      ],
    }),


    /*
    |--------------------------------------------------------------------------
    | Grades
    |--------------------------------------------------------------------------
    */

    prisma.grade.findMany({
      include: {
        educationLevel: true,
        streams: true,
      },

      orderBy: {
        name: "asc",
      },
    }),


    /*
    |--------------------------------------------------------------------------
    | Streams
    |--------------------------------------------------------------------------
    */

    prisma.stream.findMany({
      include: {
        grade: true,
      },

      orderBy: {
        name: "asc",
      },
    }),


    /*
    |--------------------------------------------------------------------------
    | Teachers
    |--------------------------------------------------------------------------
    */

    prisma.teacher.findMany({
      include: {
        user: true,
      },

      orderBy: {
        createdAt: "desc",
      },
    }),


    /*
    |--------------------------------------------------------------------------
    | Teaching Assignments
    |--------------------------------------------------------------------------
    */

    prisma.teacherTeachingAssignment.findMany({
      include: {
        teacher: {
          include: {
            user: true,
          },
        },

        grade: true,
        stream: true,
        learningArea: true,
      },

      orderBy: {
        createdAt: "desc",
      },
    }),


    /*
    |--------------------------------------------------------------------------
    | Class Teacher Assignments
    |--------------------------------------------------------------------------
    |
    | We use the ClassTeacher model created earlier.
    |
    |--------------------------------------------------------------------------
    */

    prisma.classTeacher.findMany({
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

      orderBy: {
        createdAt: "desc",
      },
    }),


    /*
    |--------------------------------------------------------------------------
    | Assessment Review
    |--------------------------------------------------------------------------
    |
    | Published assessments are the assessments that can be considered
    | for official report-card processing.
    |
    |--------------------------------------------------------------------------
    */

    prisma.assessment.findMany({
      where: {
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
      },

      orderBy: {
        assessmentDate: "desc",
      },
    }),


    /*
    |--------------------------------------------------------------------------
    | Report Card Overview
    |--------------------------------------------------------------------------
    */

    prisma.reportCard.findMany({
      include: {
        student: true,
        academicYear: true,
        term: true,
      },

      orderBy: {
        createdAt: "desc",
      },
    }),

  ]);


  /*
  |--------------------------------------------------------------------------
  | Separate assessment review categories
  |--------------------------------------------------------------------------
  */

  const assessmentsRecommendedForReportCard =
    pendingAssessmentReviews.filter(
      (assessment) =>
        assessment.includeInReportCard === true
    );


  const assessmentsExcludedFromReportCard =
    pendingAssessmentReviews.filter(
      (assessment) =>
        assessment.includeInReportCard === false
    );


  /*
  |--------------------------------------------------------------------------
  | Report card status counts
  |--------------------------------------------------------------------------
  */

  const draftReportCards =
    reportCardOverview.filter(
      (reportCard) =>
        reportCard.status === "DRAFT"
    );


  const publishedReportCards =
    reportCardOverview.filter(
      (reportCard) =>
        reportCard.status === "PUBLISHED"
    );


  return {

    academicYears,

    terms,

    grades,

    streams,

    teachers,

    teachingAssignments,

    classTeacherAssignments,

    assessmentReview: {

      totalPublishedAssessments:
        pendingAssessmentReviews.length,

      recommendedForReportCard:
        assessmentsRecommendedForReportCard.length,

      excludedFromReportCard:
        assessmentsExcludedFromReportCard.length,

      assessments:
        pendingAssessmentReviews,
    },

    reportCards: {

      total:
        reportCardOverview.length,

      draft:
        draftReportCards.length,

      published:
        publishedReportCards.length,

      records:
        reportCardOverview,
    },

  };
}



async function getAcademicOverview() {

  const [
    academicYearsCount,
    termsCount,
    gradesCount,
    streamsCount,
    teachersCount,
    teachingAssignmentsCount,
    classTeacherAssignmentsCount,
    publishedAssessmentsCount,
    recommendedAssessmentsCount,
    draftReportCardsCount,
    publishedReportCardsCount,
  ] = await Promise.all([

    prisma.academicYear.count(),

    prisma.term.count(),

    prisma.grade.count(),

    prisma.stream.count(),

    prisma.teacher.count(),

    prisma.teacherTeachingAssignment.count(),

    prisma.classTeacher.count(),

    prisma.assessment.count({
      where: {
        isPublished: true,
      },
    }),

    prisma.assessment.count({
      where: {
        isPublished: true,
        includeInReportCard: true,
      },
    }),

    prisma.reportCard.count({
      where: {
        status: "DRAFT",
      },
    }),

    prisma.reportCard.count({
      where: {
        status: "PUBLISHED",
      },
    }),

  ]);


  return {

    academicYears:
      academicYearsCount,

    terms:
      termsCount,

    grades:
      gradesCount,

    streams:
      streamsCount,

    teachers:
      teachersCount,

    teachingAssignments:
      teachingAssignmentsCount,

    classTeacherAssignments:
      classTeacherAssignmentsCount,

    assessments: {

      published:
        publishedAssessmentsCount,

      recommendedForReportCard:
        recommendedAssessmentsCount,

    },

    reportCards: {

      draft:
        draftReportCardsCount,

      published:
        publishedReportCardsCount,

    },

  };
}


async function getPendingAssessmentReviews({

  academicYearId,
  termId,
  gradeId,
  streamId,

}) {

  const where = {

    isPublished: true,

  };


  /*
  |--------------------------------------------------------------------------
  | Optional academic year filter
  |--------------------------------------------------------------------------
  */

  if (academicYearId) {

    where.academicYearId =
      academicYearId;

  }


  /*
  |--------------------------------------------------------------------------
  | Optional term filter
  |--------------------------------------------------------------------------
  */

  if (termId) {

    where.termId =
      termId;

  }


  /*
  |--------------------------------------------------------------------------
  | Optional grade filter
  |--------------------------------------------------------------------------
  */

  if (gradeId) {

    where.gradeId =
      gradeId;

  }


  /*
  |--------------------------------------------------------------------------
  | Optional stream filter
  |--------------------------------------------------------------------------
  */

  if (streamId) {

    where.streamId =
      streamId;

  }


  const assessments =
    await prisma.assessment.findMany({

      where,

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

        results: {

          include: {

            student: true,

          },

        },

      },

      orderBy: {

        assessmentDate:
          "desc",

      },

    });


  /*
  |--------------------------------------------------------------------------
  | Add a simple administrative classification
  |--------------------------------------------------------------------------
  */

  return assessments.map(
    (assessment) => ({

      ...assessment,

      reportCardRecommendation:
        assessment.includeInReportCard
          ? "RECOMMENDED"
          : "NOT_RECOMMENDED",

    })
  );

}



/*
|--------------------------------------------------------------------------
| GET REPORT CARD OVERVIEW
|--------------------------------------------------------------------------
|
| Academic Admin can use this to monitor report-card generation.
|
| Filters:
|
| academicYearId
| termId
| gradeId
| streamId
| status
|
|--------------------------------------------------------------------------
*/

async function getReportCardOverview({

  academicYearId,
  termId,
  gradeId,
  streamId,
  status,

}) {

  const where = {};


  if (academicYearId) {

    where.academicYearId =
      academicYearId;

  }


  if (termId) {

    where.termId =
      termId;

  }


  /*
  |--------------------------------------------------------------------------
  | Student-based grade/stream filtering
  |--------------------------------------------------------------------------
  |
  | ReportCard itself does not contain gradeId or streamId.
  |
  | The student's current enrollment provides that information.
  |
  |--------------------------------------------------------------------------
  */

  if (gradeId || streamId) {

    where.student = {

      enrollments: {

        some: {

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

          isActive: true,

        },

      },

    };

  }


  if (status) {

    where.status =
      status;

  }


  const reportCards =
    await prisma.reportCard.findMany({

      where,

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

      orderBy: {

        createdAt:
          "desc",

      },

    });


  /*
  |--------------------------------------------------------------------------
  | Add summary information
  |--------------------------------------------------------------------------
  */

  return reportCards.map(
    (reportCard) => ({

      ...reportCard,

      resultCount:
        reportCard.results.length,

      completionStatus:
        reportCard.results.length > 0
          ? "HAS_RESULTS"
          : "NO_RESULTS",

    })
  );

}



/*
|--------------------------------------------------------------------------
| CREATE ACADEMIC YEAR
|--------------------------------------------------------------------------
*/

async function createAcademicYear({
  name,
  startDate,
  endDate,
}) {
  if (!name || !startDate || !endDate) {
    const error = new Error(
      "name, startDate and endDate are required"
    );

    error.statusCode = 400;

    throw error;
  }

  const existingAcademicYear =
    await prisma.academicYear.findFirst({
      where: {
        name,
      },
    });

  if (existingAcademicYear) {
    const error = new Error(
      "Academic year already exists."
    );

    error.statusCode = 409;

    throw error;
  }

  return prisma.academicYear.create({
    data: {
      name,
      startDate: new Date(startDate),
      endDate: new Date(endDate),
    },
  });
}


/*
|--------------------------------------------------------------------------
| GET ACADEMIC YEARS
|--------------------------------------------------------------------------
*/

async function getAcademicYears() {
  return prisma.academicYear.findMany({
    orderBy: {
      startDate: "desc",
    },
  });
}


/*
|--------------------------------------------------------------------------
| UPDATE ACADEMIC YEAR
|--------------------------------------------------------------------------
*/

async function updateAcademicYear(
  academicYearId,
  {
    name,
    startDate,
    endDate,
  }
) {
  const existing =
    await prisma.academicYear.findUnique({
      where: {
        id: academicYearId,
      },
    });

  if (!existing) {
    const error = new Error(
      "Academic year not found."
    );

    error.statusCode = 404;

    throw error;
  }

  return prisma.academicYear.update({
    where: {
      id: academicYearId,
    },

    data: {
      name,
      startDate: startDate
        ? new Date(startDate)
        : undefined,

      endDate: endDate
        ? new Date(endDate)
        : undefined,
    },
  });
}


/*
|--------------------------------------------------------------------------
| CREATE TERM
|--------------------------------------------------------------------------
*/

async function createTerm({
  academicYearId,
  termNumber,
  name,
  startDate,
  endDate,
}) {
  if (
    !academicYearId ||
    !termNumber ||
    !name ||
    !startDate ||
    !endDate
  ) {
    const error = new Error(
      "academicYearId, termNumber, name, startDate and endDate are required"
    );

    error.statusCode = 400;

    throw error;
  }

  const academicYear =
    await prisma.academicYear.findUnique({
      where: {
        id: academicYearId,
      },
    });

  if (!academicYear) {
    const error = new Error(
      "Academic year not found."
    );

    error.statusCode = 404;

    throw error;
  }

  const existingTerm =
    await prisma.term.findFirst({
      where: {
        academicYearId,
        termNumber,
      },
    });

  if (existingTerm) {
    const error = new Error(
      `Term ${termNumber} already exists for this academic year.`
    );

    error.statusCode = 409;

    throw error;
  }

  return prisma.term.create({
    data: {
      academicYearId,
      termNumber,
      name,
      startDate: new Date(startDate),
      endDate: new Date(endDate),
    },

    include: {
      academicYear: true,
    },
  });
}


/*
|--------------------------------------------------------------------------
| GET TERMS
|--------------------------------------------------------------------------
*/

async function getTerms({
  academicYearId,
} = {}) {
  return prisma.term.findMany({
    where: academicYearId
      ? {
          academicYearId,
        }
      : undefined,

    include: {
      academicYear: true,
    },

    orderBy: [
      {
        academicYear: {
          startDate: "desc",
        },
      },
      {
        termNumber: "asc",
      },
    ],
  });
}


/*
|--------------------------------------------------------------------------
| UPDATE TERM
|--------------------------------------------------------------------------
*/

async function updateTerm(
  termId,
  {
    termNumber,
    name,
    startDate,
    endDate,
  }
) {
  const existing =
    await prisma.term.findUnique({
      where: {
        id: termId,
      },
    });

  if (!existing) {
    const error = new Error(
      "Term not found."
    );

    error.statusCode = 404;

    throw error;
  }

  return prisma.term.update({
    where: {
      id: termId,
    },

    data: {
      termNumber:
        termNumber !== undefined
          ? termNumber
          : undefined,

      name:
        name !== undefined
          ? name
          : undefined,

      startDate: startDate
        ? new Date(startDate)
        : undefined,

      endDate: endDate
        ? new Date(endDate)
        : undefined,
    },

    include: {
      academicYear: true,
    },
  });
}


/*
|--------------------------------------------------------------------------
| CREATE GRADE
|--------------------------------------------------------------------------
*/

async function createGrade({ name, educationLevelId }) {
  if (!name || !educationLevelId) {
    const error = new Error(
      "name and educationLevelId are required"
    );

    error.statusCode = 400;
    throw error;
  }

  /*
  |--------------------------------------------------------------------------
  | CHECK EDUCATION LEVEL
  |--------------------------------------------------------------------------
  */

  const educationLevel = await prisma.educationLevel.findUnique({
    where: {
      id: educationLevelId,
    },
  });

  if (!educationLevel) {
    const error = new Error("Education level not found");

    error.statusCode = 404;
    throw error;
  }

  /*
  |--------------------------------------------------------------------------
  | GENERATE GRADE CODE
  |--------------------------------------------------------------------------
  |
  | Example:
  | Grade 1 -> GRADE_1
  | Grade 8 -> GRADE_8
  | Grade 9 -> GRADE_9
  |
  */

  const code = name
    .trim()
    .toUpperCase()
    .replace(/\s+/g, "_")
    .replace(/[^A-Z0-9_]/g, "");

  /*
  |--------------------------------------------------------------------------
  | CHECK DUPLICATE GRADE
  |--------------------------------------------------------------------------
  */

  const existingGrade = await prisma.grade.findFirst({
    where: {
      OR: [
        {
          name: name.trim(),
          educationLevelId,
        },
        {
          code,
        },
      ],
    },
  });

  if (existingGrade) {
    const error = new Error(
      "A grade with this name or code already exists"
    );

    error.statusCode = 409;
    throw error;
  }

  /*
  |--------------------------------------------------------------------------
  | CREATE GRADE
  |--------------------------------------------------------------------------
  */

  return prisma.grade.create({
    data: {
      name: name.trim(),
      code,
      educationLevelId,
    },
    include: {
      educationLevel: true,
      streams: true,
    },
  });
}

/*
|--------------------------------------------------------------------------
| GET GRADES
|--------------------------------------------------------------------------
*/

async function getGrades() {
  return prisma.grade.findMany({
    include: {
      educationLevel: true,
      streams: true,
    },

    orderBy: {
      name: "asc",
    },
  });
}


/*
|--------------------------------------------------------------------------
| UPDATE GRADE
|--------------------------------------------------------------------------
*/

async function updateGrade(
  gradeId,
  {
    name,
    educationLevelId,
  }
) {
  const existing =
    await prisma.grade.findUnique({
      where: {
        id: gradeId,
      },
    });

  if (!existing) {
    const error = new Error(
      "Grade not found."
    );

    error.statusCode = 404;

    throw error;
  }

  return prisma.grade.update({
    where: {
      id: gradeId,
    },

    data: {
      name:
        name !== undefined
          ? name
          : undefined,

      educationLevelId:
        educationLevelId !== undefined
          ? educationLevelId
          : undefined,
    },

    include: {
      educationLevel: true,
      streams: true,
    },
  });
}


/*
|--------------------------------------------------------------------------
| CREATE STREAM
|--------------------------------------------------------------------------
*/


async function createStream({ name, gradeId }) {
  if (!name || !gradeId) {
    const error = new Error("name and gradeId are required");
    error.statusCode = 400;
    throw error;
  }

  const cleanName = name.trim();

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
    const error = new Error("Grade not found.");
    error.statusCode = 404;
    throw error;
  }

  /*
  |--------------------------------------------------------------------------
  | Generate stream code
  |--------------------------------------------------------------------------
  |
  | Example:
  | 8A -> 8A
  | East -> EAST
  |
  */

  const code = cleanName
    .toUpperCase()
    .replace(/\s+/g, "_")
    .replace(/[^A-Z0-9_]/g, "");

  /*
  |--------------------------------------------------------------------------
  | Check duplicate stream
  |--------------------------------------------------------------------------
  */

  const existingStream = await prisma.stream.findFirst({
    where: {
      OR: [
        {
          name: cleanName,
          gradeId,
        },
        {
          code,
        },
      ],
    },
  });

  if (existingStream) {
    const error = new Error(
      "A stream with this name or code already exists."
    );
    error.statusCode = 409;
    throw error;
  }

  /*
  |--------------------------------------------------------------------------
  | Create stream
  |--------------------------------------------------------------------------
  */

  return prisma.stream.create({
    data: {
      name: cleanName,
      code,
      gradeId,
    },
    include: {
      grade: {
        include: {
          educationLevel: true,
        },
      },
    },
  });
}

/*
|--------------------------------------------------------------------------
| GET STREAMS
|--------------------------------------------------------------------------
*/

async function getStreams({
  gradeId,
} = {}) {
  return prisma.stream.findMany({
    where: gradeId
      ? {
          gradeId,
        }
      : undefined,

    include: {
      grade: {
        include: {
          educationLevel: true,
        },
      },
    },

    orderBy: {
      name: "asc",
    },
  });
}


async function updateStream(
  streamId,
  {
    name,
    gradeId,
  }
) {
  const existing = await prisma.stream.findUnique({
    where: {
      id: streamId,
    },
  });

  if (!existing) {
    const error = new Error("Stream not found.");

    error.statusCode = 404;
    throw error;
  }

  const finalName =
    name !== undefined
      ? name.trim()
      : existing.name;

  const finalGradeId =
    gradeId !== undefined
      ? gradeId
      : existing.gradeId;

  /*
  |--------------------------------------------------------------------------
  | CHECK GRADE
  |--------------------------------------------------------------------------
  */

  const grade = await prisma.grade.findUnique({
    where: {
      id: finalGradeId,
    },
  });

  if (!grade) {
    const error = new Error("Grade not found.");

    error.statusCode = 404;
    throw error;
  }

  /*
  |--------------------------------------------------------------------------
  | CHECK DUPLICATE
  |--------------------------------------------------------------------------
  */

  const duplicate = await prisma.stream.findFirst({
    where: {
      name: finalName,
      gradeId: finalGradeId,
      NOT: {
        id: streamId,
      },
    },
  });

  if (duplicate) {
    const error = new Error(
      "This stream already exists under the selected grade."
    );

    error.statusCode = 409;
    throw error;
  }

  /*
  |--------------------------------------------------------------------------
  | UPDATE
  |--------------------------------------------------------------------------
  */

  return prisma.stream.update({
    where: {
      id: streamId,
    },

    data: {
      name: finalName,
      gradeId: finalGradeId,
    },

    include: {
      grade: {
        include: {
          educationLevel: true,
        },
      },
    },
  });
}


/*
|--------------------------------------------------------------------------
| CREATE LEARNING AREA
|--------------------------------------------------------------------------
*/

async function createLearningArea({
  name,
  code,
  curriculumType,
  description,
}) {
  if (!name || !code || !curriculumType) {
    const error = new Error(
      "name, code and curriculumType are required"
    );

    error.statusCode = 400;

    throw error;
  }

  const validCurriculumTypes = [
    "CBC",
    "SENIOR_SCHOOL",
    "OTHER",
  ];

  if (!validCurriculumTypes.includes(curriculumType)) {
    const error = new Error(
      "Invalid curriculumType. Use CBC, SENIOR_SCHOOL or OTHER."
    );

    error.statusCode = 400;

    throw error;
  }

  const existingLearningArea =
    await prisma.learningArea.findUnique({
      where: {
        code,
      },
    });

  if (existingLearningArea) {
    const error = new Error(
      "A learning area with this code already exists."
    );

    error.statusCode = 409;

    throw error;
  }

  return prisma.learningArea.create({
    data: {
      name,
      code,
      curriculumType,
      description: description || null,
    },
  });
}


/*
|--------------------------------------------------------------------------
| GET LEARNING AREAS
|--------------------------------------------------------------------------
*/

async function getLearningAreas({
  curriculumType,
} = {}) {
  const where = {};

  if (curriculumType) {
    where.curriculumType = curriculumType;
  }

  return prisma.learningArea.findMany({
    where,

    orderBy: {
      name: "asc",
    },
  });
}

module.exports = {

  getAcademicDashboard,

  getAcademicOverview,

  getPendingAssessmentReviews,

  getReportCardOverview,

  createAcademicYear,

  getAcademicYears,

  updateAcademicYear,

  createTerm,

  getTerms,

  updateTerm,

  createGrade,

  getGrades,

  updateGrade,

  createStream,

  getStreams,

  updateStream,

  createLearningArea,

  getLearningAreas,

};
