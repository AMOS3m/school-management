
const prisma = require("../../lib/prisma");
const { getTeacherById } = require("../teachers/teacher.service");



async function getMyProfile(userId) {
  const parent = await prisma.parent.findUnique({
    where: {
      userId,
    },

    include: {
      user: {
        select: {
          id: true,
          firstName: true,
          middleName: true,
          lastName: true,
          email: true,
          phone: true,
          status: true,
        },
      },

      children: {
        include: {
          student: {
            select: {
              id: true,
              admissionNumber: true,
              firstName: true,
              middleName: true,
              lastName: true,
              dateOfBirth: true,
              gender: true,
            },
          },
        },
      },
    },
  });

  if (!parent) {
    const error = new Error("Parent profile not found");
    error.statusCode = 404;
    throw error;
  }

  return parent;
}


async function getParents() {
  return prisma.parent.findMany({
    include: {
      user: {
        select: {
          id: true,
          firstName: true,
          middleName: true,
          lastName: true,
          email: true,
          phone: true,
          status: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });
}

async function getParentById(id) {
  return prisma.parent.findUnique({
    where: {
      id,
    },
    include: {
      user: {
        select: {
          id: true,
          firstName: true,
          middleName: true,
          lastName: true,
          email: true,
          phone: true,
          status: true,
        },
      },
    },
  });
}


/*
|--------------------------------------------------------------------------
| GET MY CHILDREN
|--------------------------------------------------------------------------
|
| Returns only children linked to the authenticated parent.
|
|--------------------------------------------------------------------------
*/

async function getMyChildren(userId) {
  const parent = await prisma.parent.findUnique({
    where: {
      userId,
    },

    select: {
      id: true,
    },
  });

  if (!parent) {
    const error = new Error("Parent profile not found");
    error.statusCode = 404;
    throw error;
  }

  const children = await prisma.studentParent.findMany({
    where: {
      parentId: parent.id,
    },

    include: {
      student: {
        include: {
          enrollments: {
            where: {
              isActive: true,
            },

            include: {
              grade: true,
              stream: true,
              academicYear: true,
              term: true,
            },

            orderBy: {
              admissionDate: "desc",
            },

            take: 1,
          },
        },
      },
    },

    orderBy: {
      student: {
        lastName: "asc",
      },
    },
  });

  return children;
}


/*
|--------------------------------------------------------------------------
| VERIFY PARENT-CHILD RELATIONSHIP
|--------------------------------------------------------------------------
|
| This is a critical security function.
|
| It prevents:
|
| Parent A → accessing Parent B's child.
|
|--------------------------------------------------------------------------
*/

async function verifyChildBelongsToParent(userId, studentId) {
  const parent = await prisma.parent.findUnique({
    where: {
      userId,
    },

    select: {
      id: true,
    },
  });

  if (!parent) {
    const error = new Error("Parent profile not found");
    error.statusCode = 404;
    throw error;
  }

  const relationship = await prisma.studentParent.findUnique({
    where: {
      studentId_parentId: {
        studentId,
        parentId: parent.id,
      },
    },

    select: {
      id: true,
      relationship: true,
      isPrimary: true,
    },
  });

  if (!relationship) {
    const error = new Error(
      "You are not authorized to access this student"
    );

    error.statusCode = 403;
    throw error;
  }

  return {
    parentId: parent.id,
    relationship,
  };
}


/*
|--------------------------------------------------------------------------
| GET MY CHILD
|--------------------------------------------------------------------------
|
| Returns detailed information about one child.
|
|--------------------------------------------------------------------------
*/

async function getMyChildren(userId, studentId) {
  await verifyChildBelongsToParent(userId, studentId);

  const student = await prisma.student.findUnique({
    where: {
      id: studentId,
    },

    include: {
      enrollments: {
        include: {
          grade: true,
          stream: true,
          academicYear: true,
          term: true,
        },

        orderBy: {
          admissionDate: "desc",
        },
      },

      parentLinks: {
        include: {
          parent: {
            include: {
              user: {
                select: {
                  id: true,
                  firstName: true,
                  middleName: true,
                  lastName: true,
                  email: true,
                  phone: true,
                },
              },
            },
          },
        },
      },
    },
  });

  if (!student) {
    const error = new Error("Student not found");
    error.statusCode = 404;
    throw error;
  }

  return student;
}


/*
|--------------------------------------------------------------------------
| GET CHILD ASSESSMENTS
|--------------------------------------------------------------------------
|
| Returns the child's assessments together with:
|
| - Learning area
| - Assessment name/type
| - Marks
| - Performance level
| - Teacher comment
| - Report-card inclusion
|
|--------------------------------------------------------------------------
*/

async function getChildAssessments(
  userId,
  studentId,
  filters = {}
) {
  await verifyChildBelongsToParent(userId, studentId);

  const where = {
    studentId,
  };

  if (filters.academicYearId) {
    where.assessment = {
      academicYearId: filters.academicYearId,
    };
  }

  if (filters.termId) {
    where.assessment = {
      ...(where.assessment || {}),
      termId: filters.termId,
    };
  }

  const results = await prisma.assessmentResult.findMany({
    where,

    include: {
      assessment: {
        include: {
          learningArea: true,
          grade: true,
          stream: true,
          term: true,
          academicYear: true,
          teacher: {
            include: {
              user: {
                select: {
                  firstName: true,
                  middleName: true,
                  lastName: true,
                },
              },
            },
          },
        },
      },
    },

    orderBy: {
      assessment: {
        assessmentDate: "desc",
      },
    },
  });

  return results;
}


/*
|--------------------------------------------------------------------------
| GET CHILD REPORT CARDS
|--------------------------------------------------------------------------
|
| Parents should only see published report cards.
|
|--------------------------------------------------------------------------
*/

async function getChildReportCards(userId, studentId) {
  await verifyChildBelongsToParent(userId, studentId);

  return prisma.reportCard.findMany({
    where: {
      studentId,

      status: "PUBLISHED",
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
          startDate: "desc",
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
| GET ONE CHILD REPORT CARD
|--------------------------------------------------------------------------
|
| Only published report cards are exposed to parents.
|
|--------------------------------------------------------------------------
*/

async function getChildReportCards(
  userId,
  studentId,
  reportCardId
) {
  await verifyChildBelongsToParent(userId, studentId);

  const reportCard = await prisma.reportCard.findFirst({
    where: {
      id: reportCardId,
      studentId,
      status: "PUBLISHED",
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
      "Published report card not found"
    );

    error.statusCode = 404;
    throw error;
  }

  return reportCard;
}


/*
|--------------------------------------------------------------------------
| GET CHILD FEES
|--------------------------------------------------------------------------
|
| Returns:
|
| - Charges
| - Payments
| - Adjustments
|
| The service also calculates the current balance.
|
|--------------------------------------------------------------------------
*/

async function getChildFees(userId, studentId) {
  await verifyChildBelongsToParent(userId, studentId);

  const feeAccount = await prisma.feeAccount.findUnique({
    where: {
      studentId,
    },

    include: {
      charges: {
        include: {
          academicYear: true,
          term: true,
        },

        orderBy: {
          createdAt: "desc",
        },
      },

      payments: {
        orderBy: {
          paymentDate: "desc",
        },
      },

      adjustments: {
        orderBy: {
          createdAt: "desc",
        },
      },
    },
  });

  if (!feeAccount) {
    return {
      feeAccount: null,
      summary: {
        totalCharges: 0,
        totalPaid: 0,
        totalCredits: 0,
        totalDebits: 0,
        balance: 0,
      },

      charges: [],
      payments: [],
      adjustments: [],
    };
  }

  const totalCharges = feeAccount.charges.reduce(
    (total, charge) =>
      total + Number(charge.amount),
    0
  );

  const totalPaid = feeAccount.payments
    .filter(
      (payment) =>
        payment.status === "COMPLETED"
    )
    .reduce(
      (total, payment) =>
        total + Number(payment.amount),
      0
    );

  const totalCredits = feeAccount.adjustments
    .filter(
      (adjustment) =>
        adjustment.type === "CREDIT"
    )
    .reduce(
      (total, adjustment) =>
        total + Number(adjustment.amount),
      0
    );

  const totalDebits = feeAccount.adjustments
    .filter(
      (adjustment) =>
        adjustment.type === "DEBIT"
    )
    .reduce(
      (total, adjustment) =>
        total + Number(adjustment.amount),
      0
    );

  const balance =
    totalCharges +
    totalDebits -
    totalCredits -
    totalPaid;

  return {
    feeAccount: {
      id: feeAccount.id,
      studentId: feeAccount.studentId,
    },

    summary: {
      totalCharges,
      totalPaid,
      totalCredits,
      totalDebits,
      balance,
    },

    charges: feeAccount.charges,
    payments: feeAccount.payments,
    adjustments: feeAccount.adjustments,
  };
}


/*
|--------------------------------------------------------------------------
| GET CHILD ATTENDANCE
|--------------------------------------------------------------------------
*/

async function getChildAttendance(
  userId,
  studentId,
  filters = {}
) {
  await verifyChildBelongsToParent(userId, studentId);

  const where = {
    studentId,
  };

  if (filters.termId) {
    where.termId = filters.termId;
  }

  if (filters.academicYearId) {
    where.academicYearId =
      filters.academicYearId;
  }

  const records = await prisma.attendance.findMany({
    where,

    include: {
      term: true,
      academicYear: true,
    },

    orderBy: {
      date: "desc",
    },
  });

  const summary = {
    total: records.length,
    present: 0,
    absent: 0,
    late: 0,
    excused: 0,
  };

  for (const record of records) {
    const status = String(
      record.status
    ).toUpperCase();

    if (status === "PRESENT") {
      summary.present++;
    } else if (status === "ABSENT") {
      summary.absent++;
    } else if (status === "LATE") {
      summary.late++;
    } else if (status === "EXCUSED") {
      summary.excused++;
    }
  }

  const attendanceRate =
    summary.total > 0
      ? Number(
          (
            (summary.present /
              summary.total) *
            100
          ).toFixed(2)
        )
      : 0;

  return {
    summary: {
      ...summary,
      attendanceRate,
    },

    records,
  };
}


/*
|--------------------------------------------------------------------------
| SEARCH PARENTS
|--------------------------------------------------------------------------
| Search by:
| - First name
| - Middle name
| - Last name
| - Email
| - Phone
|--------------------------------------------------------------------------
*/

async function searchParents(search) {
  if (!search || !search.trim()) {
    return [];
  }

  const keyword = search.trim();

  return prisma.parent.findMany({
    where: {
      user: {
        OR: [
          {
            firstName: {
              contains: keyword,
              mode: "insensitive",
            },
          },
          {
            middleName: {
              contains: keyword,
              mode: "insensitive",
            },
          },
          {
            lastName: {
              contains: keyword,
              mode: "insensitive",
            },
          },
          {
            email: {
              contains: keyword,
              mode: "insensitive",
            },
          },
          {
            phone: {
              contains: keyword,
              mode: "insensitive",
            },
          },
        ],
      },
    },

    include: {
      user: true,

      children: {
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

                orderBy: {
                  createdAt: "desc",
                },
              },
            },
          },
        },
      },
    },

    orderBy: {
      createdAt: "desc",
    },

    take: 50,
  });
}

/*
|--------------------------------------------------------------------------
| EXPORTS
|--------------------------------------------------------------------------

*/

module.exports = {
  getMyProfile,
  getParents,
  getParentById,
  getMyChildren,
  verifyChildBelongsToParent,
  getChildAssessments,
  getChildReportCards,
  getChildFees,
  getChildAttendance,
  searchParents,
};

