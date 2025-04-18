import React, { useState, useEffect } from 'react';
import { FiSearch, FiClock, FiCheckCircle, FiXCircle } from 'react-icons/fi';
import { FaEye } from 'react-icons/fa';
import styles from './MyHistory.module.css';
import qrCode from '../assets/qr.png';
import { syncBookingsWithRooms, initializeDatabase } from '../utils/bookingUtils';

const MyHistory = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [bookingHistory, setBookingHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const fetchBookingHistory = async () => {
    try {
      setError('');
      // Initialize database if needed
      initializeDatabase();
      
      // Sync bookings with rooms first
      await syncBookingsWithRooms();

      const user = JSON.parse(localStorage.getItem('user'));
      const studentsData = JSON.parse(localStorage.getItem('students'));

      if (!user || !studentsData?.students) {
        setBookingHistory([]);
        return;
      }

      const student = studentsData.students.find(s => s.student_id === user.student_id);
      if (student?.booking_history) {
        // Sort booking history by date and time (most recent first)
        const sortedHistory = [...student.booking_history].sort((a, b) => {
          const dateA = new Date(a.date.split('/').reverse().join('-'));
          const dateB = new Date(b.date.split('/').reverse().join('-'));
          if (dateA.getTime() === dateB.getTime()) {
            const [startTimeA] = a.time.split(' - ');
            const [startTimeB] = b.time.split(' - ');
            return startTimeB.localeCompare(startTimeA);
          }
          return dateB - dateA;
        });
        setBookingHistory(sortedHistory);
      } else {
        setBookingHistory([]);
      }
    } catch (error) {
      console.error('Error fetching booking history:', error);
      setError('Failed to load booking history. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookingHistory();
    // Refresh booking history every 30 seconds
    const interval = setInterval(fetchBookingHistory, 30000);
    return () => clearInterval(interval);
  }, []);

  const getStatusIcon = (status) => {
    switch (status.toLowerCase()) {
      case 'cancelled':
        return <FiXCircle className={styles.cancelledIcon} />;
      case 'ongoing':
        return <FiClock className={styles.ongoingIcon} />;
      case 'completed':
        return <FiCheckCircle className={styles.completedIcon} />;
      case 'pending':
        return <FiClock className={styles.pendingIcon} />;
      default:
        return null;
    }
  };

  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case 'cancelled':
        return styles.cancelled;
      case 'ongoing':
        return styles.ongoing;
      case 'completed':
        return styles.completed;
      case 'pending':
        return styles.pending;
      default:
        return '';
    }
  };

  const formatServices = (services) => {
    if (!services) return [];
    
    return Object.entries(services)
      .filter(([key, value]) => value === true || (typeof value === 'number' && value > 0))
      .map(([key, value]) => {
        const formattedKey = key.replace(/_/g, ' ');
        return typeof value === 'number' 
          ? `${formattedKey} (${value})`
          : formattedKey;
      });
  };

  const filteredHistory = bookingHistory.filter(booking => {
    const matchesSearch = 
      booking.room.toLowerCase().includes(searchQuery.toLowerCase()) ||
      booking.date.includes(searchQuery) ||
      booking.time.includes(searchQuery) ||
      booking.status.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || booking.status.toLowerCase() === statusFilter.toLowerCase();
    
    return matchesSearch && matchesStatus;
  });

  const [selectedBooking, setSelectedBooking] = useState(null);

  if (loading) {
    return (
      <div className={styles.historyContainer}>
        <div className={styles.loadingState}>Loading booking history...</div>
      </div>
    );
  }

  return (
    <div className={styles.historyContainer}>
      <div className={styles.header}>
        <h2 className={styles.title}>Booking History</h2>
        <div className={styles.filters}>
          <div className={styles.searchBox}>
            <FiSearch className={styles.searchIcon} />
            <input
              type="text"
              placeholder="Search by room, date, or status..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={styles.searchInput}
            />
          </div>
          <div className={styles.statusFilter}>
            <select 
              value={statusFilter} 
              onChange={(e) => setStatusFilter(e.target.value)}
              className={styles.filterSelect}
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="ongoing">Ongoing</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
        </div>
      </div>

      {error && <div className={styles.error}>{error}</div>}

      <div className={styles.tableWrapper}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>No.</th>
              <th>Room</th>
              <th>Date</th>
              <th>Time</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {filteredHistory.length > 0 ? (
              filteredHistory.map((booking, index) => (
                <tr key={booking.id || index} className={styles.tableRow}>
                  <td>{index + 1}</td>
                  <td className={styles.roomCell}>{booking.room}</td>
                  <td>{booking.date}</td>
                  <td>{booking.time}</td>
                  <td>
                    <span className={`${styles.statusBadge} ${getStatusColor(booking.status)}`}>
                      {getStatusIcon(booking.status)}
                      {booking.status}
                    </span>
                  </td>
                  <td>
                    <button 
                      className={styles.viewButton}
                      onClick={() => setSelectedBooking(booking)}
                    >
                      <FaEye className={styles.buttonIcon} />
                      <span>View Details</span>
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="6" className={styles.noData}>
                  No booking history found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {selectedBooking && (
        <div className={styles.modal} onClick={() => setSelectedBooking(null)}>
          <div className={styles.modalContent} onClick={e => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h3>Booking Details</h3>
              <button 
                className={styles.closeButton}
                onClick={() => setSelectedBooking(null)}
              >
                &times;
              </button>
            </div>
            <div className={styles.modalBody}>
              <div className={styles.bookingDetails}>
                <div className={styles.qrCodeContainer}>
                  <img src={qrCode} alt="QR Code" className={styles.qrCode} />
                  <p>Scan this QR code at the room</p>
                </div>
                <div className={styles.detailsGrid}>
                  <div className={styles.detailItem}>
                    <span className={styles.detailLabel}>Room:</span>
                    <span className={styles.detailValue}>{selectedBooking.room}</span>
                  </div>
                  <div className={styles.detailItem}>
                    <span className={styles.detailLabel}>Building:</span>
                    <span className={styles.detailValue}>
                      {selectedBooking.details?.building || '-'}
                    </span>
                  </div>
                  <div className={styles.detailItem}>
                    <span className={styles.detailLabel}>Floor:</span>
                    <span className={styles.detailValue}>
                      {selectedBooking.details?.floor || '-'}
                    </span>
                  </div>
                  <div className={styles.detailItem}>
                    <span className={styles.detailLabel}>Capacity:</span>
                    <span className={styles.detailValue}>
                      {selectedBooking.details?.capacity || '-'} seats
                    </span>
                  </div>
                  <div className={styles.detailItem}>
                    <span className={styles.detailLabel}>Date:</span>
                    <span className={styles.detailValue}>{selectedBooking.date}</span>
                  </div>
                  <div className={styles.detailItem}>
                    <span className={styles.detailLabel}>Time:</span>
                    <span className={styles.detailValue}>{selectedBooking.time}</span>
                  </div>
                  <div className={styles.detailItem}>
                    <span className={styles.detailLabel}>Status:</span>
                    <span className={`${styles.detailValue} ${getStatusColor(selectedBooking.status)}`}>
                      {getStatusIcon(selectedBooking.status)}
                      {selectedBooking.status}
                    </span>
                  </div>
                  <div className={styles.detailItem}>
                    <span className={styles.detailLabel}>Number of People:</span>
                    <span className={styles.detailValue}>
                      {selectedBooking.number_of_people || '-'}
                    </span>
                  </div>
                  <div className={styles.detailItem}>
                    <span className={styles.detailLabel}>Facilities:</span>
                    <span className={styles.detailValue}>
                      {formatServices(selectedBooking.details?.services).join(', ') || '-'}
                    </span>
                  </div>
                  {selectedBooking.created_at && (
                    <div className={styles.detailItem}>
                      <span className={styles.detailLabel}>Booked on:</span>
                      <span className={styles.detailValue}>
                        {new Date(selectedBooking.created_at).toLocaleString()}
                      </span>
                    </div>
                  )}
                  {selectedBooking.cancelled_at && (
                    <div className={styles.detailItem}>
                      <span className={styles.detailLabel}>Cancelled on:</span>
                      <span className={styles.detailValue}>
                        {new Date(selectedBooking.cancelled_at).toLocaleString()}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyHistory; 