const express = require("express");
const announcementRoutes = require("./routes/announcement");
const authRoutes = require("./routes/auth");
const feedBackRoutes = require("./routes/feedback");
const bodyParser = require("body-parser");

const app = express();

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.use("/auth", authRoutes);
app.use("/feedback", feedBackRoutes);
app.use("/announcements", announcementRoutes);

module.exports = app;
