import React, { useEffect, useState } from 'react';
import { useRecoilState, useSetRecoilState } from 'recoil';
import io from 'socket.io-client';
import { messageState, onlineUserState, selectedUserState } from '../lib/atoms';
import { RightSection } from './ScreenSections/MainScreen/RightSection';
import { useRouteError } from 'react-router-dom';
import { LeftSection } from './ScreenSections/MainScreen/LeftSection';

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
const ChatApp = ({ currentUserId = localStorage.getItem('token') }: { currentUserId?: any | null }) => {
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

 
  return (
    <div>
     you are {localStorage.getItem('token')}
      <h1>Chat App</h1>
      <div style={{ display: 'flex' }}>
        {/* Online Users List */}
        {/* <div style={{ flex: 1, borderRight: '1px solid gray', padding: '10px' }}>
          <h2>Online Users</h2>
          <ul>
            {onlineUsers.map((user) => (
             user.id != currentUserId &&   <li
                key={user.id}
                onClick={() =>{  
                  handleUserSelect(user)
                }}
                style={{
                  cursor: 'pointer',
                  fontWeight: selectedUser?.id === user.id ? 'bold' : 'normal',
                }}
              >
                {user.name} 
              </li>
            ))}
          </ul>
        </div> */}

        {/* Chat Window */}
        <div className=' flex w-10/12 '>
        <div className=' w-1/3'>
        <LeftSection currentUserId={currentUserId} onlineUsers={onlineUsers} handleUserSelect={handleUserSelect} selectedUser={selectedUser} />
        </div>
        <div className=' w-1/2 h-[400px]'>
        <RightSection currentUserId={currentUserId} onlineUsers={onlineUsers} />
        </div>
        </div>
      </div>
    </div>
  );
};

export default ChatApp;
