
import { Hub, Booking } from './types';

export const MOCK_HUBS: Hub[] = [
  {
    id: '1',
    name: 'Arena One Turf',
    type: 'TURF',
    location: 'Mumbai, MH',
    rating: 4.8,
    image: 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?auto=format&fit=crop&q=80&w=1200',
    priceStart: 1200,
    description: 'Premier 5-a-side football turf with FIFA quality artificial grass.',
    amenities: ['Parking', 'Drinking Water', 'Washroom', 'Floodlights'],
    isBestSeller: true,
    slots: [
      { id: 's1', time: '16:00', price: 1200, available: true },
      { id: 's2', time: '17:00', price: 1200, available: true },
      { id: 's3', time: '18:00', price: 1500, available: true },
      { id: 's4', time: '19:00', price: 1500, available: true },
    ]
  },
  {
    id: '2',
    name: 'Cyber Zone Gaming',
    type: 'GAMING CAFE',
    location: 'Pune, MH',
    rating: 4.9,
    image: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&q=80&w=1200',
    priceStart: 500,
    description: 'High-performance gaming PC lounge with latest RTX graphics cards.',
    amenities: ['Fiber Internet', 'Snacks', 'AC', 'PS5 Zone'],
    isBestSeller: true,
    slots: [],
    accessories: [
      {
        id: 'acc1',
        name: 'PS5-VIP-01',
        type: 'CONSOLE',
        slots: [
          { id: 'as1', time: '14:00', price: 600, available: true },
          { id: 'as2', time: '15:00', price: 600, available: true }
        ]
      },
      {
        id: 'acc2',
        name: 'RTX-PC-08',
        type: 'PC',
        slots: [
          { id: 'as3', time: '14:00', price: 100, available: true },
          { id: 'as4', time: '15:00', price: 100, available: true }
        ]
      }
    ]
  },
  {
    id: '3',
    name: 'Starlight Stadium',
    type: 'TURF',
    location: 'Bangalore, KA',
    rating: 4.6,
    image: 'https://images.unsplash.com/photo-1551958219-acbc608c6377?auto=format&fit=crop&q=80&w=1200',
    priceStart: 1000,
    description: 'Rooftop multisport facility for cricket and football.',
    amenities: ['Equipment Rental', 'First Aid', 'Refreshments'],
    isBestSeller: false,
    slots: [
      { id: 's9', time: '09:00', price: 1000, available: true },
    ]
  }
];

export const MOCK_BOOKINGS: Booking[] = [
  {
    id: 'b1',
    hubId: '1',
    hubName: 'Arena One Turf',
    slotId: 's1',
    slotTime: '16:00',
    userId: 'u1',
    userName: 'Rahul Sharma',
    date: '2023-11-20',
    createdAt: Date.now() - 5 * 60 * 1000,
    status: 'pending',
    paymentMethod: 'cash'
  },
  {
    id: 'b2',
    hubId: '2',
    hubName: 'Cyber Zone Gaming',
    slotId: 'as1',
    slotTime: '14:00',
    accessoryName: 'PS5-VIP-01',
    userId: 'u2',
    userName: 'Aman Varma',
    date: '2023-11-20',
    createdAt: Date.now() - 2 * 60 * 1000,
    status: 'confirmed',
    paymentMethod: 'online'
  }
];

export const GARF_BUZZ = [
  { id: 1, title: 'CASHLESS PAYMENTS', content: 'Fast, secure digital checkouts for every hub.', tag: 'DIGITAL' },
  { id: 2, title: 'GAMING MADE EASY', content: 'One-tap reservations for elite gaming sessions.', tag: 'SMOOTH' },
  { id: 3, title: 'EASY ACCESS', content: 'Find premium turfs and cafes nearby in seconds.', tag: 'ACCESS' },
  { id: 4, title: 'INSTANT BOOKING', content: 'Real-time slot management for a seamless experience.', tag: 'ELITE' },
];
