const express = require("express");
const router = express.Router();
const { getRecentLogs } = require("../controllers/logController");
const auth = require("../middleware/auth");

router.get("/logs", auth, getRecentLogs);

module.exports= router;

