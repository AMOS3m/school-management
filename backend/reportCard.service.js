
const { prisma } = require("./prisma");

/*
|--------------------------------------------------------------------------
| CBC PERFORMANCE LEVELS
|--------------------------------------------------------------------------
|
| The assessment system stores a PerformanceLevel.
|
| We convert that into a human-readable CBC descriptor for the report card.
|
| The exact enum values should match the PerformanceLevel enum in your
| Prisma schema. The helper below also handles common variations.
|
|--------------------------------------------------------------------------
*/

const CBC_DESCRIPTORS = {
  EXCEEDING_EXPECTATION: "Exceeding Expectation",
  MEETING_EXPECTATION: "Meeting Expectation",
  APPROACHING_EXPECTATION: "Approaching Expectation",
  BELOW_EXPECTATION: "Below Expectation",

  EE: "Exceeding Expectation",
  ME: "Meeting Expectation",
  AE: "Approaching Expectation",
  BE: "Below Expectation",

  EXCEEDS_EXPECTATION: "Exceeding Expectation",
  MEETS_EXPECTATION: "Meeting Expectation",
  APPROACHING_EXPECTATIONS: "Approaching Expectation",
  BELOW_EXPECTATIONS: "Below Expectation",
};


/*
|--------------------------------------------------------------------------
| CBC PERFORMANCE ORDER
|--------------------------------------------------------------------------
|
| Higher number = stronger performance.
|
|--------------------------------------------------------------------------
*/

const PERFORMANCE_ORDER = {
  BELOW_EXPECTATION: 1,
  BE: 1,

  APPROACHING_EXPECTATION: 2,
  AE: 2,

  MEETING_EXPECTATION: 3,
  ME: 3,

  EXCEEDING_EXPECTATION: 4,
  EE: 4,
};


/*
|--------------------------------------------------------------------------
| GET CBC DESCRIPTOR
|--------------------------------------------------------------------------
*/

function getCBCDescriptor(performanceLevel) {
  if (!performanceLevel) {
    return null;
  }

  const key = String(performanceLevel).toUpperCase();

  return (
    CBC_DESCRIPTORS[key] ||
    String(performanceLevel)
      .replace(/_/g, " ")
      .replace(/\b\w/g, (letter) => letter.toUpperCase())
  );
}


/*
|--------------------------------------------------------------------------
| GET PERFORMANCE SCORE
|--------------------------------------------------------------------------
|
| Converts a CBC performance level into an internal numerical value.
|
| This number is NOT displayed as the CBC grade.
|
| It is only used internally when analysing multiple assessments.
|
|--------------------------------------------------------------------------
*/

function getPerformanceScore(performanceLevel) {
  if (!performanceLevel) {
    return null;
  }

  const key = String(performanceLevel).toUpperCase();

  return PERFORMANCE_ORDER[key] || null;
}


/*
|--------------------------------------------------------------------------
| DERIVE PERFORMANCE LEVEL
|--------------------------------------------------------------------------
|
| When several assessment results contribute to one learning area,
| we determine the dominant performance level.
|
| We use the average performance level when performance levels exist.
|
|--------------------------------------------------------------------------
*/

function derivePerformanceLevel(performanceLevels) {
  const validScores = performanceLevels
    .map(getPerformanceScore)
    .filter((score) => score !== null);

  if (validScores.length === 0) {
    return null;
  }

  const average =
    validScores.reduce((sum, score) => sum + score, 0) /
    validScores.length;

  if (average >= 3.5) {
    return "EXCEEDING_EXPECTATION";
  }

  if (average >= 2.5) {
    return "MEETING_EXPECTATION";
  }

  if (average >= 1.5) {
    return "APPROACHING_EXPECTATION";
  }

  return "BELOW_EXPECTATION";
}


/*
|--------------------------------------------------------------------------
| CALCULATE PERCENTAGE
|--------------------------------------------------------------------------
*/

function calculatePercentage(totalMarks, totalPossibleMarks) {
  if (!totalPossibleMarks || totalPossibleMarks <= 0) {
    return null;
  }

  return Number(
    ((totalMarks / totalPossibleMarks) * 100).toFixed(2)
  );
}


/*
|--------------------------------------------------------------------------
| GET ACCEPTED ASSESSMENTS
|--------------------------------------------------------------------------
|
| Only assessments that:
|
| 1. belong to the requested academic year
| 2. belong to the requested term
| 3. belong to the student's grade
| 4. belong to the student's stream where applicable
| 5. are published
| 6. have explicitly been included in the report card
|
|--------------------------------------------------------------------------
*/

async function getReportCardEligibleAssessments({
  studentId,
  academicYearId,
  termId,
}) {
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

  const assessments = await prisma.assessment.findMany({
    where: {
      academicYearId,
      termId,
      gradeId: student.gradeId,

      /*
      |--------------------------------------------------------------------------
      | CRITICAL REPORT CARD CONTROL
      |--------------------------------------------------------------------------
      */

      isPublished: true,
      includeInReportCard: true,

      /*
      |--------------------------------------------------------------------------
      | If the assessment is stream-specific, only use it for students
      | belonging to that stream.
      |--------------------------------------------------------------------------
      */

      OR: [
        {
          streamId: null,
        },
        {
          streamId: student.streamId,
        },
      ],
    },

    include: {
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
            where: {
              studentId,
            },
          },
        },

        orderBy: {
          questionNumber: "asc",
        },
      },

      results: {
        where: {
          studentId,
        },

        include: {
          student: true,
        },
      },
    },

    orderBy: [
      {
        learningAreaId: "asc",
      },
      {
        assessmentDate: "asc",
      },
    ],
  });

  return assessments;
}


function buildLearningAreaAnalysis(assessments) {
  const grouped = new Map();

  for (const assessment of assessments) {
    const learningAreaId = assessment.learningAreaId;

    if (!grouped.has(learningAreaId)) {
      grouped.set(learningAreaId, {
        learningArea: assessment.learningArea,

        assessments: [],

        totalMarks: 0,

        totalPossibleMarks: 0,

        percentages: [],

        performanceLevels: [],

        teacherComments: [],

        learningOutcomes: [],
      });
    }

    const group = grouped.get(learningAreaId);

    /*
    |--------------------------------------------------------------------------
    | Assessment-level result
    |--------------------------------------------------------------------------
    */

    const assessmentResult =
      assessment.results &&
      assessment.results.length > 0
        ? assessment.results[0]
        : null;

    if (assessmentResult) {
      const marks =
        assessmentResult.marks !== null &&
        assessmentResult.marks !== undefined
          ? Number(assessmentResult.marks)
          : null;

      if (marks !== null) {
        group.totalMarks += marks;

        group.totalPossibleMarks += Number(
          assessment.totalMarks
        );

        const percentage = calculatePercentage(
          marks,
          assessment.totalMarks
        );

        if (percentage !== null) {
          group.percentages.push(percentage);
        }
      }

      if (assessmentResult.performanceLevel) {
        group.performanceLevels.push(
          String(assessmentResult.performanceLevel)
        );
      }

      if (assessmentResult.teacherComment) {
        group.teacherComments.push({
          assessment: assessment.name,
          teacher:
            assessment.teacher &&
            assessment.teacher.user
              ? `${assessment.teacher.user.firstName || ""} ${
                  assessment.teacher.user.lastName || ""
                }`.trim()
              : null,
          comment: assessmentResult.teacherComment,
        });
      }
    }

    /*
    |--------------------------------------------------------------------------
    | Preserve assessment information
    |--------------------------------------------------------------------------
    */

    group.assessments.push({
      id: assessment.id,

      name: assessment.name,

      type: assessment.type,

      assessmentDate: assessment.assessmentDate,

      totalMarks: Number(assessment.totalMarks),

      marks:
        assessmentResult &&
        assessmentResult.marks !== null &&
        assessmentResult.marks !== undefined
          ? Number(assessmentResult.marks)
          : null,

      performanceLevel:
        assessmentResult &&
        assessmentResult.performanceLevel
          ? String(assessmentResult.performanceLevel)
          : null,

      descriptor:
        assessmentResult &&
        assessmentResult.performanceLevel
          ? getCBCDescriptor(
              assessmentResult.performanceLevel
            )
          : null,

      teacherComment:
        assessmentResult &&
        assessmentResult.teacherComment
          ? assessmentResult.teacherComment
          : null,
    });

    /*
    |--------------------------------------------------------------------------
    | Preserve learning outcomes
    |--------------------------------------------------------------------------
    */

    for (const item of assessment.items || []) {
      if (!item.learningOutcome) {
        continue;
      }

      const outcome = item.learningOutcome;

      const itemResult =
        item.assessmentItemResults &&
        item.assessmentItemResults.length > 0
          ? item.assessmentItemResults[0]
          : null;

      const outcomeData = {
        learningOutcomeId: outcome.id,

        description: outcome.description,

        subStrand: outcome.subStrand
          ? {
              id: outcome.subStrand.id,
              name: outcome.subStrand.name,
              code: outcome.subStrand.code,
            }
          : null,

        strand:
          outcome.subStrand &&
          outcome.subStrand.strand
            ? {
                id: outcome.subStrand.strand.id,
                name: outcome.subStrand.strand.name,
                code: outcome.subStrand.strand.code,
              }
            : null,

        assessmentId: assessment.id,

        assessmentName: assessment.name,

        questionNumber: item.questionNumber,

        maxMarks: Number(item.maxMarks),

        marks:
          itemResult &&
          itemResult.marks !== null &&
          itemResult.marks !== undefined
            ? Number(itemResult.marks)
            : null,

        performanceLevel:
          itemResult &&
          itemResult.performanceLevel
            ? String(itemResult.performanceLevel)
            : null,

        descriptor:
          itemResult &&
          itemResult.performanceLevel
            ? getCBCDescriptor(
                itemResult.performanceLevel
              )
            : null,

        comment:
          itemResult && itemResult.comment
            ? itemResult.comment
            : null,
      };

      group.learningOutcomes.push(outcomeData);
    }
  }

  /*
  |--------------------------------------------------------------------------
  | Finalize learning areas
  |--------------------------------------------------------------------------
  */

  return Array.from(grouped.values()).map((group) => {
    const score = calculatePercentage(
      group.totalMarks,
      group.totalPossibleMarks
    );

    const performanceLevel = derivePerformanceLevel(
      group.performanceLevels
    );

    const descriptor = getCBCDescriptor(
      performanceLevel
    );

    /*
    |--------------------------------------------------------------------------
    | Combine teacher comments without losing their source.
    |--------------------------------------------------------------------------
    */

    const teacherComment = group.teacherComments
      .map((entry) => {
        if (entry.teacher) {
          return `${entry.teacher}: ${entry.comment}`;
        }

        return entry.comment;
      })
      .join(" | ");

    return {
      learningArea: group.learningArea,

      score,

      performanceLevel,

      descriptor,

      teacherComment:
        teacherComment || null,

      totalMarks: group.totalMarks,

      totalPossibleMarks:
        group.totalPossibleMarks,

      assessments: group.assessments,

      /*
      |--------------------------------------------------------------------------
      | CBC learning outcome evidence
      |--------------------------------------------------------------------------
      */

      learningOutcomes: group.learningOutcomes,

      /*
      |--------------------------------------------------------------------------
      | Individual teacher comments are preserved as well.
      |--------------------------------------------------------------------------
      */

      teacherComments: group.teacherComments,
    };
  });
}


/*
|--------------------------------------------------------------------------
| CALCULATE OVERALL SCORE
|--------------------------------------------------------------------------
|
| We use total marks / total possible marks across accepted assessments.
|
| This prevents an assessment with 10 marks from having the same weight
| as an assessment with 100 marks unless the school later chooses a
| different weighting system.
|
|--------------------------------------------------------------------------
*/

function calculateOverallScore(learningAreas) {
  let totalMarks = 0;
  let totalPossibleMarks = 0;

  for (const area of learningAreas) {
    totalMarks += Number(area.totalMarks || 0);

    totalPossibleMarks += Number(
      area.totalPossibleMarks || 0
    );
  }

  return {
    totalMarks,
    totalPossibleMarks,

    percentage: calculatePercentage(
      totalMarks,
      totalPossibleMarks
    ),
  };
}


/*
|--------------------------------------------------------------------------
| GET SCHOOL SETTINGS
|--------------------------------------------------------------------------
*/

async function getSchoolSettings() {
  const settings = await prisma.schoolSettings.findFirst();

  /*
  |--------------------------------------------------------------------------
  | If the school has not created settings yet, use safe defaults.
  |--------------------------------------------------------------------------
  */

  if (!settings) {
    return {
      rankingEnabled: true,
      reportCardsEnabled: true,
    };
  }

  return settings;
}


/*
|--------------------------------------------------------------------------
| CALCULATE RANKING
|--------------------------------------------------------------------------
|
| Ranking is optional and controlled by SchoolSettings.rankingEnabled.
|
|--------------------------------------------------------------------------
*/

async function calculateStudentRanking({
  student,
  academicYearId,
  termId,
}) {
  const settings = await getSchoolSettings();

  if (!settings.rankingEnabled) {
    return {
      gradePosition: null,
      streamPosition: null,
      totalScore: null,
      totalLearners: null,
    };
  }

  /*
  |--------------------------------------------------------------------------
  | Find students enrolled in this grade for the term.
  |--------------------------------------------------------------------------
  */

  const enrollments = await prisma.studentEnrollment.findMany({
    where: {
      academicYearId,

      OR: [
        {
          termId,
        },
        {
          termId: null,
        },
      ],

      gradeId: student.gradeId,

      isActive: true,
    },

    include: {
      student: true,
    },
  });

  const scores = [];

  /*
  |--------------------------------------------------------------------------
  | Calculate each student's score using the SAME report-card rules.
  |--------------------------------------------------------------------------
  */

  for (const enrollment of enrollments) {
    const eligibleAssessments =
      await getReportCardEligibleAssessments({
        studentId: enrollment.studentId,
        academicYearId,
        termId,
      });

    const learningAreas =
      buildLearningAreaAnalysis(
        eligibleAssessments
      );

    const overall =
      calculateOverallScore(learningAreas);

    if (overall.percentage !== null) {
      scores.push({
        studentId: enrollment.studentId,

        score: overall.percentage,

        streamId:
          enrollment.streamId || null,
      });
    }
  }

  /*
  |--------------------------------------------------------------------------
  | Sort highest score first.
  |--------------------------------------------------------------------------
  */

  scores.sort((a, b) => {
    if (b.score !== a.score) {
      return b.score - a.score;
    }

    return a.studentId.localeCompare(
      b.studentId
    );
  });

  /*
  |--------------------------------------------------------------------------
  | Grade position.
  |--------------------------------------------------------------------------
  */

  let gradePosition = null;

  const gradeIndex = scores.findIndex(
    (entry) =>
      entry.studentId === student.id
  );

  if (gradeIndex !== -1) {
    /*
    |--------------------------------------------------------------------------
    | Competition ranking:
    |
    | 95
    | 95
    | 90
    |
    | positions = 1, 1, 3
    |--------------------------------------------------------------------------
    */

    const studentScore =
      scores[gradeIndex].score;

    gradePosition =
      scores.filter(
        (entry) =>
          entry.score > studentScore
      ).length + 1;
  }

  /*
  |--------------------------------------------------------------------------
  | Stream position.
  |--------------------------------------------------------------------------
  */

  let streamPosition = null;

  if (student.streamId) {
    const streamScores = scores.filter(
      (entry) =>
        entry.streamId === student.streamId
    );

    const streamIndex =
      streamScores.findIndex(
        (entry) =>
          entry.studentId === student.id
      );

    if (streamIndex !== -1) {
      const studentScore =
        streamScores[streamIndex].score;

      streamPosition =
        streamScores.filter(
          (entry) =>
            entry.score > studentScore
        ).length + 1;
    }
  }

  return {
    gradePosition,

    streamPosition,

    totalScore:
      gradeIndex !== -1
        ? scores[gradeIndex].score
        : null,

    totalLearners: scores.length,
  };
}


/*
|--------------------------------------------------------------------------
| GENERATE REPORT CARD
|--------------------------------------------------------------------------
*/

async function generateReportCard({
  studentId,
  academicYearId,
  termId,
}) {
  /*
  |--------------------------------------------------------------------------
  | Check school settings.
  |--------------------------------------------------------------------------
  */

  const settings =
    await getSchoolSettings();

  if (!settings.reportCardsEnabled) {
    const error = new Error(
      "Report cards are currently disabled by school settings"
    );

    error.statusCode = 403;

    throw error;
  }

  /*
  |--------------------------------------------------------------------------
  | Check student.
  |--------------------------------------------------------------------------
  */

  const student =
    await prisma.student.findUnique({
      where: {
        id: studentId,
      },

      include: {
        enrollments: {
          where: {
            academicYearId,

            OR: [
              {
                termId,
              },
              {
                termId: null,
              },
            ],

            isActive: true,
          },

          include: {
            grade: true,
            stream: true,
          },
        },
      },
    });

  if (!student) {
    const error = new Error(
      "Student not found"
    );

    error.statusCode = 404;

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
      "Academic year not found"
    );

    error.statusCode = 404;

    throw error;
  }

  /*
  |--------------------------------------------------------------------------
  | Term.
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
  | Make sure the learner belongs to the requested academic period.
  |--------------------------------------------------------------------------
  */

  if (student.enrollments.length === 0) {
    const error = new Error(
      "Student has no active enrollment for this academic period"
    );

    error.statusCode = 400;

    throw error;
  }

  /*
  |--------------------------------------------------------------------------
  | Get ONLY accepted assessments.
  |--------------------------------------------------------------------------
  */

  const eligibleAssessments =
    await getReportCardEligibleAssessments({
      studentId,
      academicYearId,
      termId,
    });

  /*
  |--------------------------------------------------------------------------
  | Build CBC learning-area analysis.
  |--------------------------------------------------------------------------
  */

  const learningAreas =
    buildLearningAreaAnalysis(
      eligibleAssessments
    );

  /*
  |--------------------------------------------------------------------------
  | Calculate overall score.
  |--------------------------------------------------------------------------
  */

  const overall =
    calculateOverallScore(
      learningAreas
    );

  /*
  |--------------------------------------------------------------------------
  | Calculate ranking.
  |--------------------------------------------------------------------------
  */

  const ranking =
    await calculateStudentRanking({
      student,
      academicYearId,
      termId,
    });

  /*
  |--------------------------------------------------------------------------
  | Create/update ReportCard.
  |--------------------------------------------------------------------------
  |
  | IMPORTANT:
  |
  | We do not automatically publish the report card.
  |
  | It remains DRAFT for the Academic Admin to review.
  |
  |--------------------------------------------------------------------------
  */

  const reportCard =
    await prisma.reportCard.upsert({
      where: {
        studentId_academicYearId_termId: {
          studentId,
          academicYearId,
          termId,
        },
      },

      update: {
        /*
        |--------------------------------------------------------------------------
        | Regeneration should update the academic calculations.
        |--------------------------------------------------------------------------
        */

        totalScore:
          overall.percentage,

        totalLearners:
          ranking.totalLearners,

        gradePosition:
          ranking.gradePosition,

        streamPosition:
          ranking.streamPosition,

        generatedAt:
          new Date(),

        /*
        |--------------------------------------------------------------------------
        | Do NOT automatically change a published report card back to draft.
        |--------------------------------------------------------------------------
        |
        | The Academic Admin should deliberately control publication.
        |
        |--------------------------------------------------------------------------
        */

        ...(undefined),

      },

      create: {
        studentId,

        academicYearId,

        termId,

        status: "DRAFT",

        totalScore:
          overall.percentage,

        totalLearners:
          ranking.totalLearners,

        gradePosition:
          ranking.gradePosition,

        streamPosition:
          ranking.streamPosition,

        generatedAt:
          new Date(),
      },
    });

  

  await prisma.reportCardResult.deleteMany({
    where: {
      reportCardId:
        reportCard.id,
    },
  });

  /*
  |--------------------------------------------------------------------------
  | Create learning-area results.
  |--------------------------------------------------------------------------
  */

  for (const area of learningAreas) {
    await prisma.reportCardResult.create({
      data: {
        reportCardId:
          reportCard.id,

        learningAreaId:
          area.learningArea.id,

        score:
          area.score,

        grade:
          area.performanceLevel,

        descriptor:
          area.descriptor,

        teacherComment:
          area.teacherComment,
      },
    });
  }

  /*
  |--------------------------------------------------------------------------
  | Return the complete generated report.
  |--------------------------------------------------------------------------
  |
  | The learning outcomes are returned here even though the current
  | ReportCardResult model does not yet have a field to persist them.
  |
  |--------------------------------------------------------------------------
  */

  return {
    reportCard,

    student,

    academicYear,

    term,

    overall,

    ranking,

    learningAreas,

    /*
    |--------------------------------------------------------------------------
    | Useful for Academic Admin:
    |--------------------------------------------------------------------------
    */

    assessmentsUsed:
      eligibleAssessments.map(
        (assessment) => ({
          id: assessment.id,
          name: assessment.name,
          type: assessment.type,
          learningArea:
            assessment.learningArea,
          assessmentDate:
            assessment.assessmentDate,
          teacher:
            assessment.teacher,
          includeInReportCard:
            assessment.includeInReportCard,
          isPublished:
            assessment.isPublished,
        })
      ),
  };
}


/*
|--------------------------------------------------------------------------
| GET REPORT CARD BY ID
|--------------------------------------------------------------------------
*/

async function getReportCardById(reportCardId) {
  const reportCard =
    await prisma.reportCard.findUnique({
      where: {
        id: reportCardId,
      },

      include: {
        student: true,

        academicYear: true,

        term: true,

        results: {
          include: {
            learningArea: true,
          },

          orderBy: {
            learningArea: {
              name: "asc",
            },
          },
        },
      },
    });

  if (!reportCard) {
    const error = new Error(
      "Report card not found"
    );

    error.statusCode = 404;

    throw error;
  }

  return reportCard;
}


/*
|--------------------------------------------------------------------------
| GET STUDENT REPORT CARDS
|--------------------------------------------------------------------------
*/

async function getStudentReportCards(
  studentId
) {
  const student =
    await prisma.student.findUnique({
      where: {
        id: studentId,
      },
    });

  if (!student) {
    const error = new Error(
      "Student not found"
    );

    error.statusCode = 404;

    throw error;
  }

  return prisma.reportCard.findMany({
    where: {
      studentId,
    },

    include: {
      academicYear: true,

      term: true,

      results: {
        include: {
          learningArea: true,
        },

        orderBy: {
          learningArea: {
            name: "asc",
          },
        },
      },
    },

    orderBy: [
      {
        academicYear: {
          year: "desc",
        },
      },

      {
        term: {
          termNumber: "desc",
        },
      },
    ],
  });
}


/*
|--------------------------------------------------------------------------
| PUBLISH REPORT CARD
|--------------------------------------------------------------------------
|
| Only the controller/middleware should decide whether the current user
| has the academic-admin permission.
|
| This service only handles the report-card state transition.
|
|--------------------------------------------------------------------------
*/






/*
|--------------------------------------------------------------------------
| GET ASSESSMENTS AVAILABLE FOR REPORT CARD
|--------------------------------------------------------------------------
|
| This is useful for the Academic Admin.
|
| It clearly separates:
|
| INCLUDED assessments
| from
| EXCLUDED assessments.
|
|--------------------------------------------------------------------------
*/

async function getAssessmentReportCardControl({
  academicYearId,
  termId,
  gradeId,
  streamId,
}) {
  const assessments =
    await prisma.assessment.findMany({
      where: {
        academicYearId,

        termId,

        gradeId,

        ...(streamId
          ? {
              OR: [
                {
                  streamId: null,
                },
                {
                  streamId,
                },
              ],
            }
          : {}),

        isPublished: true,
      },

      include: {
        learningArea: true,

        teacher: {
          include: {
            user: true,
          },
        },

        results: true,
      },

      orderBy: [
        {
          learningArea: {
            name: "asc",
          },
        },

        {
          assessmentDate: "asc",
        },
      ],
    });

  return {
    included: assessments.filter(
      (assessment) =>
        assessment.includeInReportCard
    ),

    excluded: assessments.filter(
      (assessment) =>
        !assessment.includeInReportCard
    ),

    all: assessments,
  };
}


/*
|--------------------------------------------------------------------------
| UPDATE CLASS TEACHER COMMENT
|--------------------------------------------------------------------------
|
| Only the class teacher responsible for the student's class should
| be allowed to enter the class teacher comment.
|
|--------------------------------------------------------------------------
*/

async function updateClassTeacherComment({
  reportCardId,
  comment,
  userId,
}) {
  if (!reportCardId || !userId) {
    const error = new Error(
      "reportCardId and userId are required"
    );

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
    const error = new Error(
      "Teacher profile not found"
    );

    error.statusCode = 404;
    throw error;
  }

  /*
  |--------------------------------------------------------------------------
  | Find report card
  |--------------------------------------------------------------------------
  */

  const reportCard =
    await prisma.reportCard.findUnique({
      where: {
        id: reportCardId,
      },

      include: {
        student: {
          include: {
            enrollments: {
              where: {
                academicYearId:
                  undefined,
              },
            },
          },
        },

        academicYear: true,
        term: true,
      },
    });

  if (!reportCard) {
    const error = new Error(
      "Report card not found"
    );

    error.statusCode = 404;
    throw error;
  }

  /*
  |--------------------------------------------------------------------------
  | Do not modify published report cards
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
  | Find the student's enrollment for this academic year and term
  |--------------------------------------------------------------------------
  */

  const enrollment =
    await prisma.studentEnrollment.findFirst({
      where: {
        studentId: reportCard.studentId,

        academicYearId:
          reportCard.academicYearId,

        OR: [
          {
            termId: reportCard.termId,
          },
          {
            termId: null,
          },
        ],

        isActive: true,
      },
    });

  if (!enrollment) {
    const error = new Error(
      "Student enrollment for this report card was not found"
    );

    error.statusCode = 404;
    throw error;
  }

  /*
  |--------------------------------------------------------------------------
  | Find whether this teacher is the class teacher
  |--------------------------------------------------------------------------
  |
  | This part depends on how your school currently stores the class-teacher
  | assignment.
  |
  | For now, we verify that the teacher teaches the student's grade/stream.
  |
  |--------------------------------------------------------------------------
  */

  const teachingAssignment =
    await prisma.teacherTeachingAssignment.findFirst({
      where: {
        teacherId: teacher.id,

        gradeId: enrollment.gradeId,

        ...(enrollment.streamId
          ? {
              streamId: enrollment.streamId,
            }
          : {}),
      },
    });

  if (!teachingAssignment) {
    const error = new Error(
      "You are not assigned to this student's class"
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
        comment === undefined
          ? null
          : String(comment).trim(),
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
| UPDATE HEAD OF INSTITUTION COMMENT
|--------------------------------------------------------------------------
|
| The route should additionally be protected by the
| HEAD_OF_INSTITUTION permission.
|
|--------------------------------------------------------------------------
*/

async function updateHeadTeacherComment({
  reportCardId,
  comment,
  userId,
}) {
  if (!reportCardId || !userId) {
    const error = new Error(
      "reportCardId and userId are required"
    );

    error.statusCode = 400;
    throw error;
  }

  /*
  |--------------------------------------------------------------------------
  | Verify authenticated user exists
  |--------------------------------------------------------------------------
  */

  const user = await prisma.user.findUnique({
    where: {
      id: userId,
    },

    include: {
      roles: {
        include: {
          role: true,
        },
      },
    },
  });

  if (!user) {
    const error = new Error(
      "User not found"
    );

    error.statusCode = 404;
    throw error;
  }

  /*
  |--------------------------------------------------------------------------
  | Verify Head of Institution role
  |--------------------------------------------------------------------------
  */

  const isHeadOfInstitution =
    user.roles.some(
      (userRole) =>
        userRole.role.code ===
        "HEAD_OF_INSTITUTION"
    );

  if (!isHeadOfInstitution) {
    const error = new Error(
      "Only the Head of Institution can add the head teacher comment"
    );

    error.statusCode = 403;
    throw error;
  }

  /*
  |--------------------------------------------------------------------------
  | Find report card
  |--------------------------------------------------------------------------
  */

  const reportCard =
    await prisma.reportCard.findUnique({
      where: {
        id: reportCardId,
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

  if (!reportCard) {
    const error = new Error(
      "Report card not found"
    );

    error.statusCode = 404;
    throw error;
  }

  /*
  |--------------------------------------------------------------------------
  | Published report cards are locked
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
  | Update Head of Institution comment
  |--------------------------------------------------------------------------
  */

  return prisma.reportCard.update({
    where: {
      id: reportCardId,
    },

    data: {
      headTeacherComment:
        comment === undefined
          ? null
          : String(comment).trim(),
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
| PUBLISH REPORT CARD
|--------------------------------------------------------------------------
|
| Only a Head of Institution should be allowed to reach this service
| through the protected route.
|
|--------------------------------------------------------------------------
*/

async function publishReportCard({
  reportCardId,
  userId,
}) {
  if (!reportCardId || !userId) {
    const error = new Error(
      "reportCardId and userId are required"
    );

    error.statusCode = 400;
    throw error;
  }

  /*
  |--------------------------------------------------------------------------
  | Verify Head of Institution
  |--------------------------------------------------------------------------
  */

  const user = await prisma.user.findUnique({
    where: {
      id: userId,
    },

    include: {
      roles: {
        include: {
          role: true,
        },
      },
    },
  });

  if (!user) {
    const error = new Error(
      "User not found"
    );

    error.statusCode = 404;
    throw error;
  }

  const isHeadOfInstitution =
    user.roles.some(
      (userRole) =>
        userRole.role.code ===
        "HEAD_OF_INSTITUTION"
    );

  if (!isHeadOfInstitution) {
    const error = new Error(
      "Only the Head of Institution can publish report cards"
    );

    error.statusCode = 403;
    throw error;
  }

  /*
  |--------------------------------------------------------------------------
  | Find report card
  |--------------------------------------------------------------------------
  */

  const reportCard =
    await prisma.reportCard.findUnique({
      where: {
        id: reportCardId,
      },

      include: {
        results: true,
      },
    });

  if (!reportCard) {
    const error = new Error(
      "Report card not found"
    );

    error.statusCode = 404;
    throw error;
  }

  /*
  |--------------------------------------------------------------------------
  | Prevent publishing twice
  |--------------------------------------------------------------------------
  */

  if (reportCard.status === "PUBLISHED") {
    const error = new Error(
      "Report card is already published"
    );

    error.statusCode = 400;
    throw error;
  }

  /*
  |--------------------------------------------------------------------------
  | Ensure report card has learning-area results
  |--------------------------------------------------------------------------
  */

  if (reportCard.results.length === 0) {
    const error = new Error(
      "Report card must contain learning-area results before publishing"
    );

    error.statusCode = 400;
    throw error;
  }

  /*
  |--------------------------------------------------------------------------
  | Publish
  |--------------------------------------------------------------------------
  */

  return prisma.reportCard.update({
    where: {
      id: reportCardId,
    },

    data: {
      status: "PUBLISHED",

      publishedAt: new Date(),
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


module.exports = {
  getCBCDescriptor,
  getPerformanceScore,
  derivePerformanceLevel,

  getReportCardEligibleAssessments,

  buildLearningAreaAnalysis,

  calculateOverallScore,

  calculateStudentRanking,

  generateReportCard,

  getReportCardById,

  getStudentReportCards,

  publishReportCard,

  updateClassTeacherComment,

  updateHeadTeacherComment,

  getAssessmentReportCardControl,
};
