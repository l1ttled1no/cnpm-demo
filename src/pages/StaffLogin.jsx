import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import styles from './Login.module.css';
import Button from '../components/Button';

const StaffLogin = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    staff_id: '',
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
    // For demo purposes, using a hardcoded staff credential
    if (formData.staff_id === 'admin' && formData.password === 'admin123') {
      const staffData = {
        staff_id: 'admin',
        name: 'Administrator',
        user_role: 'staff'
      };
      localStorage.setItem('user', JSON.stringify(staffData));
      navigate('/staff-dashboard');
    } else {
      setError('Invalid Staff ID or password');
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.loginCard}>
        <h1>Staff Login</h1>
        <p className={styles.subtitle}>Access the study space management system</p>

        {error && <div className={styles.error}>{error}</div>}

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.formGroup}>
            <label htmlFor="staff_id">Staff ID</label>
            <input
              type="text"
              id="staff_id"
              name="staff_id"
              value={formData.staff_id}
              onChange={handleChange}
              placeholder="Enter your Staff ID"
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

          <div className={styles.staffLoginButton}>
            <Button type="submit">Login</Button>
          </div>
        </form>

        <div className={styles.helpLinks}>
          <Link to="/contact">Forgot Password?</Link>
          <Link to="/contact">Need Help?</Link>
        </div>

        <div className={styles.notice}>
          <p>For HCMUT staff members only</p>
          <p>Contact IT support if you cannot access your account</p>
        </div>
      </div>
    </div>
  );
};

export default StaffLogin; 