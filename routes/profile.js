const express = require("express");
const profileController = require("../controllers/profile.controller");
const { authPage } = require("../middlewares/auth.middlewares");
const path = require("path");
const multer = require("multer");
const router = express.Router();

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, "../uploads/user"));
  },
  filename: function (req, file, cb) {
    cb(null, new Date().getTime() + "_" + file.originalname);
  },
});
const upload = multer({ storage: storage });

router.get(
  "/me",
  authPage(["HouseOwner", "User", "Admin"]),
  profileController.getUserInfo
);

router.put(
  "/me/edit",
  authPage(["HouseOwner", "User", "Admin"]),
  profileController.updateUserInfo
);

router.put(
  "/me/edit/avatar",
  upload.single("avatar"),
  authPage(["HouseOwner", "User", "Admin"]),
  profileController.changeAvatar
);

router.put(
  "/me/edit/password",
  authPage(["HouseOwner", "User", "Admin"]),
  profileController.changePassword
);

module.exports = router;
