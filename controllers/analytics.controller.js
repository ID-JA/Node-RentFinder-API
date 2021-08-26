const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

const analyticsController = {
  async analytics(req, res) {
    /**
     * ? Get total user
     * ? Get total announcement
     * ? Get totla feedback
     */
    const allUsers = await prisma.users.count();
    const allAnnouncements = await prisma.announcements.count();
    const AllFeedBacks = await prisma.feedback.count();
    return res.status(200).json({
      users: allUsers,
      announcements: allAnnouncements,
      feedbacks: AllFeedBacks,
    });
  },
};

module.exports = analyticsController;
