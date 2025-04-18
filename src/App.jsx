import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Contact from './pages/Contact';
import StudentLogin from './pages/StudentLogin';
import StaffLogin from './pages/StaffLogin';
import StudentDashboard from './pages/StudentDashboard';
import NotFound from './pages/NotFound';
import History from './pages/History';
import MyUpcomingsPage from './pages/MyUpcomingsPage';
import NewBooking from './pages/NewBooking';

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    // Check if user is logged in
    const userData = localStorage.getItem('user');
    if (userData) {
      setIsLoggedIn(true);
      setUser(JSON.parse(userData));
    }
  }, []);

  const handleLogin = (userData) => {
    setIsLoggedIn(true);
    setUser(userData);
  };

  const handleLogout = () => {
    localStorage.removeItem('user');
    setIsLoggedIn(false);
    setUser(null);
  };

  return (
    <Router>
      <div>
        <Navbar isLoggedIn={isLoggedIn} user={user} onLogout={handleLogout} />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/contact" element={<Contact />} />
          <Route 
            path="/login-student" 
            element={<StudentLogin onLogin={handleLogin} />} 
          />
          <Route 
            path="/login-staff" 
            element={<StaffLogin onLogin={handleLogin} />} 
          />
          <Route path="/dashboard" element={<StudentDashboard />} />
          <Route path="/history" element={<History />} />
          <Route path="/my-upcomings" element={<MyUpcomingsPage />} />
          <Route path="/new-booking" element={<NewBooking />} />
          <Route path="/page-not-found" element={<NotFound />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
