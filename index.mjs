import express, {response} from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import axios from "axios";

const PORT  = 4000

const app = express({
    cors: {
        origin: "*",
    },
});

let messages = {};

app.use(express.json());
const server = createServer(app);
const io = new Server(server, {
    cors: {
        origin: "*",
    },
});

app.get("/", (req, res) => {
    res.send("Hello, Express.js!");
});

app.post('/receive', (req, res) => {
    console.log("/receive")

    const message = req.body;
    console.log(message)

    if (message.error && messages[message.time]) {
        const [client, data] = messages[message.time];
        if (client) {
            client.emit("message", data);
        }
    }

    io.emit("message", req.body);

    res.send("Message received");

    delete messages[message.time];
});

io.on("connection", (socket) => {
    console.log("User connected", socket.id);

    socket.on("disconnect", () => {
        console.log("User disconnected", socket.id);
    });

    socket.on("message", async (message) => {
        console.log("New message", message);

        const data = JSON.parse(message)
        console.log(data)

        messages[data.time] = [socket, data]


        axios.post("http://127.0.0.1:8000/send/", data).catch(error => console.log(error.message))
    });
});



server.listen(PORT, () => {
    console.log("Server started on http://localhost:4000");
});