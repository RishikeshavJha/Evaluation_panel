import type { Team } from '../types';

interface DetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  team: Team | null;
}

export default function DetailModal({ isOpen, onClose, team }: DetailModalProps) {
  if (!isOpen || !team || !team.review) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm px-4">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-md overflow-hidden flex flex-col">
        <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
          <h2 className="text-lg font-medium text-gray-900">Review Details</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 focus:outline-none cursor-pointer">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
          </button>
        </div>
        
        <div className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <span className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">Team Name</span>
              <div className="text-sm text-gray-900 font-medium">{team.teamName}</div>
            </div>
            <div>
              <span className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">Team Leader</span>
              <div className="text-sm text-gray-900 font-medium">{team.leaderName}</div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <span className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">College / Institute</span>
              <div className="text-sm text-gray-900 font-medium">{team.collegeName}</div>
            </div>
            <div>
              <span className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">Category</span>
              <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-gray-100 text-gray-700 border border-gray-200">
                {team.category}
              </span>
            </div>
          </div>

          <div>
            <span className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">Submission Time</span>
            <div className="text-sm text-gray-900 font-medium">
              {new Date(team.submittedAt).toLocaleString(undefined, {
                dateStyle: 'medium',
                timeStyle: 'short'
              })}
            </div>
          </div>
          
          <div>
            <span className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">Status</span>
            <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                team.status === 'selected' ? 'bg-green-100 text-green-800' :
                team.status === 'rejected' ? 'bg-red-100 text-red-800' :
                'bg-gray-100 text-gray-800'
              }`}>
                {team.status.charAt(0).toUpperCase() + team.status.slice(1)}
              </span>
          </div>

          <div>
            <span className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">Comment</span>
            <div className="text-sm text-gray-700 bg-gray-50 p-3 rounded-md whitespace-pre-wrap border border-gray-100">
              {team.review.comment}
            </div>
          </div>

          <div className="pt-2 border-t border-gray-100 grid grid-cols-2 gap-4">
            <div>
              <span className="block text-xs font-medium text-gray-500 mb-1">Reviewer</span>
              <div className="text-sm text-gray-900 truncate" title={team.review.reviewerEmail}>
                {team.review.reviewerEmail}
              </div>
            </div>
            <div>
              <span className="block text-xs font-medium text-gray-500 mb-1">Reviewed Date</span>
              <div className="text-sm text-gray-900">
                {new Date(team.review.reviewedAt).toLocaleDateString()}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
