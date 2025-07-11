const express = require("express");
const router = express.Router();
const { createTask,getTasks, updateTask } = require("../controllers/taskController");
const auth = require("../middleware/auth");
const { validateTask } = require("../middleware/taskValidation");

router.post("/", auth,validateTask, createTask);
router.get('/', auth, getTasks);
router.put("/:id", auth,validateTask,updateTask);

module.exports= router;