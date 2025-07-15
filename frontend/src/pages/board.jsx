import { useEffect, useState } from "react";
import axios from "axios";
import "../styles/board.css";
import ActivityLog from "../components/ActivityLog";
import TaskForm from "../components/TaskForm";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";

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
    status: task.status,
    updatedAt: task.updatedAt,
  };

  console.log("📦 Data being sent to backend:", updatedData);

  axios
    .put(`${import.meta.env.VITE_API_URL}/tasks/${task._id}`, updatedData, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
        "Content-Type": "application/json",
      },
    })
    .then(() => {
      console.log("✅ Edit successful");
      fetchTasks();
    })
    .catch((err) => {
      const errorMsg =
        err.response?.data?.msg ||
        JSON.stringify(err.response?.data) ||
        err.message;
      console.error("❌ Edit failed:", errorMsg);
      alert("Edit failed: " + errorMsg);
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
    console.log("Task deleted successfully");
    fetchTasks();
  } catch (err) {
    console.error("❌ Delete failed:", err.response?.data || err.message);
    alert(err.response?.data?.msg || "Delete failed");
  }
};



  return (
    <div className="board-wrapper">
      <div className="board-container">
        <h2>🧠 Collaborative Kanban Board</h2>
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
                              <p className="creator">
                                <strong>Created By:</strong>{" "}
                                {task.createdBy?.name || "Someone"}
                              </p>
                              <div className="task-actions">
                                <button onClick={() => handleEdit(task)}>Edit</button>
                                <button onClick={() => handleDelete(task._id)} >Detete</button>
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

      {/* Right: Activity Log */}
      <ActivityLog />
    </div>
  );
};

export default Board;
