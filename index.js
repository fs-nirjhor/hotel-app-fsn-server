const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");

const port = 4000;
const password = 'hotelAppFsn' ;
const uri = "mongodb+srv://fsnirjhor:hotelAppFsn@hotel-app-fsn.hpamzis.mongodb.net/hotel-app-fsn-data?retryWrites=true&w=majority";
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
  res.send("Hotel App FSN");
});
/*
client.connect()
.then(res => {
  const bookings = client.db("hotel-app-fsn-data").collection("bookings");
  app.post("/add-booking", (req, res) => {
   bookings.insertOne(req.body)
   .then(result => {
  	console.log(result);
  	res.send(result);
  	});
  });
})
.then(client.close())
.catch(err => console.log(err));
  */

async function run() {
	try {
	  client.connect();
	const bookings = client.db("hotel-app-fsn-data").collection("bookings");
	// Add Booking 
  app.post("/add-booking", async (req, res) => {
   const result = await bookings.insertOne(req.body);
  	console.log(result);
  	res.send(result.insertedId);
  });
	} finally {
		client.close();
	}
}
run().catch(console.dir);
	

app.listen(port);