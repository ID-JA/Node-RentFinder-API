const express = require("express");
const authController = require("../controllers/auth.controller");
const router = express.Router();

router.post("/login", authController.login);

router.post("/signup", authController.singup);
router.get("/confirm/:token", authController.confirmAccount);

module.exports = router;
