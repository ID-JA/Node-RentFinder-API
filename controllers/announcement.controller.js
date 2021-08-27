const { PrismaClient } = require("@prisma/client");
const { getUserFromToken } = require("../utility/auth");

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
    const ownerId = announcement.UserId;
    const owner = await prisma.users.findUnique({
      where: {
        Id: ownerId,
      },
    });
    const ownerDTO = (({
      PasswordHash,
      AccountConfirmed,
      Id,
      UserName,
      Email,
      City,
      ...o
    }) => o)(owner);
    res.status(200).json({
      announcement: { ...announcement },
      houseOwner: { ...ownerDTO },
    });
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
      return res.status(200).json({
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
    console.log(user);
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
      PublicationDate: new Date().toJSON().slice(0, 10).replace(/-/g, "-"),
      UserId: user.Id,
    };
    try {
      const createdAnnouncement = await prisma.announcements.create({
        data: {
          ...objData,
        },
      });
      if (!createdAnnouncement) {
        return res.status(400).json({
          message: "Creation of announcement faild, please try again !!!",
        });
      }
      return res.status(200).json({
        message: "Announcement has been created successfully ",
      });
    } catch (error) {
      let message = "Something happened";
      if (error.code === "P2011") {
        message = error.meta.constraint + " is required";
      }

      return res.status(400).json({
        message: error,
      });
    }
  },

  // ! ================================ Rate Announcement ======================================
  async rateAnnouncement(req, res) {
    /**
     * TODO:
     * ? [x] Get AnnouncementId and UserId and Value From Request
     * ? [x] search for user using token
     * ? [x] search for announcement using AnnouncementId from request
     */
    const token =
      req.body.token || req.query.token || req.headers.authorization;
    console.log(token);

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

    const announcementId = req.body.announcementId;

    try {
      const findedAnnouncement = await prisma.announcements.findFirst({
        where: {
          Id: parseInt(announcementId),
        },
      });

      if (!findedAnnouncement) {
        return res.status(400).json({
          message:
            "Announcemet with this id doesn't exist, Please try again !!!",
        });
      }
      const objData = {
        UserId: user.Id,
        AnnouncementId: parseInt(announcementId),
        Value: parseInt(req.body.value),
      };
      const ratedAnnouncement = await prisma.ratings.create({
        data: {
          ...objData,
        },
      });
      if (!ratedAnnouncement) {
        res.status(400).json({
          message: "something bad happened, Please try again !!!",
        });
      }
      return res.status(200).json({
        message: "rate has been created successfully !!! ",
      });
    } catch (error) {
      res.status(500).json(error);
    }
  },

  // ! ================================ Upload Images of Announcement =====================================
  async uploadImages(req, res) {
    try {
      const token =
        req.body.token || req.query.token || req.headers.authorization;

      const user = await getUserFromToken(token);
      console.log(user);
      const param = req.params.announcementId;
      console.log(param);
      if (!user) {
        return res.status(404).json({
          message: "user not found",
        });
      }
      if (!param) {
        return res.status(400).json({
          message: "faild while uploading images",
        });
      }
      const findedAnnouncement = await prisma.announcements.findFirst({
        where: {
          Id: parseInt(param),
          UserId: user.Id,
        },
      });
      let filesName = "";
      req.files.forEach((element) => {
        filesName += element.filename + " ";
      });
      console.log(findedAnnouncement);
      if (!findedAnnouncement) {
        return res.status(404).json({
          message: "announcement doesn't exist....",
        });
      }
      const upadtedAnnouncement_Images = await prisma.announcements.update({
        where: {
          Id: findedAnnouncement.Id,
        },
        data: {
          Photos: filesName,
        },
      });
      if (!upadtedAnnouncement_Images) {
        return res.status(400).json({
          message: "upload images faild please try again ....",
        });
      }
      return res.status(200).json({
        message: "images has been uploaded successfully....",
      });
    } catch (error) {
      console.log(error);
      return res.status(500).json({
        message: "you should upload only 3 images",
      });
    }
  },
};

module.exports = announcementController;
