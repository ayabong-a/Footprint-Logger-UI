const express = require("express");
const mongoose = require("mongoose");
const Activity = require("../models/Activity");
const auth = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/my-total", auth, async (req, res) => {
  const result = await Activity.aggregate([
    { $match: { userId: new mongoose.Types.ObjectId(req.user.id) }},
    { $group: { _id: null, total: { $sum: "$co2" }}}
  ]);
  res.json(result[0] || { total: 0 });
});

router.get("/community-average", async (req, res) => {
  const result = await Activity.aggregate([
    { $group: { _id: "$userId", total: { $sum: "$co2" }}},
    { $group: { _id: null, avg: { $avg: "$total" }}}
  ]);
  res.json(result[0] || { avg: 0 });
});

router.get("/weekly", auth, async (req, res) => {
  const weekAgo = new Date();
  weekAgo.setDate(weekAgo.getDate() - 7);

  const activities = await Activity.find({
    userId: req.user.id,
    date: { $gte: weekAgo }
  });

  res.json(activities);
});

router.get("/leaderboard", async (req, res) => {
  const leaderboard = await Activity.aggregate([
    { $group: { _id: "$userId", total: { $sum: "$co2" }}},
    { $sort: { total: 1 }},
    { $limit: 5 }
  ]);
  res.json(leaderboard);
});

module.exports = router;
