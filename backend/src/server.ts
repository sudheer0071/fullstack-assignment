import express, { Request, Response } from 'express';
import mqtt, { MqttClient } from 'mqtt';
import http from 'http';
import { Server } from 'socket.io';
import { PrismaClient } from '@prisma/client';
import { sign } from 'jsonwebtoken';
import cors from 'cors';

const app = express();
const port = 3001;
const mqttBrokerUrl = 'mqtt://broker.emqx.io:1883';

const client: MqttClient = mqtt.connect(mqttBrokerUrl, {
  clientId: `mqtt_${Math.random().toString(16).slice(3)}`,
  clean: true,
  connectTimeout: 4000,
  username: 'emqx',
  password: 'public',
  reconnectPeriod: 1000,
});

const prisma = new PrismaClient();
app.use(cors({ origin: 'http://localhost:5173' }));
app.use(express.json());

// Store connected users in memory (for demonstration purposes)
let onlineUsers: { [userId: string]:
   { name: string| null;
     socketId: string,
      id:string ,
      img:string |null,  
    } } = {};



const server = http.createServer(app);
const io = new Server(server, {
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
  socket.on('user-online', async (userId: string) => {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (user) {
      onlineUsers[userId] = { name: user.name, socketId: socket.id, id:userId,img:user.img };
      console.log('Online Users:', onlineUsers);
      io.emit('online-users', Object.values(onlineUsers)); // Send updated list to all clients
    }
  }); 

  socket.on('subscribe-to-chat', (recipientId: string, currentUserId:string) => {
    const participants = [currentUserId, recipientId].sort();
     const topic = `/chat/${participants[0]}-${participants[1]}`;
    
    socket.join(topic);
    console.log(`User ${currentUserId} joined topic ${topic}`);
  });
  

  socket.on('send-message', (data) => {
    const { text, senderId, recipientId } = data; 
    console.log("message: ",text);
    console.log("sederId: ",senderId);
    console.log("recipientId: ",recipientId);  
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
app.post('/signup', async (req: Request, res: Response) => {
  const { email, name, password } = req.body;
  const user = await prisma.user.create({
    data: { email, name, password },
  });
  const token = sign({ id: user.id }, 'secret-key');
  res.json({ message: 'User created successfully', token:user.id });
});

// Signin Route
app.post('/signin', async (req: Request, res: Response) => {
  const { email, password } = req.body;
  console.log(email);
  console.log(password);
  
  const user = await prisma.user.findUnique({
    where: { email, password },
  });
  if (user) {
    const token = sign({ id: user.id }, 'secret-key');
    res.json({ message: 'User logged in', token:user.id, user });
  } else {
     res.json({message:"wrong credentials"}) 
  }
});

// Publish Message
app.post('/publish', (req: Request, res: Response) => {
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
app.post('/subscribe', (req: Request, res: Response) => {
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



app.get('/users', async (req, res) => {
   const users = await prisma.user.findMany()
   console.log("users");
   res.json({users})
   
});



server.listen(port, () => {
  console.log(`Server listening on http://localhost:${port}`);
});
