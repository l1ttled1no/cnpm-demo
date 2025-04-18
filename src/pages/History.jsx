import React from 'react';
import MyHistory from '../components/MyHistory';
import styles from './History.module.css';

const History = () => {
  return (
    <div className={styles.historyPage}>
      <MyHistory />
    </div>
  );
};

export default History; 