const mongoose = require("mongoose");

const actionLogSchema = new mongoose.Schema({
    taskId:{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Task",
        required: true,
    },
    performedBy:{
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    actionType: {
        type: String,
        enum: ["create","edit","delete","assign", "drag", "drop"],
        required: true,
    },
}, {timestamps: true});

module.exports= mongoose.model("ActionLog", actionLogSchema);
