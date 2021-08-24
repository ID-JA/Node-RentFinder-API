const { PrismaClient, Prisma } = require("@prisma/client");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const {
  createTokens,
  sendMail,
  addUserToRole,
  getUserRole,
  decodedToken,
} = require("../utility/auth");

const saltRounds = 10;
const prisma = new PrismaClient();

const authController = {
  // ! =============================== LOG_IN ==============================================
  async login(req, res) {
    const user = await prisma.users.findUnique({
      where: {
        Email: req.body.email,
      },
    });

    if (!user) {
      return res.status(400).json({
        message: "Invalid Login",
      });
    }
    // check if account confirmed
    if (!user.AccountConfirmed) {
      return res.status(401).json({
        message: "Please confirm your email to login",
      });
    }

    const userRole = await prisma.user_role.findFirst({
      where: {
        idUser: user.Id,
      },
    });
    const valid = await bcrypt.compare(req.body.password, user.PasswordHash);
    if (!valid) {
      return res.status(400).json({
        message: "Invalid Login",
      });
    }
    const authenticatedUser = {
      ...user,
      role: await getUserRole(userRole.idUser),
    };
    const [token] = await createTokens(authenticatedUser, process.env.SECRET);
    res.status(200).json({
      token: token,
    });
  },

  // ! =============================== SIGN_UP =============================================
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
              // console.log(error);
              return res.status(400).json({
                message: error,
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

  // ! =============================== CONFIRM_ACCOUNT =====================================
  async confirmAccount(req, res) {
    let encodedToken = req.params.token;
    // console.log(encodedToken);
    try {
      const decodedToken = jwt.verify(encodedToken, process.env.SECRET);
      // console.log(decodedToken);
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

  // ! =============================== FORGET PASSWORD =====================================
  async forgetPassword(req, res) {
    const userEmail = req.body.email;
    // TODO: Search for the user with Email we got from request
    const user = await prisma.users.findUnique({
      where: {
        Email: userEmail,
      },
    });
    if (!user) {
      return res.status(400).json({
        message: "invalid Email",
      });
    }
    const authenticatedUser = {
      ...user,
      role: await getUserRole(user.Id),
    };
    const token = await createTokens(authenticatedUser, process.env.SECRET);
    // console.log(token);
    const href = `http://localhost:4000/auth/resetpassword?token=${token}`;
    let message = `
    <h1>Rest Password</h1>
    <p>to change your password click <a href="${href}">HERE</a> and flow instruction 👌</p>
    <p><strong>Sincerely ❤</strong></p>
    `;
    sendMail(user.Email, "Rest Password", message);
    res.status(200).json({
      message: "Check your inbox we send you an email to reset your password",
    });
  },

  // ! =============================== RESET PASSWORD =====================================
  async resetpassword(req, res) {
    const token = req.query.token;
    console.log(token);
    const objData = {
      newPassword: req.body.newPassword,
      confirmNewPassword: req.body.confirmNewPassword,
    };

    if (objData.newPassword !== objData.confirmNewPassword) {
      return res.status(400).json({
        message: "confirm password does not match new password",
      });
    }
    if (!token) {
      return res.status(400).json({
        message: "Invalid Token",
      });
    }
    const validToken = decodedToken(token);
    console.log(validToken);

    if (validToken === "error") {
      return res.status(400).json({
        message: "Invalid Token",
      });
    }
    // TODO: Find user after validation of the token
    const user = await prisma.users.findUnique({
      where: {
        Id: validToken.user.Id,
      },
    });
    console.log(user);
    if (!user) {
      return res.status(404).json({
        message: "Accout doesn't exist anymore",
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

module.exports = authController;
