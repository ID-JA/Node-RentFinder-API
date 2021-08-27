const express = require("express");
const favoriteController = require("../controllers/favorite.controller");
const { authPage } = require("../middlewares/auth.middlewares");

const router = express.Router();

// =============== FeedBack ==========================
router.post(
  "/add",
  authPage(["Seller", "Buyer"]),
  favoriteController.createFavorite
);
router.get(
  "/all",
  authPage(["Seller", "Buyer"]),
  favoriteController.getUserFavorite
);
router.delete(
  "/delete",
  authPage(["Seller", "Buyer"]),
  favoriteController.deleteFavorite
);

module.exports = router;
