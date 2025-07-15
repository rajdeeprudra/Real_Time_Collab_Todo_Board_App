const http = require("http");
const app = require("./app");
const {Server} = require("socket.io");
const cors = require("cors");
const taskRoutes = require("./routes/taskRoutes");

const server = http.createServer(app);



const io = new Server(server, {
    cors: {
        origin: "http://localhost:5173",
        methods: ["GET", "POST", "PATCH","DELETE","PUT"],
        credentials:true,
    },
});

app.set("io",io);


io.on("connection", (socket)=>{
    console.log("A user connected",socket.id);

    socket.on("disconnect", ()=>{
        console.log("A user disconnected:", socket.id);
    });
});

const PORT = process.env.PORT || 5000;

server.listen(PORT, ()=>{
    console.log(`server running on port ${PORT}`);
});