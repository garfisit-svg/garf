
import { Hub, Booking } from './types';

export const MOCK_HUBS: Hub[] = [
  {
    id: '1',
    name: 'Arena One Turf',
    type: 'TURF',
    location: 'Mumbai, MH',
    lat: 19.0760,
    lng: 72.8777,
    rating: 4.8,
    images: [
      'https://images.unsplash.com/photo-1574629810360-7efbbe195018?auto=format&fit=crop&q=80&w=1200',
      'https://images.unsplash.com/photo-1529900748604-07564a03e7a6?auto=format&fit=crop&q=80&w=1200',
      'https://images.unsplash.com/photo-1551958219-acbc608c6377?auto=format&fit=crop&q=80&w=1200'
    ],
    priceStart: 1200,
    description: 'Premier 5-a-side football turf with FIFA quality artificial grass. Perfect for midnight matches under state-of-the-art floodlights.',
    amenities: ['Parking', 'Drinking Water', 'Washroom', 'Floodlights'],
    isBestSeller: true,
    contactPhone: '+91 9876543210',
    contactEmail: 'contact@arenaone.com',
    slots: [
      { id: 's1', time: '16:00', price: 1200, available: true },
      { id: 's2', time: '17:00', price: 1200, available: true },
      { id: 's3', time: '18:00', price: 1500, available: true },
      { id: 's4', time: '19:00', price: 1500, available: true },
    ],
    reviews: [
      { id: 'rev1', userName: 'Rahul S.', rating: 5, comment: 'Best turf in Mumbai! The grass quality is top notch.', date: '2023-11-15' },
      { id: 'rev2', userName: 'Vikram K.', rating: 4, comment: 'Great lighting for night games.', date: '2023-11-10' }
    ]
  },
  {
    id: '2',
    name: 'Cyber Zone Gaming',
    type: 'GAMING CAFE',
    location: 'Pune, MH',
    lat: 18.5204,
    lng: 73.8567,
    rating: 4.9,
    images: [
      'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&q=80&w=1200',
      'https://images.unsplash.com/photo-1593305841991-05c297ba4575?auto=format&fit=crop&q=80&w=1200',
      'https://images.unsplash.com/photo-1538481199705-c710c4e965fc?auto=format&fit=crop&q=80&w=1200'
    ],
    priceStart: 500,
    description: 'High-performance gaming PC lounge with latest RTX graphics cards and 240Hz monitors for the ultimate competitive edge.',
    amenities: ['Fiber Internet', 'Snacks', 'AC', 'PS5 Zone'],
    isBestSeller: true,
    contactPhone: '+91 8888877777',
    contactEmail: 'play@cyberzone.in',
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
    ],
    reviews: [
      { id: 'rev3', userName: 'Anish G.', rating: 5, comment: 'Insane FPS on these PCs. Love the vibe here!', date: '2023-11-18' }
    ]
  }
];

export const MOCK_BOOKINGS: Booking[] = [];

export const GARF_BUZZ = [
  { id: 1, title: 'CASHLESS PAYMENTS', content: 'Fast, secure digital checkouts for every hub.', tag: 'DIGITAL' },
  { id: 2, title: 'GAMING MADE EASY', content: 'One-tap reservations for elite gaming sessions.', tag: 'SMOOTH' },
  { id: 3, title: 'EASY ACCESS', content: 'Find premium turfs and cafes nearby in seconds.', tag: 'ACCESS' },
  { id: 4, title: 'INSTANT BOOKING', content: 'Real-time slot management for a seamless experience.', tag: 'ELITE' },
];
