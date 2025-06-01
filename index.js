const express = require("express");
const cors = require("cors");
const app = express();
const port = process.env.PORT || 3000;
require("dotenv").config();

app.use(cors());
app.use(express.json());

const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const e = require("express");
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.0ykpaho.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    // await client.connect();

    const jobsCollection = client.db("jobPortal").collection("jobs");
    const jobsAppliedCollection = client
      .db("jobPortal")
      .collection("jobsApplied");

    // Jobs API get
    app.get("/jobs", async (req, res) => {
      const cursor = jobsCollection.find();
      const jobs = await cursor.toArray();
      res.send(jobs);
    });

    // Single Job API get
    app.get("/jobs/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const job = await jobsCollection.findOne(query);
      res.send(job);
    });

    // Job Apply API post
    app.post("/jobApplication", async (req, res) => {
      const jobApplication = req.body;
      const result = await jobsAppliedCollection.insertOne(jobApplication);
      console.log(result);
      res.send(result);
    });

    // Each user job application get
    app.get("/jobApplications", async (req, res) => {
      const email = req.query.email;
      const query = {
        applicant: email,
      };
      const result = await jobsAppliedCollection.find(query).toArray();
      res.send(result);
    });

    // await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("Welcome to the API!. Server is running.");
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
