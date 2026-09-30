require("dotenv").config();

const bcrypt = require("bcrypt");
const { PrismaClient } = require("@prisma/client");
const { PrismaPg } = require("@prisma/adapter-pg");

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL,
});

const prisma = new PrismaClient({
  adapter,
});

async function main() {
  const email = "admin@school.local";
  const password = "ChangeMe123!";
  const firstName = "System";
  const lastName = "Administrator";

  console.log("Creating first administrator...");

  // Check whether this email already exists
  const existingUser = await prisma.user.findUnique({
    where: {
      email,
    },
  });

  if (existingUser) {
    console.log("An administrator with this email already exists.");
    return;
  }

  // Hash the password
  const passwordHash = await bcrypt.hash(password, 12);

  // Find the Head of Institution role
  const role = await prisma.role.findUnique({
    where: {
      code: "HEAD_OF_INSTITUTION",
    },
  });

  if (!role) {
    throw new Error(
      "HEAD_OF_INSTITUTION role does not exist. Run the seed first."
    );
  }

  // Create user and assign administrator role
  const user = await prisma.user.create({
    data: {
      firstName,
      lastName,
      email,
      passwordHash,
      status: "ACTIVE",

      roles: {
        create: {
          roleId: role.id,
        },
      },
    },

    include: {
      roles: {
        include: {
          role: true,
        },
      },
    },
  });

  console.log("Administrator created successfully.");
  console.log("--------------------------------");
  console.log("Email:", user.email);
  console.log("Role:", user.roles[0].role.code);
  console.log("--------------------------------");
  console.log("IMPORTANT: Change the default password after login.");
}

main()
  .catch((error) => {
    console.error("Failed to create administrator:");
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });