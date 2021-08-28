const express = require("express");
const adminController = require("../controllers/admin.controller");
const { authPage } = require("../middlewares/auth.middlewares");
const router = express.Router();

router.delete(
  "announcement/delete",
  authPage(["Admin"]),
  adminController.deleteAnnouncement
);

router.delete(
  "/users/delete",
  authPage(["Admin"]),
  adminController.deleteUsers
);
router.get("/users/all", authPage(["Admin"]), adminController.getAllUsers);

module.exports = router;
