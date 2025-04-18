import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './MyUpcomings.module.css';
import Button from '../components/Button';
import { syncBookingsWithRooms, cancelBooking, initializeDatabase } from '../utils/bookingUtils';
import qrCode from '../assets/qr.png';
import PageHeader from '../components/PageHeader';

const MyUpcomingsPage = () => {
  const navigate = useNavigate();
  const [bookings, setBookings] = useState([]);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [error, setError] = useState('');
  const [showConfirmCancel, setShowConfirmCancel] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const user = JSON.parse(localStorage.getItem('user')) || { name: 'Student A', student_id: 'SA001' };

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

  const fetchBookings = async () => {
    try {
      setError('');
      // Initialize database if needed
      initializeDatabase();
      
      // Sync bookings with rooms first
      await syncBookingsWithRooms();

      const studentsData = JSON.parse(localStorage.getItem('students'));
      if (!studentsData?.students) {
        console.error('No students data found');
        setBookings([]);
        return;
      }

      const currentStudent = studentsData.students.find(
        student => student.student_id === user.student_id
      );

      if (currentStudent?.booking_history) {
        // Sort bookings by date and time
        const allBookings = [...currentStudent.booking_history].sort((a, b) => {
          const dateA = parseDate(a.date);
          const dateB = parseDate(b.date);
          if (dateA.getTime() === dateB.getTime()) {
            return parseTime(a.time) - parseTime(b.time);
          }
          return dateA - dateB;
        });

        setBookings(allBookings);
      } else {
        setBookings([]);
      }
    } catch (error) {
      console.error('Error fetching bookings:', error);
      setError('Failed to load bookings. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
    const interval = setInterval(fetchBookings, 5000);

    return () => clearInterval(interval);
  }, [user.student_id]);

  const handleCancelBooking = async (bookingId) => {
    try {
      setError('');
      await cancelBooking(user.student_id, bookingId);
      setShowConfirmCancel(null);
      await fetchBookings(); // Refresh the bookings list
    } catch (error) {
      setError(error.message);
    }
  };

  const canBeCancelled = (booking) => {
    return booking.status !== 'Completed' && booking.status !== 'Cancelled';
  };

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

  const formatServices = (services) => {
    if (!services) return '';
    return Object.entries(services)
      .filter(([key, value]) => value === true || (typeof value === 'number' && value > 0))
      .map(([key, value]) => {
        const formattedKey = key.replace(/_/g, ' ');
        return typeof value === 'number' 
          ? `${formattedKey} (${value})`
          : formattedKey;
      })
      .join(', ');
  };

  const handleViewDetails = (booking) => {
    setSelectedBooking(booking);
  };

  const handleCloseDetails = () => {
    setSelectedBooking(null);
  };

  if (loading) {
    return (
      <div className={styles.upcomings}>
        <div className={styles.loading}>Loading bookings...</div>
      </div>
    );
  }

  return (
    <div className={styles.upcomings}>
      <PageHeader userName={user.name} />
      <h1 className={styles.title}>My Upcoming Bookings</h1>

      {/* <div className={styles.pageHeader}>
        <Button onClick={fetchBookings}>Refresh</Button>
      </div> */}

      {error && <div className={styles.error}>{error}</div>}

      <div className={styles.bookingList}>
        <table>
          <thead>
            <tr>
              <th>Room</th>
              <th>Building</th>
              <th>Floor</th>
              <th>Date</th>
              <th>Time</th>
              <th>Status</th>
              <th>Facilities</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {bookings.length > 0 ? (
              bookings.map((booking) => (
                <tr key={booking.id}>
                  <td>{booking.room}</td>
                  <td>{booking.details?.building || '-'}</td>
                  <td>{booking.details?.floor || '-'}</td>
                  <td>{booking.date}</td>
                  <td>{booking.time}</td>
                  <td className={styles[booking.status.toLowerCase()]}>{booking.status}</td>
                  <td>{formatServices(booking.details?.services)}</td>
                  <td>
                    <div className={styles.actionButtons}>
                      <Button 
                        onClick={() => handleViewDetails(booking)}
                        variant="secondary"
                      >
                        View Details
                      </Button>
                      {canBeCancelled(booking) && (
                        showConfirmCancel === booking.id ? (
                          <div className={styles.confirmCancel}>
                            <Button 
                              onClick={() => handleCancelBooking(booking.id)}
                              variant="danger"
                            >
                              Confirm
                            </Button>
                            <Button 
                              onClick={() => setShowConfirmCancel(null)}
                              variant="secondary"
                            >
                              No
                            </Button>
                          </div>
                        ) : (
                          <Button 
                            onClick={() => setShowConfirmCancel(booking.id)}
                            variant="danger"
                          >
                            Cancel
                          </Button>
                        )
                      )}
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="8" className={styles.noData}>No bookings found</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className={styles.actions}>
        <Button onClick={() => navigate('/new-booking')}>New Booking</Button>
        <Button onClick={() => navigate('/dashboard')} variant="secondary">Back to Dashboard</Button>
      </div>

      {selectedBooking && (
        <div className={styles.modal}>
          <div className={styles.modalContent}>
            <div className={styles.modalHeader}>
              <h2>Booking Details</h2>
              <button className={styles.closeButton} onClick={handleCloseDetails}>&times;</button>
            </div>
            <div className={styles.modalBody}>
              <div className={styles.bookingDetails}>
                <div className={styles.qrCodeContainer}>
                  <img src={qrCode} alt="QR Code" className={styles.qrCode} />
                  <p>Scan this QR code at the room</p>
                </div>
                <div className={styles.detailsGrid}>
                  <div className={styles.detailItem}>
                    <span className={styles.label}>Room:</span>
                    <span className={styles.value}>{selectedBooking.room}</span>
                  </div>
                  <div className={styles.detailItem}>
                    <span className={styles.label}>Building:</span>
                    <span className={styles.value}>{selectedBooking.details?.building || '-'}</span>
                  </div>
                  <div className={styles.detailItem}>
                    <span className={styles.label}>Floor:</span>
                    <span className={styles.value}>{selectedBooking.details?.floor || '-'}</span>
                  </div>
                  <div className={styles.detailItem}>
                    <span className={styles.label}>Date:</span>
                    <span className={styles.value}>{selectedBooking.date}</span>
                  </div>
                  <div className={styles.detailItem}>
                    <span className={styles.label}>Time:</span>
                    <span className={styles.value}>{selectedBooking.time}</span>
                  </div>
                  <div className={styles.detailItem}>
                    <span className={styles.label}>Status:</span>
                    <span className={`${styles.value} ${styles[selectedBooking.status.toLowerCase()]}`}>
                      {selectedBooking.status}
                    </span>
                  </div>
                  <div className={styles.detailItem}>
                    <span className={styles.label}>Number of People:</span>
                    <span className={styles.value}>{selectedBooking.number_of_people}</span>
                  </div>
                  <div className={styles.detailItem}>
                    <span className={styles.label}>Facilities:</span>
                    <span className={styles.value}>
                      {formatServices(selectedBooking.details?.services)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyUpcomingsPage; 