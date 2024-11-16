"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const mqtt_1 = __importDefault(require("mqtt"));
const http_1 = __importDefault(require("http"));
const socket_io_1 = require("socket.io");
const client_1 = require("@prisma/client");
const jsonwebtoken_1 = require("jsonwebtoken");
const cors_1 = __importDefault(require("cors"));
const app = (0, express_1.default)();
const port = 3001;
const mqttBrokerUrl = 'mqtt://broker.emqx.io:1883';
const client = mqtt_1.default.connect(mqttBrokerUrl, {
    clientId: `mqtt_${Math.random().toString(16).slice(3)}`,
    clean: true,
    connectTimeout: 4000,
    username: 'emqx',
    password: 'public',
    reconnectPeriod: 1000,
});
const prisma = new client_1.PrismaClient();
app.use((0, cors_1.default)({ origin: 'http://localhost:5173' }));
app.use(express_1.default.json());
// Store connected users in memory (for demonstration purposes)
let onlineUsers = {};
const server = http_1.default.createServer(app);
const io = new socket_io_1.Server(server, {
    cors: {
        origin: 'http://localhost:5173',
        methods: ['GET', 'POST'],
    },
});
// MQTT Connect and Subscribe to General Topic
client.on('connect', () => {
    console.log('Connected to MQTT broker');
});
// Handle New WebSocket Connections
io.on('connection', (socket) => {
    console.log('New user connected:', socket.id);
    // When a user goes online, add them to the onlineUsers list
    socket.on('user-online', (userId) => __awaiter(void 0, void 0, void 0, function* () {
        const user = yield prisma.user.findUnique({ where: { id: userId } });
        if (user) {
            onlineUsers[userId] = { name: user.name, socketId: socket.id, id: userId, img: user.img };
            console.log('Online Users:', onlineUsers);
            io.emit('online-users', Object.values(onlineUsers)); // Send updated list to all clients
        }
    }));
    socket.on('subscribe-to-chat', (recipientId, currentUserId) => {
        const participants = [currentUserId, recipientId].sort();
        const topic = `/chat/${participants[0]}-${participants[1]}`;
        socket.join(topic);
        console.log(`User ${currentUserId} joined topic ${topic}`);
    });
    socket.on('send-message', (data) => {
        const { text, senderId, recipientId } = data;
        console.log("message: ", text);
        console.log("sederId: ", senderId);
        console.log("recipientId: ", recipientId);
        const participants = [senderId, recipientId].sort();
        const topic = `/chat/${participants[0]}-${participants[1]}`;
        const clients = io.sockets.adapter.rooms.get(topic);
        console.log("Clients in topic:", topic);
        // Emit the message only to the recipient
        socket.to(topic).emit('receive-message', data);
        console.log("Message emitted to the recipient:", data);
    });
    // Handle user disconnection 
    socket.on('disconnect', () => {
        for (const userId in onlineUsers) {
            if (onlineUsers[userId].socketId === socket.id) {
                delete onlineUsers[userId];
                console.log('Updated Online Users:', onlineUsers);
                io.emit('online-users', Object.values(onlineUsers)); // Send updated list to all clients
                break;
            }
        }
    });
});
// Signup Route
app.post('/signup', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { email, name, password } = req.body;
    const user = yield prisma.user.create({
        data: { email, name, password },
    });
    const token = (0, jsonwebtoken_1.sign)({ id: user.id }, 'secret-key');
    res.json({ message: 'User created successfully', token: user.id });
}));
// Signin Route
app.post('/signin', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { email, password } = req.body;
    console.log(email);
    console.log(password);
    const user = yield prisma.user.findUnique({
        where: { email, password },
    });
    if (user) {
        const token = (0, jsonwebtoken_1.sign)({ id: user.id }, 'secret-key');
        res.json({ message: 'User logged in', token: user.id, user });
    }
    else {
        res.json({ message: "wrong credentials" });
    }
}));
// Publish Message
app.post('/publish', (req, res) => {
    const { message, fromUserId, toUserId } = req.body;
    const messageObj = { text: message, fromUserId, toUserId };
    const topic = `/chat/${fromUserId}-${toUserId}`;
    // Publish message to MQTT topic
    client.publish(topic, JSON.stringify(messageObj), { retain: false }, (err) => {
        if (err) {
            console.error('Failed to publish message:', err);
            return res.status(500).send('Failed to publish message');
        }
        console.log('Message published:', messageObj);
        res.status(200).send('Message published');
    });
});
// Subscribe User-Specific Topics
app.post('/subscribe', (req, res) => {
    const { userId, otherUserId } = req.body;
    const topic = `/chat/${userId}-${otherUserId}`;
    client.subscribe(topic, (err) => {
        if (err) {
            return res.status(500).send('Failed to subscribe to topic');
        }
        console.log(`Subscribed to topic: ${topic}`);
        res.status(200).send(`Subscribed to topic: ${topic}`);
    });
});
app.get('/online-users', (req, res) => {
    res.json(Object.values(onlineUsers));
});
app.get('/users', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const users = yield prisma.user.findMany();
    console.log("users");
    res.json({ users });
}));
server.listen(port, () => {
    console.log(`Server listening on http://localhost:${port}`);
});
