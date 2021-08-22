const express = require("express");
const announcementController = require("../controllers/announcement.controller");
const router = express.Router();

router.get("/", announcementController.all);

module.exports = router;
