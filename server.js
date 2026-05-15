const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const Message = require("./models/Message");
const UserStatus = require("./models/UserStatus");
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

// app.get("/messages", async (req, res) => {
//   const after = req.query.after;
//   let query = {};
//   if (after) {
//     query.createdAt = {
//       $gt: new Date(after)
//     };
//   }

//   const messages = await Message
//     .find(query)
//     .sort({ createdAt: 1 });

//   res.json(messages);
// });


app.get("/messages", async (req, res) => {

  try {
    const after = req.query.after;
    let query = {};
    // only filter if valid
    if (
      after &&
      after !== 'undefined' &&
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
    // res.json(messages.reverse());
  } catch (err) {
    console.log(err);
    res.status(500).json({
      error: err.message
    });
  }
});

/**
 * POST message
 */
app.post("/messages", async (req, res) => {
  const msg = new Message(req.body);
  await msg.save();
  res.json(msg);
});

app.delete("/messages", async (req, res) => {
  try {
    await Message.deleteMany({});
    res.json({ success: true, message: "All chat cleared" });
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: err.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log("Server running on", PORT));

/* =========================
   REST ENDPOINT (optional)
========================= */
app.get('/', (req, res) => {
  res.send("Chat server running");
});

// app.post("/heartbeat", async (req, res) => {
//   try {

//     const { name } = req.body;

//     await UserStatus.findOneAndUpdate(
//       { name },
//       { lastActive: new Date() },
//       { upsert: true, new: true }
//     );

//     res.json({ success: true });

//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// });

app.post("/heartbeat/:user", async (req, res) => {

  const { user } = req.params;

  await UserStatus.findOneAndUpdate(
    { user },
    {
      user,
      lastActive: new Date()
    },
    {
      upsert: true,
      returnDocument: 'after'
    }
  );

  res.json({ success: true });
});

app.get("/online-users/:user", async (req, res) => {
  try {

    const { user } = req.params;

    const userStatus = await UserStatus.findOne({ user });

    if (!userStatus) {
      return res.json({
         user,
        status: false
      });
    }

    const activeLimit = 10 * 1000; // 10 seconds

    const isOnline =
      (Date.now() - new Date(userStatus.lastActive).getTime()) < activeLimit;

    res.json({
       user,
      status: isOnline
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get("/messages/:roomId", async (req, res) => {

  const { roomId } = req.params;

  const messages = await Message
    .find({ roomId })
    .sort({ createdAt: 1 })
    .limit(100);

  res.json(messages);
});