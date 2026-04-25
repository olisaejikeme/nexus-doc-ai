export default function LibraryPage() {
  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900">My Knowledge Base</h1>
        <p className="text-slate-500">Upload and manage the documents your AI will use as context.</p>
      </div>

      {/* Upload Zone */}
      <div className="border-2 border-dashed border-slate-300 rounded-xl p-12 flex flex-col items-center justify-center bg-white hover:border-blue-500 hover:bg-blue-50/50 transition-all cursor-pointer">
        <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-4">
          <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
          </svg>
        </div>
        <p className="text-lg font-medium text-slate-900">Click to upload or drag and drop</p>
        <p className="text-sm text-slate-500">PDF, DOCX, or TXT (Max 10MB)</p>
      </div>

      {/* Document Table */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 text-sm font-medium uppercase tracking-wider">
            <tr>
              <th className="px-6 py-4">Name</th>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4">Date Added</th>
              <th className="px-6 py-4">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {/* Placeholder Row */}
            <tr className="hover:bg-slate-50 transition">
              <td className="px-6 py-4 font-medium text-slate-900">Employee_Handbook.pdf</td>
              <td className="px-6 py-4">
                <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-semibold rounded-full">Indexed</span>
              </td>
              <td className="px-6 py-4 text-slate-500 text-sm">Oct 26, 2023</td>
              <td className="px-6 py-4">
                <button className="text-red-500 hover:text-red-700 text-sm font-medium">Delete</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}