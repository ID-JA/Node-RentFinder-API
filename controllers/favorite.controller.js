const { PrismaClient } = require("@prisma/client");
const { getUserFromToken } = require("../utility/auth");

const prisma = new PrismaClient();

const favoriteController = {
  async createFavorite(req, res) {
    const token =
      req.body.token || req.query.token || req.headers.authorization;
    if (!token) {
      res.status(401).json({
        message: "Invalid Token",
      });
    }
    const user = await getUserFromToken(token);

    if (!user) {
      return res.status(400).json({
        message: "Something bad happened !!",
      });
    }
    const announcement = await prisma.announcements.findUnique({
      where: {
        Id: req.body.announcementId,
      },
    });
    if (!announcement) {
      return res.status(404).json({
        message: "this announcement doesn't exist, Please try again",
      });
    }

    const createdFavorite = await prisma.favorite.create({
      data: {
        UserId: user.Id,
        AnnouncementId: announcement.Id,
      },
    });

    if (!createdFavorite) {
      return res.status(400).json({
        message: "Please try again",
      });
    }
    return res.status(200).json({
      message: "favorite has been added successfully ...",
    });
  },

  async getUserFavorite(req, res) {
    const token =
      req.body.token || req.query.token || req.headers.authorization;

    const user = await getUserFromToken(token);
    if (!user) {
      return res.status(404).json({
        message: "user not found",
      });
    }
    const allFavorites = await prisma.favorite.findMany({
      where: {
        UserId: user.Id,
      },
    });

    const favoritesDTO = [];
    for (let i = 0; i < allFavorites.length; i++) {
      const element = allFavorites[i];
      favoritesDTO.push((({ UserId, ...f }) => f)(element));
    }
    return res.status(200).json(favoritesDTO);
  },

  async deleteFavorite(req, res) {
    const token =
      req.body.token || req.query.token || req.headers.authorization;
    if (!token) {
      res.status(401).json({
        message: "Invalid Token",
      });
    }
    const user = await getUserFromToken(token);

    if (!user) {
      return res.status(400).json({
        message: "Something bad happened !!",
      });
    }
    const announcementToDelete = await prisma.favorite.findFirst({
      where: {
        UserId: user.Id,
        AnnouncementId: req.body.announcementId,
      },
    });
    if (!announcementToDelete) {
      return res.status(404).json({
        message: "this announcement doesn't exist, Please try again",
      });
    }
    const deletedAnnouncement = await prisma.favorite.delete({
      where: {
        UserId_AnnouncementId: {
          AnnouncementId: announcementToDelete.AnnouncementId,
          UserId: user.Id,
        },
      },
    });
    if (!deletedAnnouncement) {
      return res.status(400).json({
        message: "delete faild, Please try again...",
      });
    }

    return res.status(200).json({
      message: "favorite has been deleted successfully ...",
    });
  },
};

module.exports = favoriteController;
