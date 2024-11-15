import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import  { MainScreen } from '../Screens/MainScreen';
import { AuthScreen } from '../Screens/AuthScreen';
import ChatApp from '../components/Chat';

const AppRouter = () => {
  return (
    <Router future={{
      v7_startTransition: true,
      v7_relativeSplatPath:true,
    }} 
    
    >
      <Routes>
        <Route path='/chat' element={<MainScreen />} />
        <Route path='/signup' element={<AuthScreen path='signup' />} />
        <Route path='/signin' element={<AuthScreen path='signin' />} />
      </Routes>
    </Router>
  );
};

export default AppRouter;