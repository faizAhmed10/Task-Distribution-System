'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import listsApi from '../../api/lists';
import { toast } from 'react-toastify';

export default function UploadPage() {
  const [file, setFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) {
      toast.error('Please select a file to upload');
      return;
    }

    // Check if file extension is valid
    const fileExt = file.name.split('.').pop()?.toLowerCase();
    if (!['csv', 'xlsx', 'xls'].includes(fileExt || '')) {
      toast.error('Only CSV, XLSX, or XLS files are allowed');
      return;
    }

    setIsLoading(true);
    try {
      // Create FormData and append file
      const formData = new FormData();
      formData.append('file', file);
      
      // Log the file being uploaded for debugging
      console.log('Uploading file:', file.name, 'Size:', file.size, 'Type:', file.type);
      
      // Upload the file with increased timeout for larger files
      const response = await listsApi.uploadList(formData);
      console.log('Upload response:', response);
      
      if (response.success) {
        toast.success(`List uploaded successfully. ${response.count} items distributed among agents.`);
        router.push('/dashboard/lists'); 
      } else {
        toast.error(response.error || 'Failed to upload list');
      }
    } catch (error: any) {
      console.error('Upload error:', error);
      toast.error(error || 'Failed to upload list');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">Upload New List</h1>
        <Link
          href="/dashboard/lists"
          className="text-sm font-medium text-blue-600 hover:text-blue-500"
        >
          Back to Lists
        </Link>
      </div>

      <div className="bg-white shadow overflow-hidden sm:rounded-lg p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="file" className="block text-sm font-medium text-gray-700">
              CSV File
            </label>
            <div className="mt-1">
              <input
                id="file"
                name="file"
                type="file"
                accept=".csv,.xlsx,.xls"
                onChange={handleFileChange}
                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
              />
            </div>
            <p className="mt-2 text-sm text-gray-500">
              Upload a CSV, XLSX, or XLS file with the following columns: FirstName, Phone, Notes
            </p>
          </div>

          <div>
            <button
              type="submit"
              disabled={isLoading || !file}
              className="mx-auto flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-blue-300"
            >
              {isLoading ? 'Uploading...' : 'Upload List'}
            </button>
          </div>
        </form>

        <div className="mt-8 border-t border-gray-200 pt-6">
          <h3 className="text-lg font-medium text-gray-900">CSV Format Instructions</h3>
          <div className="mt-4 prose prose-sm text-gray-500">
            <p>The file should have the following format:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>First row should be the header: <code>FirstName,Phone,Notes</code></li>
              <li>Each subsequent row should contain the contact information</li>
              <li>FirstName should be the first name of the contact</li>
              <li>Phone should be a valid phone number</li>
              <li>Notes can contain any additional information</li>
              <li>The system will distribute items equally among up to 5 agents</li>
              <li>If the number of items is not divisible by the number of agents, the remainder will be distributed sequentially</li>
            </ul>
            <p className="mt-4">Example:</p>
            <pre className="bg-gray-50 p-2 rounded-md overflow-x-auto">
FirstName,Phone,Notes
John,1234567890,Interested in property A
Jane,0987654321,Called twice, follow up next week
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
}