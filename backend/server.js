require("dotenv").config();
const app = require("./src/app.js");
const connectDb = require("./src/db/db.js");
const initSocketServer = require("./src/sockets/socket.server.js");
const httpServer = require("http").createServer(app);



connectDb();
initSocketServer(httpServer);

httpServer.listen(3000,()=>{
    console.log("server is running on port 3000");
})