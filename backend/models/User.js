const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  password: String,
  weeklyTarget: { type: Number, default: 0 },
  lastWeekEmission: { type: Number, default: 0 },
});

module.exports = mongoose.model("User", userSchema);
