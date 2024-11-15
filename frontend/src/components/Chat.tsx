import React, { useEffect, useState } from 'react';
import io from 'socket.io-client';

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

const ChatApp = ({ currentUserId = localStorage.getItem('token') }: { currentUserId?: string | null }) => {
  const [onlineUsers, setOnlineUsers] = useState<User[]>([]);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [messageText, setMessageText] = useState('');

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

  const handleUserSelect = (user: User) => {
    setSelectedUser(user);
    // Subscribe to chat with the selected user
    socket.emit('subscribe-to-chat', user.id,currentUserId);
  };

  // Handle sending a message
  const sendMessage = () => {
    if (selectedUser && messageText.trim()) {
       
      const messageData = {
        text: messageText,
        senderId: currentUserId,
        recipientId: selectedUser.id,
      };

      // Emit the message to the server
      socket.emit('send-message', messageData);

      // Update the local message list to show the sent message
      setMessages((prevMessages) => [...prevMessages, messageData]);
      
      setMessageText(''); // Clear input
    }
  };

  return (
    <div>
     you are {localStorage.getItem('token')}
      <h1>Chat App</h1>
      <div style={{ display: 'flex' }}>
        {/* Online Users List */}
        <div style={{ flex: 1, borderRight: '1px solid gray', padding: '10px' }}>
          <h2>Online Users</h2>
          <ul>
            {onlineUsers.map((user) => (
             user.id != currentUserId &&   <li
                key={user.id}
                onClick={() => handleUserSelect(user)}
                style={{
                  cursor: 'pointer',
                  fontWeight: selectedUser?.id === user.id ? 'bold' : 'normal',
                }}
              >
                {user.name} 
              </li>
            ))}
          </ul>
        </div>

        {/* Chat Window */}
        <div style={{ flex: 3, padding: '10px' }}>
          {selectedUser ? (
            <>
              <h2>Chat with {selectedUser.name}</h2>

              {/* Messages Display */}
              <div
                style={{
                  border: '1px solid gray',
                  padding: '10px',
                  height: '300px',
                  overflowY: 'scroll',
                  marginBottom: '10px',
                }}
              >
                {messages 
                  .map((msg, index) => (
                    <div
                      key={index}
                      style={{
                        textAlign: msg.senderId == currentUserId ? 'right' : 'left',
                        marginBottom: '5px',
                      }}
                    >
                      <strong>{msg.senderId === currentUserId ? 'You' : selectedUser.name}:</strong>{' '}
                      {msg.text}
                    </div>
                  ))}
              </div>

              {/* Message Input */}
              <input
                type="text"
                value={messageText}
                onChange={(e) => setMessageText(e.target.value)}
                placeholder="Type a message..."
                style={{ width: '80%', marginRight: '10px' }}
              />
              <button onClick={sendMessage}>Send</button>
            </>
          ) : (
            <h2>Select a user to chat with</h2>
          )}
        </div>
      </div>
    </div>
  );
};

export default ChatApp;
