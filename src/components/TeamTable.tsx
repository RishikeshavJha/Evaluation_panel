import { useState } from 'react';
import type { Team, Status } from '../types';
import ReviewModal from './ReviewModal';
import DetailModal from './DetailModal';
import { ExternalLink, Info, ChevronDown, Lock } from 'lucide-react';

interface TeamTableProps {
  teams: Team[];
  onUpdateTeam: (teamId: string, status: Status, comment: string) => void;
}

export default function TeamTable({ teams, onUpdateTeam }: TeamTableProps) {
  const [editingTeam, setEditingTeam] = useState<{ team: Team, status: Status } | null>(null);
  const [viewingTeam, setViewingTeam] = useState<Team | null>(null);

  const handleOpenReview = (team: Team) => {
    // Cannot edit if already finalized as selected or rejected
    if (team.status === 'selected' || team.status === 'rejected') {
      return;
    }
    setEditingTeam({ team, status: 'selected' });
  };

  const handleSaveReview = (status: Status, comment: string) => {
    if (editingTeam) {
      onUpdateTeam(editingTeam.team.id, status, comment);
      setEditingTeam(null);
    }
  };

  const formatDate = (isoString?: string) => {
    if (!isoString) return null;
    const d = new Date(isoString);
    if (isNaN(d.getTime())) return isoString;
    return d.toLocaleString(undefined, {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (teams.length === 0) {
    return (
      <div className="bg-white border border-gray-200 rounded-lg p-12 text-center text-gray-500">
        No teams match your search or filters.
      </div>
    );
  }

  return (
    <>
      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-gray-50 text-gray-600 font-medium border-b border-gray-200">
              <tr>
                <th className="px-6 py-4">Team Name</th>
                <th className="px-6 py-4">Team Leader</th>
                <th className="px-6 py-4">College Name</th>
                <th className="px-6 py-4">Category</th>
                <th className="px-6 py-4">PPT Link</th>
                <th className="px-6 py-4">Submission Time</th>
                <th className="px-6 py-4 w-44">Status</th>
                <th className="px-6 py-4">Last Updated</th>
                <th className="px-6 py-4 w-16"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {teams.map((team) => (
                <tr key={team.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-6 py-4 font-medium text-gray-900">{team.teamName}</td>
                  <td className="px-6 py-4 text-gray-700 font-medium">{team.leaderName}</td>
                  <td className="px-6 py-4 text-gray-600">{team.collegeName}</td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-gray-100 text-gray-700 border border-gray-200">
                      {team.category}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <a 
                      href={team.pptLink} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-indigo-600 hover:text-indigo-800 transition-colors font-medium"
                    >
                      View PPT <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </td>
                  <td className="px-6 py-4 text-xs text-gray-600 font-medium">
                    {formatDate(team.submittedAt) || '—'}
                  </td>
                  <td className="px-6 py-4">
                    {team.status === 'selected' || team.status === 'rejected' ? (
                      <div
                        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold border cursor-not-allowed select-none ${
                          team.status === 'selected'
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-300'
                            : 'bg-rose-50 text-rose-700 border-rose-300'
                        }`}
                        title={`Evaluation decision is final (${team.status.toUpperCase()}) and cannot be changed.`}
                      >
                        <Lock className="w-3.5 h-3.5 opacity-70" />
                        <span>{team.status.charAt(0).toUpperCase() + team.status.slice(1)}</span>
                      </div>
                    ) : (
                      <button
                        onClick={() => handleOpenReview(team)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold border cursor-pointer hover:shadow-sm transition-all bg-amber-50 text-amber-800 border-amber-300 hover:bg-amber-100"
                        title="Click to open evaluation popup"
                      >
                        <span>Pending</span>
                        <ChevronDown className="w-3.5 h-3.5 opacity-70" />
                      </button>
                    )}
                  </td>
                  <td className="px-6 py-4 text-xs text-gray-500">
                    {team.review?.reviewedAt ? (
                      formatDate(team.review.reviewedAt)
                    ) : (
                      <span className="text-gray-400">—</span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-right">
                    {team.review && (
                      <button 
                        onClick={() => setViewingTeam(team)}
                        className="text-gray-400 hover:text-indigo-600 transition-colors cursor-pointer"
                        title="View Details"
                      >
                        <Info className="w-4 h-4" />
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <ReviewModal
        isOpen={!!editingTeam}
        onClose={() => setEditingTeam(null)}
        onSave={handleSaveReview}
        team={editingTeam?.team || null}
        selectedStatus={editingTeam?.status || 'selected'}
      />

      <DetailModal
        isOpen={!!viewingTeam}
        onClose={() => setViewingTeam(null)}
        team={viewingTeam}
      />
    </>
  );
}
