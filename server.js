const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const Message = require("./models/Message");
const UserStatus = require("./models/UserStatus");

const app = express();

/* =========================
   MIDDLEWARE
========================= */

app.use(cors());

app.use(express.json());

app.use(express.urlencoded({
  extended: true
}));

/* =========================
   ROOT
========================= */

app.get("/", (req, res) => {
  res.send("Chat server running");
});

/* =========================
   GET ALL MESSAGES
========================= */

app.get("/messages", async (req, res) => {

  try {

    const after = req.query.after;

    let query = {};

    // filter messages after timestamp
    if (
      after &&
      after !== "undefined" &&
      !isNaN(Date.parse(after))
    ) {

      query.createdAt = {
        $gt: new Date(after)
      };
    }

    const messages = await Message
      .find(query)
      .sort({ createdAt: 1 })
      .limit(100);

    res.json(messages);

  } catch (err) {

    console.log(err);

    res.status(500).json({
      error: err.message
    });
  }
});

/* =========================
   GET ROOM MESSAGES
========================= */

app.get("/messages/:roomId", async (req, res) => {

  try {

    const roomId = req.params.roomId;

    const messages = await Message
      .find({ roomId: roomId })
      .sort({ createdAt: 1 })

    res.json(messages);

  } catch (err) {

    console.log(err);

    res.status(500).json({
      error: err.message
    });
  }
});

/* =========================
   SAVE MESSAGE
========================= */

app.post("/messages", async (req, res) => {

  try {

    const msg = new Message(req.body);

    await msg.save();

    res.json(msg);

  } catch (err) {

    console.log(err);

    res.status(500).json({
      error: err.message
    });
  }
});

/* =========================
   DELETE ALL MESSAGES
========================= */

app.delete("/messages", async (req, res) => {

  try {

    await Message.deleteMany({});

    res.json({
      success: true,
      message: "All chat cleared"
    });

  } catch (err) {

    console.log(err);

    res.status(500).json({
      error: err.message
    });
  }
});

/* =========================
   HEARTBEAT
========================= */

app.post("/heartbeat/:name", async (req, res) => {

  try {

    const name = req.params.name;

    await UserStatus.findOneAndUpdate(
      { name: name },
      {
        name: name,
        lastActive: new Date()
      },
      {
        upsert: true,
        new: true
      }
    );

    res.json({
      success: true
    });

  } catch (err) {

    console.log(err);

    res.status(500).json({
      error: err.message
    });
  }
});

/* =========================
   ONLINE USER STATUS
========================= */

app.get("/online-users/:name", async (req, res) => {

  try {

    const name = req.params.name;

    const userStatus = await UserStatus.findOne({
      name: name
    });

    if (!userStatus) {

      return res.json({
        name: name,
        status: false
      });
    }

    // online if active within 10 sec
    const activeLimit = 10 * 1000;

    const isOnline =
      (Date.now() - new Date(userStatus.lastActive).getTime()) < activeLimit;

    res.json({
      name: name,
      status: isOnline
    });

  } catch (err) {

    console.log(err);

    res.status(500).json({
      error: err.message
    });
  }
});

/* =========================
   READ USER CHAT
========================= */

app.put("/messages/read/:roomId/:name", async (req, res) => {

  await Message.updateMany(
    {
      roomId: req.params.roomId,
      name: { $ne: req.params.name },
      read: false
    },
    {
      $set: { read: true }
    }
  );

  res.json({
    success: true
  });
});

/* =========================
   START SERVER
========================= */

mongoose.set("bufferCommands", false);

async function startServer() {

  try {

    await mongoose.connect(process.env.MONGODB_URI);

    console.log("MongoDB connected");

    const PORT = process.env.PORT || 3000;

    app.listen(PORT, () => {
      console.log("Server running on", PORT);
    });

  } catch (err) {

    console.log("MongoDB ERROR:", err);
  }
}

startServer();