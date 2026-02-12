require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const authRoutes = require("./routes/authRoutes");
const activityRoutes = require("./routes/activityRoutes");
const statsRoutes = require("./routes/statsRoutes");

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

app.listen(process.env.PORT, () =>
  console.log(`Server running on port ${process.env.PORT}`),
);
