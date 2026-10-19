const authService = require("./auth.service");

async function login(req, res) {
  try {
    const { identifier, password } = req.body;

    if (!identifier || !password) {
      return res.status(400).json({
        message: "Identifier and password are required",
      });
    }

    const result = await authService.login(
      identifier,
      password
    );

    return res.status(200).json(result);
  } catch (error) {
    console.error(error);

    return res.status(401).json({
      message: error.message || "Authentication failed",
    });
  }
}

module.exports = {
  login,
};