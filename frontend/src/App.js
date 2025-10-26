// src/App.js
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

// Import our components and pages
import Navbar from './components/Navbar';
import DataEntryPage from './pages/DataEntryPage';
import DashboardPage from './pages/DashboardPage';

// Import a simple CSS file for overall layout
import './App.css';

function App() {
  return (
    <Router>
      <div className="App">
        <Navbar />
        <main className="container">
          <Routes>
            {/* Route for the Data Entry page (homepage) */}
            <Route path="/" element={<DataEntryPage />} />
            
            {/* Route for the Dashboard page */}
            <Route path="/dashboard" element={<DashboardPage />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;