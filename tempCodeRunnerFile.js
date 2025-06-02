// Job Apply API post
    app.post("/jobApplication", async (req, res) => {
      const jobApplication = req.body;
      const result = await jobsAppliedCollection.insertOne(jobApplication);
      console.log(result);
      res.send(result);
    });