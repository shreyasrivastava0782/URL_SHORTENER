const express = require("express");
const mongoose = require("mongoose");
const shortid = require("shortid");
const cors = require("cors");
const Url = require("./db/url");

const app = express();
const PORT = 3000;

// Middleware
app.use(express.static("public"));
app.use(express.json());
app.use(cors());

// ✅ MongoDB connection
mongoose.connect("mongodb+srv://shreyasrivastava722_db_user:aeIDBPAHTnjsfpM0@cluster0.6hbraew.mongodb.net/CodeAlpha_Task1")
  .then(() => console.log("✅ Connected to MongoDB"))
  .catch(err => console.error("❌ DB Connection Error:", err));

// ✅ Ignore favicon requests
app.get("/favicon.ico", (req, res) => res.status(204).end());

// ✅ Shorten URL
app.post("/shorten", async (req, res) => {
  try {
    let { originalUrl } = req.body;

    if (!originalUrl) {
      return res.status(400).json({ error: "Original URL is required" });
    }

    // add protocol if missing
    if (!/^https?:\/\//i.test(originalUrl)) {
      originalUrl = "http://" + originalUrl;
    }

    // check if already exists
    const existing = await Url.findOne({ originalUrl });
    if (existing) {
      return res.json({ shortUrl: `http://localhost:${PORT}/${existing.shortCode}` });
    }

    // generate new short code
    const shortCode = shortid.generate();
    const newUrl = new Url({ shortCode, originalUrl });
    await newUrl.save();

    res.json({ shortUrl: `http://localhost:${PORT}/${shortCode}` });
  } catch (err) {
    console.error("❌ Error in shorten:", err.message);
    res.status(500).json({ error: "Server error" });
  }
});

// ✅ Redirect route
app.get("/:shortCode", async (req, res) => {
  try {
    const shortCode  = req.params.shortCode; // ✅ fixed
    const url = await Url.findOne({ shortCode });

    if (!url) {
      return res.status(404).json({ error: "URL not found" });
    }

    return res.redirect(url.originalUrl);
  } catch (err) {
    console.error("❌ Error in redirect:", err.message);
    res.status(500).json({ error: "Server error" });
  }
});

// ✅ Start server
app.listen(PORT, () => {
  console.log(`🚀 Server listening on http://localhost:${PORT}`);
});

