import styles from './Home.module.css';
import Button from '../components/Button';
import illustration from '../assets/homepage.svg';
import { useNavigate } from 'react-router-dom';
import Footer from '../components/Footer';

const Home = () => {
  const navigate = useNavigate();

  return (
    <div className={styles.container}>
      <main className={styles.main}>
        <div className={styles.heroSection}>
          <div className={styles.heroContent}>
            <h1>S3 - MRS: Smart Study Space Management and Reservation System</h1>
            <p className={styles.subtitle}>
              Streamline your study space booking experience at Ho Chi Minh University of Technology
            </p>
            <div className={styles.buttonGroup}>
              <Button onClick={() => navigate('/login-student')}>
                Login as Student
              </Button>
              <Button variant="secondary" onClick={() => navigate('/login-staff')}>
                Login as Staffs
              </Button>
            </div>
          </div>
          <div className={styles.heroImage}>
            <img src={illustration} alt="Students studying" />
          </div>
        </div>

        <div className={styles.infoSection}>
          <div className={styles.features}>
            <h2>Key Features</h2>
            <div className={styles.featureGrid}>
              <div className={styles.featureItem}>
                <h3>Easy Room Booking</h3>
                <p>Book study rooms, discussion spaces, and quiet areas across campus with just a few clicks.</p>
              </div>
              <div className={styles.featureItem}>
                <h3>Real-time Availability</h3>
                <p>Check room availability in real-time and find the perfect space for your study sessions.</p>
              </div>
              <div className={styles.featureItem}>
                <h3>Flexible Duration</h3>
                <p>Book rooms for short study sessions or longer group projects, from 1 hour up to 4 hours.</p>
              </div>
            </div>
          </div>

          <div className={styles.systemInfo}>
            <div className={styles.infoCard}>
              <h2>Who Can Use This System?</h2>
              <ul>
                <li>HCMUT Students with valid student ID</li>
                <li>Academic Staff and Faculty members</li>
                <li>Research groups and student organizations</li>
              </ul>
            </div>
            <div className={styles.infoCard}>
              <h2>Available Facilities</h2>
              <ul>
                <li>Individual study carrels</li>
                <li>Group study rooms (4-8 people)</li>
                <li>Discussion spaces</li>
                <li>Quiet study areas</li>
                <li>Multimedia rooms</li>
              </ul>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Home; 