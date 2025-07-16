### Logic Document

## Smart Assign - Implementation Logic
Smart Assign is designed to automatically assign the most suitable user to a newly created task based on their current workload. The goal is to distribute tasks evenly across users to avoid overloading any single person.

# How it works:

1. Retrieve All Users:
   The backend fetches all users from the database using:

   const users = await User.find();

    If no users exist, it returns an error.

2. Count Active Tasks for Each User:
   For each user, it calculates how many tasks are currently assigned to them and are not yet marked as "Done":

   const count = await Task.countDocuments({
  assignedTo: user._id,
  status: { $ne: "Done" }
});

  This creates an array of objects with each user's ID and their corresponding task count.
  
3. Find the Least Busy User:
From the array, the user with the lowest task count is selected using reduce:

    const leastBusy = userTasksCounts.reduce((min, user) =>
  user.count < min.count ? user : min
);

4. Assign the Task:
    The task (found using id from the request) is then updated by setting its assignedTo field to the least busy user's ID:

    const task = await Task.findByIdAndUpdate(
  id,
  { assignedTo: leastBusy.userId },
  { new: true }
);

5. Log the Assignment Action:
    An activity log is created for this assignment for auditing and tracking purposes:

    await logAction({ taskId, performedBy, actionType: "assign" });

6. Real-Time Notification:
    A real-time event taskSmartAssigned is emitted using Socket.IO so all connected clients are instantly aware of the update.

7. Respond to Client:
    The server responds with a success message and the updated task.



## Conflict Handling - How It Works
Conflict handling ensures that when multiple users are editing the same task at the same time, changes don’t get accidentally overwritten or lost.

# How it works:

1. Client Sends updatedAt Timestamp
    When updating a task, the frontend sends the timestamp of the version it is trying to save.

2. Server Compares with Current Task Timestamp
    On the backend, this timestamp is compared with the updatedAt value in the database:

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

If the timestamps do not match, the server concludes that someone else has modified the task since the client last fetched it — a conflict is detected.

3. Server Responds with 409 Conflict
    The server sends both versions:

    serverVersion: The latest version from the database

    clientVersion: The attempted update from the user

4. The frontend catches the 409 Conflict error and displays a      confirmation prompt to the user comparing both versions:

    if (err.response?.status === 409 && errorData?.serverVersion) {
  const server = errorData.serverVersion;
  const client = errorData.clientVersion;

  const mergeOption = window.confirm(
    `Conflict Detected!...\nClick OK to OVERWRITE.\nClick Cancel to MERGE.`
  );
}

5. Two Options for User Resolution:

Option 1 – Overwrite
If the user clicks OK, the client re-sends the same update, knowingly replacing the server version.

Option 2 – Merge
If the user clicks Cancel, the app prompts them to manually enter a merged title and description using pre-filled suggestions from both versions. This merged version is then sent to the server.

3. Retry the Update
In either case, the new data is sent to the server again, and if accepted, the UI is updated accordingly.

