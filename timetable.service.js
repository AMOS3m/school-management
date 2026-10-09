
const prisma  = require("/prisma");

async function createTimetable({ name, academicYearId, termId }) {
  if (!name || !academicYearId) {
    const error = new Error("name and academicYearId are required");
    error.statusCode = 400;
    throw error;
  }

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
  }

  return prisma.timetable.create({
    data: {
      name,
      academicYearId,
      termId: termId || null,
    },
    include: {
      academicYear: true,
      term: true,
      entries: true,
    },
  });
}



/* 
|--------------------------------------------------------------------------
| GET ALL TIMETABLES
|--------------------------------------------------------------------------
*/

async function getTimetables() {
  return prisma.timetable.findMany({
    include: {
      academicYear: true,
      term: true,
      entries: {
        include: {
          teacher: true,
          grade: true,
          stream: true,
          learningArea: true,
        },
        orderBy: [
          {
            dayOfWeek: "asc",
          },
          {
            startTime: "asc",
          },
        ],
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });
}

/*
|--------------------------------------------------------------------------
| CREATE TIMETABLE ENTRY
|--------------------------------------------------------------------------
*/

async function createTimetableEntry({
  timetableId,
  teacherId,
  gradeId,
  streamId,
  learningAreaId,
  dayOfWeek,
  startTime,
  endTime,
  room,
}) {
  if (
    !timetableId ||
    !teacherId ||
    !gradeId ||
    !learningAreaId ||
    !dayOfWeek ||
    !startTime ||
    !endTime
  ) {
    const error = new Error(
      "timetableId, teacherId, gradeId, learningAreaId, dayOfWeek, startTime and endTime are required"
    );

    error.statusCode = 400;
    throw error;
  }

  /*
  |--------------------------------------------------------------------------
  | Validate time
  |--------------------------------------------------------------------------
  */

  if (startTime >= endTime) {
    const error = new Error("startTime must be before endTime");
    error.statusCode = 400;
    throw error;
  }

  /*
  |--------------------------------------------------------------------------
  | Check timetable
  |--------------------------------------------------------------------------
  */

  const timetable = await prisma.timetable.findUnique({
    where: {
      id: timetableId,
    },
    select: {
      id: true,
      academicYearId: true,
      termId: true,
    },
  });

  if (!timetable) {
    const error = new Error("Timetable not found");
    error.statusCode = 404;
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
  | Check teacher teaching assignment
  |--------------------------------------------------------------------------
  |
  | A teacher should only be placed on the timetable for a learning
  | area/class they have actually been assigned to teach.
  |
  */

  const assignment = await prisma.teacherTeachingAssignment.findFirst({
    where: {
      teacherId,
      learningAreaId,
      gradeId,
      ...(streamId ? { streamId } : {}),
    },
  });

  if (!assignment) {
    const error = new Error(
      "Teacher is not assigned to this learning area and class"
    );

    error.statusCode = 400;
    throw error;
  }

  /*
  |--------------------------------------------------------------------------
  | Check teacher timetable conflict
  |--------------------------------------------------------------------------
  */

  const teacherConflict = await prisma.timetableEntry.findFirst({
    where: {
      teacherId,
      dayOfWeek,
      startTime: {
        lt: endTime,
      },
      endTime: {
        gt: startTime,
      },
    },
  });

  if (teacherConflict) {
    const error = new Error(
      "Teacher already has another lesson during this time"
    );

    error.statusCode = 409;
    throw error;
  }

  /*
  |--------------------------------------------------------------------------
  | Check grade/stream timetable conflict
  |--------------------------------------------------------------------------
  */

  const classConflict = await prisma.timetableEntry.findFirst({
    where: {
      gradeId,
      streamId: streamId || null,
      dayOfWeek,
      startTime: {
        lt: endTime,
      },
      endTime: {
        gt: startTime,
      },
    },
  });

  if (classConflict) {
    const error = new Error(
      "This class or stream already has a lesson during this time"
    );

    error.statusCode = 409;
    throw error;
  }

  /*
  |--------------------------------------------------------------------------
  | Check room conflict
  |--------------------------------------------------------------------------
  */

  if (room) {
    const roomConflict = await prisma.timetableEntry.findFirst({
      where: {
        room,
        dayOfWeek,
        startTime: {
          lt: endTime,
        },
        endTime: {
          gt: startTime,
        },
      },
    });

    if (roomConflict) {
      const error = new Error(
        "This room is already occupied during this time"
      );

      error.statusCode = 409;
      throw error;
    }
  }

  /*
  |--------------------------------------------------------------------------
  | Create entry
  |--------------------------------------------------------------------------
  */
 return prisma.timetableEntry.create({
  data: {
    timetable: {
      connect: {
        id: timetableId,
      },
    },

     academicYear: {
      connect: {
        id: timetable.academicYearId,
      },
    },

    teacher: {
      connect: {
        id: teacherId,
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

    learningArea: {
      connect: {
        id: learningAreaId,
      },
    },

    dayOfWeek,
    startTime,
    endTime,
    room: room || null,
  },
   
  
    include: {
      teacher: true,
      grade: true,
      stream: true,
      learningArea: true,
      timetable: true,
    },
  });
}


/*
|--------------------------------------------------------------------------
| GET TIMETABLE ENTRIES
|--------------------------------------------------------------------------
*/

async function getTimetableEntries(timetableId) {
  const timetable = await prisma.timetable.findUnique({
    where: {
      id: timetableId,
    },
  });

  if (!timetable) {
    const error = new Error("Timetable not found");
    error.statusCode = 404;
    throw error;
  }

  return prisma.timetableEntry.findMany({
    where: {
      timetableId,
    },
    include: {
      teacher: true,
      grade: true,
      stream: true,
      learningArea: true,
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
}


/*
|--------------------------------------------------------------------------
| UPDATE TIMETABLE ENTRY
|--------------------------------------------------------------------------
*/

async function updateTimetableEntry(entryId, data) {
  const existingEntry = await prisma.timetableEntry.findUnique({
    where: {
      id: entryId,
    },
  });

  if (!existingEntry) {
    const error = new Error("Timetable entry not found");
    error.statusCode = 404;
    throw error;
  }

  return prisma.timetableEntry.update({
    where: {
      id: entryId,
    },
    data,
    include: {
      teacher: true,
      grade: true,
      stream: true,
      learningArea: true,
      timetable: true,
    },
  });
}


/*
|--------------------------------------------------------------------------
| DELETE TIMETABLE ENTRY
|--------------------------------------------------------------------------
*/

async function deleteTimetableEntry(entryId) {
  const existingEntry = await prisma.timetableEntry.findUnique({
    where: {
      id: entryId,
    },
  });

  if (!existingEntry) {
    const error = new Error("Timetable entry not found");
    error.statusCode = 404;
    throw error;
  }

  await prisma.timetableEntry.delete({
    where: {
      id: entryId,
    },
  });

  return {
    message: "Timetable entry deleted successfully",
  };
}


module.exports = {
  createTimetable,
  getTimetables,
  createTimetableEntry,
  getTimetableEntries,
  updateTimetableEntry,
  deleteTimetableEntry,
};
