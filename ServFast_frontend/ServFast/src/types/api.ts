/**
 * ServiceHub API Type Definitions
 */

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'CLIENT' | 'PROVIDER' | 'ADMIN';
  avatarUrl?: string;
  bio?: string;
  createdAt: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface Service {
  id: string;
  title: string;
  description: string;
  price: number;
  category: string;
  providerId: string;
  providerName: string;
  rating: number;
  reviewCount: number;
  imageUrl?: string;
  tags: string[];
}

export interface Order {
  id: string;
  serviceId: string;
  clientId: string;
  providerId: string;
  amount: number;
  status: 'PENDING' | 'ACCEPTED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
  createdAt: string;
  updatedAt: string;
}

// ✅ Aligned with MessageResponseDTO (backend uses number IDs, sentAt, senderName)
export interface Message {
  id: number;
  senderId: number;
  senderName: string;
  senderPhoto?: string;
  receiverId: number;
  receiverName: string;
  content: string;
  isRead: boolean;
  sentAt: string;
}

// ✅ Aligned with ConversationDTO (backend returns participantId, not nested User)
export interface Conversation {
  participantId: number;
  participantName: string;
  participantPhoto?: string;
  lastMessage: string;
  lastMessageAt: string;
  unreadCount: number;
}

export interface Rating {
  id: string;
  serviceId: string;
  clientId: string;
  score: number;
  comment: string;
  createdAt: string;
  clientName?: string;
}