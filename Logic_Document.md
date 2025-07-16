### Logic Document

## Smart Assign - Implementation Logic
Smart Assign is designed to automatically assign the most suitable user to a newly created task based on their current workload. The goal is to distribute tasks evenly across users to avoid overloading any single person.

# How it works:

Fetch All Users: When a task is created, the backend fetches the list of all available users.

Track Task Counts: For each user, we count the number of tasks currently assigned to them.

Find Least Busy User: We identify the user(s) with the least number of tasks.

Assign Automatically: The task is assigned to one of these least-burdened users (either the first found or randomly among least busy).

This ensures a fair distribution of tasks and avoids manual assignment.

## Conflict Handling - How It Works
Conflict handling ensures that when multiple users are editing the same task at the same time, changes don’t get accidentally overwritten or lost.

# How it works:

Last Updated Timestamp: Every task has a lastUpdated timestamp field.

When a User Edits:

Before submitting changes, the client fetches the latest lastUpdated value.

The server compares this with the lastUpdated currently in the database.

If Timestamps Match:

No conflict – safe to update.

If Timestamps Don’t Match:

Conflict detected – this means someone else updated the task after the user began editing.

Conflict Resolution:

Option 1: Alert the user
Server returns a 409 Conflict response, and the frontend shows a message like:

“This task was updated by another user. Please refresh to get the latest version.”

Option 2: Offer Merge (optional)
Show a diff and allow the user to merge their changes with the latest version.

Example Scenario
User A and User B open Task 101 at the same time.

User A changes the title and submits.

Server accepts the update and updates the lastUpdated field.

User B also submits changes (without refreshing).

Server detects timestamp mismatch and responds with a conflict.

User B sees a message prompting them to refresh.