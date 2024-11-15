import { ChangeEvent, useState } from "react";
import { Link, useNavigate } from "react-router-dom" 
import axios from 'axios'  
import { Loader } from "../../Common/Loader";
import {toast, Toaster} from 'sonner'


export const Auth = ({type}:{type:"signup"| "signin"}) =>{ 
const [loader, setLoader] = useState(false)

  const [postInputs, setPostInputs] = useState({
    name:'',
    email:'',
    password:''
  })
const navigate = useNavigate()
  async function sendRequest(){
    console.log(postInputs.name, postInputs.email, postInputs.password);
    if (postInputs.email==''||postInputs.password=='') {
      toast.warning("Please Enter all feilds")
    }
    
    else{
      setLoader(true) 
      const toastRef = toast.loading("Fetching Details")
      const res = await axios.post(`http://localhost:3001/${type=='signin'?'signin':'signup'}`,{
       name:postInputs.name,
       email:postInputs.email,
       password:postInputs.password
      })
      const token = res.data.token
      const message = res.data.message 
      localStorage.setItem('name', type=='signin'?res.data.name:postInputs.name) 
      localStorage.setItem('token',token)
      if (message.includes('wrong')||message.includes('found')||message.includes('wrong')) {
         setLoader(false)
         toast.dismiss()
         toast.error(message)
         setPostInputs({name:' ',email:' ',password:' '})
        }
        else{ 
          setLoader(false) 
          toast.dismiss(toastRef)
          toast.success(message)
          navigate('/chat') 
      }
      }  
  }
 return <div className="">
  <div>
    <div className=" flex justify-center"> 
    </div>
      <Toaster richColors />
    </div>
  <div className=" mt-32 flex justify-center flex-col overflow-y-hidden"> 
<div className="flex justify-center">
  <div>
 <div className=" text-3xl font-bold text-secondary text-center">
 Create an account <br /><br />
 </div>
 <div className=" w-80 sm:w-96">
  {type=='signup'?
  <InputBox onChange={(e)=>{setPostInputs({
    ...postInputs,
    name:e.target.value
  })}} label="Username" placeholder='Enter your username'/>:null}
  
  <InputBox onChange={(e)=>{setPostInputs({
    ...postInputs,
    email:e.target.value
  })}} label="Email" placeholder='m@example.com'/>
  <InputBox onChange={(e)=>{setPostInputs({
    ...postInputs,
    password:e.target.value
  })}}  
  onKeyPress={(e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      sendRequest();
    }
  }}
   label="Password" placeholder='Must be more than 5 character' password=' '/>
  <Button onclick={sendRequest} label={type=='signin'?'Sign In':'Sign Up'} height={1} loader={loader}/>
 </div>
 <div className=" text-gray-400 text-center"> 
  {type=="signin"?('No Account?'):'Alreedy have and account?'}
  <Link className=" pl-2 underline" to={type=='signin'?'/signup':'/signin'}>{type=='signin'?'Sign Up':'Log In'}</Link>
 </div>
  </div> 
</div>
 </div>
 </div>
}

interface LabeledInputType {
  placeholder:string;
  label:string;
  onChange:(e:ChangeEvent<HTMLInputElement>)=>void;
  password?:string;  
  empty?:"";
  onKeyPress?:any
}
export function InputBox({onKeyPress,placeholder, label, onChange, password,  empty}:LabeledInputType){     
  // console.log("label: "+empty);   
  return <div className=" py-3"> 
      <div className="text-md font-semibold text-left py-1 ">
        {label}
      </div>
      <input onChange={onChange } onKeyDown={onKeyPress} className={`${empty?'error':''} w-full h-10 px-2 border rounded font-medium border-slate-200 py-1 bg-white border-1`} type={password?'password':"text"} placeholder={placeholder} />
  </div>
}
type props = {
  onclick:any,
  label:String,
  loader:boolean,
  height:number
}

export function Button({height=2,onclick, label, loader}:props){
   
  return <div className="py-4">
    <button className={`loader h-${height} bg-primary text-slate-100 py-2 px-3 rounded-md w-full h-10 focus:outline-none focus:ring-4 focus:ring-gray-300 hover:bg-purple-950 transition-all duration-300 `} onClick={onclick}>{loader? 
    <Loader/> 
    : label} 
    </button> 
  </div>
}