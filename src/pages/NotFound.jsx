import { useNavigate } from 'react-router-dom';
import styles from './NotFound.module.css';
import Button from '../components/Button';

const NotFound = () => {
  const navigate = useNavigate();

  return (
    <div className={styles.container}>
      <div className={styles.content}>
        <h1>404</h1>
        <h2>Page Not Found</h2>
        <p>The page you are looking for is currently under development or doesn't exist.</p>
        <Button onClick={() => navigate(-1)}>Go Back</Button>
      </div>
    </div>
  );
};

export default NotFound; 