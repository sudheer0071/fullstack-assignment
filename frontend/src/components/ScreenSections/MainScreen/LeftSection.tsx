import { Container, EllipsisVertical } from "lucide-react"
import { UserSvg } from "../../../../public/UserSvg"
import { useEffect, useState } from "react"
import { useRecoilState } from "recoil";
import { selectedUserState } from "../../../lib/atoms";
import axios from "axios";
import io from 'socket.io-client'

const socket = io('http://localhost:3001'); 

interface onlineUsersProp{
  id: string;
  name: string; 
  img?:string |any, 
  message?:string | any,
  time?:Date | any,
  pending?:string | any,
}
 
type User = {
  id: string;
  name: string;
};


export const LeftSection = ({onlineUsers, currentUserId}:{onlineUsers:onlineUsersProp[], currentUserId:string}) => {
  const [allUsers,setAllUsers] = useState<onlineUsersProp[]>([])

  useEffect(()=>{
    const fetchAllUsers = async ()=>{
      const response = await axios.get('http://localhost:3001/users')
      const res = await response.data;
      setAllUsers(res.users)
    }
    fetchAllUsers()
  },[])
  

  console.log("Online Users:", onlineUsers);
  const contacts = [
    {
      img: " https://media-del2-1.cdn.whatsapp.net/v/t61.24694-24/456055432_529059559957705_8197568754683326626_n.jpg?ccb=11-4&oh=01_Q5AaIFyPo6gqRLUO_vsH2oW3XvHQdNf4ieVLsGV8tiqa2_qd&oe=6741DF1E&_nc_sid=5e03e0&_nc_cat=101",
      name: "Alice",
      message: "Just finished the project!",
      time: "Today, 1:20pm",
      pending: "2"
    },
    {
      img: "",
      name: "Bob",
      message: "Can we reschedule our meeting?",
      time: "Yesterday, 10:15am",
      pending: "1"
    },
    {
      img: "",
      name: "Charlie",
      message: "I'll be there in 5 minutes",
      time: "Today, 4:05pm",
      pending: "4"
    },
    {
      img: "",
      name: "Charlie",
      message: "I'll be there in 5 minutes",
      time: "Today, 4:05pm",
      pending: "4"
    },
    {
      img: "",
      name: "Charlie",
      message: "I'll be there in 5 minutes",
      time: "Today, 4:05pm",
      pending: "4"
    },
    {
      img: "",
      name: "Charlie",
      message: "I'll be there in 5 minutes",
      time: "Today, 4:05pm",
      pending: "4"
    },
    {
      img: " https://media-del2-1.cdn.whatsapp.net/v/t61.24694-24/456055432_529059559957705_8197568754683326626_n.jpg?ccb=11-4&oh=01_Q5AaIFyPo6gqRLUO_vsH2oW3XvHQdNf4ieVLsGV8tiqa2_qd&oe=6741DF1E&_nc_sid=5e03e0&_nc_cat=101",
      name: "Diana",
      message: "Let's catch up later!",
      time: "Yesterday, 6:45pm",
      pending: "0"
    },
    {
      img: "",
      name: "Eve",
      message: "Check out the new update!",
      time: "Today, 11:30am",
      pending: "3"
    },
    {
      img: " https://media-del2-1.cdn.whatsapp.net/v/t61.24694-24/456055432_529059559957705_8197568754683326626_n.jpg?ccb=11-4&oh=01_Q5AaIFyPo6gqRLUO_vsH2oW3XvHQdNf4ieVLsGV8tiqa2_qd&oe=6741DF1E&_nc_sid=5e03e0&_nc_cat=101",
      name: "Frank",
      message: "Don't forget about the deadline",
      time: "Today, 2:10pm",
      pending: "1"
    },
    {
      img: "",
      name: "Grace",
      message: "Meeting in 10 minutes",
      time: "Today, 3:35pm",
      pending: "5"
    }

  ]
  
  return (
    <section className="relative border-2 h-full max-h-[100vh] rounded-[25px]  shadow-md shadow-[#79C5EF] bg-white flex  flex-col">
      <div id="TOP" className="flex justify-start z-10 p-5">
        <div className="bg-white py-2">
          <h2 className="text-2xl font-bold">People</h2>
        </div>
      </div>
  
      <div className="relative flex-grow overflow-y-auto">
        <div className="flex flex-col space--4">
        {allUsers.map((contact) => (
  <ContactCard
    currentUserId={currentUserId}
    onlineusers={onlineUsers}
    key={contact.id} // Use a unique key for each item
    id={contact.id}
    name={contact.name}
    message={contact.message || ''} // Provide defaults if needed
    time={contact.time || ''}
    pending={contact.pending || '0'}
    img={contact.img || ''}
  />
))}
   </div>
      </div>
    </section>
  );
  
}
const ContactCard = ({
  currentUserId,
  onlineusers,
  id,
  img = '',
  name = 'Unknown User',
  message = '',
  time = '00:00',
  pending = '0',
}: {
  currentUserId:string,
  onlineusers:onlineUsersProp[]
  id: string;
  img?: string;
  name: string;
  message: string;
  time: string;
  pending: string;
}) => {
  const [selectedUser, setSelectedUser] = useRecoilState(selectedUserState);
  
  
  const isOnline = onlineusers.some((onlineUser)=> onlineUser.id == id)
  
  const handleUserClick = () => {
    const currentUser = { name, id };  
    socket.emit('subscribe-to-chat', id,currentUserId);

    setSelectedUser(currentUser);  // Update the selected user state
  };

  return ( currentUserId != id &&
    <div
      onClick={handleUserClick}
      className={`flex justify-between border-b-2 pb-2 w-full items-center hover:bg-purple-300 transition-all duration-300 cursor-pointer px-5 py-3 ${selectedUser.id == id?"  bg-purple-300":""} `}
    >
      {/* User info rendering */}
      <div className="flex items-center gap-x-3 w-full">
        <div>
          {img ? (
            <img src={img} className="w-[40px] object-cover rounded-full" alt={name} />
          ) : (
            <UserSvg className="w-[38px]" />
          )}
        </div>
        <div>
          <h3 className={`${pending !== '0' ? 'font-semibold' : 'font-medium'} text-lg flex items-center`}>{name} {isOnline && <span className="bg-green-500 inline-block w-[7px] rounded-[100%] h-[7px] ml-1 "></span>} </h3>
          <p className={`${pending !== '0' ? 'font-semibold' : ''} text-gray-500 -mt-1 text-sm truncate max-w-[196px]`}>
            {message}  
           { isOnline && <small className="">online</small>}
          </p>
        </div>
      </div>
      <div className="w-6/12 flex justify-end flex-col items-end gap-1">
        <p className="text-gray-500 -mt-1 text-sm">{time}</p>
        {pending !== '0' && (
          <span className="p-[3px] px-2 rounded-full bg-[#F24E1E] text-white text-xs font-bold">
            {pending}
          </span>
        )}
      </div>
    </div>
  );
};
