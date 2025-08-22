"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import listsApi from "../../../api/lists";
import type { ListItem } from "../../../api/lists";
import agentsApi from "../../../api/agents";
import type { Agent } from "../../../api/agents";
import { toast } from "react-toastify";
import * as React from 'react';

interface ListDetailPageProps {
  params: Promise<{
    batch: string;
  }>;
}

// —————————————————————————————————————————————————————————
// Local types to normalize questionable API shapes
// —————————————————————————————————————————————————————————

type NormalizedItem = {
  _id: string;
  name: string;
  address: string;
  phone?: string;
  createdAt?: string;
  agent: Agent | null; // force a consistent shape locally
  // keep any extra fields so existing UI remains compatible
  [key: string]: unknown;
};

type AgentGroup = Record<string, { name: string; items: NormalizedItem[] }>; // "unassigned" bucket allowed

export default function ListDetailPage({ params }: ListDetailPageProps) {
  const [items, setItems] = useState<NormalizedItem[]>([]);
  const [agents, setAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(true);
  const [assigningItem, setAssigningItem] = useState<string | null>(null);
  const [selectedAgent, setSelectedAgent] = useState<string>("");
  const [deletingBatch, setDeletingBatch] = useState(false);
  const { batch } = React.use(params);
  const router = useRouter();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // ——— lists
        const listResponse = await listsApi.getListByBatch(batch);
        const rawItems: unknown = (listResponse as any)?.data;
        const rawArray: any[] = Array.isArray(rawItems)
          ? rawItems
          : (rawItems as any)?.data ?? [];

        const normalized: NormalizedItem[] = rawArray
          .filter((it) => it && (it._id || it.id))
          .map((it) => {
            const agentVal = (it as any).agent;
            const agentObj: Agent | null =
              agentVal && typeof agentVal === "object" ? (agentVal as Agent) : null;

            return {
              ...(it as ListItem),
              _id: (it as any)._id ?? (it as any).id,
              name:
                (it as any).name ??
                (it as any).firstName ??
                (it as any).fullName ??
                "Unknown",
              address: (it as any).address ?? (it as any).notes ?? "",
              phone: (it as any).phone,
              createdAt: (it as any).createdAt,
              agent: agentObj,
            } satisfies NormalizedItem;
          });

        setItems(normalized);

        // ——— agents
        const agentsResponse = await agentsApi.getAgents();
        const agentsRaw: unknown = (agentsResponse as any)?.data;
        const fetchedAgents: Agent[] = Array.isArray(agentsRaw)
          ? (agentsRaw as Agent[])
          : (((agentsRaw as any)?.data as Agent[]) ?? []);

        setAgents(fetchedAgents);
      } catch (error: any) {
        console.error("Error fetching data:", error);
        toast.error(error?.message || "Failed to fetch data");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [batch]);

  // —————————————————————————————————————————————————————————
  // Actions
  // —————————————————————————————————————————————————————————
  const handleAssignTask = async (itemId: string) => {
    if (!selectedAgent) {
      toast.error("Please select an agent");
      return;
    }

    try {
      await listsApi.assignTaskToAgent(itemId, selectedAgent);
      toast.success("Task assigned successfully");

      const agentObj = agents.find((a) => (a as any)._id === selectedAgent) ?? null;

      // Update local state with a consistent Agent object
      setItems((prev) =>
        prev.map((it) => (it._id === itemId ? { ...it, agent: agentObj } : it))
      );

      setAssigningItem(null);
      setSelectedAgent("");
    } catch (error: any) {
      console.error(error);
      toast.error(error?.message || "Failed to assign task");
    }
  };

  // —————————————————————————————————————————————————————————
  // Derived data
  // —————————————————————————————————————————————————————————
  const groups: AgentGroup = useMemo(() => {
    return items.reduce<AgentGroup>((acc, item) => {
      const agentId = item.agent?._id ?? "unassigned";
      const agentName = item.agent?.name ?? "Unassigned";
      if (!acc[agentId]) acc[agentId] = { name: agentName, items: [] };
      acc[agentId].items.push(item);
      return acc;
    }, {});
  }, [items]);

  const uploadedOn: string | null = useMemo(() => {
    const timestamps = items
      .map((i) => i.createdAt)
      .filter((d): d is string => Boolean(d))
      .map((d) => new Date(d).getTime())
      .filter((n) => !Number.isNaN(n));
    if (!timestamps.length) return null;
    return new Date(Math.min(...timestamps)).toLocaleDateString();
  }, [items]);

  // —————————————————————————————————————————————————————————
  // Render
  // —————————————————————————————————————————————————————————
  const handleDeleteBatch = async () => {
    if (!confirm(`Are you sure you want to delete batch ${batch}? This will permanently delete all ${items.length} items in this batch.`)) {
      return;
    }

    try {
      setDeletingBatch(true);
      await listsApi.deleteBatch(batch);
      toast.success('Batch deleted successfully');
      router.push('/dashboard/lists');
    } catch (error: any) {
      console.error('Error deleting batch:', error);
      toast.error(error.message || 'Failed to delete batch');
    } finally {
      setDeletingBatch(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500" />
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">List Details: {batch}</h1>
        <div className="flex space-x-4">
          <button
            onClick={handleDeleteBatch}
            disabled={deletingBatch}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {deletingBatch ? 'Deleting...' : 'Delete Batch'}
          </button>
          <Link href="/dashboard/lists" className="text-sm font-medium text-blue-600 hover:text-blue-500">
            Back to Lists
          </Link>
        </div>
      </div>

      {items.length === 0 ? (
        <div className="bg-white shadow overflow-hidden sm:rounded-lg p-6 text-center">
          <p className="text-gray-500">No items found in this batch.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          <div className="bg-white shadow overflow-hidden sm:rounded-lg">
            <div className="px-4 py-5 sm:px-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900">Batch {batch} - {items.length} items</h3>
              <p className="mt-1 max-w-2xl text-sm text-gray-500">Uploaded on {uploadedOn ?? "Unknown"}</p>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Phone</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Address</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Assigned Agent</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {items.map((item) => (
                    <tr key={item._id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{item.name}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500">{item.phone ?? "—"}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-500">{item.address}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {assigningItem === item._id ? (
                          <div className="flex items-center space-x-2">
                            <select
                              className="text-sm border border-gray-300 rounded-md p-1"
                              value={selectedAgent}
                              onChange={(e) => setSelectedAgent(e.target.value)}
                            >
                              <option value="">Select Agent</option>
                              {agents.map((agent) => (
                                <option key={(agent as any)._id} value={(agent as any)._id}>
                                  {(agent as any).name}
                                </option>
                              ))}
                            </select>
                            <button
                              onClick={() => handleAssignTask(item._id)}
                              className="text-xs bg-blue-500 text-white px-2 py-1 rounded"
                            >
                              Assign
                            </button>
                            <button
                              onClick={() => {
                                setAssigningItem(null);
                                setSelectedAgent("");
                              }}
                              className="text-xs bg-gray-300 text-gray-700 px-2 py-1 rounded"
                            >
                              Cancel
                            </button>
                          </div>
                        ) : (
                          <div className="flex items-center justify-between">
                            <div className="text-sm text-gray-500">
                              {item.agent?.name ?? "Not assigned"}
                            </div>
                            <button
                              onClick={() => setAssigningItem(item._id)}
                              className="text-xs text-blue-600 hover:text-blue-800 ml-2"
                            >
                              {item.agent ? "Reassign" : "Assign"}
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="bg-white shadow rounded-lg p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Tasks by Agent</h3>
            {Object.entries(groups).map(([agentId, group]) => (
              <div key={agentId} className="mb-6 border-b pb-4 text-black">
                <div className="flex justify-between items-center mb-2">
                  <h4 className="text-md font-medium">{group.name}</h4>
                  <span className="text-sm text-gray-500">{group.items.length} items</span>
                </div>
                <ul className="space-y-1">
                  {group.items.map((it) => (
                    <li key={it._id} className="text-sm">
                      {it.name} - {it.phone ?? "—"}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
