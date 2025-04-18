import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './StudentDashboard.module.css';
import Button from '../components/Button';
import { syncBookingsWithRooms } from '../utils/bookingUtils';

const StudentDashboard = () => {
  const navigate = useNavigate();
  const [currentTime, setCurrentTime] = useState(new Date());
  const [upcomingBookings, setUpcomingBookings] = useState([]);
  const [bookingHistory, setBookingHistory] = useState([]);
  const user = JSON.parse(localStorage.getItem('user')) || { name: 'Student A' };

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const parseDate = (dateStr) => {
    const [day, month, year] = dateStr.split('/').map(Number);
    return new Date(year, month - 1, day);
  };

  const parseTime = (timeStr) => {
    const [startTime] = timeStr.split(' - ');
    const [hours] = startTime.split(':').map(Number);
    return hours;
  };

  const fetchBookings = () => {
    // Sync bookings with rooms first
    syncBookingsWithRooms();

    const studentsData = JSON.parse(localStorage.getItem('students'));
    if (!studentsData?.students || !user) return;

    const currentStudent = studentsData.students.find(
      student => student.student_id === user.student_id
    );

    if (currentStudent?.booking_history) {
      const currentDate = new Date();
      currentDate.setHours(0, 0, 0, 0);

      // Get upcoming bookings (Pending and Ongoing)
      const upcoming = currentStudent.booking_history
        .filter(booking => {
          if (booking.status === 'Cancelled' || booking.status === 'Completed') return false;
          const bookingDate = parseDate(booking.date);
          return bookingDate >= currentDate;
        })
        .sort((a, b) => {
          const dateA = parseDate(a.date);
          const dateB = parseDate(b.date);
          if (dateA.getTime() === dateB.getTime()) {
            return parseTime(a.time) - parseTime(b.time);
          }
          return dateA - dateB;
        })
        .slice(0, 3);

      // Get last 3 bookings from history (completed or cancelled)
      const history = currentStudent.booking_history
        .filter(booking => booking.status === 'Completed' || booking.status === 'Cancelled')
        .sort((a, b) => {
          const dateA = parseDate(a.date);
          const dateB = parseDate(b.date);
          if (dateA.getTime() === dateB.getTime()) {
            return parseTime(b.time) - parseTime(a.time);
          }
          return dateB - dateA;
        })
        .slice(0, 3);

      setUpcomingBookings(upcoming);
      setBookingHistory(history);
    }
  };

  useEffect(() => {
    fetchBookings();
    const interval = setInterval(fetchBookings, 5000);

    return () => clearInterval(interval);
  }, [user]);

  const announcements = [
    {
      date: '10/03/2025',
      messages: [
        'Room B5-213 is in repaired, the new room has been re-arranged.',
        'Room V2-214: Projector has been broken and we are working on a fix.'
      ]
    },
    {
      date: '20/02/2025',
      messages: [
        'Room A2-113 can be booked by students now.'
      ]
    }
  ];

  const formatDate = (date) => {
    const options = {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false,
      weekday: 'long',
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    };
    return date.toLocaleString('en-GB', options);
  };

  return (
    <div className={styles.dashboard}>
      <div className={styles.header}>
        <div className={styles.timeDisplay}>
          It is {formatDate(currentTime)}.
        </div>
        <div className={styles.welcome}>
          Welcome, {user.name}!
        </div>
      </div>

      <div className={styles.dashboardHeader}>
        <h1 className={styles.dashboardTitle}>Dashboard</h1>
        <Button onClick={fetchBookings}>Refresh</Button>
      </div>

      <div className={styles.content}>
        <div className={styles.bookingsSection}>
          <div className={styles.upcomingBookings}>
            <h2>Upcoming Room</h2>
            <table>
              <thead>
                <tr>
                  <th>Room</th>
                  <th>Date</th>
                  <th>Time</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {upcomingBookings.length > 0 ? (
                  upcomingBookings.map((booking, index) => (
                    <tr key={booking.id || index}>
                      <td>{booking.room}</td>
                      <td>{booking.date}</td>
                      <td>{booking.time}</td>
                      <td className={styles[booking.status.toLowerCase()]}>{booking.status}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="4" className={styles.noData}>No upcoming bookings</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className={styles.bookingHistory}>
            <h2>Booking History</h2>
            <table>
              <thead>
                <tr>
                  <th>Room</th>
                  <th>Date</th>
                  <th>Time</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {bookingHistory.length > 0 ? (
                  bookingHistory.map((booking, index) => (
                    <tr key={booking.id || index}>
                      <td>{booking.room}</td>
                      <td>{booking.date}</td>
                      <td>{booking.time}</td>
                      <td className={styles[booking.status.toLowerCase()]}>{booking.status}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="4" className={styles.noData}>No booking history</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className={styles.announcementSection}>
          <h2>Announcement</h2>
          {announcements.map((announcement, index) => (
            <div key={index} className={styles.announcement}>
              <h3>{announcement.date}:</h3>
              <ul>
                {announcement.messages.map((message, msgIndex) => (
                  <li key={msgIndex}>{message}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      <div className={styles.actions}>
        <Button onClick={() => navigate('/new-booking')}>New Booking</Button>
        <Button onClick={() => navigate('/my-upcomings')}>View All Bookings</Button>
      </div>
    </div>
  );
};

export default StudentDashboard; 