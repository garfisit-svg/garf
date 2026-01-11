export type UserRole = 'user' | 'owner' | 'guest';

export interface TimeSlot {
  id: string;
  time: string;
  price: number;
  available: boolean;
}

export interface Accessory {
  id: string;
  name: string;
  slots: TimeSlot[];
}

export interface Review {
  id: string;
  userName: string;
  rating: number;
  comment: string;
  date: string;
}

export interface Hub {
  id: string;
  name: string;
  type: 'TURF' | 'GAMING CAFE';
  location: string;
  lat?: number;
  lng?: number;
  rating: number;
  images: string[];
  priceStart: number;
  description: string;
  amenities: string[];
  slots: TimeSlot[]; // For Turfs
  accessories?: Accessory[]; // For Gaming Cafes
  isBestSeller?: boolean;
  isSoldOut?: boolean;
  contactPhone?: string;
  contactEmail?: string;
  upiId?: string; // New: Owner's direct UPI ID for payments
  reviews?: Review[];
}

export interface Booking {
  id: string;
  hubId: string;
  hubName: string;
  slotId: string;
  slotTime: string;
  userId: string;
  userName: string;
  date: string;
  createdAt: number; // timestamp
  status: 'confirmed' | 'pending' | 'expired';
  paymentMethod: 'online' | 'cash' | 'upi';
  transactionId?: string;
  accessoryName?: string;
  playerCount?: number;
}

export interface PollOption {
  text: string;
  votes: string[];
}

export interface Poll {
  id: string;
  question: string;
  options: PollOption[];
  createdBy: string;
}

export interface ChatMessage {
  id: string;
  senderNickname: string;
  text?: string;
  timestamp: number;
  type: 'text' | 'poll';
  poll?: Poll;
  isSystem?: boolean;
}

export interface ChatRoom {
  id: string;
  name: string;
  description: string;
  isGlobal: boolean;
  messages: ChatMessage[];
  joinCode?: string;
}