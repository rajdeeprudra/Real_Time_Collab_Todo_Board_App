const http = require("http");
const app = require("./app");
const {server} = require("socket.io");

const server = http.createServer(app);

//socket.io server
const io = new Server(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST", "PATCH","DELETE","PUT"],
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