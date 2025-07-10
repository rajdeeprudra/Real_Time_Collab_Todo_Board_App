const express = require("express");
const router = express.Router();
const { createTask,getTasks } = require("../controllers/taskController");
const auth = require("../middleware/auth");
const { validateTask } = require("../middleware/taskValidation");

router.post("/", auth,validateTask, createTask);
router.get('/', auth, getTasks);


module.exports= router;