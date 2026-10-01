
const prisma = require("../../lib/prisma");




async function getDashboard() {
  const students = await prisma.student.count();

  const enrollments = await prisma.studentEnrollment.count({
    where: {
      isActive: true,
    },
  });

  const teachers = await prisma.teacher.count();

  const parents = await prisma.parent.count();

  return {
    students,
    enrollments,
    teachers,
    parents,
  };
}

/*
|--------------------------------------------------------------------------
| GET ALL STUDENTS
|--------------------------------------------------------------------------
*/

async function getStudents({
  search,
  gradeId,
  streamId,
  academicYearId,
  isActive,
}) {

  const where = {};

  /*
  |--------------------------------------------------------------------------
  | Search
  |--------------------------------------------------------------------------
  */

  if (search) {

    where.OR = [
      {
        admissionNumber: {
          contains: search,
          mode: "insensitive",
        },
      },

      {
        firstName: {
          contains: search,
          mode: "insensitive",
        },
      },

      {
        middleName: {
          contains: search,
          mode: "insensitive",
        },
      },

      {
        lastName: {
          contains: search,
          mode: "insensitive",
        },
      },
    ];
  }


  /*
  |--------------------------------------------------------------------------
  | Enrollment filters
  |--------------------------------------------------------------------------
  */

  if (
    gradeId ||
    streamId ||
    academicYearId ||
    isActive !== undefined
  ) {

    where.enrollments = {
      some: {
        ...(gradeId && { gradeId }),

        ...(streamId && { streamId }),

        ...(academicYearId && { academicYearId }),

        ...(isActive !== undefined && {
          isActive:
            isActive === true ||
            isActive === "true",
        }),
      },
    };
  }


  return prisma.student.findMany({

    where,

    orderBy: [
      {
        lastName: "asc",
      },
      {
        firstName: "asc",
      },
    ],

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
  });
}


/*
|--------------------------------------------------------------------------
| SEARCH STUDENTS
|--------------------------------------------------------------------------
|
| Dedicated search function for the Admissions dashboard.
|
|--------------------------------------------------------------------------
*/

async function searchStudents(search) {

  if (!search) {
    return [];
  }

  return prisma.student.findMany({

    where: {
      OR: [

        {
          admissionNumber: {
            contains: search,
            mode: "insensitive",
          },
        },

        {
          firstName: {
            contains: search,
            mode: "insensitive",
          },
        },

        {
          middleName: {
            contains: search,
            mode: "insensitive",
          },
        },

        {
          lastName: {
            contains: search,
            mode: "insensitive",
          },
        },
      ],
    },

    take: 50,

    orderBy: {
      lastName: "asc",
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
      | ENROLLMENTS
      |--------------------------------------------------------------------------
      */

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
  });
}
/*
|--------------------------------------------------------------------------
| GET STUDENT BY ID
|--------------------------------------------------------------------------
|
| Admissions Admin should see the complete admissions profile.
|
|--------------------------------------------------------------------------
*/

async function getStudentById(studentId) {

  return prisma.student.findUnique({

    where: {
      id: studentId,
    },

    include: {

      /*
      |--------------------------------------------------------------------------
      | Parents
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
      | Enrollment history
      |--------------------------------------------------------------------------
      */

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


      /*
      |--------------------------------------------------------------------------
      | Assessments
      |--------------------------------------------------------------------------
      |
      | Admissions should be able to see the student's academic history,
      | but should not modify assessments.
      |
      */

      assessments: {

        include: {
          learningArea: true,
          term: true,
          academicYear: true,
        },

        orderBy: {
          assessmentDate: "desc",
        },
      },


      /*
      |--------------------------------------------------------------------------
      | Assessment results
      |--------------------------------------------------------------------------
      */

      assessmentResults: {

        include: {

          assessment: {
            include: {
              learningArea: true,
              term: true,
              academicYear: true,
            },
          },

        },
      },


      /*
      |--------------------------------------------------------------------------
      | Report cards
      |--------------------------------------------------------------------------
      */

      reportCards: {

        include: {

          academicYear: true,

          term: true,

          results: {
            include: {
              learningArea: true,
            },
          },

        },

        orderBy: {
          createdAt: "desc",
        },
      },


      /*
      |--------------------------------------------------------------------------
      | Fee account
      |--------------------------------------------------------------------------
      */

      feeAccount: {

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
      },

    },
  });
}


/*
|--------------------------------------------------------------------------
| ADMIT STUDENT
|--------------------------------------------------------------------------
|
| Creates the student and optionally creates the first enrollment.
|
|--------------------------------------------------------------------------
*/

async function admitStudent({
  student,
  enrollment,
  createdById,
}) {

  return prisma.$transaction(async (tx) => {

    /*
    |--------------------------------------------------------------------------
    | Prevent duplicate admission number
    |--------------------------------------------------------------------------
    */

    const existingStudent =
      await tx.student.findUnique({
        where: {
          admissionNumber:
            student.admissionNumber,
        },
      });

    if (existingStudent) {

      const error = new Error(
        "A student with this admission number already exists."
      );

      error.statusCode = 409;

      throw error;
    }


    /*
    |--------------------------------------------------------------------------
    | Create student
    |--------------------------------------------------------------------------
    */

    const newStudent =
      await tx.student.create({

        data: {

          admissionNumber:
            student.admissionNumber,

          firstName:
            student.firstName,

          middleName:
            student.middleName || null,

          lastName:
            student.lastName,

          dateOfBirth:
            student.dateOfBirth
              ? new Date(student.dateOfBirth)
              : null,

          gender:
            student.gender || null,

          createdById,
        },
      });


    /*
    |--------------------------------------------------------------------------
    | Create initial enrollment
    |--------------------------------------------------------------------------
    */
   if (enrollment) {
  if (!enrollment.gradeId) {
    const error = new Error(
      "Grade is required for student enrollment."
    );

    error.statusCode = 400;
    throw error;
  }

  if (!enrollment.academicYearId) {
    const error = new Error(
      "Academic year is required for student enrollment."
    );

    error.statusCode = 400;
    throw error;
  }
}

    let newEnrollment = null;

   if (enrollment) {
  newEnrollment =
    await tx.studentEnrollment.create({
      data: {
        student: {
          connect: {
            id: newStudent.id,
          },
        },

        grade: {
          connect: {
            id: enrollment.gradeId,
          },
        },

        stream: enrollment.streamId
          ? {
              connect: {
                id: enrollment.streamId,
              },
            }
          : undefined,

        academicYear: {
          connect: {
            id: enrollment.academicYearId,
          },
        },

        term: enrollment.termId
          ? {
              connect: {
                id: enrollment.termId,
              },
            }
          : undefined,

        admissionDate: enrollment.admissionDate
          ? new Date(enrollment.admissionDate)
          : new Date(),

        isActive: true,
      },

      include: {
        grade: true,
        stream: true,
        academicYear: true,
        term: true,
      },
    });
} 

    return {
      student: newStudent,
      enrollment: newEnrollment,
    };
  });
}


/*
|--------------------------------------------------------------------------
| UPDATE STUDENT
|--------------------------------------------------------------------------
*/

async function updateStudent(
  studentId,
  data
) {

  const existingStudent =
    await prisma.student.findUnique({
      where: {
        id: studentId,
      },
    });

  if (!existingStudent) {

    const error = new Error(
      "Student not found."
    );

    error.statusCode = 404;

    throw error;
  }


  return prisma.student.update({

    where: {
      id: studentId,
    },

    data: {

      ...(data.admissionNumber !== undefined && {
        admissionNumber:
          data.admissionNumber,
      }),

      ...(data.firstName !== undefined && {
        firstName:
          data.firstName,
      }),

      ...(data.middleName !== undefined && {
        middleName:
          data.middleName,
      }),

      ...(data.lastName !== undefined && {
        lastName:
          data.lastName,
      }),

      ...(data.dateOfBirth !== undefined && {
        dateOfBirth:
          data.dateOfBirth
            ? new Date(data.dateOfBirth)
            : null,
      }),

      ...(data.gender !== undefined && {
        gender:
          data.gender,
      }),
    },
  });
}


/*
|--------------------------------------------------------------------------
| ENROLL STUDENT
|--------------------------------------------------------------------------
*/


async function enrollStudent({
  studentId,
  gradeId,
  streamId,
  academicYearId,
  termId,
  admissionDate,
}) {

    if (!gradeId) {
    const error = new Error(
      "Grade is required for student enrollment."
    );
    error.statusCode = 400;
    throw error;
  }

  if (!academicYearId) {
    const error = new Error(
      "Academic year is required for student enrollment."
    );
    error.statusCode = 400;
    throw error;
  }

  const student =
    await prisma.student.findUnique({
      where: {
        id: studentId,
      },
    });

  if (!student) {

    const error = new Error(
      "Student not found."
    );

    error.statusCode = 404;

    throw error;
  }


  /*
  |--------------------------------------------------------------------------
  | Prevent duplicate active enrollment
  |--------------------------------------------------------------------------
  */

  const existingEnrollment =
    await prisma.studentEnrollment.findFirst({

      where: {

        studentId,

        academicYearId,

        termId: termId || null,

        isActive: true,
      },
    });


  if (existingEnrollment) {

    const error = new Error(
      "Student already has an active enrollment for this academic period."
    );

    error.statusCode = 409;

    throw error;
  }

return prisma.studentEnrollment.create({
  data: {
    student: {
      connect: {
        id: studentId,
      },
    },

    grade: {
      connect: {
        id: gradeId,
      },
    },

    stream: streamId
      ? {
          connect: {
            id: streamId,
          },
        }
      : undefined,

    academicYear: {
      connect: {
        id: academicYearId,
      },
    },

    term: termId
      ? {
          connect: {
            id: termId,
          },
        }
      : undefined,

    admissionDate: admissionDate
      ? new Date(admissionDate)
      : new Date(),

    isActive: true,
  },

  include: {
    student: true,
    grade: true,
    stream: true,
    academicYear: true,
    term: true,
  },
});
  
}


/*
|--------------------------------------------------------------------------
| UPDATE ENROLLMENT
|--------------------------------------------------------------------------
*/

async function updateEnrollment(
  enrollmentId,
  data
) {

  const enrollment =
    await prisma.studentEnrollment.findUnique({
      where: {
        id: enrollmentId,
      },
    });

  if (!enrollment) {

    const error = new Error(
      "Enrollment not found."
    );

    error.statusCode = 404;

    throw error;
  }


  return prisma.studentEnrollment.update({

    where: {
      id: enrollmentId,
    },

    data: {

      ...(data.gradeId !== undefined && {
        gradeId:
          data.gradeId,
      }),

      ...(data.streamId !== undefined && {
        streamId:
          data.streamId || null,
      }),

      ...(data.academicYearId !== undefined && {
        academicYearId:
          data.academicYearId,
      }),

      ...(data.termId !== undefined && {
        termId:
          data.termId || null,
      }),

      ...(data.admissionDate !== undefined && {
        admissionDate:
          new Date(data.admissionDate),
      }),

      ...(data.exitDate !== undefined && {
        exitDate:
          data.exitDate
            ? new Date(data.exitDate)
            : null,
      }),

      ...(data.isActive !== undefined && {
        isActive:
          data.isActive,
      }),
    },

    include: {

      student: true,

      grade: true,

      stream: true,

      academicYear: true,

      term: true,
    },
  });
}


/*
|--------------------------------------------------------------------------
| REMOVE / END ENROLLMENT
|--------------------------------------------------------------------------
|
| We don't delete historical enrollment records.
| We mark them inactive and record the exit date.
|
|--------------------------------------------------------------------------
*/

async function removeEnrollment(
  enrollmentId,
  exitDate
) {

  const enrollment =
    await prisma.studentEnrollment.findUnique({
      where: {
        id: enrollmentId,
      },
    });

  if (!enrollment) {

    const error = new Error(
      "Enrollment not found."
    );

    error.statusCode = 404;

    throw error;
  }


  return prisma.studentEnrollment.update({

    where: {
      id: enrollmentId,
    },

    data: {

      isActive: false,

      exitDate:
        exitDate
          ? new Date(exitDate)
          : new Date(),
    },

    include: {

      student: true,

      grade: true,

      stream: true,

      academicYear: true,

      term: true,
    },
  });
}


/*
|--------------------------------------------------------------------------
| CREATE PARENT
|--------------------------------------------------------------------------
|
| Parent itself is linked to a User.
|
| The User account/password creation should ideally be handled by
| your existing user/authentication service.
|
|--------------------------------------------------------------------------
*/

    
/*
|--------------------------------------------------------------------------
| CREATE PARENT ACCOUNT
|--------------------------------------------------------------------------
|
| Admissions Admin creates a complete parent account:
|
| 1. Create User
| 2. Assign PARENT role
| 3. Create Parent profile
| 4. Link Parent to Student
|
| If the parent already exists, we reuse the existing account and
| simply link the parent to the new student.
|
|--------------------------------------------------------------------------
*/

async function createParentAccount({
  firstName,
  middleName,
  lastName,
  email,
  phone,
  password,
  relationship,
  studentId,
  isPrimary = false,
}) {

  return prisma.$transaction(async (tx) => {

    /*
    |--------------------------------------------------------------------------
    | Validate student
    |--------------------------------------------------------------------------
    */

    const student = await tx.student.findUnique({
      where: {
        id: studentId,
      },
    });

    if (!student) {

      const error = new Error(
        "Student not found."
      );

      error.statusCode = 404;

      throw error;
    }


    /*
    |--------------------------------------------------------------------------
    | Find existing user
    |--------------------------------------------------------------------------
    |
    | We check email and phone so that the same parent is not accidentally
    | given multiple accounts.
    |
    |--------------------------------------------------------------------------
    */

    let user = await tx.user.findFirst({
      where: {
        OR: [
          {
            email,
          },
          {
            phone,
          },
        ],
      },
    });


    /*
    |--------------------------------------------------------------------------
    | CREATE USER IF PARENT DOES NOT ALREADY EXIST
    |--------------------------------------------------------------------------
    */

    if (!user) {

      /*
      |--------------------------------------------------------------------------
      | Password hashing
      |--------------------------------------------------------------------------
      */

      const bcrypt = require("bcrypt");

      const passwordHash =
        await bcrypt.hash(password, 12);


      user = await tx.user.create({

        data: {

          firstName,

          middleName:
            middleName || null,

          lastName,

          email,

          phone,

          passwordHash,

          status: "ACTIVE",
        },
      });
    }


    /*
    |--------------------------------------------------------------------------
    | FIND PARENT PROFILE
    |--------------------------------------------------------------------------
    */

    let parent = await tx.parent.findUnique({
      where: {
        userId: user.id,
      },
    });


    /*
    |--------------------------------------------------------------------------
    | CREATE PARENT PROFILE IF NECESSARY
    |--------------------------------------------------------------------------
    */

    if (!parent) {

      parent = await tx.parent.create({

        data: {

          userId: user.id,

          relationship:
            relationship || null,
        },
      });
    }


    /*
    |--------------------------------------------------------------------------
    | GET PARENT ROLE
    |--------------------------------------------------------------------------
    */

    const parentRole = await tx.role.findUnique({
      where: {
        code: "PARENT",
      },
    });


    if (!parentRole) {

      const error = new Error(
        "PARENT role has not been configured."
      );

      error.statusCode = 500;

      throw error;
    }


    /*
    |--------------------------------------------------------------------------
    | ASSIGN PARENT ROLE
    |--------------------------------------------------------------------------
    |
    | upsert prevents duplicate UserRole records.
    |
    |--------------------------------------------------------------------------
    */

    await tx.userRole.upsert({

      where: {
        userId_roleId: {
          userId: user.id,
          roleId: parentRole.id,
        },
      },

      update: {},

      create: {

        userId: user.id,

        roleId: parentRole.id,
      },
    });


    /*
    |--------------------------------------------------------------------------
    | PRIMARY PARENT HANDLING
    |--------------------------------------------------------------------------
    |
    | A student should normally have only one primary parent.
    |
    |--------------------------------------------------------------------------
    */

    if (isPrimary === true) {

      await tx.studentParent.updateMany({

        where: {
          studentId,
          isPrimary: true,
        },

        data: {
          isPrimary: false,
        },
      });
    }


    /*
    |--------------------------------------------------------------------------
    | LINK PARENT TO STUDENT
    |--------------------------------------------------------------------------
    */

    const studentParent =
      await tx.studentParent.upsert({

        where: {
          studentId_parentId: {
            studentId,
            parentId: parent.id,
          },
        },

        update: {

          relationship:
            relationship || null,

          isPrimary:
            isPrimary === true,
        },

        create: {

          studentId,

          parentId:
            parent.id,

          relationship:
            relationship || null,

          isPrimary:
            isPrimary === true,
        },

        include: {

          student: true,

          parent: {
            include: {
              user: true,
            },
          },
        },
      });


    /*
    |--------------------------------------------------------------------------
    | RETURN COMPLETE RESULT
    |--------------------------------------------------------------------------
    */

    return {

      user,

      parent,

      studentParent,

    };
  });
}



/*
|--------------------------------------------------------------------------
| UPDATE PARENT-STUDENT LINK
|--------------------------------------------------------------------------
*/

async function updateParentStudentLink(
  studentId,
  parentId,
  data
) {

  const link =
    await prisma.studentParent.findUnique({

      where: {
        studentId_parentId: {
          studentId,
          parentId,
        },
      },
    });

  if (!link) {

    const error = new Error(
      "Parent-student relationship not found."
    );

    error.statusCode = 404;

    throw error;
  }


  return prisma.$transaction(
    async (tx) => {

      if (data.isPrimary === true) {

        await tx.studentParent.updateMany({

          where: {
            studentId,
            isPrimary: true,
          },

          data: {
            isPrimary: false,
          },
        });
      }


      return tx.studentParent.update({

        where: {
          studentId_parentId: {
            studentId,
            parentId,
          },
        },

        data: {

          ...(data.relationship !== undefined && {
            relationship:
              data.relationship,
          }),

          ...(data.isPrimary !== undefined && {
            isPrimary:
              data.isPrimary,
          }),
        },

        include: {

          student: true,

          parent: {
            include: {
              user: true,
            },
          },
        },
      });
    }
  );
}


/*
|--------------------------------------------------------------------------
| REMOVE PARENT FROM STUDENT
|--------------------------------------------------------------------------
*/

async function removeParentFromStudent(
  studentId,
  parentId
) {

  const link =
    await prisma.studentParent.findUnique({

      where: {
        studentId_parentId: {
          studentId,
          parentId,
        },
      },
    });

  if (!link) {

    const error = new Error(
      "Parent-student relationship not found."
    );

    error.statusCode = 404;

    throw error;
  }


  return prisma.studentParent.delete({

    where: {
      studentId_parentId: {
        studentId,
        parentId,
      },
    },

    include: {

      student: true,

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
| GET STUDENT PARENTS
|--------------------------------------------------------------------------
*/

async function getStudentParents(
  studentId
) {

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

      student: true,
    },

    orderBy: {
      isPrimary: "desc",
    },
  });
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

  updateParentStudentLink,

  removeParentFromStudent,

  getStudentParents,

  createParentAccount,

};

