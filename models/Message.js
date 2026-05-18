const mongoose = require("mongoose");

const MessageSchema = new mongoose.Schema({
  roomId: String,
  name: String,
  message: String,
  createdAt: {
    type: Date,
    default: Date.now
  },
  read: {
    type: Boolean,
    default: false
  }
});

module.exports = mongoose.model("Message", MessageSchema);