# 🧠 Collaborative Kanban Task Board

A real-time, multi-user collaborative Kanban board built using the **MERN stack**. This application allows users to manage tasks across multiple statuses like Todo, In Progress, and Done. It supports live updates via WebSockets, smart task assignment based on user workload, conflict handling for concurrent edits, and activity tracking.

---

## 🚀 Project Overview

This project enables efficient team collaboration by:
- Allowing real-time task updates for all users
- Smartly assigning tasks based on workload
- Handling version conflicts during simultaneous edits
- Maintaining an activity log of the last 20 actions
- Ensuring secure user authentication and input validation

---

## 🛠️ Tech Stack


### Frontend
- **React.js**
- **Axios**
- **Socket.IO Client**
- **Hello Pangea DnD** (for drag-and-drop)
- **Vite** (for faster bundling)
- **CSS**

### Backend
- **Node.js**
- **Express.js**
- **MongoDB** with Mongoose
- **Zod** – for request body validation
- **bcryptjs** – for password hashing
- **JWT (JSON Web Tokens)** – for secure auth
- **Socket.IO Server**

---

## Setup & Installation

### Prerequisites:
- Node.js and npm
- MongoDB (local or cloud)
- `.env` file configured for backend

---

###  Backend Setup

In your terminal go to the project root 
cd backend
npm install

## Create a .env file inside the backend/ folder with the following:
PORT = 5000
MONGO_URL= "mongodb+srv://rajdeeprudra2003:XMSZJr2MfxvmmcqQ@cluster0.lb5ogju.mongodb.net/"
JWT_SECRET="mySecretKey123"

Then start the backend server:

nodemon server.js

###  Frontend Setup

cd frontend
npm install

## Create a .env file inside the frontend/ folder with:

VITE_API_URL=http://localhost:5000/api

## Then run the frontend:

npm run dev

----

## Features & Usage

# Features
Drag-and-drop Kanban columns (Todo, In Progress, Done)

Real-time updates via Socket.IO

Smart Assign – assigns task to the least-burdened user

Conflict Handling – handles simultaneous task edits

Activity Log – shows the latest 20 actions, updates live

Auth system with secure JWT tokens

Input validation using Zod

Password hashing with bcryptjs

# Usage Guide
Login / Register with your email and password.

Create a Task by filling in the task form.

Assign a User or use Smart Assign.

Drag Tasks between columns.

Edit Tasks – if a conflict is detected, you'll be prompted to overwrite or merge.

Delete Tasks – permanently remove a task.

View live updates and logs in the Activity Log panel.

-------

## Smart Assign Logic
The Smart Assign feature assigns a task to the user with the least number of currently assigned tasks of that user role (employee or NGO). This ensures fair workload distribution.

Steps:
When the "Smart Assign" button is clicked for a task, a request is sent to: PATCH /tasks/:id/smart-assign

All users are fetched from the database.

For each user, the number of tasks currently assigned to them is counted.

The user with the minimum number of tasks is identified.

The selected task is then assigned to that user.

Logging:

After assignment, the action is logged in the ActionLog model.

A real-time update is emitted to all connected clients via Socket.IO.

Fetch all users in the same role group.

----

## Conflict Handling Logic

Each task includes an updatedAt timestamp. On edit:

The client sends its last-known updatedAt.

The server compares it with the DB version.

If mismatched → sends 409 Conflict response with:

Server version

Client version

The frontend gives two options:

Overwrite – save the client version directly.

Merge – manually combine fields and save.

This ensures no one accidentally overwrites important updates.


