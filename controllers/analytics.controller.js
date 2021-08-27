const { PrismaClient } = require("@prisma/client");
const { getUserRole } = require("../utility/auth");

const prisma = new PrismaClient();

const analyticsController = {
  async analytics(req, res) {
    /**
     * ? Get total user
     * ? Get total announcement
     * ? Get totla feedback
     */
    const allUsers = await prisma.users.findMany();
    const houseOwners = [];
    const users = [];
    for (let i = 0; i < allUsers.length; i++) {
      const element = allUsers[i];

      const userRole = await getUserRole(element.Id);
      if (userRole === "HouseOwner") {
        houseOwners.push(element);
      } else if (userRole === "User") {
        users.push(element);
      }
    }

    const allAnnouncements = await prisma.announcements.count();
    return res.status(200).json({
      HouseOwners: houseOwners.length,
      Users: users.length,
      announcements: allAnnouncements,
    });
  },
};

module.exports = analyticsController;
