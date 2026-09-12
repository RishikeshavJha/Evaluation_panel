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

export default function ReviewModal({ isOpen, onClose, onSave, team, selectedStatus }: ReviewModalProps) {
  const [comment, setComment] = useState('');
  const { email } = useAuth();

  useEffect(() => {
    if (isOpen && team) {
      setComment(team.review?.comment || '');
    }
  }, [isOpen, team]);

  if (!isOpen || !team) return null;

  const handleSave = () => {
    onSave(selectedStatus, comment.trim());
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm px-4">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-md overflow-hidden flex flex-col">
        <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
          <h2 className="text-lg font-medium text-gray-900">
            Mark {team.teamName} as {selectedStatus.charAt(0).toUpperCase() + selectedStatus.slice(1)}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 focus:outline-none cursor-pointer">
             <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
          </button>
        </div>
        
        <div className="p-6 flex-1">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Comments <span className="text-gray-400 font-normal text-xs">(Optional)</span>
          </label>
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            className="w-full h-32 p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 resize-none text-sm text-gray-900"
            placeholder="Write your feedback here (optional)..."
          />
          
          <div className="mt-4 text-xs text-gray-500 flex items-center gap-2">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path></svg>
            Reviewed by: <span className="font-medium text-gray-700">{email}</span>
          </div>
        </div>

        <div className="px-6 py-4 border-t border-gray-100 flex justify-end gap-3 bg-gray-50/50">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors cursor-pointer"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
}
