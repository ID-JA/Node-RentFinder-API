("use strict");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const _ = require("lodash");
const nodemailer = require("nodemailer");
const { PrismaClient, Prisma } = require("@prisma/client");

const prisma = new PrismaClient();

const createTokens = async (user, secret) => {
  console.log(user);
  const createToken = jwt.sign(
    {
      user: _.pick(user, ["Id", "UserName", "role"]),
    },
    secret,
    {
      expiresIn: "1h",
    }
  );

  return Promise.all([createToken]);
};

const sendMail = async (to, subject, content) => {
  let transporter = nodemailer.createTransport({
    host: process.env.MAIL_HOST,
    port: process.env.MAIL_PORT,
    secure: process.env.MAIL_SECURE,
    auth: {
      user: process.env.GMAIL_USER,
      pass: process.env.GMAIL_PASS,
    },
  });

  // send mail with defined transport object
  let info = await transporter.sendMail({
    from: "mycals.app@gmail.com", // sender address
    to: to, // list of receivers
    subject: subject, // Subject line
    html: content, // html body
  });
};

const addUserToRole = async (userId, RoleName) => {
  const role = await prisma.roles.findFirst({
    where: {
      Name: RoleName,
    },
  });
  // add user to role
  const userToRole = await prisma.user_role.create({
    data: {
      idUser: userId,
      IdRole: role.Id,
    },
  });
};

/**
 * * Get ROLE for authenticated user
 * @param {number} roleId role id of authenticated user
 * @returns {Promise} Promise object represents the Role Name
 */
const getUserRole = async (roleId) => {
  const role = await prisma.roles.findFirst({
    where: {
      Id: roleId,
    },
  });
  return role.Name;
};

module.exports = {
  createTokens: createTokens,
  sendMail: sendMail,
  addUserToRole: addUserToRole,
  getUserRole: getUserRole,
};
