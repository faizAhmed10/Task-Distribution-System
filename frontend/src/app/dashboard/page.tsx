'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import agentsApi, { Agent } from '../api/agents';
import listsApi, { ListBatch } from '../api/lists';
import { toast } from 'react-toastify';

export default function Dashboard() {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [lists, setLists] = useState<ListBatch[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [agentsResponse, listsResponse] = await Promise.all([
          agentsApi.getAgents(),
          listsApi.getLists(),
        ]);
        setAgents(agentsResponse.data);
        setLists(listsResponse.data);
      } catch (error: any) {
        toast.error(error.message || 'Failed to fetch dashboard data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-semibold text-gray-900 mb-6">Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Agents Summary */}
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-medium text-gray-900">Agents</h2>
              <Link
                href="/dashboard/agents"
                className="text-sm font-medium text-blue-600 hover:text-blue-500"
              >
                View all
              </Link>
            </div>
            <div className="mt-4">
              <p className="text-3xl font-semibold text-gray-900">{agents.length}</p>
              <p className="mt-1 text-sm text-gray-500">Total agents registered</p>
            </div>
            <div className="mt-4">
              <Link
                href="/dashboard/agents/new"
                className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Add New Agent
              </Link>
            </div>
          </div>
        </div>

        {/* Lists Summary */}
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-medium text-gray-900">Lists</h2>
              <Link
                href="/dashboard/lists"
                className="text-sm font-medium text-blue-600 hover:text-blue-500"
              >
                View all
              </Link>
            </div>
            <div className="mt-4">
              <p className="text-3xl font-semibold text-gray-900">{lists.length}</p>
              <p className="mt-1 text-sm text-gray-500">Total lists uploaded</p>
            </div>
            <div className="mt-4">
              <Link
                href="/dashboard/upload"
                className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Upload New List
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="mt-6 bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Recent Activity</h2>
          {lists.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Batch ID
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Date
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {lists.slice(0, 5).map((list) => (
                    <tr key={list.batch}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {list.batch}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(list.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <Link
                          href={`/dashboard/lists/${list.batch}`}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          View Details
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-gray-500">No lists have been uploaded yet.</p>
          )}
        </div>
      </div>
    </div>
  );
}