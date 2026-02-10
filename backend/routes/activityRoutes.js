const express = require("express");
const Activity = require("../models/Activity");
const auth = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/", auth, async (req, res) => {
  const activity = await Activity.create({
    ...req.body,
    userId: req.user.id
  });
  res.json(activity);
});

router.get("/", auth, async (req, res) => {
  const activities = await Activity.find({ userId: req.user.id });
  res.json(activities);
});

module.exports = router;
