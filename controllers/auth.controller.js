const { PrismaClient, Prisma } = require("@prisma/client");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { createTokens, sendMail, addUserToRole } = require("../utility/auth");

const saltRounds = 10;
const prisma = new PrismaClient();

const authController = {
  // ! =============================== LOG_IN =====================================
  async login(req, res) {
    const user = await prisma.users.findUnique({
      where: {
        Email: req.body.email,
      },
    });
    const userRole = await prisma.user_role.findUnique({
      where: {
        idUser_IdRole: user.Id,
      },
    });
    if (!user) {
      return res.status(400).json({
        message: "Invalid Login",
      });
    }

    if (!user.AccountConfirmed) {
      return res.status(401).json({
        message: "Please confirm your email to login",
      });
    }

    const valid = await bcrypt.compare(req.body.password, user.PasswordHash);
    if (!valid) {
      return res.status(400).json({
        message: "Invalid Login",
      });
    }
    const [token] = await createTokens(user, process.env.SECRET);
    res.status(200).json({
      token: token,
    });
  },
  // ! =============================== SIGN_UP =====================================
  async singup(req, res) {
    bcrypt.hash(req.body.password, saltRounds, async function (err, hash) {
      if (err) {
        return res.status(500).json({
          error: err,
        });
      } else {
        try {
          let user = {};
          user = {
            FirstName: req.body.firstName,
            LastName: req.body.lastName,
            City: req.body.city,
            PhoneNumber: req.body.phoneNumber,
            UserName: req.body.userName,
            Email: req.body.email,
            PasswordHash: hash,
          };
          const createUser = await prisma.users.create({ data: user });
          addUserToRole(createUser.Id, req.body.role);

          const [token] = await createTokens(createUser, process.env.SECRET);
          const confimAccountHref = `http://localhost:${process.env.PORT}/auth/confirm/${token}`;
          let message = `<h2>Hello From Rent Finder</h2>
            <p>Please confirm you account by <a href="${confimAccountHref}">clicking here</a></p>
            `;

          sendMail(req.body.email, "Confirm your Account", message)
            .then((result) => {
              return res.status(200).json({
                message: "Check your inbox to confirm your account ...",
              });
            })
            .catch((error) => {
              console.log(error);
              return res.status(400).json({
                message: res,
              });
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
    });
  },

  async confirmAccount(req, res) {
    let encodedToken = req.params.token;
    console.log(encodedToken);
    try {
      const decodedToken = jwt.verify(encodedToken, process.env.SECRET);
      console.log(decodedToken);
      const updateUser = await prisma.users.update({
        where: {
          Id: decodedToken.user.Id,
        },
        data: {
          AccountConfirmed: 1,
        },
      });
    } catch (e) {
      return res.send("error");
    }

    return res.redirect("http://localhost:3001/login");
  },
};

module.exports = authController;
