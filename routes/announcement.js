const express = require("express");
const announcementController = require("../controllers/announcement.controller");
const { authPage } = require("../middlewares/auth.middlewares");

const router = express.Router();

router.get("/", announcementController.getAllAnnouncements);
router.get(
  "/mine",
  authPage(["Seller"]),
  announcementController.getAnnouncementsOfUser
);
router.get("/:Id", announcementController.getAnnouncementById);
router.delete(
  "/:Id/delete",
  authPage(["Seller"]),
  announcementController.deleteAnnouncement
);

router.put(
  "/:Id/update",
  authPage(["Seller"]),
  announcementController.updateAnnouncement
);

router.post(
  "/create",
  authPage(["Seller"]),
  announcementController.createAnnouncement
);
router.post(
  "/rate",
  authPage(["Buyer"]),
  announcementController.rateAnnouncement
);

module.exports = router;
