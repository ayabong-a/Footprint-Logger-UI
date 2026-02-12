const express = require("express");
const Activity = require("../models/Activity");
const auth = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/", auth, async (req, res) => {
  const { category, activity, amount, unitCo2 } = req.body;

  if (!category || !activity || !amount || !unitCo2) {
    return res.status(400).json({ message: "Missing required fields" });
  }

  const co2 = amount * unitCo2;

  const newActivity = new Activity({
    userId: req.user.id,
    category,
    activity,
    amount,
    unitCo2,
    co2,
  });

  await newActivity.save();
  res.status(201).json(newActivity);
});

router.get("/", auth, async (req, res) => {
  const activities = await Activity.find({ userId: req.user.id });
  res.json(activities);
});

router.put("/:id", auth, async (req, res) => {
  const { amount } = req.body;

  const activity = await Activity.findOne({
    _id: req.params.id,
    userId: req.user.id,
  });
  if (!activity) return res.status(404).json({ message: "Activity not found" });

  activity.amount = amount;
  activity.co2 = amount * activity.unitCo2;

  await activity.save();
  res.json(activity);
});

router.delete("/:id", auth, async (req, res) => {
  await Activity.findOneAndDelete({ _id: req.params.id, userId: req.user.id });
  res.json({ message: "Activity deleted" });
});

module.exports = router;
