const prisma  = require("./prisma");

/*
|--------------------------------------------------------------------------
| CREATE EXAMINATION TIMETABLE
|--------------------------------------------------------------------------
*/

async function createExaminationTimetable({
  name,
  examinationType,
  academicYearId,
  termId,
}) {
  if (!name || !academicYearId) {
    const error = new Error(
      "name and academicYearId are required"
    );
    error.statusCode = 400;
    throw error;
  }

  // Check academic year
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

  // Check term if supplied
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

  return prisma.examinationTimetable.create({
    data: {
      name,
      examinationType: examinationType || null,

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
| GET ALL EXAMINATION TIMETABLES
|--------------------------------------------------------------------------
*/

async function getExaminationTimetables() {
  return prisma.examinationTimetable.findMany({
    orderBy: {
      createdAt: "desc",
    },

    include: {
      academicYear: true,
      term: true,

      entries: {
        orderBy: [
          {
            examDate: "asc",
          },
          {
            startTime: "asc",
          },
        ],

        include: {
          grade: true,
          learningArea: true,
        },
      },
    },
  });
}


/*
|--------------------------------------------------------------------------
| GET ONE EXAMINATION TIMETABLE
|--------------------------------------------------------------------------
*/

async function getExaminationTimetable(id) {
  const timetable = await prisma.examinationTimetable.findUnique({
    where: {
      id,
    },

    include: {
      academicYear: true,
      term: true,

      entries: {
        orderBy: [
          {
            examDate: "asc",
          },
          {
            startTime: "asc",
          },
        ],

        include: {
          grade: true,
          learningArea: true,
        },
      },
    },
  });

  if (!timetable) {
    const error = new Error(
      "Examination timetable not found"
    );

    error.statusCode = 404;
    throw error;
  }

  return timetable;
}


/*
|--------------------------------------------------------------------------
| UPDATE EXAMINATION TIMETABLE
|--------------------------------------------------------------------------
*/

async function updateExaminationTimetable(
  id,
  {
    name,
    examinationType,
    academicYearId,
    termId,
    status,
  }
) {
  const existing = await prisma.examinationTimetable.findUnique({
    where: {
      id,
    },
  });

  if (!existing) {
    const error = new Error(
      "Examination timetable not found"
    );

    error.statusCode = 404;
    throw error;
  }

  if (academicYearId) {
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

  return prisma.examinationTimetable.update({
    where: {
      id,
    },

    data: {
      ...(name !== undefined && {
        name,
      }),

      ...(examinationType !== undefined && {
        examinationType,
      }),

      ...(academicYearId !== undefined && {
        academicYear: {
          connect: {
            id: academicYearId,
          },
        },
      }),

      ...(termId !== undefined && {
        term: termId
          ? {
              connect: {
                id: termId,
              },
            }
          : {
              disconnect: true,
            },
      }),

      ...(status !== undefined && {
        status,
      }),
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
| DELETE EXAMINATION TIMETABLE
|--------------------------------------------------------------------------
*/

async function deleteExaminationTimetable(id) {
  const existing =
    await prisma.examinationTimetable.findUnique({
      where: {
        id,
      },
    });

  if (!existing) {
    const error = new Error(
      "Examination timetable not found"
    );

    error.statusCode = 404;
    throw error;
  }

  await prisma.examinationTimetable.delete({
    where: {
      id,
    },
  });

  return {
    message: "Examination timetable deleted successfully",
  };
}


/*
|--------------------------------------------------------------------------
| CREATE EXAMINATION ENTRY
|--------------------------------------------------------------------------
*/

async function createExaminationEntry({
  examinationTimetableId,
  academicYearId,
  termId,
  gradeId,
  learningAreaId,
  examDate,
  startTime,
  endTime,
}) {
  if (
    !examinationTimetableId ||
    !gradeId ||
    !learningAreaId ||
    !examDate ||
    !startTime ||
    !endTime
  ) {
    const error = new Error(
      "examinationTimetableId, gradeId, learningAreaId, examDate, startTime and endTime are required"
    );

    error.statusCode = 400;
    throw error;
  }

  // Get parent timetable
  const timetable =
    await prisma.examinationTimetable.findUnique({
      where: {
        id: examinationTimetableId,
      },

      select: {
        id: true,
        academicYearId: true,
        termId: true,
      },
    });

  if (!timetable) {
    const error = new Error(
      "Examination timetable not found"
    );

    error.statusCode = 404;
    throw error;
  }

  // Academic year comes from the parent timetable
  const finalAcademicYearId =
    timetable.academicYearId;

  // Term comes from the parent timetable unless explicitly supplied
  const finalTermId =
    termId !== undefined
      ? termId
      : timetable.termId;

  // Check grade
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

  // Check learning area
  const learningArea =
    await prisma.learningArea.findUnique({
      where: {
        id: learningAreaId,
      },
    });

  if (!learningArea) {
    const error = new Error(
      "Learning area not found"
    );

    error.statusCode = 404;
    throw error;
  }

  // Validate time
  if (startTime >= endTime) {
    const error = new Error(
      "End time must be later than start time"
    );

    error.statusCode = 400;
    throw error;
  }

  // Create entry
  return prisma.examinationTimetableEntry.create({
    data: {
      examDate: new Date(examDate),
      startTime,
      endTime,

      examinationTimetable: {
        connect: {
          id: examinationTimetableId,
        },
      },

      academicYear: {
        connect: {
          id: finalAcademicYearId,
        },
      },

      term: finalTermId
        ? {
            connect: {
              id: finalTermId,
            },
          }
        : undefined,

      grade: {
        connect: {
          id: gradeId,
        },
      },

      learningArea: {
        connect: {
          id: learningAreaId,
        },
      },
    },

    include: {
      examinationTimetable: true,
      academicYear: true,
      term: true,
      grade: true,
      learningArea: true,
    },
  });
}


/*
|--------------------------------------------------------------------------
| GET EXAMINATION ENTRIES
|--------------------------------------------------------------------------
*/

async function getExaminationEntries(
  examinationTimetableId
) {
  const timetable =
    await prisma.examinationTimetable.findUnique({
      where: {
        id: examinationTimetableId,
      },
    });

  if (!timetable) {
    const error = new Error(
      "Examination timetable not found"
    );

    error.statusCode = 404;
    throw error;
  }

  return prisma.examinationTimetableEntry.findMany({
    where: {
      examinationTimetableId,
    },

    orderBy: [
      {
        examDate: "asc",
      },
      {
        startTime: "asc",
      },
    ],

    include: {
      grade: true,
      learningArea: true,
      term: true,
    },
  });
}


/*
|--------------------------------------------------------------------------
| UPDATE EXAMINATION ENTRY
|--------------------------------------------------------------------------
*/

async function updateExaminationEntry(
  entryId,
  {
    gradeId,
    learningAreaId,
    examDate,
    startTime,
    endTime,
  }
) {
  const existing =
    await prisma.examinationTimetableEntry.findUnique({
      where: {
        id: entryId,
      },
    });

  if (!existing) {
    const error = new Error(
      "Examination timetable entry not found"
    );

    error.statusCode = 404;
    throw error;
  }

  if (gradeId) {
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
  }

  if (learningAreaId) {
    const learningArea =
      await prisma.learningArea.findUnique({
        where: {
          id: learningAreaId,
        },
      });

    if (!learningArea) {
      const error = new Error(
        "Learning area not found"
      );

      error.statusCode = 404;
      throw error;
    }
  }

  const finalStartTime =
    startTime !== undefined
      ? startTime
      : existing.startTime;

  const finalEndTime =
    endTime !== undefined
      ? endTime
      : existing.endTime;

  if (finalStartTime >= finalEndTime) {
    const error = new Error(
      "End time must be later than start time"
    );

    error.statusCode = 400;
    throw error;
  }

  return prisma.examinationTimetableEntry.update({
    where: {
      id: entryId,
    },

    data: {
      ...(gradeId !== undefined && {
        grade: {
          connect: {
            id: gradeId,
          },
        },
      }),

      ...(learningAreaId !== undefined && {
        learningArea: {
          connect: {
            id: learningAreaId,
          },
        },
      }),

      ...(examDate !== undefined && {
        examDate: new Date(examDate),
      }),

      ...(startTime !== undefined && {
        startTime,
      }),

      ...(endTime !== undefined && {
        endTime,
      }),
    },

    include: {
      examinationTimetable: true,
      grade: true,
      learningArea: true,
      term: true,
    },
  });
}


/*
|--------------------------------------------------------------------------
| DELETE EXAMINATION ENTRY
|--------------------------------------------------------------------------
*/

async function deleteExaminationEntry(entryId) {
  const existing =
    await prisma.examinationTimetableEntry.findUnique({
      where: {
        id: entryId,
      },
    });

  if (!existing) {
    const error = new Error(
      "Examination timetable entry not found"
    );

    error.statusCode = 404;
    throw error;
  }

  await prisma.examinationTimetableEntry.delete({
    where: {
      id: entryId,
    },
  });

  return {
    message:
      "Examination timetable entry deleted successfully",
  };
}


module.exports = {
  createExaminationTimetable,
  getExaminationTimetables,
  getExaminationTimetable,
  updateExaminationTimetable,
  deleteExaminationTimetable,

  createExaminationEntry,
  getExaminationEntries,
  updateExaminationEntry,
  deleteExaminationEntry,
};
