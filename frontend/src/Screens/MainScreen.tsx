import { useEffect, useState } from "react";
import { LeftSection } from "../components/ScreenSections/MainScreen/LeftSection"
import { RightSection } from "../components/ScreenSections/MainScreen/RightSection"
import { io, Socket } from 'socket.io-client';

import { messageState, onlineUserState, selectedUserState } from "../lib/atoms";
import { useRecoilState } from "recoil";
import axios from "axios";

const socket = io('http://localhost:3001'); // Replace with your backend URL

type User = {
  id: string;
  name: string;
};


type Message = {
  text: string;
  senderId: string;
  recipientId: string;
};

type ChatMessages = {
  [chatId: string]: Message[];
};

export const MainScreen = ({currentUserId = localStorage.getItem('token')}:{currentUserId?:any})=>{
  const [chatMessages, setChatMessages] = useState<ChatMessages>({});

  const [onlineUsers, setOnlineUsers] = useRecoilState<User[]>(onlineUserState);
  const [selectedUser, setSelectedUser] = useRecoilState<User | null>(selectedUserState);
  const [messages, setMessages] = useRecoilState<Message[]>(messageState); 

  const getChatId = (user1Id: string, user2Id: string) => {
    return [user1Id, user2Id].sort().join('-');
  };


  useEffect(() => {
    // Notify the server that this user is online
    socket.emit('user-online', currentUserId);
    console.log("user online");
    
    // Listen for the updated list of online users
    socket.on('online-users', (users: User[]) => {
      console.log("oline user");
      setOnlineUsers(users.filter((user) => user.id !== currentUserId));
    });
    socket.on('receive-message', (data: Message) => {
      const chatId = getChatId(data.senderId, data.recipientId)
      setChatMessages(prevMessages => ({
        ...prevMessages,
        [chatId]: [...(prevMessages[chatId] || []), data]
      }));
    });

    return () => {
      socket.disconnect();
    };
  }, [currentUserId]);

  const handleUserSelect = (user:{name:string,id:string,socketId:string}) => {
    console.log("clicked user");
    
    console.log(user);  
    setSelectedUser(user);
    // Subscribe to chat with the selected user
    socket.emit('subscribe-to-chat', user.id,currentUserId);

    const chatId = getChatId(currentUserId, user.id);
    if (!chatMessages[chatId]) {
      setChatMessages(prev => ({
        ...prev,
        [chatId]: []
      }));
    }
  };

  const getCurrentChatMessages = () => {
    if (!selectedUser) return [];
    const chatId = getChatId(currentUserId, selectedUser.id);
    return chatMessages[chatId] || [];
  };


  return <div className="bg-bg-0 font-roboto">
   <div className=" containers flex gap-x-10 h-screen">
    {/* list of online users */}
    <div className=" w-[30%] ">
    <LeftSection currentUserId={currentUserId} onlineUsers={onlineUsers} handleUserSelect={handleUserSelect} selectedUser={selectedUser} />
    </div>

    {/* chat area */}
    <div className=" w-[70%] ">
          <RightSection currentUserId={currentUserId} onlineUsers={onlineUsers} messages={getCurrentChatMessages()} />
    </div>
  </div>
  </div>
}



 