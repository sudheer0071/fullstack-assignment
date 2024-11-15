import atoms, { atom } from 'recoil'

export const selectedUserState:any = atom({
  key:"selectedUser",
  default:[]
})


export const onlineUserState:any = atom({
  key:"onlineUser",
  default:[]
})


export const messageState:any = atom({
  key:"message",
  default:[]
})

