import { useEffect, useState } from "react";
import axios from "axios";
import "../styles/board.css";
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

    // Update task status in backend
    axios
      .patch(
        `${import.meta.env.VITE_API_URL}/tasks/${taskId}`,
        { status: destination.droppableId },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      )
      .then(() => {
        fetchTasks(); // re-fetch to update UI
      })
      .catch((err) => console.error("Drag update failed:", err));
  };

  return (
    <div className="board-container">
      <h2>🧠 Collaborative Kanban Board</h2>
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
                            <p><strong>Priority:</strong> {task.priority}</p>
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
  );
};

export default Board;
