const express = require("express");

const router = express.Router();

const userController = require("./user.controller");

const authMiddleware = require("../../middleware/auth.middleware");
const requirePermission = require("../../middleware/permission.middleware");

router.post(
  "/admins",
  authMiddleware,
  requirePermission("USER_CREATE"),
  userController.createAdmin
);

module.exports = router;