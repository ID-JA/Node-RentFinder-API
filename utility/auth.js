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
    tls: {
      rejectUnauthorized: false,
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
 * * Get ROLE NAME for authenticated user
 * @param {number} userId user id of authenticated user
 * @returns {Promise} Promise object represents the Role Name
 */
const getUserRole = async (userId) => {
  const userRole = await prisma.user_role.findFirst({
    where: {
      idUser: userId,
    },
  });
  const role = await prisma.roles.findFirst({
    where: {
      Id: userRole.IdRole,
    },
  });
  return role.Name;
};

/**
 *
 * @param {string} encodedToken encoded token from user
 * @returns decoded token if token valid otherwise "error" if token invalid
 */
const decodedToken = (encodedToken) => {
  console.log(encodedToken);
  try {
    const token = encodedToken.split(" ");
    console.log(token.length);

    const decoded = jwt.verify(
      token.length === 2 ? token[1] : token[0],
      process.env.SECRET
    );
    return decoded;
  } catch (err) {
    return "error";
  }
};

/**
 *
 * @param {string} token token of authenticated user
 * @returns Object User
 */

const getUserFromToken = async (token) => {
  const validToken = decodedToken(token);
  console.log(validToken);

  if (validToken === "error") {
    return "Invalid Token";
  }
  // TODO: Find user after validation of the token
  const user = await prisma.users.findUnique({
    where: {
      Id: validToken.user.Id,
    },
  });
  return user;
};

module.exports = {
  createTokens: createTokens,
  sendMail: sendMail,
  addUserToRole: addUserToRole,
  getUserRole: getUserRole,
  decodedToken: decodedToken,
  getUserFromToken: getUserFromToken,
};
