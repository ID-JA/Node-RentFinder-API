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
    // console.log(user);
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

  // ! =============================== DELETE ANNOUNCEMENT=====================================
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
    // console.log(user);
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
        return res.status(400).json({
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
      // console.log(error);
      res.status(500).json(error);
    }
  },

  // ! =============================== UPDATE ANNOUNCEMENT=====================================
  async updateAnnouncement(req, res) {
    /**
     * TODO:
     * *  Get Id From the Request [x]
     * * Search for Announcement By ID [x]
     * * If Announcement exist Update It otherwise return "404" Error [x]
     */
    const token =
      req.body.token || req.query.token || req.headers.authorization;
    if (!token) {
      return res.status(400).json({
        message: "authentication is requiered !!!",
      });
    }
    const user = await getUserFromToken(token);

    if (!user) {
      return res.status(400).json({
        message: "Something bad happened !!",
      });
    }
    let announcementId = 0;
    try {
      announcementId = parseInt(req.params.Id);
    } catch (error) {
      return res.status(400).json({
        message: "something bad happened, Please try again...",
      });
    }
    if (!announcementId) {
      return res.status(400).json({
        message: "you need to pass an ID to Upadate announcement",
      });
    }

    const announcement = await prisma.announcements.findFirst({
      where: {
        Id: announcementId,
        UserId: user.Id,
      },
    });

    if (!announcement) {
      return res.status(404).json({
        message: "update failed !!!",
      });
    }

    const updatedAnnouncement = await prisma.announcements.update({
      where: {
        Id: announcement.Id,
      },
      data: {
        Title: req.body.title,
        Description: req.body.description,
        IsAvailable: req.body.isAvailable,
        TotalLivingrooms: req.body.totalLivingrooms,
        TotalBathrooms: req.body.totalBathrooms,
        TotalBedrooms: req.body.totalBedrooms,
        TotalFloors: req.body.totalFloors,
        TotalKitchens: req.body.totalKitchens,
        Location: req.body.location,
        Surface: req.body.surface,
        Price: req.body.price,
        Photos: req.body.photos,
      },
    });

    if (!updatedAnnouncement) {
      res.status(400);
      throw new Error("Something Bad Happpened Please Try Again !!!");
    }
    return res.status(200).json({
      message: "Announcement has been updated successfully",
    });
  },

  // ! =============================== CREATE NEW ANNOUNCEMENT=====================================
  async createAnnouncement(req, res) {
    const token =
      req.body.token || req.query.token || req.headers.authorization;
    if (!token) {
      return res.status(400).json({
        message: "authentication is requiered !!!",
      });
    }
    const user = await getUserFromToken(token);
    // console.log(user);
    if (!user) {
      return res.status(400).json({
        message: "Something bad happened !!",
      });
    }
    const objData = {
      Title: req.body.title,
      Description: req.body.description,
      IsAvailable: req.body.isAvailable,
      TotalLivingrooms: req.body.totalLivingrooms,
      TotalBathrooms: req.body.totalBathrooms,
      TotalBedrooms: req.body.totalBedrooms,
      TotalFloors: req.body.totalFloors,
      TotalKitchens: req.body.totalKitchens,
      Location: req.body.location,
      Surface: req.body.surface,
      Price: req.body.price,
      Photos: req.body.photos,
      UserId: user.Id,
    };
    try {
      const createdAnnouncement = await prisma.announcements.create({
        data: {
          ...objData,
        },
      });
      if (!createdAnnouncement) {
        res.status(400);
        throw new Error("Creation of announcement faild, please try again !!!");
      }
      return res.status(200).json({
        message: "Announcement has been created successfully ",
      });
    } catch (error) {
      let message = "Something happened";
      if (error.code === "P2011") {
        message = error.meta.constraint + " is required";
      } else if (error.code === "P2002") {
        message = "Email Already Exist !!!";
      }
      return res.status(400).json({
        message: message,
      });
    }
  },
};

module.exports = announcementController;
