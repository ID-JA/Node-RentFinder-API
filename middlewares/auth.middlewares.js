const jwt = require("jsonwebtoken");
const config = process.env;

const authPage = (permistions) => {
  return (req, res, next) => {
    const token =
      req.body.token || req.query.token || req.headers.authorization;
    if (!token) {
      return res.status(403).send("A token is required for authentication");
    }
    try {
      const decoded = jwt.verify(token.split(" ")[1], config.SECRET);
      const userRole = decoded.user.role;
      if (permistions.includes(userRole)) {
        next();
      } else {
        return res.status(401).json("you don't have premisions !!!");
      }
    } catch (err) {
      return res.status(401).send("Invalid Token");
    }
  };
};

module.exports = { authPage };
