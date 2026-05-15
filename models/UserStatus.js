const mongoose = require("mongoose");

const UserStatusSchema = new mongoose.Schema({
  name: String,
  user: String,
  lastActive: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model("UserStatus", UserStatusSchema);