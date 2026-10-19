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
  const levels = await prisma.educationLevel.findMany();

  const grades = await prisma.grade.findMany({
    include: {
      educationLevel: true,
    },
  });

  const streams = await prisma.stream.findMany({
    include: {
      grade: true,
    },
  });

  const areas = await prisma.learningArea.findMany();

  console.log("\n==============================");
  console.log("EDUCATION LEVELS");
  console.log("==============================");
  console.log(JSON.stringify(levels, null, 2));

  console.log("\n==============================");
  console.log("GRADES");
  console.log("==============================");
  console.log(JSON.stringify(grades, null, 2));

  console.log("\n==============================");
  console.log("STREAMS");
  console.log("==============================");
  console.log(JSON.stringify(streams, null, 2));

  console.log("\n==============================");
  console.log("LEARNING AREAS");
  console.log("==============================");
  console.log(JSON.stringify(areas, null, 2));
}

main()
  .catch((error) => {
    console.error("Error:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });