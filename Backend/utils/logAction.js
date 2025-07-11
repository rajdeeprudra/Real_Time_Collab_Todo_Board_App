const ActionLog = require("../models/ActionLog");

const logAction = async({ taskId, performedBy, actionType }) => {
    try {
    await ActionLog.create({ taskId, performedBy, actionType });
    }catch (error) {
        console.error("Failed to log action: ", error.message);
    }
};

module.exports =logAction;