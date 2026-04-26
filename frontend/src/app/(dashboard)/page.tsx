'use client';

import toast from 'react-hot-toast';
import { useState, useEffect, useCallback } from 'react';

type Document = {
  id: number;
  name: string;
  file_type: string;
  file_url: string;
  status: 'Indexed' | 'Processing...' | 'Failed';
  uploaded_at: string;
};

export default function LibraryPage() {
  const [uploading, setUploading] = useState(false);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [stats, setStats] = useState({ totalDocs: 0, embeddings: '0' });

  const API_BASE = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000') + '/api/v1';

  const getAuthToken = () => document.cookie.split('; ').find(row => row.startsWith('token='))?.split('=')[1];

  const fetchDocs = useCallback(async () => {
    const token = getAuthToken();
    if (!token) return;
    try {
      const response = await fetch(`${API_BASE}/documents`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      const res = await response.json();
      if (res.status && Array.isArray(res.data)) {
        setDocuments(res.data);
        setStats({ totalDocs: res.data.length, embeddings: (res.data.length * 42).toLocaleString() });
      }
    } catch (error) { console.error(error); }
  }, [API_BASE]);

  useEffect(() => { fetchDocs(); }, [fetchDocs]);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const token = getAuthToken();
    setUploading(true);
    const uploadToast = toast.loading(`Indexing ${file.name}...`);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch(`${API_BASE}/documents/upload`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData,
      });
      const res = await response.json();
      if (res.status) {
        toast.success('Document indexed!', { id: uploadToast });
        setDocuments(prev => [res.data, ...prev]);
        fetchDocs();
      } else {
        toast.error(res.message, { id: uploadToast });
      }
    } catch (error) { toast.error('Upload failed.', { id: uploadToast }); }
    finally { setUploading(false); }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Indexed':
        return 'text-emerald-500 dark:text-emerald-400';
      case 'Processing...':
        return 'text-amber-500 dark:text-amber-400';
      case 'Failed':
        return 'text-red-500 dark:text-red-400';
      default:
        return 'text-slate-500 dark:text-slate-400';
    }
  };

  return (
    <div className="max-w-[1400px] mx-auto p-4 md:p-8 lg:p-12">
      {/* Header Section */}
      <div className="mb-6 md:mb-8">
        <h1 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
          My Knowledge Base
        </h1>
        <p className="text-slate-600 dark:text-slate-400 mt-1 text-sm md:text-base">
          Manage organizational intelligence.
        </p>
      </div>

      {/* Stats and Upload Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6 mb-6 md:mb-8">
        {/* Upload Area */}
        <label
          className={`lg:col-span-2 border-2 border-dashed rounded-2xl p-6 md:p-10 flex flex-col items-center justify-center bg-white dark:bg-slate-900/50 transition-all cursor-pointer 
            border-slate-200 dark:border-slate-700 
            hover:border-blue-500 dark:hover:border-blue-500 
            hover:bg-blue-50/10 dark:hover:bg-blue-900/10
            ${uploading ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          <input
            type="file"
            className="hidden"
            onChange={handleFileUpload}
            disabled={uploading}
            accept=".pdf,.docx"
          />
          <div className="w-12 h-12 md:w-14 md:h-14 bg-blue-50 dark:bg-blue-900/20 rounded-xl flex items-center justify-center mb-3 md:mb-4 transition-colors">
            <svg
              className="w-6 h-6 md:w-7 md:h-7 text-blue-600 dark:text-blue-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
              />
            </svg>
          </div>
          <p className="text-lg md:text-xl font-semibold text-slate-900 dark:text-white">
            {uploading ? 'Processing...' : 'Upload Knowledge'}
          </p>
          <p className="text-xs md:text-sm text-slate-500 dark:text-slate-400 mt-2">
            Supported formats: PDF, DOCX
          </p>
        </label>

        {/* Stats Cards */}
        <div className="space-y-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 p-4 md:p-6 rounded-2xl transition-colors hover:border-slate-300 dark:hover:border-slate-600">
            <div className="text-2xl md:text-3xl font-bold text-blue-600 dark:text-blue-400">
              {stats.totalDocs}
            </div>
            <div className="text-slate-600 dark:text-slate-400 text-xs md:text-sm mt-1">
              Documents Indexed
            </div>
            <div className="mt-2 h-1 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-blue-600 dark:bg-blue-500 rounded-full transition-all duration-500"
                style={{ width: `${Math.min((stats.totalDocs / 100) * 100, 100)}%` }}
              />
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 p-4 md:p-6 rounded-2xl transition-colors hover:border-slate-300 dark:hover:border-slate-600">
            <div className="text-2xl md:text-3xl font-bold text-purple-600 dark:text-purple-400">
              {stats.embeddings}
            </div>
            <div className="text-slate-600 dark:text-slate-400 text-xs md:text-sm mt-1">
              Vector Embeddings
            </div>
            <p className="text-xs text-slate-400 dark:text-slate-500 mt-2">
              ~42 embeddings per document
            </p>
          </div>
        </div>
      </div>

      {/* Documents Table */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left min-w-[500px]">
            <thead>
              <tr className="text-slate-500 dark:text-slate-400 text-[11px] uppercase tracking-widest font-bold border-b border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50">
                <th className="px-4 md:px-6 py-3 md:py-4">Name</th>
                <th className="px-4 md:px-6 py-3 md:py-4">Status</th>
                <th className="px-4 md:px-6 py-3 md:py-4 hidden sm:table-cell">Date</th>
                <th className="px-4 md:px-6 py-3 md:py-4">Type</th>
              </tr>
            </thead>
            <tbody className="text-xs md:text-sm divide-y divide-slate-100 dark:divide-slate-800">
              {documents.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-4 md:px-6 py-8 md:py-12 text-center text-slate-500 dark:text-slate-400">
                    <div className="flex flex-col items-center gap-2">
                      <svg className="w-10 h-10 md:w-12 md:h-12 text-slate-400 dark:text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      <p className="text-sm md:text-base">No documents uploaded yet</p>
                      <p className="text-xs">Upload your first document to get started</p>
                    </div>
                  </td>
                </tr>
              ) : (
                documents.map((doc) => (
                  <tr
                    key={doc.id}
                    className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors group"
                  >
                    <td className="px-4 md:px-6 py-3 md:py-4">
                      <div className="flex items-center gap-2 md:gap-3">
                        <div className="w-6 h-6 md:w-8 md:h-8 bg-slate-100 dark:bg-slate-800 rounded-lg flex items-center justify-center group-hover:bg-slate-200 dark:group-hover:bg-slate-700 transition-colors">
                          {doc.file_type === 'pdf' ? (
                            <svg className="w-3 h-3 md:w-4 md:h-4 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                            </svg>
                          ) : (
                            <svg className="w-3 h-3 md:w-4 md:h-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                          )}
                        </div>
                        <span className="font-medium text-slate-900 dark:text-slate-200 truncate max-w-[150px] md:max-w-md">
                          {doc.name}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 md:px-6 py-3 md:py-4">
                      <div className="flex items-center gap-2">
                        <div className={`w-1.5 h-1.5 rounded-full ${doc.status === 'Indexed' ? 'bg-emerald-500 dark:bg-emerald-400' :
                          doc.status === 'Processing...' ? 'bg-amber-500 dark:bg-amber-400 animate-pulse' :
                            'bg-red-500 dark:bg-red-400'
                          }`} />
                        <span className={`font-semibold text-xs ${getStatusColor(doc.status)}`}>
                          {doc.status}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 md:px-6 py-3 md:py-4 text-slate-500 dark:text-slate-400 text-xs hidden sm:table-cell">
                      {new Date(doc.uploaded_at).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric'
                      })}
                    </td>
                    <td className="px-4 md:px-6 py-3 md:py-4">
                      <span className="inline-flex px-2 py-1 rounded-md text-xs font-medium bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                        {doc.file_type?.toUpperCase() || 'DOC'}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}