const { PrismaClient } = require("@prisma/client");
const { getUserFromToken } = require("../utility/auth");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const prisma = new PrismaClient();
const saltRounds = 10;
const profileController = {
  async getUserInfo(req, res) {
    /**
     * TODO:
     * ? GET User Info Using Token
     * ?
     */

    const token =
      req.body.token || req.query.token || req.headers.authorization;
    if (!token) {
      return res.status(401).json({
        message: "Invalid Token",
      });
    }
    const user = await getUserFromToken(token);
    if (!user) {
      return res.status(404).json({
        message: "user not found",
      });
    }
    const userDTO = (({ PasswordHash, AccountConfirmed, ...u }) => u)(user);

    return res.status(200).json(userDTO);
  },

  async updateUserInfo(req, res) {
    const token =
      req.body.token || req.query.token || req.headers.authorization;

    const user = await getUserFromToken(token);
    if (!user) {
      return res.status(404).json({
        message: "user not found",
      });
    }
    const objData = {
      FirstName: req.body.firstName,
      LastName: req.body.lastName,
      PhoneNumber: req.body.phoneNumber,
      City: req.body.city,
      UserName: req.body.userName,
    };

    console.log(objData);

    const updatedUser = await prisma.users.update({
      where: {
        Id: user.Id,
      },
      data: {
        ...objData,
      },
    });

    console.log(updatedUser);

    if (!updatedUser) {
      return res.status(400).json({
        message: "something bad happened while updating your informations",
      });
    }
    return res.status(200).json({
      message: "your informations has been updated successfully",
    });
  },

  async changeAvatar(req, res) {
    try {
      console.log(req.file);
      const token =
        req.body.token || req.query.token || req.headers.authorization;

      const user = await getUserFromToken(token);
      if (!user) {
        return res.status(404).json({
          message: "user not found",
        });
      }
      const upadtedUser_Avatar = await prisma.users.update({
        where: {
          Id: user.Id,
        },
        data: {
          Avatar: req.file.filename,
        },
      });
      if (upadtedUser_Avatar) {
        return res.status(200).json({
          message: "avatar has been changed successfully...",
        });
      }
    } catch (error) {
      return res.status(400).json({
        message: "change avatar faild please try again...",
      });
    }
  },

  async changePassword(req, res) {
    const token =
      req.body.token || req.query.token || req.headers.authorization;

    if (!token) {
      return res.status(401).json({
        message: "Invalid Token",
      });
    }
    const user = await getUserFromToken(token);
    if (!user) {
      return res.status(404).json({
        message: "user not found",
      });
    }

    const objData = {
      oldPassword: req.body.oldPassword,
      newPassword: req.body.newPassword,
      confirmPassword: req.body.confirmPassword,
    };
    if (
      !objData.oldPassword ||
      !objData.newPassword ||
      !objData.confirmPassword
    ) {
      return res.status(400).json({
        message: "all fields are required",
      });
    }
    if (objData.newPassword !== objData.confirmPassword) {
      return res.status(400).json({
        message: "confirm password does not match new password",
      });
    }
    const valid = await bcrypt.compare(req.body.oldPassword, user.PasswordHash);

    if (!valid) {
      return res.status(400).json({
        message: "Old Password is incorrect...",
      });
    }

    bcrypt.hash(objData.newPassword, saltRounds, async function (err, hash) {
      // TODO: Change Old Password with New Password
      const updatedUser = await prisma.users.update({
        where: {
          Id: user.Id,
        },
        data: {
          PasswordHash: hash,
        },
      });
      if (updatedUser) {
        return res.status(201).json({
          message: "your password has been change successfully !!! ",
        });
      } else {
        return res.status(400).json({
          message: "SomeThing Bad Happpened",
        });
      }
    });
  },
};

module.exports = profileController;
