import { useState, useRef, useEffect } from 'react';
import type { Team, Status } from '../types';
import ReviewModal from './ReviewModal';
import DetailModal from './DetailModal';
import { ExternalLink, Info, ChevronDown } from 'lucide-react';

interface TeamTableProps {
  teams: Team[];
  onUpdateTeam: (teamId: string, status: Status, comment: string) => void;
}

export default function TeamTable({ teams, onUpdateTeam }: TeamTableProps) {
  const [editingTeam, setEditingTeam] = useState<{ team: Team, status: Status } | null>(null);
  const [viewingTeam, setViewingTeam] = useState<Team | null>(null);
  const [dropdownOpen, setDropdownOpen] = useState<string | null>(null);
  
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(null);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleStatusSelect = (team: Team, status: Status) => {
    setDropdownOpen(null);
    setEditingTeam({ team, status });
  };

  const handleSaveReview = (status: Status, comment: string) => {
    if (editingTeam) {
      onUpdateTeam(editingTeam.team.id, status, comment);
      setEditingTeam(null);
    }
  };

  const formatDate = (isoString?: string) => {
    if (!isoString) return null;
    return new Date(isoString).toLocaleString(undefined, {
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
                      className="inline-flex items-center gap-1.5 text-indigo-600 hover:text-indigo-800 transition-colors"
                    >
                      View PPT <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </td>
                  <td className="px-6 py-4 text-xs text-gray-600 font-medium">
                    {formatDate(team.submittedAt) || '—'}
                  </td>
                  <td className="px-6 py-4">
                    <div className="relative inline-block text-left" ref={dropdownOpen === team.id ? dropdownRef : null}>
                      <button
                        onClick={() => setDropdownOpen(dropdownOpen === team.id ? null : team.id)}
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-medium border cursor-pointer hover:opacity-80 transition-opacity ${
                          team.status === 'selected' ? 'bg-green-50 text-green-700 border-green-200' :
                          team.status === 'rejected' ? 'bg-red-50 text-red-700 border-red-200' :
                          'bg-gray-50 text-gray-600 border-gray-200'
                        }`}
                      >
                        {team.status.charAt(0).toUpperCase() + team.status.slice(1)}
                        <ChevronDown className="w-3 h-3 opacity-60" />
                      </button>

                      {dropdownOpen === team.id && (
                        <div className="absolute z-10 mt-1 w-32 rounded-md bg-white shadow-lg border border-gray-100 focus:outline-none">
                          <div className="py-1">
                            <button
                              onClick={() => handleStatusSelect(team, 'selected')}
                              className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 cursor-pointer"
                            >
                              Selected
                            </button>
                            <button
                              onClick={() => handleStatusSelect(team, 'rejected')}
                              className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 cursor-pointer"
                            >
                              Rejected
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
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
        selectedStatus={editingTeam?.status || 'pending'}
      />

      <DetailModal
        isOpen={!!viewingTeam}
        onClose={() => setViewingTeam(null)}
        team={viewingTeam}
      />
    </>
  );
}
