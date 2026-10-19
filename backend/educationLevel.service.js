const { prisma } = require("./prisma");


/*
|--------------------------------------------------------------------------
| CREATE EDUCATION LEVEL
|--------------------------------------------------------------------------
*/

async function createEducationLevel({
  code,
  name,
  description,
}) {
  if (!code || !name) {
    const error = new Error(
      "code and name are required"
    );

    error.statusCode = 400;
    throw error;
  }

  const existing = await prisma.educationLevel.findUnique({
    where: {
      code,
    },
  });

  if (existing) {
    const error = new Error(
      "This education level code already exists."
    );

    error.statusCode = 409;
    throw error;
  }

  return prisma.educationLevel.create({
    data: {
      code,
      name,
      description: description || null,
    },
  });
}


/*
|--------------------------------------------------------------------------
| GET EDUCATION LEVELS
|--------------------------------------------------------------------------
*/

async function getEducationLevels() {
  return prisma.educationLevel.findMany({
    include: {
      grades: true,
    },

    orderBy: {
      name: "asc",
    },
  });
}


/*
|--------------------------------------------------------------------------
| UPDATE EDUCATION LEVEL
|--------------------------------------------------------------------------
*/

async function updateEducationLevel(
  educationLevelId,
  {
    code,
    name,
    description,
  }
) {
  const existing =
    await prisma.educationLevel.findUnique({
      where: {
        id: educationLevelId,
      },
    });

  if (!existing) {
    const error = new Error(
      "Education level not found."
    );

    error.statusCode = 404;
    throw error;
  }

  return prisma.educationLevel.update({
    where: {
      id: educationLevelId,
    },

    data: {
      code:
        code !== undefined
          ? code
          : undefined,

      name:
        name !== undefined
          ? name
          : undefined,

      description:
        description !== undefined
          ? description
          : undefined,
    },
  });
}


/*
|--------------------------------------------------------------------------
| DELETE EDUCATION LEVEL
|--------------------------------------------------------------------------
*/

async function deleteEducationLevel(
  educationLevelId
) {
  const existing =
    await prisma.educationLevel.findUnique({
      where: {
        id: educationLevelId,
      },
    });

  if (!existing) {
    const error = new Error(
      "Education level not found."
    );

    error.statusCode = 404;
    throw error;
  }

  await prisma.educationLevel.delete({
    where: {
      id: educationLevelId,
    },
  });

  return {
    message:
      "Education level deleted successfully",
  };
}


module.exports = {
  createEducationLevel,
  getEducationLevels,
  updateEducationLevel,
  deleteEducationLevel,
};
