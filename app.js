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

//list of all movies categories
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

//list of restaurants
// app.get("/restaurants", (req, res) => {
//   db.collection("restaurants")
//     .find()
//     .toArray((err, result) => {
//       if (err) throw err;
//       res.send(result);
//     });
// });

//restaurant with respect to city
// app.get("/restaurants/:id", (req, res) => {
//   let restId = Number(req.params.id);
//   //console.log("id is", restId);
//   db.collection("restaurants")
//     .find({ state_id: restId })
//     .toArray((err, result) => {
//       if (err) throw err;
//       res.send(result);
//     });
// });

//list of restaurants - page 1
//restaurant with respect to city - page 1
//and restaurant wrt mealType or quick search - page 2
app.get("/restaurants", (req, res) => {
  let stateId = Number(req.query.state_id);
  let mealId = Number(req.query.meal_id);
  //console.log("state id is", stateId, "and meal id is", mealId);

  let queries = {};
  if (stateId) {
    queries = { state_id: stateId };
  }

  if (mealId) {
    queries = { "mealTypes.mealtype_id": mealId };
  }
  db.collection("restaurants")
    .find(queries)
    .toArray((err, result) => {
      if (err) throw err;
      res.send(result);
    });
});

//mealType (quick search) - page 1
app.get("/mealType", (req, res) => {
  db.collection("mealType")
    .find()
    .toArray((err, result) => {
      if (err) throw err;
      res.send(result);
    });
});

//restaurants details - page 3
app.get("/details/:id", (req, res) => {
  let restId = Number(req.params.id);
  //console.log("id is", restId);
  //let restId = mongo.ObjectId(req.params.id);
  db.collection("restaurants")
    .find({ restaurant_id: restId })
    .toArray((err, result) => {
      if (err) throw err;
      res.send(result);
    });
});

//menu of that restaurant - page 3
app.get("/menu/:id", (req, res) => {
  let restId = Number(req.params.id);
  //console.log("id is", restId);
  //let restId = mongo.ObjectId(req.params.id);
  db.collection("menu")
    .find({ restaurant_id: restId })
    .toArray((err, result) => {
      if (err) throw err;
      res.send(result);
    });
});

// Filter and pagination
// cuisine filter
// low cost and high cost filer
// low cost, high cost and cuisine filter
// sort filter
//pagination
app.get("/filter/:mealId", (req, res) => {
  let sort = { cost: 1 };
  let mealId = Number(req.params.mealId);
  let cuisineId = Number(req.query.cuisine);
  let lcost = Number(req.query.lcost);
  let hcost = Number(req.query.hcost);
  let query = {};

  let skip = 0;
  let limit = 10000000000000000;

  if (req.query.skip && req.query.limit) {
    skip = Number(req.query.skip);
    limit = Number(req.query.limit);
  }

  if (req.query.sort) {
    sort = {
      cost: req.query.sort,
    };
  }

  if (cuisineId && lcost && hcost) {
    query = {
      "cuisines.cuisine_id": cuisineId,
      "mealTypes.mealtype_id": mealId,
      $and: [{ cost: { $gt: lcost, $lt: hcost } }],
    };
  }

  if (cuisineId) {
    query = {
      "cuisines.cuisine_id": cuisineId,
      "mealTypes.mealtype_id": mealId,
    };
  }

  if (lcost && hcost) {
    query = {
      $and: [{ cost: { $gt: lcost, $lt: hcost } }],
      "mealTypes.mealtype_id": mealId,
    };
  }
  db.collection("restaurants")
    .find(query)
    .sort(sort)
    .skip(skip)
    .limit(limit)
    .toArray((err, result) => {
      if (err) throw err;
      res.send(result);
    });
});

//get orders or list all orders - page 5
app.get("/orders", (req, res) => {
  let userEmail = req.query.email;

  let queries = {};
  if (userEmail) {
    queries = { email: userEmail };
  }

  db.collection("orders")
    .find(queries)
    .toArray((err, result) => {
      if (err) throw err;
      res.send(result);
    });
});

//place order (post method) - page 5

// app.post("/placeOrder", (req, res) => {
//   console.log(req.body);
//   res.send("It's working!");
// });

app.post("/placeOrder", (req, res) => {
  db.collection("orders").insert(req.body, (err, result) => {
    if (err) throw err;
    res.send("Order Added!");
  });
});

// delete order
app.delete("/deleteOrder", (req, res) => {
  db.collection("orders").remove({}, (err, result) => {
    if (err) throw err;
    res.send(result);
  });
});

//menu items on user selection - page 4
app.post("/menuItem", (req, res) => {
  //console.log(req.body);
  //res.send("Done");
  db.collection("menu")
    .find({ menu_id: { $in: req.body } })
    .toArray((err, result) => {
      if (err) throw err;
      res.send(result);
    });
});

//update order
app.put("/updateOrder/:id", (req, res) => {
  let oId = mongo.ObjectId(req.params.id);
  let status = req.query.status ? req.query.status : "Pending";
  db.collection("orders").updateOne(
    { _id: oId },
    {
      $set: {
        status: status,
        bank_name: req.body.bank_name,
        bank_status: req.body.bank_status,
      },
    },
    (err, result) => {
      if (err) throw err;
      res.send(`Status updated to ${status}`);
    }
  );
});

//connecting to mongodb
MongoClient.connect(mongoUrl, (err, connection) => {
  if (err) console.log("Error while connecting!");
  db = connection.db("zomato-api");
  app.listen(port, () => {
    console.log(`Listening to the port: ${port}`);
  });
});
