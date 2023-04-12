const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");

require("dotenv").config();

const admin = require("firebase-admin");
const serviceAccount = require("./configs/hotel-app-fsn-firebase-adminsdk-27o1v-77c2d8580c.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: `${process.env.FIRE_URL}`,
});

const port = 4000;
const uri =
  `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@hotel-app-fsn.hpamzis.mongodb.net/${process.env.DB_NAME}?retryWrites=true&w=majority`;
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverApi: ServerApiVersion.v1,
});

const app = express();
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.get("/", (req, res) => {
  res.send("Server: Hotel FSN");
});

// MongoDb Connection
async function run() {
  try {
    client.connect();
    const bookings = client.db("hotel-app-fsn-data").collection("bookings");
    // Add Booking
    app.post("/add-booking", async (req, res) => {
      const result = await bookings.insertOne(req.body);
      console.log(result);
      res.send(result);
    });
    // Get Booking Data
    app.get("/bookings", async (req, res) => {
      const bearer = req.headers.authorization;
      if (bearer && bearer.startsWith("Bearer ")) {
        const idToken = bearer.split(" ")[1];
        await admin
          .auth()
          .verifyIdToken(idToken)
          .then(async (decodedToken) => {
            const tokenEmail = decodedToken.email;
            const userEmail = req.query.email;
            console.log({ tokenEmail, userEmail });
            if (tokenEmail === userEmail) {
              const result = await bookings
                .find({ email: userEmail })
                .toArray();
              res.status(200).send(result);
            } else {
              res.status(401).send("Un-authorized Access");
            }
          })
          .catch((error) => {
            console.log(error);
            res.status(401).send("Un-authorized Access");
          });
      } else {
        res.status(401).send("Un-authorized Access");
      }
    });
  } finally {
    await client.close();
  }
}
run().catch(console.dir);

/*
client.connect()
.then(res => {
  const bookings = client.db("hotel-app-fsn-data").collection("bookings");
  // Add Booking 
  app.post("/add-booking", (req, res) => {
   bookings.insertOne(req.body)
   .then(result => {
  	console.log(result);
  	res.send(result);
  	});
  });
  // Get Bookings Data 
  
})
.then(client.close())
.catch(err => console.log(err));
  */

app.listen(port);
