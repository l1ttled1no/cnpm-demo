import React, { useState, useEffect } from 'react';
import { FaEye, FaTimes, FaSearch } from 'react-icons/fa';
import { FiClock, FiCheckCircle, FiMapPin, FiCalendar } from 'react-icons/fi';
import { MdOutlinePending, MdAccessTime } from 'react-icons/md';
import styles from './MyUpcomings.module.css';

const MyUpcomings = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [upcomingBookings, setUpcomingBookings] = useState([]);
  const [showCancelModal, setShowCancelModal] = useState(false);

  const parseDate = (dateStr) => {
    const [day, month, year] = dateStr.split('/').map(Number);
    return new Date(year, month - 1, day);
  };

  const parseTime = (timeStr) => {
    const [startTime] = timeStr.split(' - ');
    const [hours] = startTime.split(':').map(Number);
    return hours;
  };

  const getBookingStatus = (date, time) => {
    const now = new Date();
    const bookingDate = parseDate(date);
    const bookingHour = parseTime(time);
    
    bookingDate.setHours(bookingHour, 0, 0, 0);
    const bookingEndDate = new Date(bookingDate);
    bookingEndDate.setHours(bookingHour + 1, 0, 0, 0);

    if (now < bookingDate) {
      return 'Pending';
    } else if (now >= bookingDate && now < bookingEndDate) {
      return 'On-going';
    } else {
      return 'Completed';
    }
  };

  const updateBookingStatuses = () => {
    const user = JSON.parse(localStorage.getItem('user'));
    if (!user) return;

    const studentData = JSON.parse(localStorage.getItem('studentData'));
    if (!studentData?.students) return;

    const currentStudent = studentData.students.find(
      student => student.student_id === user.student_id
    );

    if (currentStudent?.booking_history) {
      const currentDate = new Date();
      currentDate.setHours(0, 0, 0, 0);

      const updatedBookings = currentStudent.booking_history
        .filter(booking => {
          if (booking.status === 'Cancelled') return false;
          const bookingDate = parseDate(booking.date);
          return bookingDate >= currentDate;
        })
        .map(booking => ({
          ...booking,
          status: booking.status === 'Cancelled' ? 'Cancelled' : getBookingStatus(booking.date, booking.time)
        }))
        .sort((a, b) => {
          const dateA = parseDate(a.date);
          const dateB = parseDate(b.date);
          return dateA - dateB;
        });

      setUpcomingBookings(updatedBookings);
    }
  };

  useEffect(() => {
    updateBookingStatuses();
    const interval = setInterval(updateBookingStatuses, 60000); // Update every minute
    return () => clearInterval(interval);
  }, []);

  const handleCancel = (booking) => {
    setSelectedBooking(booking);
    setShowCancelModal(true);
  };

  const confirmCancel = () => {
    const user = JSON.parse(localStorage.getItem('user'));
    const studentData = JSON.parse(localStorage.getItem('studentData'));
    
    if (!user || !studentData?.students) return;

    const studentIndex = studentData.students.findIndex(
      student => student.student_id === user.student_id
    );

    if (studentIndex === -1) return;

    const updatedStudents = [...studentData.students];
    const bookingIndex = updatedStudents[studentIndex].booking_history.findIndex(
      booking => 
        booking.room === selectedBooking.room && 
        booking.date === selectedBooking.date && 
        booking.time === selectedBooking.time
    );

    if (bookingIndex === -1) return;

    updatedStudents[studentIndex].booking_history[bookingIndex].status = 'Cancelled';
    studentData.students = updatedStudents;
    
    localStorage.setItem('studentData', JSON.stringify(studentData));
    updateBookingStatuses();
    setShowCancelModal(false);
    setSelectedBooking(null);
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'Pending':
        return <MdOutlinePending className={styles.pendingIcon} />;
      case 'On-going':
        return <MdAccessTime className={styles.ongoingIcon} />;
      case 'Completed':
        return <FiCheckCircle className={styles.completedIcon} />;
      default:
        return null;
    }
  };

  const getStatusClass = (status) => {
    switch (status) {
      case 'Pending':
        return styles.pending;
      case 'On-going':
        return styles.ongoing;
      case 'Completed':
        return styles.completed;
      default:
        return '';
    }
  };

  const formatServices = (services) => {
    if (!services) return [];
    
    const servicesList = [];
    
    if (services.ethernet) servicesList.push('Ethernet');
    if (services.projector) servicesList.push('Projector');
    if (services.whiteboard) servicesList.push('Whiteboard');
    if (services.ac) servicesList.push('Air Conditioning');
    if (services.computers > 0) servicesList.push(`${services.computers} Computers`);
    if (services.power_outlets > 0) servicesList.push(`${services.power_outlets} Power Outlets`);
    if (services.smart_board) servicesList.push('Smart Board');
    if (services.video_conference) servicesList.push('Video Conference');
    
    return servicesList;
  };

  const filteredBookings = upcomingBookings.filter(booking => {
    const searchLower = searchQuery.toLowerCase();
    return (
      booking.room.toLowerCase().includes(searchLower) ||
      booking.date.toLowerCase().includes(searchLower) ||
      booking.time.toLowerCase().includes(searchLower)
    );
  });

  return (
    <div className={styles.upcomingsContainer}>
      <div className={styles.header}>
        <h2 className={styles.title}>My Upcoming Bookings</h2>
        <div className={styles.filters}>
          <div className={styles.searchBox}>
            <FaSearch className={styles.searchIcon} />
            <input
              type="text"
              placeholder="Search by room, date, or time..."
              className={styles.searchInput}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
      </div>

      <div className={styles.tableWrapper}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Room</th>
              <th>Date</th>
              <th>Time</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredBookings.length > 0 ? (
              filteredBookings.map((booking, index) => (
                <tr key={index} className={styles.tableRow}>
                  <td className={styles.roomCell}>
                    <FiMapPin /> {booking.room}
                  </td>
                  <td>
                    <FiCalendar /> {booking.date}
                  </td>
                  <td>
                    <FiClock /> {booking.time}
                  </td>
                  <td>
                    <span className={`${styles.statusBadge} ${getStatusClass(booking.status)}`}>
                      {getStatusIcon(booking.status)} {booking.status}
                    </span>
                  </td>
                  <td className={styles.actionCell}>
                    <button
                      className={styles.viewButton}
                      onClick={() => setSelectedBooking(booking)}
                    >
                      <FaEye className={styles.buttonIcon} />
                      <span>View</span>
                    </button>
                    {booking.status === 'Pending' && (
                      <button
                        className={styles.cancelButton}
                        onClick={() => handleCancel(booking)}
                      >
                        <FaTimes className={styles.buttonIcon} />
                        <span>Cancel</span>
                      </button>
                    )}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="5" className={styles.noData}>
                  No upcoming bookings found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {showCancelModal && (
        <div className={styles.modal}>
          <div className={styles.modalContent}>
            <h3>Cancel Booking</h3>
            <p>Are you sure you want to cancel this booking?</p>
            <div className={styles.modalButtons}>
              <button
                className={styles.confirmButton}
                onClick={confirmCancel}
              >
                Yes, Cancel
              </button>
              <button
                className={styles.cancelButton}
                onClick={() => setShowCancelModal(false)}
              >
                No, Keep
              </button>
            </div>
          </div>
        </div>
      )}

      {selectedBooking && (
        <div className={styles.modal}>
          <div className={styles.modalContent}>
            <h3>Booking Details</h3>
            <div className={styles.detailsGrid}>
              <div className={styles.detailItem}>
                <span className={styles.detailLabel}>Room</span>
                <span className={styles.detailValue}>{selectedBooking.room}</span>
              </div>
              <div className={styles.detailItem}>
                <span className={styles.detailLabel}>Building</span>
                <span className={styles.detailValue}>Building {selectedBooking.details?.building}</span>
              </div>
              <div className={styles.detailItem}>
                <span className={styles.detailLabel}>Floor</span>
                <span className={styles.detailValue}>{selectedBooking.details?.floor} Floor</span>
              </div>
              <div className={styles.detailItem}>
                <span className={styles.detailLabel}>Date</span>
                <span className={styles.detailValue}>{selectedBooking.date}</span>
              </div>
              <div className={styles.detailItem}>
                <span className={styles.detailLabel}>Time</span>
                <span className={styles.detailValue}>{selectedBooking.time}</span>
              </div>
              <div className={styles.detailItem}>
                <span className={styles.detailLabel}>Status</span>
                <span className={`${styles.detailValue} ${getStatusClass(selectedBooking.status)}`}>
                  {getStatusIcon(selectedBooking.status)}
                  {selectedBooking.status}
                </span>
              </div>
              <div className={styles.detailItem}>
                <span className={styles.detailLabel}>Capacity</span>
                <span className={styles.detailValue}>{selectedBooking.details?.capacity} people</span>
              </div>
              {selectedBooking.details?.services && (
                <div className={styles.detailItem}>
                  <span className={styles.detailLabel}>Room Amenities</span>
                  <div className={styles.amenitiesList}>
                    {formatServices(selectedBooking.details.services).map((service, index) => (
                      <span key={index} className={styles.amenityTag}>
                        {service}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
            <button className={styles.closeButton} onClick={() => setSelectedBooking(null)}>
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyUpcomings; 