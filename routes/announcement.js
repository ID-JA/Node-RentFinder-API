const express = require("express");
const announcementController = require("../controllers/announcement.controller");
const { authPage } = require("../middlewares/auth.middlewares");

const router = express.Router();

router.get("/", authPage(["seller"]), announcementController.all);

module.exports = router;
