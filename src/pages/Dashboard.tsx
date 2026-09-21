import { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useTeamsData } from '../hooks/useTeamsData';
import TeamTable from '../components/TeamTable';
import { Search, LogOut, Clock, CheckCircle2, Users, Filter, Award } from 'lucide-react';
import type { Status, Category } from '../types';

type FilterType = 'all' | 'pending' | 'selected' | 'rejected' | 'reviewed';

export default function Dashboard() {
  const { email, logout } = useAuth();
  const { teams, updateTeamReview, loading, error } = useTeamsData();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<FilterType>('all');
  const [categoryFilter, setCategoryFilter] = useState<Category | 'all'>('all');

  const handleUpdateTeam = (teamId: string, status: Status, comment: string) => {
    updateTeamReview(teamId, status, comment, email || 'unknown@gmail.com');
  };

  const pendingCount = teams.filter(t => t.status === 'pending').length;
  const selectedCount = teams.filter(t => t.status === 'selected').length;
  const rejectedCount = teams.filter(t => t.status === 'rejected').length;
  const reviewedCount = teams.filter(t => t.status !== 'pending').length;
  const totalCount = teams.length;

  // Selected counts by category
  const ugTotal = teams.filter(t => t.category === 'UG').length;
  const ugSelected = teams.filter(t => t.category === 'UG' && t.status === 'selected').length;

  const pgTotal = teams.filter(t => t.category === 'PG').length;
  const pgSelected = teams.filter(t => t.category === 'PG' && t.status === 'selected').length;

  const ppgTotal = teams.filter(t => t.category === 'PPG').length;
  const ppgSelected = teams.filter(t => t.category === 'PPG' && t.status === 'selected').length;

  const filteredTeams = teams.filter(team => {
    const query = searchQuery.toLowerCase();
    const matchesSearch = 
      team.teamName.toLowerCase().includes(query) || 
      team.leaderName.toLowerCase().includes(query) ||
      team.collegeName.toLowerCase().includes(query);
    if (!matchesSearch) return false;
    
    if (categoryFilter !== 'all' && team.category !== categoryFilter) {
      return false;
    }

    if (statusFilter === 'pending') return team.status === 'pending';
    if (statusFilter === 'selected') return team.status === 'selected';
    if (statusFilter === 'rejected') return team.status === 'rejected';
    if (statusFilter === 'reviewed') return team.status !== 'pending';
    return true;
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <h1 className="text-xl font-semibold text-gray-900">Team Review Dashboard</h1>
            
            <div className="flex items-center gap-6">
              <div className="text-sm text-gray-500 hidden sm:block">{email}</div>
              <button 
                onClick={logout}
                className="text-gray-400 hover:text-gray-700 flex items-center gap-1.5 text-sm font-medium transition-colors focus:outline-none cursor-pointer"
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden sm:inline">Sign Out</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Summary Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <button 
            onClick={() => setStatusFilter(statusFilter === 'pending' ? 'all' : 'pending')}
            className={`p-4 rounded-lg border text-left transition-all cursor-pointer ${
              statusFilter === 'pending' 
                ? 'bg-amber-50/60 border-amber-300 ring-2 ring-amber-500/20' 
                : 'bg-white border-gray-200 hover:border-gray-300 shadow-xs'
            }`}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Pending Reviews</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{pendingCount}</p>
              </div>
              <div className="w-10 h-10 rounded-full bg-amber-100/80 text-amber-700 flex items-center justify-center">
                <Clock className="w-5 h-5" />
              </div>
            </div>
          </button>

          <button 
            onClick={() => setStatusFilter(statusFilter === 'reviewed' ? 'all' : 'reviewed')}
            className={`p-4 rounded-lg border text-left transition-all cursor-pointer ${
              statusFilter === 'reviewed' || statusFilter === 'selected' || statusFilter === 'rejected'
                ? 'bg-indigo-50/60 border-indigo-300 ring-2 ring-indigo-500/20' 
                : 'bg-white border-gray-200 hover:border-gray-300 shadow-xs'
            }`}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Reviewed Teams</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{reviewedCount}</p>
              </div>
              <div className="w-10 h-10 rounded-full bg-indigo-100/80 text-indigo-700 flex items-center justify-center">
                <CheckCircle2 className="w-5 h-5" />
              </div>
            </div>
          </button>

          <button 
            onClick={() => { setStatusFilter('all'); setCategoryFilter('all'); }}
            className={`p-4 rounded-lg border text-left transition-all cursor-pointer ${
              statusFilter === 'all' && categoryFilter === 'all'
                ? 'bg-gray-100/80 border-gray-300 ring-2 ring-gray-400/20' 
                : 'bg-white border-gray-200 hover:border-gray-300 shadow-xs'
            }`}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Total Submissions</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{totalCount}</p>
              </div>
              <div className="w-10 h-10 rounded-full bg-gray-100 text-gray-700 flex items-center justify-center">
                <Users className="w-5 h-5" />
              </div>
            </div>
          </button>
        </div>

        {/* Selected Teams by Category Section */}
        <div className="bg-white border border-gray-200 rounded-lg p-5 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Award className="w-5 h-5 text-green-600" />
              <h2 className="text-sm font-semibold text-gray-900 uppercase tracking-wider">
                Selected Teams by Category
              </h2>
            </div>
            <span className="text-xs text-gray-500 font-medium">{selectedCount} Total Selected</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <button
              onClick={() => { setCategoryFilter('UG'); setStatusFilter('selected'); }}
              className={`p-3.5 rounded-md border text-left transition-all cursor-pointer flex items-center justify-between ${
                categoryFilter === 'UG' && statusFilter === 'selected'
                  ? 'bg-green-50/80 border-green-300 ring-2 ring-green-500/20'
                  : 'bg-gray-50/50 border-gray-200 hover:bg-gray-100/60'
              }`}
            >
              <div>
                <span className="text-xs font-semibold text-gray-600 block">UG Selected</span>
                <span className="text-xl font-bold text-green-700 mt-0.5 block">{ugSelected} <span className="text-xs font-normal text-gray-500">/ {ugTotal} UG teams</span></span>
              </div>
              <span className="text-xs font-bold px-2 py-0.5 rounded bg-green-100 text-green-800">UG</span>
            </button>

            <button
              onClick={() => { setCategoryFilter('PG'); setStatusFilter('selected'); }}
              className={`p-3.5 rounded-md border text-left transition-all cursor-pointer flex items-center justify-between ${
                categoryFilter === 'PG' && statusFilter === 'selected'
                  ? 'bg-green-50/80 border-green-300 ring-2 ring-green-500/20'
                  : 'bg-gray-50/50 border-gray-200 hover:bg-gray-100/60'
              }`}
            >
              <div>
                <span className="text-xs font-semibold text-gray-600 block">PG Selected</span>
                <span className="text-xl font-bold text-green-700 mt-0.5 block">{pgSelected} <span className="text-xs font-normal text-gray-500">/ {pgTotal} PG teams</span></span>
              </div>
              <span className="text-xs font-bold px-2 py-0.5 rounded bg-green-100 text-green-800">PG</span>
            </button>

            <button
              onClick={() => { setCategoryFilter('PPG'); setStatusFilter('selected'); }}
              className={`p-3.5 rounded-md border text-left transition-all cursor-pointer flex items-center justify-between ${
                categoryFilter === 'PPG' && statusFilter === 'selected'
                  ? 'bg-green-50/80 border-green-300 ring-2 ring-green-500/20'
                  : 'bg-gray-50/50 border-gray-200 hover:bg-gray-100/60'
              }`}
            >
              <div>
                <span className="text-xs font-semibold text-gray-600 block">PPG Selected</span>
                <span className="text-xl font-bold text-green-700 mt-0.5 block">{ppgSelected} <span className="text-xs font-normal text-gray-500">/ {ppgTotal} PPG teams</span></span>
              </div>
              <span className="text-xs font-bold px-2 py-0.5 rounded bg-green-100 text-green-800">PPG</span>
            </button>
          </div>
        </div>

        {/* Search Bar & Filters */}
        <div className="flex flex-col md:flex-row gap-4 justify-between items-stretch md:items-center">
          <div className="relative flex-1 max-w-md">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search by team, leader, or college..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="block w-full pl-9 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            />
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-gray-500" />
              <span className="text-sm font-medium text-gray-700 hidden sm:inline">Category:</span>
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value as Category | 'all')}
                className="block w-auto pl-3 pr-8 py-2 border border-gray-300 rounded-md bg-white text-sm font-medium text-gray-700 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 cursor-pointer"
              >
                <option value="all">All Categories</option>
                <option value="UG">UG (Undergraduate)</option>
                <option value="PG">PG (Postgraduate)</option>
                <option value="PPG">PPG (Pre-PG / PhD)</option>
              </select>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-gray-700 hidden sm:inline">Status:</span>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as FilterType)}
                className="block w-auto pl-3 pr-8 py-2 border border-gray-300 rounded-md bg-white text-sm font-medium text-gray-700 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 cursor-pointer"
              >
                <option value="all">All Statuses ({totalCount})</option>
                <option value="pending">Pending ({pendingCount})</option>
                <option value="selected">Selected ({selectedCount})</option>
                <option value="rejected">Rejected ({rejectedCount})</option>
                <option value="reviewed">Reviewed ({reviewedCount})</option>
              </select>
            </div>
          </div>
        </div>

        {/* Loading / Error states */}
        {loading && (
          <div className="flex items-center justify-center gap-3 py-16 text-gray-500 text-sm">
            <div className="w-5 h-5 border-2 border-gray-300 border-t-indigo-500 rounded-full animate-spin" />
            Loading submissions from Firestore…
          </div>
        )}
        {error && !loading && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700 font-medium">
            {error}
          </div>
        )}

        {/* Table */}
        {!loading && !error && <TeamTable teams={filteredTeams} onUpdateTeam={handleUpdateTeam} />}
      </main>
    </div>
  );
}
