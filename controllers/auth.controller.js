const authController = {
  login(req, res) {
    console.log(req.body);
    const obj = {
      email: req.body.email,
      password: req.body.password,
    };
    res.status(200).json({
      data: obj,
    });
  },
  singup(req, res) {},
};

module.exports = authController;
