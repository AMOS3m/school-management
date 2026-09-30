require("dotenv").config();

const { PrismaClient } = require("@prisma/client");
const { PrismaPg } = require("@prisma/adapter-pg");

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL,
});

const prisma = new PrismaClient({
  adapter,
});

async function main() {
  console.log("Creating academic data...");

  // ==========================================
  // 1. EDUCATION LEVELS
  // ==========================================

  const primary = await prisma.educationLevel.upsert({
    where: {
      code: "PRIMARY",
    },
    update: {},
    create: {
      code: "PRIMARY",
      name: "Primary School",
      description: "Kenyan CBC Primary School",
    },
  });

  const juniorSecondary = await prisma.educationLevel.upsert({
    where: {
      code: "JUNIOR_SECONDARY",
    },
    update: {},
    create: {
      code: "JUNIOR_SECONDARY",
      name: "Junior Secondary School",
      description: "Kenyan CBC Junior Secondary School",
    },
  });

  console.log("Education levels created.");

  // ==========================================
  // 2. GRADES
  // ==========================================

  const grade6 = await prisma.grade.upsert({
    where: {
      educationLevelId_code: {
        educationLevelId: primary.id,
        code: "G6",
      },
    },
    update: {},
    create: {
      name: "Grade 6",
      code: "G6",
      educationLevelId: primary.id,
    },
  });

  const grade7 = await prisma.grade.upsert({
    where: {
      educationLevelId_code: {
        educationLevelId: juniorSecondary.id,
        code: "G7",
      },
    },
    update: {},
    create: {
      name: "Grade 7",
      code: "G7",
      educationLevelId: juniorSecondary.id,
    },
  });

  console.log("Grades created.");

  // ==========================================
  // 3. STREAMS
  // ==========================================

  const grade6A = await prisma.stream.upsert({
    where: {
      gradeId_code: {
        gradeId: grade6.id,
        code: "6A",
      },
    },
    update: {},
    create: {
      name: "6A",
      code: "6A",
      gradeId: grade6.id,
    },
  });

  const grade6B = await prisma.stream.upsert({
    where: {
      gradeId_code: {
        gradeId: grade6.id,
        code: "6B",
      },
    },
    update: {},
    create: {
      name: "6B",
      code: "6B",
      gradeId: grade6.id,
    },
  });

  const grade7A = await prisma.stream.upsert({
    where: {
      gradeId_code: {
        gradeId: grade7.id,
        code: "7A",
      },
    },
    update: {},
    create: {
      name: "7A",
      code: "7A",
      gradeId: grade7.id,
    },
  });

  console.log("Streams created.");

  // ==========================================
  // 4. LEARNING AREAS
  // ==========================================

  const mathematics = await prisma.learningArea.upsert({
    where: {
      code: "MAT",
    },
    update: {},
    create: {
      name: "Mathematics",
      code: "MAT",
      curriculumType: "CBC",
      description: "Mathematics learning area",
    },
  });

  const english = await prisma.learningArea.upsert({
    where: {
      code: "ENG",
    },
    update: {},
    create: {
      name: "English",
      code: "ENG",
      curriculumType: "CBC",
      description: "English learning area",
    },
  });

  const kiswahili = await prisma.learningArea.upsert({
    where: {
      code: "KIS",
    },
    update: {},
    create: {
      name: "Kiswahili",
      code: "KIS",
      curriculumType: "CBC",
      description: "Kiswahili learning area",
    },
  });

  const science = await prisma.learningArea.upsert({
    where: {
      code: "SCI",
    },
    update: {},
    create: {
      name: "Science and Technology",
      code: "SCI",
      curriculumType: "CBC",
      description: "Science and Technology learning area",
    },
  });

  console.log("Learning areas created.");

  // ==========================================
  // DISPLAY CREATED DATA
  // ==========================================

  console.log("\n==============================");
  console.log("CREATED DATA");
  console.log("==============================");

  console.log("\nEducation Levels:");
  console.log(primary);
  console.log(juniorSecondary);

  console.log("\nGrades:");
  console.log(grade6);
  console.log(grade7);

  console.log("\nStreams:");
  console.log(grade6A);
  console.log(grade6B);
  console.log(grade7A);

  console.log("\nLearning Areas:");
  console.log(mathematics);
  console.log(english);
  console.log(kiswahili);
  console.log(science);

  console.log("\nAcademic data created successfully.");
}

main()
  .catch((error) => {
    console.error("Error:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });