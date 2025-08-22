'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Agent } from '../api/agents';

const agentSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email'),
  countryCode: z.string().min(1, 'Country code is required'),
  mobile: z.string().min(10, 'Mobile number must be at least 10 characters'),
  password: z.string().min(6, 'Password must be at least 6 characters').optional().nullable(),
  active: z.boolean().default(true),
});

type AgentFormData = z.infer<typeof agentSchema> & {
  password?: string;
};

interface AgentFormProps {
  agent?: Agent;
  onSubmit: (data: AgentFormData) => Promise<void>;
  isLoading: boolean;
}

export default function AgentForm({ agent, onSubmit, isLoading }: AgentFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<AgentFormData>({
    resolver: zodResolver(agentSchema),
    defaultValues: agent
      ? {
          name: agent.name,
          email: agent.email,
          countryCode: agent.countryCode,
          mobile: agent.mobile,
          active: agent.active,
        }
      : undefined,
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-gray-700">
          Name
        </label>
        <input
          type="text"
          id="name"
          {...register('name')}
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
        />
        {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>}
      </div>

      <div>
        <label htmlFor="email" className="block text-sm font-medium text-gray-700">
          Email
        </label>
        <input
          type="email"
          id="email"
          {...register('email')}
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
        />
        {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label htmlFor="countryCode" className="block text-sm font-medium text-gray-700">
            Country Code
          </label>
          <input
            type="text"
            id="countryCode"
            placeholder="+1"
            {...register('countryCode')}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          />
          {errors.countryCode && <p className="mt-1 text-sm text-red-600">{errors.countryCode.message}</p>}
        </div>
        <div className="md:col-span-2">
          <label htmlFor="mobile" className="block text-sm font-medium text-gray-700">
            Mobile Number
          </label>
          <input
            type="text"
            id="mobile"
            {...register('mobile')}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          />
          {errors.mobile && <p className="mt-1 text-sm text-red-600">{errors.mobile.message}</p>}
        </div>
      </div>

      {!agent && (
        <div>
          <label htmlFor="password" className="block text-sm font-medium text-gray-700">
            Password
          </label>
          <input
            type="password"
            id="password"
            {...register('password')}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          />
          {errors.password && <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>}
        </div>
      )}

      <div className="flex items-center">
        <input
          id="active"
          type="checkbox"
          {...register('active')}
          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
        />
        <label htmlFor="active" className="ml-2 block text-sm text-gray-900">
          Active
        </label>
      </div>

      <div>
        <button
          type="submit"
          disabled={isLoading}
          className="mx-auto flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-blue-300"
        >
          {isLoading ? 'Saving...' : agent ? 'Update Agent' : 'Create Agent'}
        </button>
      </div>
    </form>
  );
}