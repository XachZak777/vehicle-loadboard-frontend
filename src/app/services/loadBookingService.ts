import { LoadBooking, LoadStatus } from '../types/user';
import { Load } from '../types';

// Mock database for bookings
const BOOKINGS_KEY = 'load_bookings';

export function getBookings(): LoadBooking[] {
  const saved = localStorage.getItem(BOOKINGS_KEY);
  return saved ? JSON.parse(saved) : [];
}

function saveBookings(bookings: LoadBooking[]): void {
  localStorage.setItem(BOOKINGS_KEY, JSON.stringify(bookings));
}

export function createBookingRequest(
  load: Load,
  carrierId: string,
  carrierName: string,
  carrierEmail: string,
  carrierPhone: string
): LoadBooking {
  const bookings = getBookings();
  
  const newBooking: LoadBooking = {
    id: `booking-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    loadId: load.id,
    carrierId,
    carrierName,
    carrierEmail,
    carrierPhone,
    status: 'requested',
    requestedAt: new Date().toISOString(),
  };
  
  bookings.push(newBooking);
  saveBookings(bookings);
  
  return newBooking;
}

export function getBookingsByLoadId(loadId: string): LoadBooking[] {
  const bookings = getBookings();
  return bookings.filter(b => b.loadId === loadId);
}

export function getBookingsByCarrierId(carrierId: string): LoadBooking[] {
  const bookings = getBookings();
  return bookings.filter(b => b.carrierId === carrierId);
}

export function getBookingById(bookingId: string): LoadBooking | undefined {
  const bookings = getBookings();
  return bookings.find(b => b.id === bookingId);
}

export function updateBookingStatus(
  bookingId: string,
  status: LoadStatus,
  notes?: string
): LoadBooking | null {
  const bookings = getBookings();
  const booking = bookings.find(b => b.id === bookingId);
  
  if (!booking) return null;
  
  booking.status = status;
  if (notes) booking.notes = notes;
  
  const now = new Date().toISOString();
  
  switch (status) {
    case 'booked':
      booking.bookedAt = now;
      break;
    case 'picked-up':
      booking.pickedUpAt = now;
      break;
    case 'delivered':
      booking.deliveredAt = now;
      break;
    case 'paid':
      booking.paidAt = now;
      break;
  }
  
  saveBookings(bookings);
  return booking;
}

export function deleteBooking(bookingId: string): boolean {
  const bookings = getBookings();
  const filteredBookings = bookings.filter(b => b.id !== bookingId);
  
  if (filteredBookings.length === bookings.length) {
    return false; // Booking not found
  }
  
  saveBookings(filteredBookings);
  return true;
}

// Get bookings for loads created by a specific broker
export function getBookingsForBrokerLoads(loads: Load[]): LoadBooking[] {
  const bookings = getBookings();
  const loadIds = new Set(loads.map(l => l.id));
  return bookings.filter(b => loadIds.has(b.loadId));
}
