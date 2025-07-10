const Task = require("../models/tasks");

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

        res.status(201).json({
            msg:"Task created Successfully", task: savedTask
        });
    }catch(err){
        res.status(500).json({
            msg:"err.msg"
        });
    }
};

module.exports = {
    createTask
};