const express = require("express");
const feedBackController = require("../controllers/feedback.controller");
const { authPage } = require("../middlewares/auth.middlewares");

const router = express.Router();

// =============== FeedBack ==========================
router.get("/", feedBackController.getAllFeedBack);
router.post(
  "/create",
  authPage(["User", "HouseOwner"]),
  feedBackController.createNewFeedBack
);

module.exports = router;
