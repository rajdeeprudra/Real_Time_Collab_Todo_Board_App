const Task = require("../models/tasks");
const User = require("../models/user");
const logAction = require("../utils/logAction");

const createTask = async (req, res) => {
  try {
    const { title, description, priority, status, assignedTo } = req.body;

    const existingTask = await Task.findOne({ title });
    if (existingTask) {
      return res.status(400).json({
        msg: "Task Title must be unique.",
      });
    }

    const newTask = new Task({
      title,
      description,
      priority,
      status,
      assignedTo,
      createdBy: req.user.id,
    });

    const savedTask = await newTask.save();

    await logAction({
      taskId: savedTask._id,
      performedBy: req.user.id,
      actionType: "create",
      message: `${req.user.name} created a task.`,
    });

    const io = req.app.get("io");
    io.emit("taskCreated", savedTask);

    res.status(201).json({
      msg: "Task created Successfully",
      task: savedTask,
    });
  } catch (err) {
    res.status(500).json({ msg: "Failed to create task", error: err.message });
  }
};

const getTasks = async (req, res) => {
  try {
    const userId = req.user.id;

    const tasks = await Task.find({
      $or: [{ createdBy: userId }, { assignedTo: userId }],
    })
      .populate("createdBy", "name email")
      .populate("assignedTo", "name email");

    res.status(200).json({ tasks });
  } catch (err) {
    res.status(500).json({ msg: "Failed to fetch tasks", error: err.message });
  }
};

const updateTask = async (req, res) => {
  const { id } = req.params;
  const userId = req.user.id;

  try {
    const existingTask = await Task.findById(id);
    if (!existingTask) {
      return res.status(404).json({ msg: "Task not found" });
    }

 

   if (
  existingTask.createdBy.toString() !== userId &&
  (!existingTask.assignedTo || existingTask.assignedTo.toString() !== userId)
) {
  return res.status(403).json({
    msg: "Not authorized to update this task",
    createdBy: existingTask.createdBy?.toString(),
    assignedTo: existingTask.assignedTo?.toString(),
    you: userId,
  });
}

    
    const clientUpdatedAt = req.body.updatedAt;
    if (
      clientUpdatedAt &&
      new Date(clientUpdatedAt).getTime() !== new Date(existingTask.updatedAt).getTime()
    ) {
      return res.status(409).json({
        msg: "Conflict detected",
        serverVersion: existingTask,
        clientVersion: req.body,
      });
    }

    const UpdatedFields = {
      title: req.body.title,
      description: req.body.description,
      priority: req.body.priority,
      status: req.body.status,
      assignedTo: req.body.assignedTo,
    };

    const updatedTask = await Task.findByIdAndUpdate(id, UpdatedFields, {
      new: true,
    });

    await logAction({
      taskId: updatedTask._id,
      performedBy: req.user.id,
      actionType: "edit",
    });

    const io = req.app.get("io");
    io.emit("taskUpdated", updatedTask);

    res.status(200).json({ msg: "Task updated", task: updatedTask });
  } catch (err) {
    res.status(500).json({ msg: "Failed to update task", error: err.message });
  }
};

const deleteTask = async (req, res) => {
  const { id } = req.params;
  const userId = req.user.id;

  try {
    const task = await Task.findById(id);
    if (!task) {
      return res.status(404).json({ msg: "Task not found" });
    }

   

    if (
      task.createdBy.toString() !== userId &&
      (!task.assignedTo || task.assignedTo.toString() !== userId)
    ) {
      return res.status(403).json({
        msg: "You are not authorized to delete this task",
        createdBy: task.createdBy.toString(),
        assignedTo: task.assignedTo?.toString(),
        you: userId,
      });
    }

    await Task.findByIdAndDelete(id);

    await logAction({
      taskId: task._id,
      performedBy: req.user.id,
      actionType: "delete",
      message: `${req.user.name} deleted a task.`,
    });

    const io = req.app.get("io");
    io.emit("taskDeleted", id);

    res.status(200).json({ msg: "Task deleted successfully" });
  } catch (err) {
    console.log("Delete task error:", err);
    res.status(500).json({ msg: "Failed to delete task", error: err.message });
  }
};

const smartAssign = async (req, res) => {
  const { id } = req.params;

  try {
    const users = await User.find();

    if (!users.length) {
      return res.status(400).json({ msg: "No users found" });
    }

    const userTasksCounts = await Promise.all(
      users.map(async (user) => {
        const count = await Task.countDocuments({
          assignedTo: user._id,
          status: { $ne: "Done" },
        });
        return { userId: user._id, count };
      })
    );

    const leastBusy = userTasksCounts.reduce((min, user) =>
      user.count < min.count ? user : min
    );

    const task = await Task.findByIdAndUpdate(
      id,
      { assignedTo: leastBusy.userId },
      { new: true }
    );

    if (!task) {
      return res.status(404).json({ msg: "Task not found" });
    }

    await logAction({
      taskId: task._id,
      performedBy: req.user.id,
      actionType: "assign",
    });

    const io = req.app.get("io");
    io.emit("taskSmartAssigned", task);

    res.status(200).json({ msg: "Task Smart-Assigned", task });
  } catch (err) {
    console.error("Smart Assign error: ", err);
    res.status(500).json({ msg: "Smart Assign Failed", error: err.message });
  }
};

const dragDropTask = async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  const userId = req.user.id;

  try {
    const task = await Task.findById(id);
    if (!task) {
      return res.status(404).json({ msg: "Task not found" });
    }


    if (
      task.createdBy.toString() !== userId &&
      (!task.assignedTo || task.assignedTo.toString() !== userId)
    ) {
      return res.status(403).json({
        msg: "You are not authorized to move this task",
        createdBy: task.createdBy.toString(),
        assignedTo: task.assignedTo?.toString(),
        you: userId,
      });
    }

    task.status = status;
    const updatedTask = await task.save();

    await logAction({
      taskId: updatedTask._id,
      performedBy: userId,
      actionType: "drop",
    });

    const io = req.app.get("io");
    io.emit("taskDragged", updatedTask);

    res.status(200).json({ msg: "Task moved successfully", task: updatedTask });
  } catch (err) {
    console.log("drag-drop error", err.message);
    res.status(500).json({ msg: "Failed to move task", error: err.message });
  }
};

module.exports = {
  createTask,
  getTasks,
  updateTask,
  deleteTask,
  smartAssign,
  dragDropTask,
};
