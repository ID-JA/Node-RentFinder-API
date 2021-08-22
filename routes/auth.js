const express = require("express");
const authController = require("../controllers/auth.controller");
const router = express.Router();

router.post("/login", (req, res) => {
  console.log(req.url);
  const obj = {
    email: req.body.email,
    password: req.body.password,
  };
  res.status(200).json({
    data: obj,
  });
});

module.exports = router;
