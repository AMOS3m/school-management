
const prisma = require("../../lib/prisma");

async function getHeadInstitutionDashboard() {


  const academicYear =
    await prisma.academicYear.findFirst({
      orderBy: {
        createdAt: "desc",
      },
    });


  /*
  |--------------------------------------------------------------------------
  | CURRENT TERM
  |--------------------------------------------------------------------------
  */

  let currentTerm = null;

  if (academicYear) {
    currentTerm =
      await prisma.term.findFirst({
        where: {
          academicYearId: academicYear.id,
        },
        orderBy: {
          termNumber: "desc",
        },
      });
  }


  /*
  |--------------------------------------------------------------------------
  | STUDENT COUNT
  |--------------------------------------------------------------------------
  */

  const totalStudents =
    await prisma.student.count();


  /*
  |--------------------------------------------------------------------------
  | TEACHER COUNT
  |--------------------------------------------------------------------------
  */

  const totalTeachers =
    await prisma.teacher.count();


  /*
  |--------------------------------------------------------------------------
  | GRADE COUNT
  |--------------------------------------------------------------------------
  */

  const totalGrades =
    await prisma.grade.count();


  /*
  |--------------------------------------------------------------------------
  | STREAM COUNT
  |--------------------------------------------------------------------------
  */

  const totalStreams =
    await prisma.stream.count();


  /*
  |--------------------------------------------------------------------------
  | CLASS TEACHER ASSIGNMENTS
  |--------------------------------------------------------------------------
  */

  const totalClassTeacherAssignments =
    await prisma.classTeacher.count();


  /*
  |--------------------------------------------------------------------------
  | TEACHING ASSIGNMENTS
  |--------------------------------------------------------------------------
  */

  const totalTeachingAssignments =
    await prisma.teacherTeachingAssignment.count();


  /*
  |--------------------------------------------------------------------------
  | ASSESSMENT OVERVIEW
  |--------------------------------------------------------------------------
  */

  let assessmentOverview = {
    total: 0,
    published: 0,
    includedInReportCard: 0,
    excludedFromReportCard: 0,
  };

  if (academicYear) {

    const assessments =
      await prisma.assessment.findMany({
        where: {
          academicYearId: academicYear.id,
          ...(currentTerm
            ? {
                termId: currentTerm.id,
              }
            : {}),
        },

        select: {
          isPublished: true,
          includeInReportCard: true,
        },
      });


    assessmentOverview = {
      total: assessments.length,

      published:
        assessments.filter(
          (assessment) =>
            assessment.isPublished
        ).length,

      includedInReportCard:
        assessments.filter(
          (assessment) =>
            assessment.includeInReportCard
        ).length,

      excludedFromReportCard:
        assessments.filter(
          (assessment) =>
            !assessment.includeInReportCard
        ).length,
    };
  }


  /*
  |--------------------------------------------------------------------------
  | REPORT CARD OVERVIEW
  |--------------------------------------------------------------------------
  */

  let reportCardOverview = {
    total: 0,
    draft: 0,
    published: 0,
  };

  if (academicYear) {

    const reportCards =
      await prisma.reportCard.findMany({
        where: {
          academicYearId: academicYear.id,

          ...(currentTerm
            ? {
                termId: currentTerm.id,
              }
            : {}),
        },

        select: {
          status: true,
        },
      });


    reportCardOverview = {
      total: reportCards.length,

      draft:
        reportCards.filter(
          (reportCard) =>
            reportCard.status === "DRAFT"
        ).length,

      published:
        reportCards.filter(
          (reportCard) =>
            reportCard.status === "PUBLISHED"
        ).length,
    };
  }


  /*
  |--------------------------------------------------------------------------
  | ATTENDANCE OVERVIEW
  |--------------------------------------------------------------------------
  |
  | We only calculate this if a current term exists.
  |
  */

  let attendanceOverview = {
    totalRecords: 0,
    present: 0,
    absent: 0,
    late: 0,
  };


  if (currentTerm) {

    const attendanceRecords =
      await prisma.attendance.findMany({
        where: {
          termId: currentTerm.id,
        },

        select: {
          status: true,
        },
      });


    attendanceOverview = {
      totalRecords:
        attendanceRecords.length,

      present:
        attendanceRecords.filter(
          (record) =>
            record.status === "PRESENT"
        ).length,

      absent:
        attendanceRecords.filter(
          (record) =>
            record.status === "ABSENT"
        ).length,

      late:
        attendanceRecords.filter(
          (record) =>
            record.status === "LATE"
        ).length,
    };
  }




let feesOverview = {
  totalFeesCharged: 0,
  totalFeesCollected: 0,
  totalCredits: 0,
  totalDebits: 0,
  outstandingBalance: 0,
  studentsWithBalance: 0,
  studentsFullyPaid: 0,
  partiallyPaidAccounts: 0,
  pendingCharges: 0,
  collectionPercentage: 0,
};


/*
|--------------------------------------------------------------------------
| GET CURRENT TERM FEE CHARGES
|--------------------------------------------------------------------------
*/

if (currentTerm) {

  const feeCharges =
    await prisma.feeCharge.findMany({
      where: {
        termId: currentTerm.id,
      },

      select: {
        id: true,
        feeAccountId: true,
        amount: true,
        status: true,
      },
    });


  /*
  |--------------------------------------------------------------------------
  | TOTAL FEES CHARGED
  |--------------------------------------------------------------------------
  */

  const totalFeesCharged =
    feeCharges
      .filter(
        (charge) =>
          charge.status !== "WAIVED"
      )
      .reduce(
        (total, charge) =>
          total + Number(charge.amount),
        0
      );


  /*
  |--------------------------------------------------------------------------
  | PENDING CHARGES
  |--------------------------------------------------------------------------
  */

  const pendingCharges =
    feeCharges.filter(
      (charge) =>
        charge.status === "PENDING"
    ).length;


  /*
  |--------------------------------------------------------------------------
  | GET ALL FEE ACCOUNTS
  |--------------------------------------------------------------------------
  |
  | We retrieve accounts belonging to students who have charges
  | in the current term.
  |
  */

  const feeAccountIds = [
    ...new Set(
      feeCharges.map(
        (charge) =>
          charge.feeAccountId
      )
    ),
  ];


  const feeAccounts =
    await prisma.feeAccount.findMany({
      where: {
        id: {
          in: feeAccountIds,
        },
      },

      include: {
        payments: {
          where: {
            status: "COMPLETED",

            termId: currentTerm.id,
          },

          select: {
            amount: true,
          },
        },

        adjustments: {
          select: {
            type: true,
            amount: true,
          },
        },
      },
    });


  /*
  |--------------------------------------------------------------------------
  | TOTAL PAYMENTS
  |--------------------------------------------------------------------------
  */

  const totalFeesCollected =
    feeAccounts.reduce(
      (total, account) => {

        const payments =
          account.payments.reduce(
            (
              paymentTotal,
              payment
            ) =>
              paymentTotal +
              Number(
                payment.amount
              ),
            0
          );

        return total + payments;
      },

      0
    );


  /*
  |--------------------------------------------------------------------------
  | TOTAL CREDITS
  |--------------------------------------------------------------------------
  */

  const totalCredits =
    feeAccounts.reduce(
      (total, account) => {

        const credits =
          account.adjustments
            .filter(
              (adjustment) =>
                adjustment.type ===
                "CREDIT"
            )
            .reduce(
              (
                adjustmentTotal,
                adjustment
              ) =>
                adjustmentTotal +
                Number(
                  adjustment.amount
                ),
              0
            );

        return total + credits;
      },

      0
    );


  /*
  |--------------------------------------------------------------------------
  | TOTAL DEBITS
  |--------------------------------------------------------------------------
  */

  const totalDebits =
    feeAccounts.reduce(
      (total, account) => {

        const debits =
          account.adjustments
            .filter(
              (adjustment) =>
                adjustment.type ===
                "DEBIT"
            )
            .reduce(
              (
                adjustmentTotal,
                adjustment
              ) =>
                adjustmentTotal +
                Number(
                  adjustment.amount
                ),
              0
            );

        return total + debits;
      },

      0
    );


  /*
  |--------------------------------------------------------------------------
  | OUTSTANDING BALANCE
  |--------------------------------------------------------------------------
  |
  | Outstanding =
  |
  | Charges
  | + Debits
  | - Credits
  | - Completed Payments
  |
  |--------------------------------------------------------------------------
  */

  const outstandingBalance =
    Math.max(
      0,
      totalFeesCharged +
        totalDebits -
        totalCredits -
        totalFeesCollected
    );


  /*
  |--------------------------------------------------------------------------
  | STUDENT ACCOUNT STATUS
  |--------------------------------------------------------------------------
  */

  let studentsWithBalance = 0;

  let studentsFullyPaid = 0;

  let partiallyPaidAccounts = 0;


  for (
    const account of feeAccounts
  ) {

    /*
    |----------------------------------------------------------------------
    | Charges belonging to this account
    |----------------------------------------------------------------------
    */

    const accountCharges =
      feeCharges.filter(
        (charge) =>
          charge.feeAccountId ===
          account.id
      );


    const charges =
      accountCharges
        .filter(
          (charge) =>
            charge.status !==
            "WAIVED"
        )
        .reduce(
          (
            total,
            charge
          ) =>
            total +
            Number(
              charge.amount
            ),
          0
        );


    /*
    |----------------------------------------------------------------------
    | Payments
    |----------------------------------------------------------------------
    */

    const payments =
      account.payments.reduce(
        (
          total,
          payment
        ) =>
          total +
          Number(
            payment.amount
          ),
        0
      );


    /*
    |----------------------------------------------------------------------
    | Adjustments
    |----------------------------------------------------------------------
    */

    const credits =
      account.adjustments
        .filter(
          (adjustment) =>
            adjustment.type ===
            "CREDIT"
        )
        .reduce(
          (
            total,
            adjustment
          ) =>
            total +
            Number(
              adjustment.amount
            ),
          0
        );


    const debits =
      account.adjustments
        .filter(
          (adjustment) =>
            adjustment.type ===
            "DEBIT"
        )
        .reduce(
          (
            total,
            adjustment
          ) =>
            total +
            Number(
              adjustment.amount
            ),
          0
        );


    /*
    |----------------------------------------------------------------------
    | Calculate student's outstanding balance
    |----------------------------------------------------------------------
    */

    const balance =
      charges +
      debits -
      credits -
      payments;


    /*
    |----------------------------------------------------------------------
    | Student has outstanding balance
    |----------------------------------------------------------------------
    */

    if (balance > 0) {

      studentsWithBalance++;


      /*
      |--------------------------------------------------------------------
      | Determine whether account is partially paid
      |--------------------------------------------------------------------
      */

      if (
        payments > 0 &&
        balance > 0
      ) {
        partiallyPaidAccounts++;
      }

    } else {

      /*
      |--------------------------------------------------------------------
      | Fully paid
      |--------------------------------------------------------------------
      */

      studentsFullyPaid++;
    }
  }


  /*
  |--------------------------------------------------------------------------
  | COLLECTION PERCENTAGE
  |--------------------------------------------------------------------------
  */

  const collectionBase =
    totalFeesCharged +
    totalDebits -
    totalCredits;


  const collectionPercentage =
    collectionBase > 0
      ? Number(
          (
            (totalFeesCollected /
              collectionBase) *
            100
          ).toFixed(2)
        )
      : 0;


  /*
  |--------------------------------------------------------------------------
  | FINAL FINANCIAL OVERVIEW
  |--------------------------------------------------------------------------
  */

  feesOverview = {

    totalFeesCharged:
      Number(
        totalFeesCharged.toFixed(2)
      ),

    totalFeesCollected:
      Number(
        totalFeesCollected.toFixed(2)
      ),

    totalCredits:
      Number(
        totalCredits.toFixed(2)
      ),

    totalDebits:
      Number(
        totalDebits.toFixed(2)
      ),

    outstandingBalance:
      Number(
        outstandingBalance.toFixed(2)
      ),

    studentsWithBalance,

    studentsFullyPaid,

    partiallyPaidAccounts,

    pendingCharges,

    collectionPercentage,
  };
}







  /*
  |--------------------------------------------------------------------------
  | RECENT ASSESSMENTS
  |--------------------------------------------------------------------------
  */

  let recentAssessments = [];

  if (academicYear) {

    recentAssessments =
      await prisma.assessment.findMany({
        where: {
          academicYearId:
            academicYear.id,

          ...(currentTerm
            ? {
                termId:
                  currentTerm.id,
              }
            : {}),
        },

        include: {
          learningArea: true,
          grade: true,
          stream: true,
          teacher: {
            include: {
              user: true,
            },
          },
        },

        orderBy: {
          assessmentDate: "desc",
        },

        take: 10,
      });
  }


  /*
  |--------------------------------------------------------------------------
  | RECENT REPORT CARDS
  |--------------------------------------------------------------------------
  */

  let recentReportCards = [];

  if (academicYear) {

    recentReportCards =
      await prisma.reportCard.findMany({
        where: {
          academicYearId:
            academicYear.id,

          ...(currentTerm
            ? {
                termId:
                  currentTerm.id,
            }
            : {}),
        },

        include: {
          student: true,
          term: true,
        },

        orderBy: {
          updatedAt: "desc",
        },

        take: 10,
      });
  }


  /*
  |--------------------------------------------------------------------------
  | RETURN DASHBOARD
  |--------------------------------------------------------------------------
  */

  return {
    academic: {
      academicYear,
      currentTerm,
    },

    school: {
      totalStudents,
      totalTeachers,
      totalGrades,
      totalStreams,
      totalClassTeacherAssignments,
      totalTeachingAssignments,
    },

    attendance: attendanceOverview,

    assessments: assessmentOverview,

    reportCards: reportCardOverview,

    fees: feesOverview,

    recentAssessments,

    recentReportCards,
  };
}


/*
|--------------------------------------------------------------------------
| GET SCHOOL SUMMARY
|--------------------------------------------------------------------------
|
| A smaller endpoint that can be used by the Head of Institution
| dashboard cards.
|
|--------------------------------------------------------------------------
*/

async function getSchoolSummary() {

  const [
    totalStudents,
    totalTeachers,
    totalGrades,
    totalStreams,
    totalClassTeacherAssignments,
    totalTeachingAssignments,
  ] = await Promise.all([

    prisma.student.count(),

    prisma.teacher.count(),

    prisma.grade.count(),

    prisma.stream.count(),

    prisma.classTeacher.count(),

    prisma.teacherTeachingAssignment.count(),

  ]);


  return {
    totalStudents,
    totalTeachers,
    totalGrades,
    totalStreams,
    totalClassTeacherAssignments,
    totalTeachingAssignments,
  };
}


/*
|--------------------------------------------------------------------------
| GET ACADEMIC PROGRESS
|--------------------------------------------------------------------------
|
| Shows the Head of Institution how far the school has progressed
| academically during the current term.
|
|--------------------------------------------------------------------------
*/

async function getAcademicProgress() {

  const academicYear =
    await prisma.academicYear.findFirst({
      orderBy: {
        createdAt: "desc",
      },
    });


  if (!academicYear) {

    return {
      academicYear: null,
      term: null,
      assessments: {
        total: 0,
        published: 0,
        includedInReportCard: 0,
      },
      reportCards: {
        total: 0,
        draft: 0,
        published: 0,
      },
    };
  }


  const term =
    await prisma.term.findFirst({
      where: {
        academicYearId:
          academicYear.id,
      },

      orderBy: {
        termNumber: "desc",
      },
    });


  const assessmentWhere = {
    academicYearId:
      academicYear.id,

    ...(term
      ? {
          termId: term.id,
        }
      : {}),
  };


  const [
    totalAssessments,
    publishedAssessments,
    includedAssessments,
    totalReportCards,
    draftReportCards,
    publishedReportCards,
  ] = await Promise.all([

    prisma.assessment.count({
      where: assessmentWhere,
    }),

    prisma.assessment.count({
      where: {
        ...assessmentWhere,
        isPublished: true,
      },
    }),

    prisma.assessment.count({
      where: {
        ...assessmentWhere,
        includeInReportCard: true,
      },
    }),

    prisma.reportCard.count({
      where: {
        ...assessmentWhere,
      },
    }),

    prisma.reportCard.count({
      where: {
        ...assessmentWhere,
        status: "DRAFT",
      },
    }),

    prisma.reportCard.count({
      where: {
        ...assessmentWhere,
        status: "PUBLISHED",
      },
    }),

  ]);


  return {
    academicYear,
    term,

    assessments: {
      total: totalAssessments,
      published: publishedAssessments,
      includedInReportCard:
        includedAssessments,
    },

    reportCards: {
      total: totalReportCards,
      draft: draftReportCards,
      published: publishedReportCards,
    },
  };
}


/*
|--------------------------------------------------------------------------
| EXPORTS
|--------------------------------------------------------------------------
*/

module.exports = {
  getHeadInstitutionDashboard,
  getSchoolSummary,
  getAcademicProgress,
};

