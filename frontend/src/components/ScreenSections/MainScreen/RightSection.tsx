import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { io, Socket } from 'socket.io-client';
import {ChatSvgSend} from '../../../../public/ChatSvgSend'
import {ChatSvgRecieve} from '../../../../public/ChatSvgRecieve'
import {EllipsisVertical, Send} from 'lucide-react'
import { messageState, onlineUserState, selectedUserState } from '../../../lib/atoms';
import { useRecoilState } from 'recoil';
import { useRouteError } from 'react-router-dom';


type User = {
  id: string;
  name: string;
};


type Message = {
  text: string;
  senderId: string;
  recipientId: string;
};


interface onlineUsersProp{
  id: string;
  name: string; 
  img?:string |any, 
  message?:string | any,
  time?:Date | any,
  pending?:string | any,
}

const socket: Socket = io('http://localhost:3001'); 

export const RightSection = ({
  currentUserId,
  onlineUsers,
  messages // Add this prop
}: {
  currentUserId: string,
  onlineUsers: onlineUsersProp[],
  messages: Message[] // Add this type
}) => {
  const [selectedUser, setSelectedUser] = useRecoilState<User>(selectedUserState);
  // Remove the global messages state since we'll use the prop
  const [input, setInput] = useState<string>('');

  const formatTime = () => {
    const now = new Date();
    const hours = now.getHours();
    const minutes = now.getMinutes();
    const ampm = hours >= 12 ? 'pm' : 'am';
    const formattedHours = hours % 12 || 12;
    const formattedMinutes = minutes < 10 ? `0${minutes}` : minutes;
    return `${formattedHours}:${formattedMinutes} ${ampm}`;
  };

  const sendMessage = () => {
    if (selectedUser && input.trim()) {
      const messageData = {
        text: input,
        senderId: currentUserId,
        recipientId: selectedUser.id,
      };

      socket.emit('send-message', messageData);
      setInput('');
    }
  };

  const online = onlineUsers.some((onlineUser) => onlineUser.id === selectedUser?.id);


  return (
   selectedUser.id && selectedUser.name && <section className=" relative shadow-md shadow-[#79C5EF] rounded-[25px] bg-white border-2 p-4 h-full">
      <div className=' h-full'> 
           <div className=' flex justify-between border-b-2 pb-2 w-full items-center'> 
            <div className=' flex items-center gap-x-3 w-full'>
              <div>
                <img src=" https://media-del2-1.cdn.whatsapp.net/v/t61.24694-24/456055432_529059559957705_8197568754683326626_n.jpg?ccb=11-4&oh=01_Q5AaIFyPo6gqRLUO_vsH2oW3XvHQdNf4ieVLsGV8tiqa2_qd&oe=6741DF1E&_nc_sid=5e03e0&_nc_cat=101" className=' w-[50px] bg-purple-300 object-cover rounded-full' alt="" />
              </div>
              <div>
                 <h3 className=' font-semibold text-xl'>{selectedUser.name}</h3>
                 <p className=' text-gray-500 -mt-1'> {online?"online":"offline"}</p>
              </div>
            </div>
            <div className=''>
              <EllipsisVertical className=' transition-all duration-300 hover:rotate-180 text-secondary'/>
            </div>
            <div>

            </div>
        </div> 
      <div className=" relative flex-grow flex-shrink basis-0 h-[90%] rounded-md p-2  overflow-y-auto pb-12">
        <div className=' space-y-3 mb-5'>
        {messages.map((msg, index) => online &&  (
          msg.senderId == currentUserId  ?
          <div className=' relative '>  
              <span className=' absolute right-0 top-[5px]  '>
                <ChatSvgSend className=" text-primary fill-[#6E00FF] " />
              </span> 
            <div className=' relative flex justify-end'>
              <div
                key={index}
                className=" send text-lg rounded-tl-none bg-primary text-white py-4 px-4"
              >
              <p className=' text-left'>{msg.text}</p>  
              </div>
            </div>
            <div className=' flex justify-end'>
              <p className=' text-gray-500 -mt-1 text-xs mr-2'>Today, {formatTime()}</p>
            </div>
          </div>
            :

            <div className='  relative '>
            <span className=' absolute left-0 top-[5px]  '>
                <ChatSvgRecieve className=" text-[#c9c6c6]" />
              </span> 
            <div className=' flex justify-start'>
              <div
                key={index}
                className=" recieve bg-[#c9c6c6]  py-4 px-4 text-lg "
              >
               <p  className=' text-left'>{msg.text}</p> 
              </div>
            </div>
            <div className=' flex justify-start'>
              <p className=' text-gray-500 -mt-1 text-xs ml-2'>Today, {formatTime()}</p>
            </div>
            </div>
        ))}
        </div>
      </div>
      <div className=' bg-white absolute bottom-5 flex gap-4 w-full items-center mt-5 right-0 left-0 px-6 '>
      <div className=' w-full'>

      <input
        type="text"
        value={input}
        onKeyDown={(e)=>{
          if(e.key == "Enter"){
            sendMessage()
          }
          }
          }
        onChange={(e) => setInput(e.target.value)}
        placeholder="Type a message"
        className=' p-3 w-full focus-within:outline-none bg-bg-0 rounded-[15px] placeholder:text-gray-500'
        />
        </div>
        <div >
      <button onClick={()=>sendMessage()} className= 'group bg-primary rounded-[20px] p-[12px] border-2 shadow-md'> <Send className=' text-white transition-all duration-300 group-hover:rotate-45 ' /> </button>
        </div>
      </div>
      </div>
    </section>
  );
};

