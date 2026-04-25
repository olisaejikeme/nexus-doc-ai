'use client';

import { useState } from 'react';

export default function LibraryPage() {
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState("");

  // This function handles the file selection and upload
  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setMessage("Uploading...");

    // 1. Prepare the "Container" for the file
    const formData = new FormData();
    formData.append('file', file);

    try {
      // 2. Send the file to our FastAPI backend
      const response = await fetch('http://localhost:8000/upload', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        const data = await response.json();
        setMessage(`Success: ${data.filename} uploaded!`);
      } else {
        setMessage("Upload failed.");
      }
    } catch (error) {
      console.error("Error:", error);
      setMessage("Error connecting to server.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">My Knowledge Base</h1>
        <p className="text-slate-500">Upload and manage documents.</p>
      </div>

      {/* Upload Zone (Now Functional) */}
      <label className={`border-2 border-dashed rounded-xl p-12 flex flex-col items-center justify-center bg-white transition-all cursor-pointer ${uploading ? 'border-blue-300 opacity-50' : 'border-slate-300 hover:border-blue-500'}`}>
        <input
          type="file"
          className="hidden"
          onChange={handleFileUpload}
          disabled={uploading}
        />
        <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-4">
          <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
          </svg>
        </div>
        <p className="text-lg font-medium text-slate-900">
          {uploading ? "Processing..." : "Click to upload a PDF"}
        </p>
        {message && <p className="mt-2 text-sm text-blue-600">{message}</p>}
      </label>

      {/* The Table (We will keep this static for now) */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        {/* ... (Keep the table code from before) ... */}
      </div>
    </div>
  );
}