const { PrismaClient } = require("@prisma/client");
const { getUserRole } = require("../utility/auth");

const prisma = new PrismaClient();

const adminController = {
  async deleteUsers(req, res) {
    const userId = req.body.userId;

    if (!userId) {
      return res.status(400).json({
        message: "this action required user id",
      });
    }

    try {
      const userToDelete = await prisma.users.findFirst({
        where: {
          Id: userId,
        },
      });

      if (!userToDelete) {
        return res.status(400).json({
          message: `user with ${userId} doesn't exist, please try again`,
        });
      }

      const userRole = await getUserRole(userToDelete.Id);
      console.log(userRole);
      if (userRole !== "Admin") {
        const deletedUserFormRole = await prisma.user_role.delete({
          where: {
            idUser_IdRole: {
              idUser: userToDelete.Id,
              IdRole: userRole === "User" ? 1 : 3,
            },
          },
        });

        const deletedUser = await prisma.users.delete({
          where: {
            Id: deletedUserFormRole.idUser,
          },
        });

        return res.status(200).json({
          message: "user has been deleted successfully...",
        });
      } else {
        return res.status(400).json({
          message: "Bad Action",
        });
      }
    } catch (error) {
      let message = "";
      if (error.code === "P2025") {
        message = `user with id: ${userId}, does not exist.`;
      }
      return res.status(500).json({
        message: error,
      });
    }
  },

  async deleteAnnouncement(req, res) {
    const announcementId = req.body.announcementId;

    if (!announcementId) {
      return res.status(400).json({
        message: "this action required user id",
      });
    }

    try {
      const deletedAnnouncement = await prisma.announcements.delete({
        where: {
          Id: announcementId,
        },
      });

      if (!deletedAnnouncement) {
        return res.status(404).json({
          message: `user with ${ann} doesn't exist, please try again`,
        });
      }

      return res.status(200).json({
        message: "Announcement has been deleted successfully...",
      });
    } catch (error) {
      let message = "";
      if (error.code === "P2025") {
        message = `announcement with id:${announcementId} does not exist.`;
      }
      return res.status(500).json({
        message: message,
      });
    }
  },

  async getAllUsers(req, res) {
    const allUsers = await prisma.users.findMany();

    const users = [];
    const houseOwners = [];
    for (let i = 0; i < allUsers.length; i++) {
      const element = allUsers[i];
      const userDTO = (({ PasswordHash, ...e }) => e)(element);
      const userRole = await getUserRole(element.Id);
      if (userRole === "HouseOwner") {
        houseOwners.push(userDTO);
      } else if (userRole === "User") {
        users.push(userDTO);
      }
    }
    return res.status(200).json({
      users,
      houseOwners,
    });
  },
};

module.exports = adminController;
