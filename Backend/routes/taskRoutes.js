const express = require("express");
const router = express.Router();
const { createTask,getTasks, updateTask, deleteTask, smartAssign, dragDropTask } = require("../controllers/taskController");
const auth = require("../middleware/auth");
const { validateTask } = require("../middleware/taskValidation");

router.post("/", auth,validateTask, createTask);
router.get('/', auth, getTasks);
router.put("/:id", auth,validateTask,updateTask);
router.delete("/:id", auth, deleteTask);
router.patch("/:id/smart-assign", auth, smartAssign);
router.patch("/drag/:id", auth, dragDropTask);

module.exports= router;  