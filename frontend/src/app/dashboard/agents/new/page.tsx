'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import AgentForm from '../../../components/AgentForm';
import agentsApi from '../../../api/agents';
import { toast } from 'react-toastify';

export default function NewAgentPage() {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (data: any) => {
    setIsLoading(true);
    try {
      await agentsApi.createAgent(data);
      toast.success('Agent created successfully');
      router.push('/dashboard/agents');
    } catch (error: any) {
      toast.error(error.message || 'Failed to create agent');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">Add New Agent</h1>
        <Link
          href="/dashboard/agents"
          className="text-sm font-medium text-blue-600 hover:text-blue-500"
        >
          Back to Agents
        </Link>
      </div>

      <div className="bg-white shadow overflow-hidden sm:rounded-lg p-6">
        <AgentForm onSubmit={handleSubmit} isLoading={isLoading} />
      </div>
    </div>
  );
}