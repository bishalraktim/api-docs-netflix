//express is used to add routing
let express = require("express");
let app = express();

//configure mongodb
const mongo = require("mongodb");
const MongoClient = mongo.MongoClient;
//const mongoUrl = "mongodb://localhost:27017";
mongoUrl =
  "mongodb+srv://zomato:zomato123@cluster0.lynmg.mongodb.net/myFirstDatabase?retryWrites=true&w=majority";

//Environment variables
const dotenv = require("dotenv");
dotenv.config();
let port = process.env.PORT || 9210;

//body parser and cors
const bodyParser = require("body-parser");
const cors = require("cors");

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cors());

//declare db
let db;

//get -- default route
app.get("/", (req, res) => {
  res.send("Welcome to express!");
});

//list of all movies
app.get("/data", (req, res) => {
  db.collection("movieData")
    .find()
    .toArray((err, result) => {
      if (err) throw err;
      res.send(result);
    });
});

//list of all movies category
app.get("/categories", (req, res) => {
  db.collection("category")
    .find()
    .toArray((err, result) => {
      if (err) throw err;
      res.send(result);
    });
});

//list of different movies types
//horror movies: /movies/1
//action movies: /movies/2
//thriller movies; /movies/3
//romantic movies: /movies/4
app.get("/movies/:id", (req, res) => {
  let catId = Number(req.params.id);
  //console.log("id is", restId);
  db.collection("movieData")
    .find({ category_id: catId })
    .toArray((err, result) => {
      if (err) throw err;
      res.send(result);
    });
});

//add movies
app.post("/addMovies", (req, res) => {
  db.collection("movieData").insert(req.body, (err, result) => {
    if (err) throw err;
    res.send("Data Added!");
  });
});

//delete movies
app.delete("/deleteMovies/:ids", (req, res) => {
  let delId = Number(req.params.ids);
  db.collection("movieData").remove({ id: delId }, (err, result) => {
    if (err) throw err;
    res.send(result);
  });
});

//connecting to mongodb
MongoClient.connect(mongoUrl, (err, connection) => {
  if (err) console.log("Error while connecting!");
  db = connection.db("zomato-api");
  app.listen(port, () => {
    console.log(`Listening to the port: ${port}`);
  });
});
