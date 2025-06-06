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

      const email = req.query.email;
      let query = {};
      if (email) {
        query = { hr_email: email };
      }
      const cursor = jobsCollection.find(query);
      const jobs = await cursor.toArray();
      res.send(jobs);
    });

    // jobs API post
    app.post("/jobs", async (req, res) => {
      const job = req.body;
      const result = await jobsCollection.insertOne(job);
      console.log(result);
      res.send(result);
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

    // Get all job applications for a specific job
    app.get("/application" , async (req , res) => {
      const email = req.query.email;

      const query = {
        email: email,
      };
      const result = await jobsAppliedCollection.find(query).toArray();
      res.send(result);
    })

    // My Added Jobs API get
    app.get("/jobsByEmailAddress" , async (req , res) => {
      const email = req.query.email;
      const query = {
        hr_email: email,
      };
      const result = await jobsCollection.find(query).toArray();
      res.send(result);
    })

    // Delete job API
    app.delete("/jobs/:id", async (req, res) => {
      try {
        const id = req.params.id;
        const query = { _id: new ObjectId(id) };
        const result = await jobsCollection.deleteOne(query);
        
        if (result.deletedCount === 0) {
          return res.status(404).send({ success: false, message: "Job not found" });
        }
        
        res.send({ success: true, message: "Job deleted successfully" });
      } catch (error) {
        console.error("Error deleting job:", error);
        res.status(500).send({ success: false, message: "Failed to delete job" });
      }
    });

    // Update job API
    app.put("/jobs/:id", async (req, res) => {
      try {
        const id = req.params.id;
        const updatedJob = req.body;
        const query = { _id: new ObjectId(id) };
        
        const result = await jobsCollection.updateOne(
          query, 
          { $set: updatedJob }
        );
        
        if (result.matchedCount === 0) {
          return res.status(404).send({ 
            success: false, 
            message: "Job not found" 
          });
        }
        
        res.send({ 
          success: true, 
          message: "Job updated successfully"
        });
      } catch (error) {
        console.error("Error updating job:", error);
        res.status(500).send({ 
          success: false, 
          message: "Failed to update job" 
        });
      }
    });

    // Get applications for a specific job
    app.get("/applications/job/:jobId", async (req, res) => {
      try {
        const jobId = req.params.jobId;
        const query = { jobId: jobId };
        const applications = await jobsAppliedCollection.find(query).toArray();
        res.send(applications);
      } catch (error) {
        console.error("Error fetching applications:", error);
        res.status(500).send({ success: false, message: "Failed to fetch applications" });
      }
    });

    // Update application status
    app.patch("/applications/:id", async (req, res) => {
      try {
        const id = req.params.id;
        const { status } = req.body;
        
        // Validate status
        const validStatuses = ['pending', 'reviewing', 'shortlisted', 'rejected', 'hired'];
        if (!validStatuses.includes(status)) {
          return res.status(400).send({ success: false, message: "Invalid status value" });
        }
        
        const query = { _id: new ObjectId(id) };
        const updateDoc = {
          $set: { status: status }
        };
        
        const result = await jobsAppliedCollection.updateOne(query, updateDoc);
        
        if (result.matchedCount === 0) {
          return res.status(404).send({ success: false, message: "Application not found" });
        }
        
        res.send({ success: true, message: "Application status updated successfully" });
      } catch (error) {
        console.error("Error updating application status:", error);
        res.status(500).send({ success: false, message: "Failed to update application status" });
      }
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
