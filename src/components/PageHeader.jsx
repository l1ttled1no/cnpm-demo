import React, { useState, useEffect } from 'react';
import styles from './PageHeader.module.css';

const PageHeader = ({ userName }) => {
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const formatDate = (date) => {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const day = days[date.getDay()];
    const dd = String(date.getDate()).padStart(2, '0');
    const mm = String(date.getMonth() + 1).padStart(2, '0');
    const yyyy = date.getFullYear();
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');

    return `It is ${day}, ${dd}/${mm}/${yyyy}, ${hours}:${minutes}:${seconds}.`;
  };

  return (
    <div className={styles.pageHeader}>
      <div className={styles.timeDisplay}>{formatDate(currentTime)}</div>
      <div className={styles.welcome}>Welcome, {userName}!</div>
    </div>
  );
};

export default PageHeader; 