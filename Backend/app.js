const express = require("express");
const cors = require("cors");
const dotenv= require("dotenv");
const connectDB = require("./config/db");
const userRoutes = require("./routes/userRoutes");
const taskRoutes = require("./routes/taskRoutes");
const logRoutes = require("./routes/logRoutes");
dotenv.config();
connectDB();

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/user", userRoutes);
app.use("/api/tasks", taskRoutes);
app.use("/api/actions",logRoutes);


module.exports = app;

