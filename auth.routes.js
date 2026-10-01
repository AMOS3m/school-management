const express = require("express");

const authController = require("./auth.controller");
const authenticate = require("../../middleware/auth.middleware");
const requirePermission = require("../../middleware/permission.middleware");

const router = express.Router();

router.post("/login", authController.login);

router.get(
  "/test-student-access",
  authenticate,
  requirePermission("STUDENT_VIEW"),
  (req, res) => {
    res.json({
      message: "Authorization successful",
      user: req.user,
    });
  }
);

module.exports = router;