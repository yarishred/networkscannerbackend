//Modulos
const express = require("express");
const cors = require("cors");
const session = require("express-session");

//Database Connection
const mongoDB = require("mongodb");
const MongoDBStore = require("connect-mongodb-session")(session);
const mongoose = require("mongoose");

// Store Mongodb Session
const MongoDBURI = "mongodb://127.0.0.1:27017/NetworkDB";

//Import Routes
const ledRouter = require("./routes/ledRoutes");

// Enable express application
const app = express();

app.use(express.json());
const port = 5500;

//habilitar CORS
app.use(cors());

//Express Routes
app.use(ledRouter);

mongoose
  .connect(MongoDBURI, { useNewUrlParser: true })
  .then(() => {
    app.listen(port, () => {
      console.log(`Connected on port: ${port}`);
    });
  })
  .catch((error) => {
    console.log(error);
  });
