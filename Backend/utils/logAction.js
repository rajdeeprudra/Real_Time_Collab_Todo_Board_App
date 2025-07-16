const ActionLog = require("../models/ActionLog");
const Task = require("../models/tasks");

const generateMessage = (actionType, taskTitle = "a task") => {
  switch (actionType) {
    case "create":
      return `created task "${taskTitle}"`;
    case "edit":
      return `edited task "${taskTitle}"`;
    case "delete":
      return `deleted task "${taskTitle}"`;
    case "assign":
      return `assigned "${taskTitle}"`;
    case "drop":
      return `moved task "${taskTitle}" to another column`;
    default:
      return `did something with "${taskTitle}"`;
  }
};

const logAction = async ({ taskId, performedBy, actionType }) => {
  try {
    // Fetch task title for message generation
    const task = await Task.findById(taskId).select("title");
    const taskTitle = task?.title || "a task";

    const message = generateMessage(actionType, taskTitle);

    await ActionLog.create({
      taskId,
      performedBy,
      actionType,
      message, 
    });
  } catch (error) {
    console.error("Failed to log action:", error.message);
  }
};

module.exports = logAction;
