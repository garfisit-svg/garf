export type UserRole = 'user' | 'owner' | 'guest';

export interface TimeSlot {
  id: string;
  time: string;
  price: number;
  available: boolean;
}

export interface Category {
  id: string;
  name: string;
  totalUnits: number;
  pricePerHour: number;
  image?: string;
  slots: TimeSlot[];
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
  owner_id?: string;
  name: string;
  type: 'TURF' | 'GAMING CAFE';
  location: string;
  lat?: number;
  lng?: number;
  rating: number;
  images: string[];
  foodMenu?: string[];
  priceStart: number;
  description: string;
  amenities: string[];
  slots: TimeSlot[]; // For Turfs
  categories?: Category[]; // For Gaming Cafes
  accessories?: Accessory[]; // Legacy support
  isBestSeller?: boolean;
  isSoldOut?: boolean;
  contactPhone?: string;
  contactEmail?: string;
  upiId?: string; 
  reviews?: Review[];
  bookingCount?: number;
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
  createdAt: number;
  status: 'confirmed' | 'pending' | 'expired';
  paymentMethod: 'online' | 'upi'; 
  transactionId?: string;
  accessoryName?: string;
  categoryName?: string;
  categoryId?: string;
  playerCount?: number;
  basePrice?: number;
  serviceFee?: number;
  totalPrice?: number;
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