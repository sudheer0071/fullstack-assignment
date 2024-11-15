import { useEffect, useState } from "react";
import { LeftSection } from "../components/ScreenSections/MainScreen/LeftSection"
import { RightSection } from "../components/ScreenSections/MainScreen/RightSection"
import { io, Socket } from 'socket.io-client';

import { messageState, selectedUserState } from "../lib/atoms";
import { useRecoilState } from "recoil";
import axios from "axios";


type User = {
  id: string;
  name: string;
};


type Message = {
  text: string;
  senderId: string;
  recipientId: string;
};


export const MainScreen = ({currentUserId = localStorage.getItem('token')}:{currentUserId?:any})=>{
  
  console.log(currentUserId);
  
  const [messages, setMessages] = useRecoilState<Message[]>(messageState); 
  const [onlineUsers, setOnlineUsers] = useState<User[]>([])  
  
  const socket: Socket = io('http://localhost:3001');

  useEffect(() => {
    // Notify the server that this user is online
    socket.emit('user-online', currentUserId);
    console.log("user online");
    
    // Listen for the updated list of online users
    socket.on('online-users', (users: User[]) => {
      console.log("oline user");
      setOnlineUsers(users.filter((user) => user.id !== currentUserId));
    });

    // Listen for incoming messages
    console.log("recieving message: ");
    socket.on('receive-message', (data: Message) => {
      console.log("received ");
      setMessages((prevMessages) => [...prevMessages, data]);
    });

    return () => {
      socket.disconnect();
    };
  }, [currentUserId]);

  return <div className="bg-bg-0 font-roboto">
   <div className=" containers flex gap-x-10 h-screen">
    {/* list of online users */}
    <div className=" w-[30%] ">
          <LeftSection currentUserId={currentUserId} onlineUsers={onlineUsers}  />
    </div>

    {/* chat area */}
    <div className=" w-[70%] ">
          <RightSection currentUserId={currentUserId} onlineUsers={onlineUsers}/>
    </div>
  </div>
  </div>
}



 