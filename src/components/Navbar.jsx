import { Link, useNavigate, useLocation } from 'react-router-dom';
import styles from './Navbar.module.css';
import logo from '../assets/logo.svg';

const Navbar = ({ isLoggedIn, user, onLogout }) => {
  const navigate = useNavigate();
  const location = useLocation();
  
  const handleLogout = () => {
    onLogout();
    navigate('/');
  };

  const isActive = (path) => {
    return location.pathname === path ? styles.active : '';
  };

  return (
    <nav className={styles.navbar}>
      <div className={styles.logo}>
        <Link to={isLoggedIn ? '/dashboard' : '/'}>
          <img src={logo} alt="BK Logo" />
        </Link>
        <h1>S3 - MRS</h1>
      </div>
      
      <div className={styles.navLinks}>
        {!isLoggedIn ? (
          <>
            <Link to="/" className={`${styles.navLink} ${isActive('/')}`}>
              Home
            </Link>
            <Link to="/contact" className={`${styles.navLink} ${isActive('/contact')}`}>
              Contact
            </Link>
            <div className={styles.loginButtons}>
              <Link to="/login-student" className={`${styles.loginButton} ${styles.studentLogin}`}>
                Student Login
              </Link>
              <Link to="/login-staff" className={`${styles.loginButton} ${styles.staffLogin}`}>
                Staff Login
              </Link>
            </div>
          </>
        ) : (
          <>
            <Link to="/dashboard" className={`${styles.navLink} ${isActive('/dashboard')}`}>
              Dashboard
            </Link>
            <Link to="/new-booking" className={`${styles.navLink} ${isActive('/new-booking')}`}>
              New Booking
            </Link>
            <Link to="/my-upcomings" className={`${styles.navLink} ${isActive('/my-upcomings')}`}>
              My Upcomings
            </Link>
            <Link to="/history" className={`${styles.navLink} ${isActive('/history')}`}>
              History
            </Link>
            <div className={styles.userSection}>
              <span className={styles.userName}>
                {user?.name || (user?.user_role === 'staff' ? 'Staff' : 'Student')}
              </span>
              <button onClick={handleLogout} className={styles.logoutButton}>
                Logout
              </button>
            </div>
          </>
        )}
      </div>
    </nav>
  );
};

export default Navbar; 