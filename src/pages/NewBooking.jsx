import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './NewBooking.module.css';
import { TIME_SLOTS, addNewBooking, validateBooking } from '../utils/bookingUtils';
import Button from '../components/Button';
import PageHeader from '../components/PageHeader';

const NewBooking = () => {
  const navigate = useNavigate();
  const [currentTime, setCurrentTime] = useState(new Date());
  const [formData, setFormData] = useState({
    duration: '1 hour',
    time: TIME_SLOTS[0],
    date: new Date().toISOString().split('T')[0],
    numberOfPeople: '',
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [error, setError] = useState('');
  const [rooms, setRooms] = useState({});
  
  const user = JSON.parse(localStorage.getItem('user')) || { name: 'Student A' };

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const loadRooms = () => {
    // Load rooms from localStorage to get real-time data
    const roomsData = JSON.parse(localStorage.getItem('room_lists')) || { rooms: [] };
    
    // Group rooms by building
    const availableRooms = roomsData.rooms.reduce((acc, room) => {
      const building = room.building;
      if (!acc[building]) {
        acc[building] = [];
      }
      acc[building].push(room);
      return acc;
    }, {});
    
    setRooms(availableRooms);
  };

  useEffect(() => {
    loadRooms();
  }, []);

  const formatDate = (date) => {
    const options = {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
      weekday: 'long',
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    };
    return date.toLocaleString('en-GB', options);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    setError('');
    
    // Refresh room list when date, time, or number of people changes
    if (['date', 'time', 'numberOfPeople'].includes(name)) {
      loadRooms();
    }
  };

  const handleRoomSelect = (room) => {
    try {
      validateBooking(room, formData.date, formData.time, formData.numberOfPeople);
      setSelectedRoom(room);
      setShowConfirmation(true);
      setError('');
    } catch (err) {
      setError(err.message);
    }
  };

  const formatServicesText = (services) => {
    if (!services) return '';
    return Object.entries(services)
      .filter(([key, value]) => {
        if (typeof value === 'boolean') return value;
        if (typeof value === 'number') return value > 0;
        return false;
      })
      .map(([key, value]) => {
        const formattedKey = key.replace(/_/g, ' ');
        return typeof value === 'number' 
          ? `${formattedKey} (${value})`
          : formattedKey;
      })
      .join(', ');
  };

  const handleBooking = async () => {
    try {
      const booking = await addNewBooking(
        user.student_id,
        selectedRoom,
        formData.date,
        formData.time,
        formData.numberOfPeople
      );

      // Refresh rooms data after successful booking
      loadRooms();

      // Navigate to dashboard on success
      navigate('/dashboard');
    } catch (error) {
      setError(error.message);
      if (error.message.includes('already booked') || error.message.includes('not available')) {
        setShowConfirmation(false);
        setSelectedRoom(null);
        // Refresh rooms data to show updated availability
        loadRooms();
      }
    }
  };

  const filteredRooms = Object.entries(rooms).reduce((acc, [building, roomList]) => {
    const filtered = roomList.filter(room => {
      try {
        validateBooking(room, formData.date, formData.time, formData.numberOfPeople);
        
        const searchLower = searchQuery.toLowerCase();
        const capacity = room.capacity.toString();
        const services = formatServicesText(room.services).toLowerCase();
        
        return (
          room.room_id.toLowerCase().includes(searchLower) ||
          capacity.includes(searchLower) ||
          services.includes(searchLower)
        );
      } catch {
        return false;
      }
    });
    
    if (filtered.length > 0) {
      acc[building] = filtered;
    }
    return acc;
  }, {});

  return (
    <div className={styles.newBooking}>
      <PageHeader userName="Nguyen Van A" />
      <h1 className={styles.title}>New Booking</h1>

      <div className={styles.content}>
        <div className={styles.bookingForm}>
          <div className={styles.formGroup}>
            <label htmlFor="date">Date:</label>
            <input
              type="date"
              id="date"
              name="date"
              value={formData.date}
              min={new Date().toISOString().split('T')[0]}
              onChange={handleInputChange}
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="time">Time:</label>
            <select
              id="time"
              name="time"
              value={formData.time}
              onChange={handleInputChange}
            >
              {TIME_SLOTS.map(slot => (
                <option key={slot} value={slot}>{slot}</option>
              ))}
            </select>
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="numberOfPeople">Number of People:</label>
            <input
              type="number"
              id="numberOfPeople"
              name="numberOfPeople"
              value={formData.numberOfPeople}
              min="1"
              onChange={handleInputChange}
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="search">Search Rooms:</label>
            <input
              type="text"
              id="search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by room number, capacity, or facilities..."
            />
          </div>
        </div>

        {error && <div className={styles.error}>{error}</div>}

        <div className={styles.roomList}>
          {Object.entries(filteredRooms).map(([building, rooms]) => (
            <div key={building} className={styles.buildingSection}>
              <h2>Building {building}</h2>
              <div className={styles.rooms}>
                {rooms.map(room => (
                  <div
                    key={room.room_id}
                    className={`${styles.roomCard} ${selectedRoom?.room_id === room.room_id ? styles.selected : ''}`}
                    onClick={() => handleRoomSelect(room)}
                  >
                    <img src={room.room_picture} alt={`Room ${room.room_id}`} />
                    <div className={styles.roomInfo}>
                      <h3>{room.room_id}</h3>
                      <p>Capacity: {room.capacity}</p>
                      <p className={styles.facilities}>
                        {formatServicesText(room.services)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {showConfirmation && selectedRoom && (
          <div className={styles.confirmation}>
            <h2>Confirm Booking</h2>
            <p>Room: {selectedRoom.room_id}</p>
            <p>Date: {formData.date}</p>
            <p>Time: {formData.time}</p>
            <p>Number of People: {formData.numberOfPeople}</p>
            <div className={styles.confirmationActions}>
              <Button onClick={handleBooking}>Confirm Booking</Button>
              <Button onClick={() => setShowConfirmation(false)} variant="secondary">Cancel</Button>
            </div>
          </div>
        )}
      </div>

      <div className={styles.actions}>
        <Button onClick={() => navigate('/dashboard')} variant="secondary">Back to Dashboard</Button>
      </div>
    </div>
  );
};

export default NewBooking; 