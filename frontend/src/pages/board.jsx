import { useEffect, useState } from "react";
import axios from "axios";
import "../styles/board.css";
import ActivityLog from "../components/ActivityLog";
import TaskForm from "../components/TaskForm";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";

import socket from "../socket";

const columns = ["Todo", "In Progress", "Done"];



const Board = () => {
  const [tasks, setTasks] = useState([]);

  const fetchTasks = async () => {
    try {
      const res = await axios.get(`${import.meta.env.VITE_API_URL}/tasks`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      setTasks(res.data.tasks);
    } catch (err) {
      console.error("Fetch tasks failed:", err);
    }
  };

  useEffect(() => {
    fetchTasks();

    
    socket.on("taskCreated", (task)=>{
      setTasks((prev)=> [...prev,task]);
    });

    socket.on("taskUpdated", (updatedTask)=>{
      setTasks((prev)=> 
      prev.map((t)=> (t._id ===updatedTask._id ? updatedTask: t))
    );
    });

    socket.on("taskDeleted", (deleteId)=>{
      setTasks((prev)=> prev.filter((t)=> t._id !==deleteId));
    });

    return ()=>{
      socket.off("taskCreated");
      socket.off("taskUpdated");
      socket.off("taskDeleted");
  
    };


  }, []);

  const onDragEnd = (result) => {
    const { destination, source, draggableId } = result;
    if (!destination || destination.droppableId === source.droppableId) return;

    const taskId = draggableId;

    axios
      .patch(
        `${import.meta.env.VITE_API_URL}/tasks/drag/${taskId}`,
        { status: destination.droppableId },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      )
      .then(() => fetchTasks())
      .catch((err) => console.error("Drag update failed:", err));
  };

  const handleEdit = (task) => {
    const updatedTitle = prompt("Enter new title", task.title);
    if (!updatedTitle || updatedTitle === task.title) return;

    const updatedData = {
      title: updatedTitle,
      description: task.description,
      priority: task.priority,
      status: task.status,
      assignedTo: task.assignedTo?._id,
      updatedAt: task.updatedAt,
    };

    axios
      .put(`${import.meta.env.VITE_API_URL}/tasks/${task._id}`, updatedData, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
          "Content-Type": "application/json",
        },
      })
      .then(() => {
        fetchTasks();
      })
      .catch((err) => {
        const errorData = err.response?.data;

        if (err.response?.status === 409 && errorData?.serverVersion) {
          const server = errorData.serverVersion;
          const client = errorData.clientVersion;

          const mergeOption = window.confirm(
            `Conflict Detected!\n\nServer Version:\nTitle: ${server.title}\nDescription: ${server.description}\n\nYour Version:\nTitle: ${client.title}\nDescription: ${client.description}\n\nClick OK to OVERWRITE.\nClick Cancel to MERGE.`
          );

          if (mergeOption) {
            axios
              .put(`${import.meta.env.VITE_API_URL}/tasks/${task._id}`, updatedData, {
                headers: {
                  Authorization: `Bearer ${localStorage.getItem("token")}`,
                  "Content-Type": "application/json",
                },
              })
              .then(() => {
                alert("Overwritten successfully");
                fetchTasks();
              })
              .catch((err) =>
                alert("Failed to overwrite: " + (err.response?.data?.msg || err.message))
              );
          } else {
            const mergedTitle = prompt(
              "Enter merged title:",
              `${server.title}/${client.title}`
            );
            const mergedDesc = prompt(
              "Enter merged description:",
              `${server.description}/${client.description}`
            );
            if (!mergedTitle || !mergedDesc) return;

            const mergedData = {
              title: mergedTitle,
              description: mergedDesc,
              status: task.status,
              updatedAt: server.updatedAt,
            };

            axios
              .put(`${import.meta.env.VITE_API_URL}/tasks/${task._id}`, mergedData, {
                headers: {
                  Authorization: `Bearer ${localStorage.getItem("token")}`,
                  "Content-Type": "application/json",
                },
              })
              .then(() => {
                alert("Merged and saved");
                fetchTasks();
              })
              .catch((err) =>
                alert("Failed to merge: " + (err.response?.data?.msg || err.message))
              );
          }
        } else {
          const fallback =
            errorData?.msg || JSON.stringify(errorData) || err.message;
          alert("Edit failed: " + fallback);
        }
      });
  };

  const handleDelete = async (taskId) => {
    if (!window.confirm("Are you sure you want to delete this task?")) return;

    try {
      await axios.delete(`${import.meta.env.VITE_API_URL}/tasks/${taskId}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      fetchTasks();
    } catch (err) {
      alert(err.response?.data?.msg || "Delete failed");
    }
  };

  const handleSmartAssign = async (taskId) => {
    try {
      const res = await axios.patch(
        `${import.meta.env.VITE_API_URL}/tasks/${taskId}/smart-assign`,
        {},
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      alert(res.data.msg || "Smart assigned");
      fetchTasks();
    } catch (err) {
      console.error("Smart assign failed:", err);
      alert(err.response?.data?.msg || "Smart assign failed");
    }
  };

  return (
    <div className="board-wrapper">
      <div className="board-container">
        <h2>Collaborative Kanban Board</h2>
        <TaskForm onTaskCreated={fetchTasks} />

        <DragDropContext onDragEnd={onDragEnd}>
          <div className="columns">
            {columns.map((col) => (
              <Droppable droppableId={col} key={col}>
                {(provided) => (
                  <div
                    className="column"
                    {...provided.droppableProps}
                    ref={provided.innerRef}
                  >
                    <h3>{col}</h3>
                    {tasks
                      .filter((task) => task.status === col)
                      .map((task, index) => (
                        <Draggable
                          key={task._id}
                          draggableId={task._id}
                          index={index}
                        >
                          {(provided) => (
                            <div
                              className="task-card"
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                              ref={provided.innerRef}
                            >
                              <h4>{task.title}</h4>
                              <p>{task.description}</p>
                              <p>
                                <strong>Priority:</strong> {task.priority}
                              </p>
                              <p>
                                <strong>Created By:</strong>{" "}
                                {task.createdBy?.email || "Someone"}
                              </p>
                              <p>
                                <strong>Assigned To:</strong>{" "}
                                {task.assignedTo?.email || "Not Assigned"}
                              </p>
                              <div className="task-actions">
                                <button onClick={() => handleEdit(task)}>Edit</button>
                                <button onClick={() => handleDelete(task._id)}>
                                  Delete
                                </button>
                                <button onClick={() => handleSmartAssign(task._id)}>
                                  Smart Assign
                                </button>
                              </div>
                            </div>
                          )}
                        </Draggable>
                      ))}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            ))}
          </div>
        </DragDropContext>
      </div>

      <ActivityLog />
    </div>
  );
};

export default Board;
