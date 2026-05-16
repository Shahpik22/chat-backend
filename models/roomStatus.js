const mongoose = require("mongoose");

const RoomStatusSchema = new mongoose.Schema({
  roomId: String,
  name: String,
  lastActive: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model("RoomStatus", RoomStatusSchema);