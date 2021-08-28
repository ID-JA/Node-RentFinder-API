const express = require("express");
const favoriteController = require("../controllers/favorite.controller");
const { authPage } = require("../middlewares/auth.middlewares");

const router = express.Router();

// =============== FeedBack ==========================
router.post(
  "/add",
  authPage(["HouseOwner", "User"]),
  favoriteController.createFavorite
);
router.get(
  "/all",
  authPage(["HouseOwner", "User"]),
  favoriteController.getUserFavorite
);
router.delete(
  "/delete",
  authPage(["HouseOwner", "User"]),
  favoriteController.deleteFavorite
);

module.exports = router;
