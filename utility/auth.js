("use strict");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const _ = require("lodash");
const nodemailer = require("nodemailer");

const createTokens = async (user, secret) => {
  const createToken = jwt.sign(
    {
      user: _.pick(user, ["Id", "UserName"]),
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

module.exports = {
  createTokens: createTokens,
  sendMail: sendMail,
};
