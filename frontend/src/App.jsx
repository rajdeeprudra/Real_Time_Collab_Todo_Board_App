import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import { Routes, Route, Navigate } from 'react-router-dom';
import Register from './pages/register';
import Login from "./pages/login";
import Board from "./pages/board";


function App() {

  const token = localStorage.getItem("token");

  
  return (
    
      <div>
        <h1>Collaborative Real-Time To-Do Board</h1>
        <Routes>
          <Route path="/" element={<Navigate to={token ? "/board" : "/register"} />} />
          <Route path='/register' element = {<Register/>}/>
          <Route path="/login" element={<Login />} />
          <Route path="/board" element={<Board />} />
        </Routes>
      </div>
    
  );
}

export default App
