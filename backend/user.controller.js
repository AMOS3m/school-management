const userService = require("./user.service");

async function createAdmin(req, res) {
  try {
    const admin = await userService.createAdmin(req.body);

    return res.status(201).json({
      message: "Administrator created successfully",
      admin,
    });
  } catch (error) {
    console.error(error);

    return res.status(error.statusCode || 500).json({
      message: error.message || "Failed to create administrator",
    });
  }
}

module.exports = {
  createAdmin,
};