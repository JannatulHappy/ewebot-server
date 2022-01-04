const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
require("dotenv").config();
const MongoClient = require("mongodb").MongoClient;
const ObjectId = require("mongodb").ObjectId;

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.kkrwn.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const port = process.env.PORT || 5000;
const app = express();
app.use(cors());
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.get("/", (req, res) => {
  res.send("Hello World!");
});

client.connect((err) => {
  const servicesCollection = client.db("Ewebot").collection("services");
  const usersCollection = client.db("Ewebot").collection("users");
  const ordersCollection = client.db("Ewebot").collection("orders");
  const reviewsCollection = client.db("Ewebot").collection("reviews");
  const appointmentsCollection = client.db("Ewebot").collection("appointments");
  const professionalsCollection = client.db("Ewebot").collection("professionals");

  console.log("database connected");

  // getting all professionals
  app.get("/professionals", async (req, res) => {
    const result = await professionalsCollection.find({}).toArray();
    res.send(result);
  });
  // get single  professional

  app.get("/singleProfessional/:id", async (req, res) => {
    const result = await professionalsCollection
      .find({ _id: ObjectId(req.params.id) })
      .toArray();
    res.send(result[0]);
  });
  

  // make admin
  app.put("/users/admin", async (req, res) => {
    const user = req.body;
    const filter = { email: user.email };
    const updateDoc = { $set: { role: "admin" } };
    const result = await usersCollection.updateOne(filter, updateDoc);
    console.log(result);
    res.json(result);
  });

  // check  admin or not
  app.get("/users/:email", async (req, res) => {
    const email = req.params.email;
    const query = { email: email };
    const user = await usersCollection.findOne(query);
    let isAdmin = false;
    if (user?.role === "admin") {
      isAdmin = true;
    }
    res.json({ admin: isAdmin });
  });
  // add user

  app.post("/users", async (req, res) => {
    const user = req.body;
    const result = await usersCollection.insertOne(user);
    console.log(result);
    res.json(result);
  });
  // add user update
  app.put("/users", async (req, res) => {
    const user = req.body;
    const filter = { email: user.email };
    const options = { upsert: true };
    const updateDoc = { $set: user };
    const result = await usersCollection.updateOne(filter, updateDoc, options);
    res.json(result);
  });
  // get reviews
  app.get("/reviews", async (req, res) => {
    const result = await reviewsCollection.find({}).toArray();
    res.send(result);
  });
  //add  review
  app.post("/addReview", async (req, res) => {
    const result = await reviewsCollection.insertOne(req.body);

    res.send(result);
  });
  //add professional
  app.post("/addProfessional", async (req, res) => {
    const result = await professionalsCollection.insertOne(req.body);
console.log(result)
    res.send(result);
  });
   // get all appointments
   app.get("/appointments", async (req, res) => {
      
    const email = req.query.email;
    const date = new Date(req.query.date).toLocaleDateString();

    const query = { email: email, date: date };

    const cursor = appointmentsCollection.find(query);
    const appointments = await cursor.toArray();
    res.json(appointments);
  });
  // post each appointment
  app.post("/appointments", async (req, res) => {
    const appointment = req.body;
    const result = await appointmentsCollection.insertOne(appointment);
    console.log(result);
    res.json(result);
  });
 
  //get  my order by using email query

  app.get("/myOrders/:email", async (req, res) => {
    const result = await ordersCollection
      .find({
        userEmail: req.params.email,
      })
      .toArray();
    res.send(result);
  });

  // delete an order from my order

  app.delete("/deleteOrder/:id", async (req, res) => {
    const result = await appointmentsCollection.deleteOne({
      _id: ObjectId(req.params.id),
    });
    res.send(result);
  });
   /// all order
   app.get("/allAppointments", async (req, res) => {
    
    const result = await appointmentsCollection.find({}).toArray();
    res.send(result);
  });
  // update status to shipped
  app.put("/approveBooking/:id", async (req, res) => {
    const id = req.params.id;
    const query = { _id: ObjectId(id) };
    const Booking = {
      $set: {
        status: "Shipped",
      },
    };
    const result = await ordersCollection.updateOne(query, Booking);
    res.json(result);
  });
 
   // delete appointment from all appointments
   app.delete("/DeleteFromAllAppointments/:id", async (req, res) => {
    const result = await appointmentsCollection.deleteOne({
      _id: ObjectId(req.params.id),
    });
    res.send(result);
  });
   // delete collections from manage collection
   app.delete("/deleteManageServices/:id", async (req, res) => {
    const result = await servicesCollection.deleteOne({
      _id: ObjectId(req.params.id),
    });
    res.send(result);
  });
});

app.listen(port, () => {
  console.log(`Listening to port : ${port}`);
});
