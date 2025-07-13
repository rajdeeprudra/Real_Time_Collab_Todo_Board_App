import { useEffect, useState } from "react";
import axios from "axios";
import io from "socket.io-client";

const socket = io(import.meta.env.VITE_API_URL);

const ActivityLog = () => {
  const [logs, setLogs] = useState([]);

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get(`${import.meta.env.VITE_API_URL}/actions/logs`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setLogs(res.data.logs);
      } catch (err) {
        console.error("Failed to fetch logs", err);
      }
    };

    fetchLogs();

    socket.on("new_action", (action) => {
      setLogs((prev) => [action, ...prev.slice(0, 19)]);
    });

    return () => socket.off("new_action");
  }, []);

  return (
    <div className="activity-log">
      <h3>Activity Log</h3>
      <ul>
        {logs.map((log, index) => (
          <li key={index}>
            <strong>{log.user}</strong> {log.actionType} task "<strong>{log.taskTitle}</strong>" at {new Date(log.timestamp).toLocaleTimeString()}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ActivityLog;
