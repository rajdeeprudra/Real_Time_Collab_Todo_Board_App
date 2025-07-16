import { useEffect, useState } from "react";
import axios from "axios";
import "../styles/taskForm.css";
import { Fetch } from "socket.io-client";

const TaskForm = ({ onTaskCreated }) => {
  const [form, setForm] = useState({
    title: "",
    description: "",
    priority: "Low",
    assignedTo: "",
  });

  const [msg, setMsg] = useState("");
  const [users, setUsers] = useState([]);

  useEffect(()=>{
    const fetchUsers = async()=>{
      try{
        const res = await axios.get(`${import.meta.env.VITE_API_URL}/user`,{
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });
        setUsers(res.data.users);
        console.log("users fetched:", res.data.user);
      }catch(err){
        console.error("Failed to fetch users:",err);
      }
    };
    fetchUsers();
  },[]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post(
        `${import.meta.env.VITE_API_URL}/tasks`,
        form,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      setMsg("Task created!");
      setForm({ title: "", description: "", priority: "Low" });
      onTaskCreated(); 
    } catch (err) {
      setMsg(err.response?.data?.msg || "Failed to create task");
    }
  };

  return (
    <form className="task-form" onSubmit={handleSubmit}>
      <h3>Create New Task</h3>

      <input
        name="title"
        placeholder="Task Title"
        value={form.title}
        onChange={handleChange}
        required
      />

      <textarea
        name="description"
        placeholder="Description"
        value={form.description}
        onChange={handleChange}
        required
      />

      <select name="priority" value={form.priority} onChange={handleChange}>
        <option>Low</option>
        <option>Medium</option>
        <option>High</option>
      </select>

      <select name="assignedTo" value={form.assignedTo} onChange={handleChange}>
        <option value="">Assign To</option>
        {users.map((user) => (
          <option key={user._id} value={user._id}>
            {user.username || user.email || user._id}
          </option>
        ))}
      </select>

      <button type="submit">Create Task</button>
      <p>{msg}</p>
    </form>
  );
};

export default TaskForm;
