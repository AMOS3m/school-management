const prisma = require("../../lib/prisma");


/*
|--------------------------------------------------------------------------
| GET ALL STUDENTS
|--------------------------------------------------------------------------
| Used by the Head of Institution / Admin dashboard.
|--------------------------------------------------------------------------
*/

async function getStudents() {
  return prisma.student.findMany({
    orderBy: {
      lastName: "asc",
    },

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
      },

      parentLinks: {
        include: {
          parent: {
            include: {
              user: true,
            },
          },
        },
      },
    },
  });
}


/*
|--------------------------------------------------------------------------
| GET INDIVIDUAL STUDENT
|--------------------------------------------------------------------------
|
| Gives the Head of Institution a complete overview of the student:
|
| 1. Personal information
| 2. Parents
| 3. Current class / stream
| 4. Academic history
| 5. Assessments
| 6. Assessment results
| 7. Learning areas
| 8. Report cards
| 9. Fees
|
|--------------------------------------------------------------------------
*/

async function getStudentById(id) {
  const student = await prisma.student.findUnique({
    where: {
      id,
    },

    include: {

      /*
      |--------------------------------------------------------------------------
      | PARENTS
      |--------------------------------------------------------------------------
      */

      parentLinks: {
        include: {
          parent: {
            include: {
              user: true,
            },
          },
        },
      },


      /*
      |--------------------------------------------------------------------------
      | ENROLLMENTS / CLASS INFORMATION
      |--------------------------------------------------------------------------
      */

      enrollments: {
        orderBy: {
          admissionDate: "desc",
        },

        include: {
          grade: true,
          stream: true,
          academicYear: true,
          term: true,
        },
      },




      /*
      |--------------------------------------------------------------------------
      | ATTENDANCE
      |--------------------------------------------------------------------------
      */

      attendanceRecords: {
        orderBy: {
          date: "desc",
        },

        include: {
          academicYear: true,
          term: true,

          timetableEntry: {
            include: {
              grade: true,
              stream: true,
              learningArea: true,
              teacher: {
                include: {
                  user: true,
                },
              },
            },
          },
        },
      },



      /*
      |--------------------------------------------------------------------------
      | ASSESSMENTS
      |--------------------------------------------------------------------------
      */

      assessments: {
        orderBy: {
          assessmentDate: "desc",
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

          results: true,

          items: {
            include: {
              learningOutcome: true,

              assessmentItemResults: true,
            },
          },
        },
      },


      /*
      |--------------------------------------------------------------------------
      | DIRECT ASSESSMENT RESULTS
      |--------------------------------------------------------------------------
      |
      | This gives the student-level marks, performance level and
      | teacher comments.
      |
      */

      assessmentResults: {
        orderBy: {
          createdAt: "desc",
        },

        include: {

          assessment: {
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
          },
        },
      },


      /*
      |--------------------------------------------------------------------------
      | ASSESSMENT ITEM RESULTS
      |--------------------------------------------------------------------------
      |
      | Useful for CBC learning-outcome / question-level analysis.
      |
      */

      assessmentItemResults: {
        orderBy: {
          createdAt: "desc",
        },

        include: {

          assessmentItem: {
            include: {
              assessment: {
                include: {
                  academicYear: true,
                  term: true,
                  learningArea: true,
                },
              },

              learningOutcome: true,
            },
          },
        },
      },


      /*
      |--------------------------------------------------------------------------
      | REPORT CARDS
      |--------------------------------------------------------------------------
      */

      reportCards: {
        orderBy: {
          createdAt: "desc",
        },

        include: {

          academicYear: true,

          term: true,

          results: {
            include: {
              learningArea: true,
            },
          },
        },
      },


      /*
      |--------------------------------------------------------------------------
      | FEES
      |--------------------------------------------------------------------------
      */

      feeAccount: {
        include: {

          /*
          |--------------------------------------------------------------------------
          | FEE CHARGES
          |--------------------------------------------------------------------------
          */

          charges: {
            orderBy: {
              createdAt: "desc",
            },

            include: {
              academicYear: true,
              term: true,
            },
          },


          /*
          |--------------------------------------------------------------------------
          | PAYMENTS
          |--------------------------------------------------------------------------
          */

          payments: {
            orderBy: {
              paymentDate: "desc",
            },
          },


          /*
          |--------------------------------------------------------------------------
          | ADJUSTMENTS
          |--------------------------------------------------------------------------
          */

          adjustments: {
            orderBy: {
              createdAt: "desc",
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
| CREATE STUDENT
|--------------------------------------------------------------------------
*/

async function createStudent(data, createdById) {
  return prisma.student.create({
    data: {
      admissionNumber: data.admissionNumber,

      firstName: data.firstName,

      middleName: data.middleName,

      lastName: data.lastName,

      dateOfBirth: data.dateOfBirth
        ? new Date(data.dateOfBirth)
        : null,

      gender: data.gender,

      createdById,
    },
  });
}


/*
|--------------------------------------------------------------------------
| UPDATE STUDENT
|--------------------------------------------------------------------------
*/

async function updateStudent(id, data) {
  return prisma.student.update({
    where: {
      id,
    },

    data: {
      admissionNumber: data.admissionNumber,

      firstName: data.firstName,

      middleName: data.middleName,

      lastName: data.lastName,

      dateOfBirth: data.dateOfBirth
        ? new Date(data.dateOfBirth)
        : undefined,

      gender: data.gender,
    },
  });
}


/*
|--------------------------------------------------------------------------
| DELETE STUDENT
|--------------------------------------------------------------------------
|
| Optional administrative function.
|
| Because many student records are connected to academic records,
| deleting students should normally be restricted.
|
|--------------------------------------------------------------------------
*/

async function deleteStudent(id) {
  return prisma.student.delete({
    where: {
      id,
    },
  });
}


/*
|--------------------------------------------------------------------------
| GET STUDENT PARENTS
|--------------------------------------------------------------------------
|
| Useful when the Head clicks the "Parents" section separately.
|--------------------------------------------------------------------------
*/

async function getStudentParents(studentId) {
  return prisma.studentParent.findMany({
    where: {
      studentId,
    },

    include: {
      parent: {
        include: {
          user: true,
        },
      },
    },
  });
}


/*
|--------------------------------------------------------------------------
| GET STUDENT ASSESSMENTS
|--------------------------------------------------------------------------
*/

async function getStudentAssessments(studentId) {
  return prisma.assessment.findMany({
    where: {
      studentId,
    },

    orderBy: {
      assessmentDate: "desc",
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

      results: true,

      items: {
        include: {
          learningOutcome: true,
          assessmentItemResults: true,
        },
      },
    },
  });
}


/*
|--------------------------------------------------------------------------
| GET STUDENT REPORT CARDS
|--------------------------------------------------------------------------
*/

async function getStudentReportCards(studentId) {
  return prisma.reportCard.findMany({
    where: {
      studentId,
    },

    orderBy: {
      createdAt: "desc",
    },

    include: {
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
| GET STUDENT FEES
|--------------------------------------------------------------------------
*/

async function getStudentFees(studentId) {
  return prisma.feeAccount.findUnique({
    where: {
      studentId,
    },

    include: {
      charges: {
        orderBy: {
          createdAt: "desc",
        },

        include: {
          academicYear: true,
          term: true,
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
}

/*
|--------------------------------------------------------------------------
| SEARCH STUDENTS
|--------------------------------------------------------------------------
| Search by:
| - Admission number
| - First name
| - Middle name
| - Last name
|--------------------------------------------------------------------------
*/

async function searchStudents(search) {
  if (!search || !search.trim()) {
    return [];
  }

  const keyword = search.trim();

  return prisma.student.findMany({
    where: {
      OR: [
        {
          admissionNumber: {
            contains: keyword,
            mode: "insensitive",
          },
        },
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
      ],
    },

    include: {
      parentLinks: {
        include: {
          parent: {
            include: {
              user: true,
            },
          },
        },
      },

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

    orderBy: {
      lastName: "asc",
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