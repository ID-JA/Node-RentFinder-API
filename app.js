const express = require("express");
const announcementRoutes = require("./routes/announcement");
const authRoutes = require("./routes/auth");
const feedBackRoutes = require("./routes/feedback");
const profileRoutes = require("./routes/profile");
const favoriteRoutes = require("./routes/favorite");
const analyticsRoutes = require("./routes/analytics");
const adminRoutes = require("./routes/admin");
const bodyParser = require("body-parser");
const helmet = require("helmet");
const cors = require("cors");
const morgan = require("morgan");

const app = express();

app.use(helmet());
app.use(morgan("dev"));
app.use(cors());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use("/static/images/user", express.static("uploads/user"));
app.use("/static/images/announcement", express.static("uploads/announcement"));

// app.use((req, res, next) => {
//   const error = new Error(`NOT FOUND - ${req.originalUrl}`);
//   res.status(404);
//   next(error);
// });

app.use((error, req, res, next) => {
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  res.status(statusCode);
  res.json({
    message: error.message,
    stack: process.env.NODE_ENV === "production" ? "😁" : error.stack,
  });
});

app.use("/auth", authRoutes);
app.use("/feedback", feedBackRoutes);
app.use("/announcements", announcementRoutes);
app.use("/favorite", favoriteRoutes);
app.use("/profile", profileRoutes);
app.use("/analytics", analyticsRoutes);
app.use("/admin", adminRoutes);

module.exports = app;
