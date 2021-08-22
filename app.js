const express = require("express");
const announcementRoutes = require("./routes/announcement");
const authRoutes = require("./routes/auth");
const bodyParser = require("body-parser");
const nodemailer = require("nodemailer");

const app = express();

// const transporter = nodemailer.createTransport({
//   service: "Gmail",
//   auth: {
//     user: process.env.GMAIL_USER,
//     pass: process.env.GMAIL_PASS,
//   },
// });

// const SECRET = process.env.SECRET;
// const SECRET_2 = process.env.SECRET_2;
// const EMAIL_SECRET = process.env.EMAIL_SECRET;

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// app.use(function (err, req, res, next) {
//   console.error(err.stack);
//   res.status(500).send("Something broke!");
// });
app.use("/announcements", announcementRoutes);
app.use("/auth", authRoutes);

module.exports = app;
