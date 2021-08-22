const express = require("express");
const announcementRoutes = require("./routes/announcement");
const authRoutes = require("./routes/auth");
const bodyParser = require("body-parser");

const app = express();

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.use("/announcements", announcementRoutes);
app.use("/auth", authRoutes);

module.exports = app;
