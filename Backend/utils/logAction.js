const ActionLog = require("../models/ActionLog");

const logAction = async({ taskId, performedBy, actionType }) => {
    try {
    await ActionLog.create({ taskId, performedBy, actionType });
    }catch (error) {
        console.error("Failed to log action: ", error.message);
    }
};

function generateMessage(actionType, taskTitle = "a task") {
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
}


module.exports =logAction;