const { PrismaClient } = require("@prisma/client");
const { decodedToken, getUserFromToken } = require("../utility/auth");

const prisma = new PrismaClient();

const feedBackController = {
  async getAllFeedBack(req, res) {
    const token =
      req.body.token || req.query.token || req.headers.authorization;

    const userInfo = await getUserFromToken(token);
    // console.log(user);

    const feedbacks = await prisma.feedback.findMany();
    const allFeedBacks = [];
    
    for (let i = 0; i < feedbacks.length; i++) {
      const element = feedbacks[i];
      const user = await prisma.users.findFirst({
        where: {
          Id: element.UserId,
        },
      });
      allFeedBacks.push({
        ...element,
        UserId: user.Id,
        Avatar: user.Avatar,
        FirstName: user.FirstName,
        LastName: user.LastName,
      });
    }
    return res.status(200).json(allFeedBacks);
  },

  async createNewFeedBack(req, res) {
    //TODO:  Get user Id Form token
    const token =
      req.body.token || req.query.token || req.headers.authorization;
    const objData = {
      Content: req.body.content,
      Value: req.body.value,
    };
    if (token && objData.Value && objData.Content) {
      const validToken = decodedToken(token.split(" ")[1]);

      if (validToken === "error") {
        return res.status(400).json({
          message: "Invalid Token",
        });
      }
      try {
        const user = await prisma.users.findUnique({
          where: {
            Id: validToken.user.Id,
          },
        });
        const createdFeedBack = await prisma.feedback.create({
          data: {
            Content: objData.Content,
            Value: objData.Value,
            UserId: user.Id,
          },
        });
        if (!createdFeedBack) {
          return res.status(400).json({
            message: "something happened please try again !!!",
          });
        }
        return res.status(200).json({
          message: "feedback has been created successuflly...",
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
    }
  },
};

module.exports = feedBackController;
