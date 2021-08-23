const { PrismaClient } = require("@prisma/client");
const { Int32 } = require("mongodb");
const { decodedToken, getUserFromToken } = require("../utility/auth");

const prisma = new PrismaClient();

const announcementController = {
  // ! =============================== GET ALL ANNOUNCEMENTS =====================================
  async getAllAnnouncements(req, res) {
    const allAnnouncements = await prisma.announcements.findMany();
    res.status(200).json(allAnnouncements);
  },

  // ! =============================== GET ANNOUNCEMENT OF USER =====================================
  async getAnnouncementsOfUser(req, res) {
    // TODO: GET User From token
    const token =
      req.body.token || req.query.token || req.headers.authorization;
    if (!token) {
      return res.status(400).json({
        message: "Invalid Token",
      });
    }

    const user = await getUserFromToken(token);
    console.log(user);
    if (user === "Invalid Token") {
      return res.status(404).json({
        message: "Accout doesn't exist anymore",
      });
    }

    const announcementsOfUser = await prisma.announcements.findMany({
      where: {
        UserId: user.Id,
      },
    });
    res.status(200).json(announcementsOfUser);
  },

  // ! =============================== GET ANNOUNCEMENT BY ID  =====================================
  async getAnnouncementById(req, res) {
    const announcementId = parseInt(req.params.Id);
    const announcement = await prisma.announcements.findUnique({
      where: {
        Id: announcementId,
      },
    });

    if (!announcement) {
      res.status(404).json({
        message: "we couldn't find this announcement please try again !!!",
      });
    }
    res.status(201).json(announcement);
  },

  // ! =============================== RESET PASSWORD =====================================
  async deleteAnnouncement(req, res) {
    // TODO: GET User From token
    const token =
      req.body.token || req.query.token || req.headers.authorization;
    const announcementId = req.params.Id;
    if (!token) {
      return res.status(400).json({
        message: "Invalid Token",
      });
    }

    const user = await getUserFromToken(token);
    console.log(user);
    if (user === "Invalid Token") {
      return res.status(404).json({
        message: "Accout doesn't exist anymore",
      });
    }
    try {
      const findedAnnouncement = await prisma.announcements.findFirst({
        where: {
          UserId: user.Id,
          Id: parseInt(announcementId),
        },
      });

      if (!findedAnnouncement) {
        res.status(400).json({
          message:
            "Announcemet with this id doesn't exist, Please try again !!!",
        });
      }
      const deleteAnnouncement = await prisma.announcements.delete({
        where: {
          Id: findedAnnouncement.Id,
        },
      });
      if (!deleteAnnouncement) {
        res.status(400).json({
          message: "something bad happened, Please try again !!!",
        });
      }
      res.status(200).json({
        message: "Announcement has been deleted successfully !!! ",
      });
    } catch (error) {
      console.log(error);
      res.status(500).json(error);
    }
  },
};

module.exports = announcementController;
