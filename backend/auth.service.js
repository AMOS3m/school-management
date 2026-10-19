const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const prisma = require("./prisma");

async function login(identifier, password) {
  const user = await prisma.user.findFirst({
    where: {
      OR: [
        { email: identifier },
        { phone: identifier },
      ],
    },
    include: {
      roles: {
        include: {
          role: {
            include: {
              permissions: {
                include: {
                  permission: true,
                },
              },
            },
          },
        },
      },
    },
  });

  if (!user) {
    throw new Error("Invalid credentials");
  }

  if (user.status !== "ACTIVE") {
    throw new Error("User account is not active");
  }

  const passwordValid = await bcrypt.compare(
    password,
    user.passwordHash
  );

  if (!passwordValid) {
    throw new Error("Invalid credentials");
  }

  const roles = user.roles.map(
    (userRole) => userRole.role.code
  );

  const permissions = [
    ...new Set(
      user.roles.flatMap((userRole) =>
        userRole.role.permissions.map(
          (rolePermission) =>
            rolePermission.permission.code
        )
      )
    ),
  ];

  const token = jwt.sign(
    {
      sub: user.id,
      roles,
      permissions,
    },
    process.env.JWT_SECRET,
    {
      expiresIn: process.env.JWT_EXPIRES_IN || "1d",
    }
  );

  return {
    token,

    user: {
      id: user.id,
      firstName: user.firstName,
      middleName: user.middleName,
      lastName: user.lastName,
      email: user.email,
      phone: user.phone,
      roles,
      permissions,
    },
  };
}

module.exports = {
  login,
};
