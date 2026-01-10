
import { Hub, Booking } from './types';

/**
 * INITIAL STATE: EMPTY
 * To satisfy the requirement that no hubs exist until an owner adds them.
 */
export const MOCK_HUBS: Hub[] = [];

export const MOCK_BOOKINGS: Booking[] = [];

export const GARF_BUZZ = [
  { id: 1, title: 'CASHLESS PAYMENTS', content: 'Fast, secure digital checkouts for every hub.', tag: 'DIGITAL' },
  { id: 2, title: 'GAMING MADE EASY', content: 'One-tap reservations for intensive gaming sessions.', tag: 'SMOOTH' },
  { id: 3, title: 'EASY ACCESS', content: 'Find premium turfs and cafes nearby in seconds.', tag: 'ACCESS' },
  { id: 4, title: 'INSTANT BOOKING', content: 'Real-time slot management for a seamless experience.', tag: 'ACTIVE' },
];