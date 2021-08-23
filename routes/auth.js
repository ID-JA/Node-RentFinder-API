const express = require("express");
const authController = require("../controllers/auth.controller");
const router = express.Router();

// =============== Authentication ==========================
router.post("/login", authController.login);
router.post("/signup", authController.singup);
router.post("/forgetpassword", authController.forgetPassword);
router.post("/resetpassword", authController.resetpassword);
router.get("/confirm/:token", authController.confirmAccount);

module.exports = router;
