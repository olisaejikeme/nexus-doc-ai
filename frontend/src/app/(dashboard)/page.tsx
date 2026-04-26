'use client';

import toast from 'react-hot-toast';
import { useState, useEffect, useCallback } from 'react';

// Updated to match your Backend DocumentResponse Schema
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

  // Ensure this points to the full V1 prefix
  const API_BASE = process.env.NEXT_PUBLIC_API_URL
    ? `${process.env.NEXT_PUBLIC_API_URL}/api/v1`
    : 'http://localhost:8000/api/v1';

  // Helper to grab the token from cookies
  const getAuthToken = () => {
    if (typeof document === 'undefined') return null;
    return document.cookie
      .split('; ')
      .find(row => row.startsWith('token='))
      ?.split('=')[1];
  };

  const fetchDocs = useCallback(async () => {
    const token = getAuthToken();
    if (!token) return;

    try {
      const response = await fetch(`${API_BASE}/documents`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
      });

      const res = await response.json();

      // Unwrap ResponseSchema: res.status (bool) and res.data (payload)
      if (res.status && Array.isArray(res.data)) {
        setDocuments(res.data);
        setStats({
          totalDocs: res.data.length,
          embeddings: `${(res.data.length * 42).toLocaleString()}` // Just for visual flair
        });
      }
    } catch (error) {
      console.error("Failed to fetch documents:", error);
    }
  }, [API_BASE]);

  useEffect(() => {
    fetchDocs();
  }, [fetchDocs]);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const token = getAuthToken();
    if (!token) {
      toast.error("Session expired. Please login again.");
      return;
    }

    setUploading(true);
    const uploadToast = toast.loading(`Indexing ${file.name}...`);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch(`${API_BASE}/documents/upload`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
          // Note: Don't set Content-Type for FormData, browser does it automatically
        },
        body: formData,
      });

      const res = await response.json();

      if (res.status) {
        toast.success(res.message || 'Document indexed!', { id: uploadToast });
        // Use the actual data object returned from backend
        setDocuments(prev => [res.data, ...prev]);
      } else {
        toast.error(res.message || 'Upload failed.', { id: uploadToast });
      }
    } catch (error) {
      toast.error('Network error. Check connection.', { id: uploadToast });
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-[1400px] mx-auto">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">My Knowledge Base</h1>
          <p className="text-slate-500 mt-1">Manage and index your organizational intelligence.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <label className={`lg:col-span-2 border-2 border-dashed rounded-2xl p-10 flex flex-col items-center justify-center bg-white transition-all cursor-pointer border-slate-200 hover:border-blue-500 group ${uploading ? 'opacity-50 cursor-wait' : ''}`}>
          <input type="file" className="hidden" onChange={handleFileUpload} disabled={uploading} accept=".pdf,.docx" />
          <div className="w-14 h-14 bg-blue-50 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
            <svg className="w-7 h-7 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" /></svg>
          </div>
          <p className="text-xl font-semibold text-slate-900">{uploading ? 'Processing File...' : 'Click or drag to upload'}</p>
          <p className="text-slate-500 mt-2 text-center text-sm">PDF and DOCX supported.</p>
        </label>

        <div className="space-y-6">
          <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-sm">
            <div className="text-blue-600 font-bold text-2xl mb-1">{stats.totalDocs}</div>
            <div className="text-slate-500 text-sm font-medium">Total Documents Indexed</div>
          </div>
          <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-sm">
            <div className="text-purple-600 font-bold text-2xl mb-1">{stats.embeddings}</div>
            <div className="text-slate-500 text-sm font-medium">Vector Embeddings</div>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/30">
          <h3 className="font-bold text-slate-900">Recent Documents</h3>
          <span className="text-xs text-blue-600 font-bold px-2 py-1 bg-blue-50 rounded">Live Knowledge</span>
        </div>

        <table className="w-full text-left">
          <thead>
            <tr className="text-slate-400 text-[11px] uppercase tracking-widest font-bold border-b border-slate-100 bg-slate-50/50">
              <th className="px-6 py-4">Name</th>
              <th className="px-6 py-4">Type</th>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4">Date Added</th>
              <th className="px-6 py-4"></th>
            </tr>
          </thead>
          <tbody className="text-sm divide-y divide-slate-50">
            {documents.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-10 text-center text-slate-400">
                  No documents found. Upload your first PDF to begin.
                </td>
              </tr>
            ) : (
              documents.map((doc) => (
                <tr key={doc.id} className="hover:bg-slate-50/50 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <svg className="w-5 h-5 text-blue-500" fill="currentColor" viewBox="0 0 20 20"><path d="M4 4a2 2 0 012-2h4.586A1 1 0 0111.293 2.293l4.414 4.414a1 1 0 01.293.707V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" /></svg>
                      <span className="text-slate-900 font-medium">{doc.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="bg-slate-100 px-2 py-1 rounded text-[10px] font-bold text-slate-500">
                      {doc.file_type}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                      <span className="font-semibold text-xs text-emerald-600">{doc.status}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-slate-400 text-xs">
                    {new Date(doc.uploaded_at).toLocaleDateString(undefined, {
                      month: 'short', day: 'numeric', year: 'numeric'
                    })}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button className="text-slate-300 group-hover:text-slate-600 transition font-bold text-lg">···</button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}