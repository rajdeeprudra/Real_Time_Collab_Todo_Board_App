import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import { Routes, Route } from 'react-router-dom';
import Register from './pages/register';
import Login from "./pages/login";
//import Board from "./pages/board";


function App() {
  
  return (
    
      <div>
        <h1>Collaborative Real-Time To-Do Board</h1>
        <Routes>
          <Route path='/register' element = {<Register/>}/>
          <Route path="/login" element={<Login />} />
        </Routes>
      </div>
    
  );
}

export default App
