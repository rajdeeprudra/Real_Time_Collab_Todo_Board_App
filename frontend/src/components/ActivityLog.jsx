import { useEffect, useState } from "react";
import axios from "axios";
//import { io } from "socket.io-client";
import socket from "../socket";

// const socket = io(import.meta.env.VITE_API_URL, {
//   transports:["websocket"],
//   withCredentials: true,
// });

const ActivityLog = () => {
  const [logs, setLogs] = useState([]);

  const fetchLogs = async () => {
    try {
      const res = await axios.get(
        `${import.meta.env.VITE_API_URL}/actions/logs`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      setLogs(res.data.logs);
    } catch (err) {
      console.error("❌ Failed to fetch logs", err);
    }
  };

  useEffect(() => {
    fetchLogs();

    socket.on("taskCreated", fetchLogs);
    socket.on("taskUpdated", fetchLogs);
    socket.on("taskDeleted", fetchLogs);
    socket.on("taskSmartAssigned", fetchLogs);
    socket.on("taskDragged", fetchLogs);

    return () => {
      socket.off("taskCreated", fetchLogs);
      socket.off("taskUpdated", fetchLogs);
      socket.off("taskDeleted", fetchLogs);
      socket.off("taskSmartAssigned", fetchLogs);
      socket.off("taskDragged", fetchLogs);
    };
  }, []);

  return (
    <div className="activity-log">
      <h3>Activity Log</h3>
      <ul>
        {logs.map((log) => (
          <li key={log._id}>
            <strong>{log.performedBy?.username || "Someone"}</strong> {log.message}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ActivityLog;
