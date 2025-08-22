'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import AgentForm from '../../../components/AgentForm';
import agentsApi, { Agent } from '../../../api/agents';
import { toast } from 'react-toastify';

interface EditAgentPageProps {
  params: {
    id: string;
  };
}

export default function EditAgentPage({ params }: EditAgentPageProps) {
  const [agent, setAgent] = useState<Agent | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);
  const router = useRouter();
  const { id } = React.use(params);

  useEffect(() => {
    const fetchAgent = async () => {
      try {
        const response = await agentsApi.getAgent(id);
        setAgent(response.data);
      } catch (error: any) {
        toast.error(error.message || 'Failed to fetch agent');
        router.push('/dashboard/agents');
      } finally {
        setIsFetching(false);
      }
    };

    fetchAgent();
  }, [id, router]);

  const handleSubmit = async (data: any) => {
    setIsLoading(true);
    try {
      await agentsApi.updateAgent(id, data);
      toast.success('Agent updated successfully');
      router.push('/dashboard/agents');
    } catch (error: any) {
      toast.error(error.message || 'Failed to update agent');
    } finally {
      setIsLoading(false);
    }
  };

  if (isFetching) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!agent) {
    return (
      <div className="bg-white shadow overflow-hidden sm:rounded-lg p-6 text-center">
        <p className="text-gray-500">Agent not found.</p>
        <Link
          href="/dashboard/agents"
          className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-blue-700 bg-blue-100 hover:bg-blue-200"
        >
          Back to Agents
        </Link>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">Edit Agent</h1>
        <Link
          href="/dashboard/agents"
          className="text-sm font-medium text-blue-600 hover:text-blue-500"
        >
          Back to Agents
        </Link>
      </div>

      <div className="bg-white shadow overflow-hidden sm:rounded-lg p-6">
        <AgentForm agent={agent} onSubmit={handleSubmit} isLoading={isLoading} />
      </div>
    </div>
  );
}