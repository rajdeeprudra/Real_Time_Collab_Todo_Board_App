const ActionLog = require("../models/ActionLog");

const getRecentLogs = async(req,res) => {
    try{
        const logs = await ActionLog.find()
        .sort({ createdAt: -1})
        .limit(20)
        .populate("performedBy","username")
        .populate("taskId", "title");

        res.status(200).json({logs});
    }catch (error){
        console.error("Fetch Logs Error", error);
        res.status(500).json({msg:"Failed to fetch action logs"});
    }
};

module.exports = { getRecentLogs };