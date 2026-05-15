const mongoose = require("mongoose");

const MessageSchema = new mongoose.Schema({
  roomId: String,
  name: String,
  message: String,
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model("Message", MessageSchema);