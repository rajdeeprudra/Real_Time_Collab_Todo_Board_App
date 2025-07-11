const Task = require("../models/tasks");
//const user = require("../models/user");
const User = require("../models/user");
const logAction = require("../utils/logAction");

const createTask = async(req,res)=>{
    try{
        const {title, description, priority, status, assignedTo } = req.body;

        const existingTask = await Task.findOne({title});
        if(existingTask){
            return res.status(400).json({
                msg:" Task Title must be unique. "
            });
        }

        const newTask = new Task({
            title,
            description,
            priority,
            status,
            assignedTo: assignedTo || null,
            createdBy: req.user.id
        });

        const savedTask = await newTask.save();

        await logAction({
            taskId: savedTask._id,
            performedBy: req.user.id,
            actionType: "create"
        });

        res.status(201).json({
            msg:"Task created Successfully", task: savedTask
        });
    }catch(err){
        res.status(500).json({
            msg:"err.msg"
        });
    }
};


const getTasks = async(req,res)=>{
    try{
        const userId = req.user.id;

        const tasks = await Task.find({createdBy:userId});
        res.status(200).json({ tasks });
    }catch(err){
        res.status(500).json({msg:" Failed to fetch tasks", error: err.msg});
    }
};


const updateTask = async (req,res)=>{
   const { id } = req.params;
   const userId= req.user.id;

   try{
    const existingTask = await Task.findById(id);
    if(!existingTask){
        return res.status(404).json({
            msg:"Task not found"
        });
    }

    if(
        existingTask.createdBy.toString()!==userId && 
        existingTask.assignedTo.toString()!== userId
    ){
        return res.status(403).json({ msg:"Not authorized to update this task"});
    }


    //conflict detection using timestamps
    const clientUpdatedAt = req.body.updatedAt;
    if(clientUpdatedAt && new Date(clientUpdatedAt).getTime()!== new Date(existingTask.updatedAt).getTime()){
        return res.status(409).json({
            msg:" Conflict detected",
            serverVersion: existingTask,
            clientVersion: req.body,
        });
    }

    const UpdatedFields = {
        title :req.body.title,
        description: req.body.description,
        priority: req.body.priority,
        status:req.body.status,
        assignedTo:req.body.assignedTo,
    };

    const updatedTask = await Task.findByIdAndUpdate(id, UpdatedFields,{
        new: true,
    });

    await logAction({
        taskId: updatedTask._id,
        performedBy: req.user.id,
        actionType: "edit"
    });

    res.status(200).json({msg:" Task updated", task: updatedTask});
   } catch(err){
    res.status(500).json({msg:"Failed to update task",error: err.msg});
   }
};


const deleteTask = async(req,res)=>{
    const {id}= req.params;
    const userId= req.user.id;


    try{
        const task = await Task.findById(id);

        if(!task) {
            return res.status(404).json({msg: "Task not found"});
        }

        if(task.createdBy.toString()!== userId){
            return res.status(403).json({msg:"You are not authorized to delete this task"});
        }

        await Task.findByIdAndDelete(id);

        res.status(200).json({msg:" Task deleted successfully"});

        await logAction({
            taskId:task._id,
            performedBy: req.user.id,
            actionType: "delete"
        });

    } catch(err){
        console.log("Delete task error:",err);
        res.status(500).json({msg: "Failed to delete task",error:err.msg});
    }
};

const smartAssign = async(req,res)=>{
    const {id}= req.params;

    try{

        const users = await User.find();

        if(!users.length){
            return res.status(400).json({msg:"No users found"});

        }

        const userTasksCounts = await Promise.all(
            users.map(async(user)=>{
                const count = await Task.countDocuments({
                    assignedTo: user._id,
                    status:{$ne: "Done"}
                });
                return {userId: user._id, count};
            })

        );

        const leastBusy = userTasksCounts.reduce((min, user)=>
        user.count < min.count ? user : min
    );

    const task = await Task.findByIdAndUpdate(
        id,
        {assignedTo: leastBusy.userId},
        {new : true}
    );

    if(!task){
        return res.status(404).json({msg:"Task not found"});
    }

    await logAction({
        taskId: task._id,
        performedBy: req.user.id,
        actionType: "assign"
    });

    res.status(200).json({msg:"Task Smart-Assigned",task});

    }catch(err){
        console.error("Smart Assign error: ", err);
        res.status(500).json({msg:"Smart Assign Failed", error: err.msg});
    }

};

const dragDropTask = async(req,res)=> {
    const { id } = req.params;
    const { status } = req.body;
    const userId = req.user.id;

    try {
        const task = await Task.findById(id);
        if(!task) {
            return res.status(404).json({msg: "Task not found"});
        }

        task.status = status;
        const updatedTask = await task.save();

        await logAction ({
            taskId: updatedTask._id,
            performedBy: userId,
            actionType: "drop"
        });

        res.status(200).json({msg:"Task moved successfully", task: updatedTask});
    } catch(err) {
        console.log("drag-drop error", err.msg);
        res.status(500).json({msg:"Failed to move task", error:err.msg});
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