import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

interface ListItem {
  _id?: string;
  firstName: string;
  phone: string;
  notes: string;
  agent: {
    _id: string;
    name: string;
    email: string;
  } | string;
  uploadBatch: string;
  createdAt?: string;
  address?: string;
  name?: string; // For compatibility with the frontend display
}

interface ListBatch {
  batch: string;
  createdAt: string;
  count: number;
}

interface AgentListData {
  _id: string;
  agentName: string;
  agentEmail: string;
  items: ListItem[];
  count: number;
}

const listsApi = {
  uploadList: async (formData: FormData) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('No token found');

      // Log the form data for debugging
      console.log('FormData being sent:', formData);
      
      const response = await axios.post(`${API_URL}/lists/upload`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        },
        // Increase timeout for larger files
        timeout: 60000,
      });
      
      // Log the response for debugging
      console.log('Upload response:', response.data);
      
      return response.data;
    } catch (error: any) {
      console.error('API Error:', error);
      if (error.response) {
        console.error('Response data:', error.response.data);
        console.error('Response status:', error.response.status);
      }
      throw error.response?.data?.error || 'Failed to upload list';
    }
  },
  
  assignTaskToAgent: async (itemId: string, agentId: string) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('No token found');

      const response = await axios.put(
        `${API_URL}/lists/assign/${itemId}`,
        { agentId },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      return response.data;
    } catch (error: any) {
      console.error('Error assigning task:', error);
      throw error.response?.data?.error || 'Failed to assign task to agent';
    }
  },

  getListByAgent: async (agentId: string) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('No token found');

      const response = await axios.get(`${API_URL}/lists/agent/${agentId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      return response.data;
    } catch (error: any) {
      console.error('Error fetching agent list items:', error);
      throw error.response?.data?.error || 'Failed to fetch agent list items';
    }
  },

  getLists: async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('No token found');

      const response = await axios.get(`${API_URL}/lists`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.data;
    } catch (error: any) {
      throw error.response?.data?.error || 'Failed to fetch lists';
    }
  },

  getListByBatch: async (batch: string) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('No token found');

      const response = await axios.get(`${API_URL}/lists/${batch}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.data;
    } catch (error: any) {
      throw error.response?.data?.error || 'Failed to fetch list';
    }
  },

  deleteBatch: async (batch: string) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('No token found');

      const response = await axios.delete(`${API_URL}/lists/${batch}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.data;
    } catch (error: any) {
      console.error('Error deleting batch:', error);
      throw error.response?.data?.error || 'Failed to delete batch';
    }
  },
};

export default listsApi;
export type { ListItem, ListBatch, AgentListData };