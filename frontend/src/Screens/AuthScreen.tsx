import { Auth } from "../components/ScreenSections/AuthScreen/SignIn"

export const AuthScreen = ({path}:{path:any}) =>{
  return <div>
      <Auth type={path} />
  </div>
}