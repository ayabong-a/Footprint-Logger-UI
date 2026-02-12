const mongoose = require("mongoose");

const activitySchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  category: { type: String, required: true },
  activity: { type: String, required: true },
  amount: { type: Number, required: true },
  unitCo2: { type: Number, required: true }, // store per-unit CO2
  co2: { type: Number, required: true }, // total CO2
  date: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Activity", activitySchema);
