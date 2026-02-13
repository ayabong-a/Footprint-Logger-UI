require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const http = require("http");
const { Server } = require("socket.io");

const Activity = require("./models/Activity");

const authRoutes = require("./routes/authRoutes");
const activityRoutes = require("./routes/activityRoutes");
const statsRoutes = require("./routes/statsRoutes");
const insightRoutes = require("./routes/insightRoutes");

const app = express();

app.use(
  cors({
    origin: "https://aquamarine-valkyrie-bc9181.netlify.app",
    credentials: true,
  }),
);
app.use(express.json());

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.error(err));

app.use("/api/auth", authRoutes);
app.use("/api/activities", activityRoutes);
app.use("/api/stats", statsRoutes);
app.use("/api/insights", insightRoutes);

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "https://aquamarine-valkyrie-bc9181.netlify.app",
    credentials: true,
  },
});

io.on("connection", (socket) => {
  console.log("User connected");

  socket.on("requestTip", async (userId) => {
    const activities = await Activity.find({ userId });

    const totals = {};
    activities.forEach((a) => {
      if (!totals[a.category]) totals[a.category] = 0;
      totals[a.category] += a.co2;
    });

    const highestCategory = Object.entries(totals).sort(
      (a, b) => b[1] - a[1],
    )[0]?.[0];

    const tips = {
      transport: "Reduce driving this week by replacing 2 trips.",
      food: "Try a vegetarian meal twice this week.",
      energy: "Lower heating or AC usage slightly.",
    };

    socket.emit("tipUpdate", {
      tip: tips[highestCategory] || "Log more activities to get insights!",
    });
  });
});

server.listen(process.env.PORT, () =>
  console.log(`Server running on port ${process.env.PORT}`),
);
