import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import React from 'react'
import Modal from 'react-modal';

Modal.setAppElement('#root');

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
//D:\AB Projects\StackNotes\frontend\src\main.jsx