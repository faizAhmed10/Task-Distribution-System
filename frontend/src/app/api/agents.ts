import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export interface Agent {
  _id?: string;
  name: string;
  email: string;
  countryCode: string;
  mobile: string;
  password?: string;
  createdAt?: string;
  active?: boolean;
}

const agentsApi = {
  getAgents: async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('No token found');

      const response = await axios.get(`${API_URL}/agents`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.data;
    } catch (error: any) {
      throw error.response?.data?.error || 'Failed to fetch agents';
    }
  },

  getAgent: async (id: string) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('No token found');

      const response = await axios.get(`${API_URL}/agents/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.data;
    } catch (error: any) {
      throw error.response?.data?.error || 'Failed to fetch agent';
    }
  },

  createAgent: async (agentData: Agent) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('No token found');

      const response = await axios.post(`${API_URL}/agents`, agentData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      console.log(response.data)
      return response.data;
    } catch (error: any) {
      throw error.response?.data?.error || 'Failed to create agent';
    }
  },

  updateAgent: async (id: string, agentData: Partial<Agent>) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('No token found');

      const response = await axios.put(`${API_URL}/agents/${id}`, agentData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.data;
    } catch (error: any) {
      throw error.response?.data?.error || 'Failed to update agent';
    }
  },

  deleteAgent: async (id: string) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('No token found');

      const response = await axios.delete(`${API_URL}/agents/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.data;
    } catch (error: any) {
      throw error.response?.data?.error || 'Failed to delete agent';
    }
  },
};

export default agentsApi;