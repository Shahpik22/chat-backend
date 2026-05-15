const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const Message = require("./models/Message");

const app = express();

app.use(cors());
app.use(express.json());

// MongoDB
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log("MongoDB connected"))
  .catch(err => console.log(err));

/**
 * GET messages
 */
// app.get("/messages", async (req, res) => {
//   const messages = await Message.find().sort({ createdAt: 1 });
//   res.json(messages);
// });

app.get("/messages", async (req, res) => {
  const after = req.query.after;
  let query = {};
  if (after) {
    query.createdAt = {
      $gt: new Date(after)
    };
  }

  const messages = await Message
    .find(query)
    .sort({ createdAt: 1 });

  res.json(messages);
});

/**
 * POST message
 */
app.post("/messages", async (req, res) => {
  const msg = new Message(req.body);
  await msg.save();
  res.json(msg);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log("Server running on", PORT));

/* =========================
   REST ENDPOINT (optional)
========================= */
app.get('/', (req, res) => {
  res.send("Chat server running");
});