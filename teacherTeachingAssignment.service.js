
const  prisma  = require("/prisma");



async function createTeachingAssignment({
  teacherId,
  learningArea,
  gradeId,
  streamId,
}) {
  if (!teacherId || !learningArea || !gradeId) {
    const error = new Error(
      "teacherId, learningArea and gradeId are required"
    );

    error.statusCode = 400;
    throw error;
  }

  const learningAreaName = learningArea.trim();

  if (!learningAreaName) {
    const error = new Error(
      "Learning area cannot be empty"
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
  | FIND EXISTING LEARNING AREA
  |--------------------------------------------------------------------------
  */

  let learningAreaRecord =
    await prisma.learningArea.findFirst({
      where: {
        name: {
          equals: learningAreaName,
          mode: "insensitive",
        },
      },
    });

  /*
  |--------------------------------------------------------------------------
  | CREATE LEARNING AREA IF IT DOES NOT EXIST
  |--------------------------------------------------------------------------
  */

  if (!learningAreaRecord) {
    const generatedCode = learningAreaName
      .toUpperCase()
      .replace(/[^A-Z0-9]+/g, "_")
      .replace(/^_+|_+$/g, "")
      .substring(0, 50);

    learningAreaRecord =
      await prisma.learningArea.create({
        data: {
          name: learningAreaName,
          code: generatedCode,
          curriculumType: "CBC",
        },
      });
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
    | Make sure stream belongs to selected grade
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
  | Prevent duplicate assignment
  |--------------------------------------------------------------------------
  */

  const existingAssignment =
    await prisma.teacherTeachingAssignment.findFirst({
      where: {
        teacherId,
        learningAreaId: learningAreaRecord.id,
        gradeId,
        streamId: streamId || null,
      },
    });

  if (existingAssignment) {
    const error = new Error(
      "This teacher is already assigned to this learning area and class"
    );

    error.statusCode = 409;
    throw error;
  }

  /*
  |--------------------------------------------------------------------------
  | Create teaching assignment
  |--------------------------------------------------------------------------
  */

  return prisma.teacherTeachingAssignment.create({
    data: {
      teacherId,
      learningAreaId: learningAreaRecord.id,
      gradeId,
      streamId: streamId || null,
    },

    include: {
      teacher: {
        include: {
          user: true,
        },
      },

      learningArea: true,

      grade: true,

      stream: true,
    },
  });
}

/*
|--------------------------------------------------------------------------
| GET TEACHING ASSIGNMENTS
|--------------------------------------------------------------------------
|
| Academic Admin can filter assignments.
|
| Optional:
| teacherId
| learningAreaId
| gradeId
| streamId
|
|--------------------------------------------------------------------------
*/

async function getTeachingAssignments({
  teacherId,
  learningAreaId,
  gradeId,
  streamId,
}) {
  return prisma.teacherTeachingAssignment.findMany({
    where: {
      ...(teacherId
        ? {
            teacherId,
          }
        : {}),

      ...(learningAreaId
        ? {
            learningAreaId,
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
      teacher: {
        include: {
          user: true,
        },
      },

      learningArea: true,

      grade: true,

      stream: true,
    },

    orderBy: {
      createdAt: "desc",
    },
  });
}


/*
|--------------------------------------------------------------------------
| GET TEACHING ASSIGNMENT BY ID
|--------------------------------------------------------------------------
*/

async function getTeachingAssignmentById(
  assignmentId
) {
  if (!assignmentId) {
    const error = new Error(
      "assignmentId is required"
    );

    error.statusCode = 400;
    throw error;
  }

  const assignment =
    await prisma.teacherTeachingAssignment.findUnique({
      where: {
        id: assignmentId,
      },

      include: {
        teacher: {
          include: {
            user: true,
          },
        },

        learningArea: true,

        grade: true,

        stream: true,
      },
    });

  if (!assignment) {
    const error = new Error(
      "Teaching assignment not found"
    );

    error.statusCode = 404;
    throw error;
  }

  return assignment;
}


/*
|--------------------------------------------------------------------------
| UPDATE TEACHING ASSIGNMENT
|--------------------------------------------------------------------------
|
| Academic Admin can change:
|
| teacher
| learning area
| grade
| stream
|
|--------------------------------------------------------------------------
*/

async function updateTeachingAssignment({
  assignmentId,
  teacherId,
  learningArea,
  gradeId,
  streamId,
}) {
  if (!assignmentId) {
    const error = new Error(
      "assignmentId is required"
    );

    error.statusCode = 400;
    throw error;
  }

  /*
  |--------------------------------------------------------------------------
  | Find existing assignment
  |--------------------------------------------------------------------------
  */

  const existingAssignment =
    await prisma.teacherTeachingAssignment.findUnique({
      where: {
        id: assignmentId,
      },
    });

  if (!existingAssignment) {
    const error = new Error(
      "Teaching assignment not found"
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
    teacherId !== undefined
      ? teacherId
      : existingAssignment.teacherId;

   /*
|--------------------------------------------------------------------------
| Determine final learning area
|--------------------------------------------------------------------------
*/

let finalLearningAreaId =
  existingAssignment.learningAreaId;

if (learningArea !== undefined) {
  const learningAreaName = learningArea.trim();

  if (!learningAreaName) {
    const error = new Error(
      "Learning area cannot be empty"
    );

    error.statusCode = 400;
    throw error;
  }

  let learningAreaRecord =
    await prisma.learningArea.findFirst({
      where: {
        name: {
          equals: learningAreaName,
          mode: "insensitive",
        },
      },
    });
   
   if (!learningAreaRecord) {
  const generatedCode = learningAreaName
    .toUpperCase()
    .replace(/[^A-Z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "")
    .substring(0, 50);

  learningAreaRecord =
    await prisma.learningArea.create({
      data: {
        name: learningAreaName,
        code: generatedCode,
        curriculumType: "CBC",
      },
    });
} 
  
  finalLearningAreaId =
    learningAreaRecord.id;
}
  
  const finalGradeId =
    gradeId !== undefined
      ? gradeId
      : existingAssignment.gradeId;

  const finalStreamId =
    streamId !== undefined
      ? streamId
      : existingAssignment.streamId;

  /*
  |--------------------------------------------------------------------------
  | Validate teacher
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
  | Validate learning area
  |--------------------------------------------------------------------------
  */

  const learningAreaRecord =
  await prisma.learningArea.findUnique({
    where: {
      id: finalLearningAreaId,
    },
  });

if (!learningAreaRecord) {
  const error = new Error(
    "Learning area not found"
  );

  error.statusCode = 404;
  throw error;
}
  /*
  |--------------------------------------------------------------------------
  | Validate grade
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
  | Validate stream
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
  | Check duplicate assignment
  |--------------------------------------------------------------------------
  */

  const duplicate =
    await prisma.teacherTeachingAssignment.findFirst({
      where: {
        teacherId: finalTeacherId,
        learningAreaId: finalLearningAreaId,
        gradeId: finalGradeId,
        streamId: finalStreamId || null,

        NOT: {
          id: assignmentId,
        },
      },
    });

  if (duplicate) {
    const error = new Error(
      "This teaching assignment already exists"
    );

    error.statusCode = 409;
    throw error;
  }

  /*
  |--------------------------------------------------------------------------
  | Update
  |--------------------------------------------------------------------------
  */

  return prisma.teacherTeachingAssignment.update({
    where: {
      id: assignmentId,
    },

    data: {
      teacherId: finalTeacherId,
      learningAreaId: finalLearningAreaId,
      gradeId: finalGradeId,
      streamId: finalStreamId || null,
    },

    include: {
      teacher: {
        include: {
          user: true,
        },
      },

      learningArea: true,

      grade: true,

      stream: true,
    },
  });
}


/*
|--------------------------------------------------------------------------
| REMOVE TEACHING ASSIGNMENT
|--------------------------------------------------------------------------
*/

async function removeTeachingAssignment(
  assignmentId
) {
  if (!assignmentId) {
    const error = new Error(
      "assignmentId is required"
    );

    error.statusCode = 400;
    throw error;
  }

  const assignment =
    await prisma.teacherTeachingAssignment.findUnique({
      where: {
        id: assignmentId,
      },
    });

  if (!assignment) {
    const error = new Error(
      "Teaching assignment not found"
    );

    error.statusCode = 404;
    throw error;
  }

  await prisma.teacherTeachingAssignment.delete({
    where: {
      id: assignmentId,
    },
  });

  return {
    id: assignmentId,
    message: "Teaching assignment removed successfully",
  };
}


module.exports = {
  createTeachingAssignment,
  getTeachingAssignments,
  getTeachingAssignmentById,
  updateTeachingAssignment,
  removeTeachingAssignment,
};

