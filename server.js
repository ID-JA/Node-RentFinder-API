const http = require("http");
const app = require("./app");
require("dotenv").config();

let port = process.env.PORT || 3000;
const server = http.createServer(app);

server.listen(port, () => {
  console.log("server is runing ..." + port);
});
