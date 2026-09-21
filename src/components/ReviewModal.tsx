import { useState, useEffect } from 'react';
import type { Team, Status } from '../types';
import { useAuth } from '../hooks/useAuth';

interface ReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (status: Status, comment: string) => void;
  team: Team | null;
  selectedStatus: Status;
}

export default function ReviewModal({ isOpen, onClose, onSave, team, selectedStatus: initialStatus }: ReviewModalProps) {
  const [comment, setComment] = useState('');
  const [status, setStatus] = useState<Status>(initialStatus || 'selected');
  const { email } = useAuth();

  useEffect(() => {
    if (isOpen && team) {
      setComment(team.review?.comment || '');
      setStatus(initialStatus || team.status || 'selected');
    }
  }, [isOpen, team, initialStatus]);

  if (!isOpen || !team) return null;

  const handleSave = () => {
    onSave(status, comment.trim());
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4 animate-in fade-in duration-150">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden flex flex-col border border-gray-200">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
          <div>
            <h2 className="text-base font-semibold text-gray-900">
              Evaluate Presentation
            </h2>
            <p className="text-xs text-gray-500">{team.teamName} • {team.category} Track</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 focus:outline-none cursor-pointer p-1">
             <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
          </button>
        </div>
        
        <div className="p-6 flex-1 space-y-4">
          {/* Status Selection */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-2">
              Evaluation Decision <span className="text-red-500">*</span>
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setStatus('selected')}
                className={`py-2 px-3 rounded-lg text-xs font-bold border flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                  status === 'selected'
                    ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                    : 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                }`}
              >
                <span>Selected</span>
              </button>

              <button
                type="button"
                onClick={() => setStatus('rejected')}
                className={`py-2 px-3 rounded-lg text-xs font-bold border flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                  status === 'rejected'
                    ? 'bg-rose-600 text-white border-rose-600 shadow-sm'
                    : 'bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100'
                }`}
              >
                <span>Rejected</span>
              </button>

              <button
                type="button"
                onClick={() => setStatus('pending')}
                className={`py-2 px-3 rounded-lg text-xs font-bold border flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                  status === 'pending'
                    ? 'bg-amber-500 text-white border-amber-500 shadow-sm'
                    : 'bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100'
                }`}
              >
                <span>Pending</span>
              </button>
            </div>
          </div>

          {/* Remarks / Comments (Optional) */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5 flex items-center justify-between">
              <span>Evaluator Remarks</span>
              <span className="text-gray-400 font-normal text-[11px] font-mono">(Optional)</span>
            </label>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              className="w-full h-28 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 resize-none text-xs text-gray-900 placeholder:text-gray-400"
              placeholder="Add optional reviewer comments or feedback..."
            />
          </div>
          
          <div className="text-[11px] text-gray-500 flex items-center gap-1.5 pt-1">
            <svg className="w-3.5 h-3.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path></svg>
            Evaluator: <span className="font-semibold text-gray-700">{email || 'Teacher Evaluator'}</span>
          </div>
        </div>

        {/* Modal Actions */}
        <div className="px-6 py-3.5 border-t border-gray-100 flex justify-end gap-2 bg-gray-50">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="px-4 py-2 text-xs font-bold text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors shadow-sm cursor-pointer"
          >
            Submit Review
          </button>
        </div>
      </div>
    </div>
  );
}
