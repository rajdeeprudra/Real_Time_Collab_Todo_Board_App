const mongoose = require("mongoose");

const taskSchema = new mongoose.Schema({
    title:{
        type: String,
        required:true,
        unique: true
    },
    description:{
        type: String,
        default:''
    },
    assignedTo:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        default: null
    },
    status:{
        type: String,
        enum: ['Todo', 'In Progress', 'Done'],
        default:'Todo'
    },
    priority:{
        type: String,
        enum: ['Low','Medium', 'High'],
        default: 'Medium'
    },
    createdBy:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    }
},{
    timestamps: true
});

module.exports = mongoose.model("Task", taskSchema);