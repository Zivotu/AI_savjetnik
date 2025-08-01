// src/main.tsx
import React from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'               // ← OBAVEZNO da bi sve Tailwind i CSS radilo

createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)
