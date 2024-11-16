// src/index.js
import React from 'react';
import ReactDOM from 'react-dom';  // Change this import
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import { BrowserRouter } from 'react-router-dom';

ReactDOM.render(
    <React.StrictMode>
        <BrowserRouter>
            <App />
        </BrowserRouter>
    </React.StrictMode>,
    document.getElementById('root')  // Pass the root element directly
);

reportWebVitals();
