const express = require("express");
const announcementController = require("../controllers/announcement.controller");
const { authPage } = require("../middlewares/auth.middlewares");
const path = require("path");
const multer = require("multer");

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, "../uploads/announcement"));
  },
  filename: function (req, file, cb) {
    cb(null, new Date().getTime() + "_" + file.originalname);
  },
});

const upload = multer({ storage: storage });
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

router.put(
  "/create/:announcementId/images",
  upload.array("images", 3),
  authPage(["Seller"]),
  announcementController.uploadImages
);

module.exports = router;
