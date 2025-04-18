// Utility functions for booking management
export const TIME_SLOTS = [
  '06:00-07:00', '07:00-08:00', '08:00-09:00', '09:00-10:00',
  '10:00-11:00', '11:00-12:00', '13:00-14:00', '14:00-15:00',
  '15:00-16:00', '16:00-17:00', '17:00-18:00', '18:00-19:00',
  '19:00-20:00', '20:00-21:00'
];

export const formatDateForDisplay = (dateStr) => {
  // Convert YYYY-MM-DD to DD/MM/YYYY
  if (dateStr.includes('-')) {
    const [year, month, day] = dateStr.split('-');
    return `${day}/${month}/${year}`;
  }
  return dateStr;
};

export const formatTimeForDisplay = (timeStr) => {
  // Ensure consistent time format with spaces around hyphen
  return timeStr.replace('-', ' - ');
};

export const updateBookingStatus = (booking) => {
  const now = new Date();
  const [bookingDay, bookingMonth, bookingYear] = booking.date.split('/').map(Number);
  const [startTime] = booking.time.split('-')[0].split(':').map(Number);
  
  const bookingDate = new Date(bookingYear, bookingMonth - 1, bookingDay);
  bookingDate.setHours(startTime, 0, 0, 0);
  
  const bookingEndDate = new Date(bookingDate);
  bookingEndDate.setHours(startTime + 1, 0, 0, 0);

  if (booking.status === 'Cancelled') return 'Cancelled';
  if (now < bookingDate) return 'Pending';
  if (now >= bookingDate && now < bookingEndDate) return 'Ongoing';
  return 'Completed';
};

export const validateBooking = (room, date, timeSlot, numberOfPeople) => {
  if (!room || !date || !timeSlot || !numberOfPeople) {
    throw new Error('Please fill in all required fields.');
  }

  const formattedDate = formatDateForDisplay(date);
  const formattedTime = formatTimeForDisplay(timeSlot);

  // Check if room exists and is available
  if (room.status !== 'available') {
    throw new Error('This room is not available for booking.');
  }

  // Check capacity
  if (parseInt(numberOfPeople) > room.capacity) {
    throw new Error(`This room's capacity (${room.capacity}) is less than the number of people (${numberOfPeople}).`);
  }

  // Check if slot is already booked
  const isBooked = room.booked_slots.some(slot => 
    slot.date === formattedDate && slot.time === formattedTime
  );

  if (isBooked) {
    throw new Error('This time slot is already booked.');
  }

  return true;
};

export const initializeDatabase = () => {
  try {
    // Initialize room_lists if not exists
    const roomsData = localStorage.getItem('room_lists');
    if (!roomsData) {
      localStorage.setItem('room_lists', JSON.stringify({ rooms: [] }));
    }

    // Initialize students if not exists
    const studentsData = localStorage.getItem('students');
    if (!studentsData) {
      localStorage.setItem('students', JSON.stringify({ students: [] }));
    }

    return true;
  } catch (error) {
    console.error('Error initializing database:', error);
    return false;
  }
};

export const syncBookingsWithRooms = () => {
  try {
    // Initialize database if needed
    initializeDatabase();

    // Get room and student data with proper initialization
    const roomsData = JSON.parse(localStorage.getItem('room_lists')) || { rooms: [] };
    const studentsData = JSON.parse(localStorage.getItem('students')) || { students: [] };
    
    // Update booking statuses
    const updatedStudents = studentsData.students.map(student => {
      if (!student.booking_history) return student;
      
      const updatedBookings = student.booking_history.map(booking => {
        // Find room details
        const room = roomsData.rooms.find(r => r.room_id === booking.room);
        if (!room) return booking;

        // Update booking with room details and current status
        return {
          ...booking,
          details: {
            building: room.building,
            floor: room.floor,
            capacity: room.capacity,
            services: room.services,
            room_picture: room.room_picture
          },
          status: updateBookingStatus(booking)
        };
      });

      return {
        ...student,
        booking_history: updatedBookings
      };
    });

    // Save updated data
    const updatedStudentsData = { ...studentsData, students: updatedStudents };
    localStorage.setItem('students', JSON.stringify(updatedStudentsData));
    
    // Verify data was saved
    const verifyData = JSON.parse(localStorage.getItem('students'));
    if (!verifyData || !verifyData.students) {
      throw new Error('Failed to save synchronized data');
    }

    return true;
  } catch (error) {
    console.error('Error syncing bookings:', error);
    return false;
  }
};

export const addNewBooking = (studentId, room, date, timeSlot, numberOfPeople) => {
  try {
    // Initialize database if needed
    initializeDatabase();

    if (!studentId || !room || !date || !timeSlot || !numberOfPeople) {
      throw new Error('Missing required booking information');
    }

    // Validate booking first
    validateBooking(room, date, timeSlot, numberOfPeople);

    // Get current data with proper initialization
    let roomsData = JSON.parse(localStorage.getItem('room_lists')) || { rooms: [] };
    let studentsData = JSON.parse(localStorage.getItem('students')) || { students: [] };

    const formattedDate = formatDateForDisplay(date);
    const formattedTime = formatTimeForDisplay(timeSlot);

    // Find student or create if not exists
    let studentIndex = studentsData.students.findIndex(s => s.student_id === studentId);
    if (studentIndex === -1) {
      // Create new student if not found
      studentsData.students.push({
        student_id: studentId,
        booking_history: []
      });
      studentIndex = studentsData.students.length - 1;
    }

    // Ensure booking_history exists
    if (!studentsData.students[studentIndex].booking_history) {
      studentsData.students[studentIndex].booking_history = [];
    }

    // Create new booking
    const newBooking = {
      id: Date.now().toString(),
      room: room.room_id,
      date: formattedDate,
      time: formattedTime,
      status: 'Pending',
      details: {
        building: room.building,
        floor: room.floor,
        capacity: room.capacity,
        services: room.services,
        room_picture: room.room_picture
      },
      number_of_people: numberOfPeople,
      created_at: new Date().toISOString()
    };

    // Add booking to student history
    studentsData.students[studentIndex].booking_history.push(newBooking);

    // Update room's booked slots
    const roomIndex = roomsData.rooms.findIndex(r => r.room_id === room.room_id);
    if (roomIndex === -1) {
      // Add room if not exists
      roomsData.rooms.push({
        ...room,
        booked_slots: []
      });
    }

    // Ensure booked_slots exists
    if (!roomsData.rooms[roomIndex].booked_slots) {
      roomsData.rooms[roomIndex].booked_slots = [];
    }

    // Add new booking slot
    roomsData.rooms[roomIndex].booked_slots.push({
      date: formattedDate,
      time: timeSlot,
      booked_by: studentId,
      booking_id: newBooking.id
    });

    // Save all updated data
    localStorage.setItem('room_lists', JSON.stringify(roomsData));
    localStorage.setItem('students', JSON.stringify(studentsData));

    // Verify data was saved correctly
    const verifyStudents = JSON.parse(localStorage.getItem('students'));
    const verifyRooms = JSON.parse(localStorage.getItem('room_lists'));
    
    if (!verifyStudents || !verifyRooms) {
      throw new Error('Failed to save booking data');
    }

    return newBooking;
  } catch (error) {
    console.error('Error adding booking:', error);
    throw error;
  }
};

export const cancelBooking = (studentId, bookingId) => {
  try {
    if (!studentId || !bookingId) {
      throw new Error('Missing student ID or booking ID');
    }

    // Get current data
    const roomsData = JSON.parse(localStorage.getItem('room_lists'));
    const studentsData = JSON.parse(localStorage.getItem('students'));

    if (!roomsData || !studentsData) {
      throw new Error('Database not initialized');
    }

    // Find student
    const studentIndex = studentsData.students.findIndex(s => s.student_id === studentId);
    if (studentIndex === -1) {
      throw new Error('Student not found');
    }

    // Find booking
    const bookingIndex = studentsData.students[studentIndex].booking_history?.findIndex(b => b.id === bookingId);
    if (bookingIndex === -1 || bookingIndex === undefined) {
      throw new Error('Booking not found');
    }

    const booking = studentsData.students[studentIndex].booking_history[bookingIndex];

    // Check if booking can be cancelled
    if (booking.status === 'Completed') {
      throw new Error('Cannot cancel a completed booking');
    }
    if (booking.status === 'Cancelled') {
      throw new Error('This booking is already cancelled');
    }

    // Update booking status
    studentsData.students[studentIndex].booking_history[bookingIndex] = {
      ...booking,
      status: 'Cancelled',
      cancelled_at: new Date().toISOString()
    };

    // Remove booking from room's booked slots
    const roomIndex = roomsData.rooms.findIndex(r => r.room_id === booking.room);
    if (roomIndex !== -1) {
      roomsData.rooms[roomIndex].booked_slots = roomsData.rooms[roomIndex].booked_slots.filter(
        slot => !(slot.date === booking.date && 
                 slot.time === booking.time && 
                 slot.booked_by === studentId)
      );
    }

    // Save updated data
    localStorage.setItem('room_lists', JSON.stringify(roomsData));
    localStorage.setItem('students', JSON.stringify(studentsData));

    return studentsData.students[studentIndex].booking_history[bookingIndex];
  } catch (error) {
    console.error('Error cancelling booking:', error);
    throw error;
  }
}; 