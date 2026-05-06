import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Auth from './components/Auth';
import Dashboard from './components/Dashboard';
import './index.css';

function App() {
  const [auth, setAuth] = useState(null);

  // 🔥 AUTO-LOGIN ON REFRESH
  useEffect(() => {
    const token = localStorage.getItem("token");
    const user = localStorage.getItem("user");

    if (token && user) {
      setAuth(JSON.parse(user));
    }
  }, []);

  return (
    <Router>
      <Routes>
        <Route
          path="/"
          element={!auth ? <Auth setAuth={setAuth} /> : <Navigate to="/dashboard" />}
        />

        <Route
          path="/dashboard"
          element={
            auth
              ? <Dashboard auth={auth} setAuth={setAuth} />
              : <Navigate to="/" />
          }
        />
      </Routes>
    </Router>
  );
}

export default App;