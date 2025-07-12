import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowseRouter, Routes, ROute } from "react-router-dom";
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import Login from './pages/login.jsx';
import Register from './pages/register.jsx';

ReactDom.createRoot(document.getElementById('root')).render(
  <BrowseRouter>
    <Routes>
      <Route path = "/" element = {<App/>}/>
      <Route path = "/login" element = {<Login/>}/>
      <Route path = "/register" element = {<Register/>}/>
    </Routes>
  </BrowseRouter>
);
