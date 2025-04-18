import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import styles from './Login.module.css';
import Button from '../components/Button';
import studentsData from '../db/students.json';
import googleLogo from '../assets/google.png';

const StudentLogin = ({ onLogin }) => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    student_bknetid: '',
    password: ''
  });
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: value
    }));
    setError('');
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const student = studentsData.students.find(
      s => s.student_bknetid === formData.student_bknetid && s.password === formData.password
    );

    if (student) {
      // Store user data
      localStorage.setItem('user', JSON.stringify(student));
      
      // Store the entire students data for booking history
      localStorage.setItem('studentData', JSON.stringify(studentsData));
      
      // Update app state
      onLogin(student);
      navigate('/dashboard');
    } else {
      setError('Invalid BKNet ID or password');
    }
  };

  const handleGoogleLogin = () => {
    // Redirect to 404 page
    navigate('/page-not-found');
  };

  return (
    <div className={styles.container}>
      <div className={styles.loginCard}>
        <h1>Student Login</h1>
        <p className={styles.subtitle}>Access your study space management account</p>

        {error && <div className={styles.error}>{error}</div>}

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.formGroup}>
            <label htmlFor="student_bknetid">BKNet ID</label>
            <input
              type="text"
              id="student_bknetid"
              name="student_bknetid"
              value={formData.student_bknetid}
              onChange={handleChange}
              placeholder="Enter your BKNet ID"
              required
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Enter your password"
              required
            />
          </div>

          <div className={styles.buttonContainer}>
            <Button type="submit">Login</Button>
            <button 
              type="button" 
              className={styles.googleButton}
              onClick={handleGoogleLogin}
            >
              <img 
                src={googleLogo} 
                alt="Google logo" 
                className={styles.googleLogo}
              />
              Login with Google
            </button>
          </div>
        </form>

        <div className={styles.helpLinks}>
          <Link to="/contact">Forgot Password?</Link>
          <Link to="/contact">Need Help?</Link>
        </div>

        <div className={styles.notice}>
          <p>For HCMUT students only</p>
          <p>Use your BKNet ID and password to login</p>
        </div>
      </div>
    </div>
  );
};

export default StudentLogin; 