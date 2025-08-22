'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import listsApi, { ListBatch } from '../../api/lists';
import { toast } from 'react-toastify';

export default function ListsPage() {
  const [lists, setLists] = useState<ListBatch[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingBatch, setDeletingBatch] = useState<string | null>(null);

  useEffect(() => {
    const fetchLists = async () => {
      setLoading(true);
      try {
        const response = await listsApi.getLists();
        console.log('Lists data:', response);
        
        // Process the data to ensure it's in the correct format
        const processedLists = Array.isArray(response.data) 
          ? response.data 
          : response.data || [];
        
        // Ensure each list has a count property
        const listsWithCounts = processedLists.map(list => ({
          ...list,
          count: list.count || 0
        }));
        
        setLists(listsWithCounts);
      } catch (error: any) {
        console.error('Error fetching lists:', error);
        toast.error(error.message || 'Failed to fetch lists');
      } finally {
        setLoading(false);
      }
    };

    fetchLists();
  }, []);

  console.log("Lists: ",lists)
  const handleDeleteBatch = async (batch: string) => {
    if (!confirm(`Are you sure you want to delete batch ${batch}? This will permanently delete all items in this batch.`)) {
      return;
    }

    try {
      setDeletingBatch(batch);
      await listsApi.deleteBatch(batch);
      toast.success('Batch deleted successfully');
      
      // Remove the deleted batch from the local state
      setLists(prev => prev.filter(list => list.batch !== batch));
    } catch (error: any) {
      console.error('Error deleting batch:', error);
      toast.error(error.message || 'Failed to delete batch');
    } finally {
      setDeletingBatch(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">Lists</h1>
        <Link
          href="/dashboard/upload"
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          Upload New List
        </Link>
      </div>

      {lists.length === 0 ? (
        <div className="bg-white shadow overflow-hidden sm:rounded-lg p-6 text-center">
          <p className="text-gray-500">No lists found. Upload your first list to get started.</p>
        </div>
      ) : (
        <div className="bg-white shadow overflow-hidden sm:rounded-lg">
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
                  Upload Date
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Items Count
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
              {lists.map((list) => (
                <tr key={list.batch}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{list.batch}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500">
                      {new Date(list.createdAt).toLocaleDateString()}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500">{list.count}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                    <Link
                      href={`/dashboard/lists/${list.batch}`}
                      className="text-blue-600 hover:text-blue-900"
                    >
                      View Details
                    </Link>
                    <button
                      onClick={() => handleDeleteBatch(list.batch)}
                      disabled={deletingBatch === list.batch}
                      className="text-red-600 hover:text-red-900 disabled:opacity-50 disabled:cursor-not-allowed ml-4"
                    >
                      {deletingBatch === list.batch ? 'Deleting...' : 'Delete'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}