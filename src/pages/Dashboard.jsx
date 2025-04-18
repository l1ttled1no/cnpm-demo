import React from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './Dashboard.module.css';
import PageHeader from '../components/PageHeader';

const Dashboard = () => {
  return (
    <div className={styles.dashboard}>
      <PageHeader userName="Nguyen Van A" />
      <h1 className={styles.title}>Dashboard</h1>
    </div>
  );
};

export default Dashboard; 