import api from './axiosConfig';
import type { Message, Conversation } from '../types/api';

export type { Message, Conversation };

export const messagesApi = {
  /**
   * Send a message to a receiver.
   */
  send: async (receiverId: number, content: string): Promise<Message> => {
    const res = await api.post('/messages', { receiverId, content });
    return res.data;
  },

  /**
   * Fetch messages with a partner AND mark them as read (backend handles both).
   */
  getConversation: async (partnerId: number): Promise<Message[]> => {
    const res = await api.get(`/messages/${partnerId}`);
    return res.data;
  },

  /**
   * Fetch all conversations sorted by lastMessageAt DESC (backend sorts).
   */
  getConversations: async (): Promise<Conversation[]> => {
    const res = await api.get('/messages/conversations');
    return res.data;
  },
};