const bcrypt = require("bcrypt");

const prisma = require("./prisma");

const { DayOfWeek } = require("@prisma/client");



async function getMyDashboard(userId) {
  if (!userId) {
    throw new Error("userId is required");
  }


  /*
  |--------------------------------------------------------------------------
  | Find teacher belonging to logged-in user
  |--------------------------------------------------------------------------
  */

  const teacher = await prisma.teacher.findUnique({
    where: {
      userId,
    },

    include: {
      user: true,

      /*
      |--------------------------------------------------------------------------
      | Teaching assignments
      |--------------------------------------------------------------------------
      */

      teachingAssignments: {
        include: {
          learningArea: true,
          grade: true,
          stream: true,
        },

        orderBy: {
          createdAt: "desc",
        },
      },

      /*
      |--------------------------------------------------------------------------
      | Learning areas assigned to teacher
      |--------------------------------------------------------------------------
      */

      learningAreas: {
        include: {
          learningArea: true,
        },
      },

      /*
      |--------------------------------------------------------------------------
      | Streams assigned to teacher
      |--------------------------------------------------------------------------
      */

      teacherStreams: {
        include: {
          stream: {
            include: {
              grade: true,
            },
          },
        },
      },

      /*
      |--------------------------------------------------------------------------
      | Class-teacher assignments
      |--------------------------------------------------------------------------
      |
      | We only retrieve currently active assignments.
      |
      */

      classTeacherAssignments: {
    
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
      | Recent assessments
      |--------------------------------------------------------------------------
      */

      assessments: {
        include: {
          learningArea: true,
          grade: true,
          stream: true,
          term: true,
        },

        orderBy: {
          assessmentDate: "desc",
        },

        take: 10,
      },
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
  | TODAY'S TIMETABLE
  |--------------------------------------------------------------------------
  |
  | JavaScript:
  |
  | 0 = Sunday
  | 1 = Monday
  | ...
  | 6 = Saturday
  |
  | Your timetable should therefore store the same convention.
  |
  |--------------------------------------------------------------------------
  */

const daysNames = [
  DayOfWeek.SUNDAY,
  DayOfWeek.MONDAY,
  DayOfWeek.TUESDAY,
  DayOfWeek.WEDNESDAY,
  DayOfWeek.THURSDAY,
  DayOfWeek.FRIDAY,
  DayOfWeek.SATURDAY,
];

const today = daysNames[new Date().getDay()];



  const todaysTimetable =
    await prisma.timetableEntry.findMany({
      where: {
        teacherId: teacher.id,
        dayOfWeek: today,
      },

      include: {
        timetable: true,
        learningArea: true,
        grade: true,
        stream: true,
        term: true,
      },

      orderBy: {
        startTime: "asc",
      },
    });


  /*
  |--------------------------------------------------------------------------
  | RETURN DASHBOARD
  |--------------------------------------------------------------------------
  */

  return {
    teacher: {
      id: teacher.id,
      userId: teacher.userId,
      employeeNumber: teacher.employeeNumber,

      profile: {
        firstName: teacher.user.firstName,
        middleName: teacher.user.middleName,
        lastName: teacher.user.lastName,
        email: teacher.user.email,
        phone: teacher.user.phone,
      },
    },


    /*
    |--------------------------------------------------------------------------
    | Teaching assignments
    |--------------------------------------------------------------------------
    */

    teachingAssignments:
      teacher.teachingAssignments,


    /*
    |--------------------------------------------------------------------------
    | Learning areas
    |--------------------------------------------------------------------------
    */

    learningAreas:
      teacher.learningAreas,


    /*
    |--------------------------------------------------------------------------
    | Streams
    |--------------------------------------------------------------------------
    */

    streams:
      teacher.teacherStreams,


    /*
    |--------------------------------------------------------------------------
    | Class teacher assignments
    |--------------------------------------------------------------------------
    */

    classTeacherAssignments:
      teacher.classTeacherAssignments,


    /*
    |--------------------------------------------------------------------------
    | Today's timetable
    |--------------------------------------------------------------------------
    */

    todaysTimetable,


    /*
    |--------------------------------------------------------------------------
    | Recent assessments
    |--------------------------------------------------------------------------
    */

    recentAssessments:
      teacher.assessments,
  };
}






async function getTeachers() {
  return prisma.teacher.findMany({
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


async function getTeacherById(id) {
  if (!id) {
    const error = new Error("Teacher ID is required");
    error.statusCode = 400;
    throw error;
  }

  /*
  |--------------------------------------------------------------------------
  | GET TEACHER PROFILE
  |--------------------------------------------------------------------------
  |
  | This returns the complete teacher profile required by the
  | administration teacher-details page.
  |
  */

  const teacher = await prisma.teacher.findUnique({
    where: {
      id,
    },

    include: {
      /*
      |--------------------------------------------------------------------------
      | BASIC USER INFORMATION
      |--------------------------------------------------------------------------
      */

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

      /*
      |--------------------------------------------------------------------------
      | LEARNING AREAS
      |--------------------------------------------------------------------------
      |
      | Learning areas directly assigned to the teacher.
      |
      */

      learningAreas: {
        include: {
          learningArea: true,
        },
      },

      /*
      |--------------------------------------------------------------------------
      | STREAMS
      |--------------------------------------------------------------------------
      |
      | Streams directly assigned to the teacher.
      |
      */

      teacherStreams: {
        include: {
          stream: {
            include: {
              grade: true,
            },
          },
        },
      },

      /*
      |--------------------------------------------------------------------------
      | TEACHING ASSIGNMENTS
      |--------------------------------------------------------------------------
      |
      | Shows exactly which learning area the teacher teaches
      | in which grade and stream.
      |
      */

      teachingAssignments: {
        include: {
          learningArea: true,
          grade: true,
          stream: true,
        },

        orderBy: {
          createdAt: "desc",
        },
      },

      /*
      |--------------------------------------------------------------------------
      | CLASS TEACHER ASSIGNMENTS
      |--------------------------------------------------------------------------
      |
      | Shows whether the teacher is a class teacher and the
      | grade/stream they are responsible for.
      |
      */

      classTeacherAssignments: {
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
      | ASSESSMENTS CREATED BY TEACHER
      |--------------------------------------------------------------------------
      */

      assessments: {
        include: {
          learningArea: true,
          grade: true,
          stream: true,
          term: true,
        },

        orderBy: {
          assessmentDate: "desc",
        },
      },
    },
  });

  /*
  |--------------------------------------------------------------------------
  | TEACHER NOT FOUND
  |--------------------------------------------------------------------------
  */

  if (!teacher) {
    const error = new Error("Teacher not found");
    error.statusCode = 404;
    throw error;
  }

  /*
  |--------------------------------------------------------------------------
  | TEACHER TIMETABLE
  |--------------------------------------------------------------------------
  |
  | We query timetable entries separately rather than assuming that
  | Teacher has a timetableEntries relation in the Prisma schema.
  |
  */

  const timetable = await prisma.timetableEntry.findMany({
    where: {
      teacherId: teacher.id,
    },

    include: {
      timetable: true,
      learningArea: true,
      grade: true,
      stream: true,
      term: true,
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

  /*
  |--------------------------------------------------------------------------
  | RETURN COMPLETE TEACHER PROFILE
  |--------------------------------------------------------------------------
  */

  return {
    teacher: {
      id: teacher.id,
      userId: teacher.userId,
      employeeNumber: teacher.employeeNumber,

      profile: {
        id: teacher.user.id,
        firstName: teacher.user.firstName,
        middleName: teacher.user.middleName,
        lastName: teacher.user.lastName,
        email: teacher.user.email,
        phone: teacher.user.phone,
        status: teacher.user.status,
      },
    },

    /*
    |--------------------------------------------------------------------------
    | LEARNING AREAS
    |--------------------------------------------------------------------------
    */

    learningAreas: teacher.learningAreas,

    /*
    |--------------------------------------------------------------------------
    | STREAMS
    |--------------------------------------------------------------------------
    */

    streams: teacher.teacherStreams,

    /*
    |--------------------------------------------------------------------------
    | TEACHING ASSIGNMENTS
    |--------------------------------------------------------------------------
    */

    teachingAssignments: teacher.teachingAssignments,

    /*
    |--------------------------------------------------------------------------
    | CLASS TEACHER ASSIGNMENTS
    |--------------------------------------------------------------------------
    */

    classTeacherAssignments: teacher.classTeacherAssignments,

    /*
    |--------------------------------------------------------------------------
    | TIMETABLE
    |--------------------------------------------------------------------------
    */

    timetable,

    /*
    |--------------------------------------------------------------------------
    | ASSESSMENTS
    |--------------------------------------------------------------------------
    */

    assessments: teacher.assessments,
  };
}



async function createTeacher(data) {

  if (!data.password) {
    const error = new Error("Teacher password is required");
    error.code = "PASSWORD_REQUIRED";
    throw error;
  } 
   
  return prisma.$transaction(async (tx) => {
    // 1. Hash the password
    const passwordHash = await bcrypt.hash(data.password, 12);

    // 2. Create the User account
    const user = await tx.user.create({
      data: {
        firstName: data.firstName,
        middleName: data.middleName || null,
        lastName: data.lastName,
        email: data.email || null,
        phone: data.phone || null,
        passwordHash,
      },
    });

    // 3. Find the TEACHER role
    const teacherRole = await tx.role.findUnique({
      where: {
        code: "TEACHER",
      },
    });

    if (!teacherRole) {
      throw new Error("TEACHER role has not been seeded");
    }

    // 4. Assign TEACHER role to the user
    await tx.userRole.create({
      data: {
        userId: user.id,
        roleId: teacherRole.id,
      },
    });

    // 5. Create the Teacher record
    const teacher = await tx.teacher.create({
      data: {
        userId: user.id,
        employeeNumber: data.employeeNumber || null,
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

    return teacher;
  });
}

async function updateTeacher(id, data) {
  return prisma.$transaction(async (tx) => {
    const teacher = await tx.teacher.findUnique({
      where: { id },
    });

    if (!teacher) {
      const error = new Error("Teacher not found");
      error.code = "P2025";
      throw error;
    }

    await tx.user.update({
      where: {
        id: teacher.userId,
      },
      data: {
        firstName: data.firstName,
        middleName: data.middleName,
        lastName: data.lastName,
        email: data.email,
        phone: data.phone,
      },
    });

    return tx.teacher.update({
      where: {
        id,
      },
      data: {
        employeeNumber: data.employeeNumber,
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
  });
}



async function assignLearningArea(teacherId, learningAreaId) {
  // Make sure the teacher exists
  const teacher = await prisma.teacher.findUnique({
    where: {
      id: teacherId,
    },
  });

  if (!teacher) {
    const error = new Error("Teacher not found");
    error.statusCode = 404;
    throw error;
  }

  // Make sure the learning area exists
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

  // Assign teacher to learning area
  try {
    return await prisma.teacherLearningArea.create({
      data: {
        teacherId,
        learningAreaId,
      },
      include: {
        teacher: {
          include: {
            user: {
              select: {
                id: true,
                firstName: true,
                middleName: true,
                lastName: true,
                email: true,
              },
            },
          },
        },
        learningArea: true,
      },
    });
  } catch (error) {
    // Teacher already assigned to this learning area
    if (error.code === "P2002") {
      const duplicateError = new Error(
        "Teacher is already assigned to this learning area"
      );
      duplicateError.statusCode = 409;
      throw duplicateError;
    }

    throw error;
  }
}


async function assignStream(teacherId, streamId) {
  // Make sure the teacher exists
  const teacher = await prisma.teacher.findUnique({
    where: {
      id: teacherId,
    },
  });

  if (!teacher) {
    const error = new Error("Teacher not found");
    error.statusCode = 404;
    throw error;
  }

  // Make sure the stream exists
  const stream = await prisma.stream.findUnique({
    where: {
      id: streamId,
    },
    include: {
      grade: true,
    },
  });

  if (!stream) {
    const error = new Error("Stream not found");
    error.statusCode = 404;
    throw error;
  }

  // Assign teacher to stream
  try {
    return await prisma.teacherStream.create({
      data: {
        teacherId,
        streamId,
      },
      include: {
        teacher: {
          include: {
            user: {
              select: {
                id: true,
                firstName: true,
                middleName: true,
                lastName: true,
                email: true,
              },
            },
          },
        },
        stream: {
          include: {
            grade: true,
          },
        },
      },
    });
  } catch (error) {
    // Teacher already assigned to this stream
    if (error.code === "P2002") {
      const duplicateError = new Error(
        "Teacher is already assigned to this stream"
      );
      duplicateError.statusCode = 409;
      throw duplicateError;
    }

    throw error;
  }
}

async function createTeachingAssignment(
  teacherId,
  learningAreaId,
  streamId
) {
  // Check teacher
  const teacher = await prisma.teacher.findUnique({
    where: {
      id: teacherId,
    },
  });

  if (!teacher) {
    const error = new Error("Teacher not found");
    error.statusCode = 404;
    throw error;
  }

  // Check learning area
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

  // Check stream
  const stream = await prisma.stream.findUnique({
    where: {
      id: streamId,
    },
    include: {
      grade: true,
    },
  });

  if (!stream) {
    const error = new Error("Stream not found");
    error.statusCode = 404;
    throw error;
  }

  // Create assignment
  try {
    return await prisma.teacherTeachingAssignment.create({
      data: {
        teacherId,
        learningAreaId,
        streamId,
      },
      include: {
        teacher: {
          include: {
            user: {
              select: {
                id: true,
                firstName: true,
                middleName: true,
                lastName: true,
                email: true,
              },
            },
          },
        },

        learningArea: true,

        stream: {
          include: {
            grade: true,
          },
        },
      },
    });
  } catch (error) {
    if (error.code === "P2002") {
      const duplicateError = new Error(
        "This teacher is already assigned to this learning area and stream"
      );

      duplicateError.statusCode = 409;

      throw duplicateError;
    }

    throw error;
  }
}

/*
|--------------------------------------------------------------------------
| SEARCH TEACHERS
|--------------------------------------------------------------------------
| Search by:
| - First name
| - Middle name
| - Last name
| - Email
| - Phone
|--------------------------------------------------------------------------
*/

async function searchTeachers(search) {
  if (!search || !search.trim()) {
    return [];
  }

  const keyword = search.trim();

  return prisma.teacher.findMany({
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

      teachingAssignments: {
        include: {
          grade: true,
          stream: true,
          learningArea: true,
        },
      },

      classTeacherAssignments: {
        include: {
          grade: true,
          stream: true,
          academicYear: true,
          term: true,
        },
      },
    },

    orderBy: {
      createdAt: "desc",
    },

    take: 50,
  });
}





async function getMyProfile(userId) {
  if (!userId) {
    const error = new Error("userId is required");
    error.statusCode = 400;
    throw error;
  }

  const teacher = await prisma.teacher.findUnique({
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

      teachingAssignments: {
        include: {
          learningArea: true,
          grade: true,
          stream: true,
        },

        orderBy: {
          createdAt: "desc",
        },
      },

      learningAreas: {
        include: {
          learningArea: true,
        },
      },

      teacherStreams: {
        include: {
          stream: {
            include: {
              grade: true,
            },
          },
        },
      },

      classTeacherAssignments: {
      
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

  if (!teacher) {
    const error = new Error("Teacher profile not found");
    error.statusCode = 404;
    throw error;
  }

  return {
    id: teacher.id,

    employeeNumber: teacher.employeeNumber,

    profile: {
      id: teacher.user.id,
      firstName: teacher.user.firstName,
      middleName: teacher.user.middleName,
      lastName: teacher.user.lastName,
      email: teacher.user.email,
      phone: teacher.user.phone,
      status: teacher.user.status,
    },

    teachingAssignments: teacher.teachingAssignments,

    learningAreas: teacher.learningAreas,

    streams: teacher.teacherStreams,

    classTeacherAssignments:
      teacher.classTeacherAssignments,
  };
}


/*
|--------------------------------------------------------------------------
| UPDATE MY PORTAL PROFILE
|--------------------------------------------------------------------------
|
| Teachers can update their personal information.
|
| NOT editable by teacher:
| - employeeNumber
| - status
| - roles
| - teaching assignments
| - learning areas
| - streams
| - class teacher assignments
|
*/

async function updateMyProfile(userId, data) {
  if (!userId) {
    const error = new Error("userId is required");
    error.statusCode = 400;
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


  /*
  |--------------------------------------------------------------------------
  | Get editable fields
  |--------------------------------------------------------------------------
  */

  const firstName =
    data.firstName !== undefined
      ? String(data.firstName).trim()
      : teacher.user.firstName;

  const middleName =
    data.middleName !== undefined
      ? String(data.middleName).trim() || null
      : teacher.user.middleName;

  const lastName =
    data.lastName !== undefined
      ? String(data.lastName).trim()
      : teacher.user.lastName;

  const phone =
    data.phone !== undefined
      ? String(data.phone).trim() || null
      : teacher.user.phone;


  /*
  |--------------------------------------------------------------------------
  | Validate required names
  |--------------------------------------------------------------------------
  */

  if (!firstName) {
    const error = new Error("First name is required");
    error.statusCode = 400;
    throw error;
  }

  if (!lastName) {
    const error = new Error("Last name is required");
    error.statusCode = 400;
    throw error;
  }


  /*
  |--------------------------------------------------------------------------
  | Update USER record
  |--------------------------------------------------------------------------
  |
  | We update the User table because the teacher's personal details
  | are stored there.
  |
  */

  const updatedUser = await prisma.user.update({
    where: {
      id: teacher.userId,
    },

    data: {
      firstName,
      middleName,
      lastName,
      phone,
    },

    select: {
      id: true,
      firstName: true,
      middleName: true,
      lastName: true,
      email: true,
      phone: true,
      status: true,
    },
  });


  /*
  |--------------------------------------------------------------------------
  | Return updated teacher portal profile
  |--------------------------------------------------------------------------
  */

  return {
    id: teacher.id,

    employeeNumber:
      teacher.employeeNumber,

    profile: updatedUser,
  };
}




module.exports = {
  getMyProfile,
  updateMyProfile,
  getTeachers,
  getTeacherById,
  createTeacher,
  updateTeacher,
  assignLearningArea,
  assignStream,
  createTeachingAssignment,
  getMyDashboard,
  searchTeachers,
};
