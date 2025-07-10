const express = require("express");
const router = express.Router();
const { createTask } = require("../controllers/taskController");
const auth = require("../middleware/auth");
const { validateTask } = require("../middleware/taskValidation");

router.post("/", auth,validateTask, createTask);

module.exports= router;