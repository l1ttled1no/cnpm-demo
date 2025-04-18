import styles from './Contact.module.css';
import Button from '../components/Button';

const Contact = () => {
  const handleSubmit = (e) => {
    e.preventDefault();
    // Handle form submission here
    console.log('Form submitted');
  };

  return (
    <div className={styles.container}>
      <div className={styles.content}>
        <h1>Contact Us</h1>
        <p className={styles.description}>
          Have questions about the Smart Study Space Management System? We're here to help!
        </p>
        
        <form className={styles.form} onSubmit={handleSubmit}>
          <div className={styles.formGroup}>
            <label htmlFor="name">Full Name</label>
            <input 
              type="text" 
              id="name" 
              name="name" 
              placeholder="Enter your full name"
              required 
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="studentId">Student ID</label>
            <input 
              type="text" 
              id="studentId" 
              name="studentId" 
              placeholder="Enter your student ID"
              required 
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="email">Email Address</label>
            <input 
              type="email" 
              id="email" 
              name="email" 
              placeholder="Enter your email address"
              required 
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="phone">Phone Number</label>
            <input 
              type="tel" 
              id="phone" 
              name="phone" 
              placeholder="Enter your phone number"
              required 
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="message">Message</label>
            <textarea 
              id="message" 
              name="message" 
              placeholder="Enter your message"
              rows="5"
              required 
            />
          </div>

          <Button type="submit">Send Message</Button>
        </form>

        <div className={styles.contactInfo}>
          <h2>Other Ways to Reach Us</h2>
          <div className={styles.infoGrid}>
            <div className={styles.infoItem}>
              <h3>Address</h3>
              <p>404 - A4 (IT Staff Room), 268 Ly Thuong Kiet Street, Ward 14, District 10, Ho Chi Minh City</p>
            </div>
            <div className={styles.infoItem}>
              <h3>Email</h3>
              <p>support@hcmut.edu.vn</p>
            </div>
            <div className={styles.infoItem}>
              <h3>Phone</h3>
              <p>(+84) 28 1234 5678</p>
            </div>
            <div className={styles.infoItem}>
              <h3>Office Hours</h3>
              <p>Monday - Friday: 8:00 AM - 5:00 PM</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contact; 