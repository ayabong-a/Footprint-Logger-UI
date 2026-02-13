const express = require("express");
const Activity = require("../models/Activity");
const User = require("../models/User");
const auth = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/", auth, async (req, res) => {
  try {
    const userId = req.user.id;

    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

    const activities = await Activity.find({
      userId,
      date: { $gte: oneWeekAgo }
    });

    if (!activities.length) {
      return res.json({
        highestCategory: null,
        weeklyTotal: 0,
        tip: "Start logging activities to receive personalised tips!"
      });
    }

    const totals = {};

    activities.forEach(a => {
      if (!totals[a.category]) totals[a.category] = 0;
      totals[a.category] += a.co2;
    });

    const highestCategory = Object.entries(totals)
      .sort((a, b) => b[1] - a[1])[0][0];

    const weeklyTotal = activities.reduce((sum, a) => sum + a.co2, 0);

    const tips = {
      transport: "Try replacing two short car trips with walking or cycling.",
      food: "Replace one meat-based meal with a plant-based option this week.",
      energy: "Turn off unused appliances and reduce heating/cooling usage."
    };

    const user = await User.findById(userId);

    // Set reduction goal (5% lower than this week)
    user.lastWeekEmission = weeklyTotal;
    user.weeklyTarget = weeklyTotal * 0.95;
    await user.save();

    res.json({
      highestCategory,
      weeklyTotal,
      weeklyTarget: user.weeklyTarget,
      tip: tips[highestCategory] || "Keep monitoring your activities!"
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;