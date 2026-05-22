import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';

// Enable Tailwind dark mode
document.documentElement.classList.add('dark');
// Force RTL on root
document.documentElement.setAttribute('dir', 'rtl');
document.documentElement.setAttribute('lang', 'ar');

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
