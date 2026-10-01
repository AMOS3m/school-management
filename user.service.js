const bcrypt = require("bcrypt");
const prisma = require("../../lib/prisma");

const ADMIN_ROLES = [
  "HEAD_OF_INSTITUTION",
  "ACADEMIC_ADMIN",
  "ADMISSIONS_ADMIN",
  "FINANCE_ADMIN",
];

async function createAdmin(data) {
  const {
    firstName,
    middleName,
    lastName,
    email,
    phone,
    password,
    role,
  } = data;

  // Validate required fields
  if (!firstName || !lastName || !email || !password || !role) {
    const error = new Error(
      "firstName, lastName, email, password and role are required"
    );
    error.statusCode = 400;
    throw error;
  }

  // Only administrative roles can be created through this endpoint
  if (!ADMIN_ROLES.includes(role)) {
    const error = new Error("Invalid administrator role");
    error.statusCode = 400;
    throw error;
  }

  // Check if email already exists
  const existingUser = await prisma.user.findUnique({
    where: {
      email,
    },
  });

  if (existingUser) {
    const error = new Error("A user with this email already exists");
    error.statusCode = 409;
    throw error;
  }

  // Find the requested role
  const roleRecord = await prisma.role.findUnique({
    where: {
      code: role,
    },
  });

  if (!roleRecord) {
    const error = new Error("Requested role does not exist");
    error.statusCode = 400;
    throw error;
  }

  // Hash password
  const passwordHash = await bcrypt.hash(password, 12);

  // Create user and assign role in one transaction
  const user = await prisma.$transaction(async (tx) => {
    const newUser = await tx.user.create({
      data: {
        firstName,
        middleName: middleName || null,
        lastName,
        email,
        phone: phone || null,
        passwordHash,
        status: "ACTIVE",
      },
    });

    await tx.userRole.create({
      data: {
        userId: newUser.id,
        roleId: roleRecord.id,
      },
    });

    return newUser;
  });

  // Never return passwordHash
  return {
    id: user.id,
    firstName: user.firstName,
    middleName: user.middleName,
    lastName: user.lastName,
    email: user.email,
    phone: user.phone,
    status: user.status,
    role,
    createdAt: user.createdAt,
  };
}

module.exports = {
  createAdmin,
};