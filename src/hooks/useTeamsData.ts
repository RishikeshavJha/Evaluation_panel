import { useState, useEffect } from 'react';
import type { Team, Status, Category } from '../types';

const INITIAL_TEAMS: Team[] = [
  { id: '1', teamName: 'Alpha Innovators', leaderName: 'Alex Johnson', collegeName: 'Stanford University', category: 'UG', pptLink: 'https://docs.google.com/presentation/d/placeholder1', submittedAt: '2026-09-12T10:15:00.000Z', status: 'pending', review: null },
  { id: '2', teamName: 'Beta Builders', leaderName: 'Sarah Connor', collegeName: 'MIT', category: 'PG', pptLink: 'https://docs.google.com/presentation/d/placeholder2', submittedAt: '2026-09-12T11:30:00.000Z', status: 'pending', review: null },
  { id: '3', teamName: 'Gamma Geniuses', leaderName: 'Michael Chen', collegeName: 'UC Berkeley', category: 'PPG', pptLink: 'https://docs.google.com/presentation/d/placeholder3', submittedAt: '2026-09-12T12:05:00.000Z', status: 'pending', review: null },
  { id: '4', teamName: 'Delta Dynamics', leaderName: 'Emily Watson', collegeName: 'Harvard University', category: 'UG', pptLink: 'https://docs.google.com/presentation/d/placeholder4', submittedAt: '2026-09-12T13:45:00.000Z', status: 'pending', review: null },
  { id: '5', teamName: 'Epsilon Engineers', leaderName: 'David Miller', collegeName: 'Carnegie Mellon', category: 'PG', pptLink: 'https://docs.google.com/presentation/d/placeholder5', submittedAt: '2026-09-12T14:20:00.000Z', status: 'pending', review: null },
  { id: '6', teamName: 'Zeta Pioneers', leaderName: 'Jessica Taylor', collegeName: 'Cornell University', category: 'UG', pptLink: 'https://docs.google.com/presentation/d/placeholder6', submittedAt: '2026-09-12T15:00:00.000Z', status: 'pending', review: null },
  { id: '7', teamName: 'Eta Explorers', leaderName: 'Robert Davis', collegeName: 'Georgia Tech', category: 'PPG', pptLink: 'https://docs.google.com/presentation/d/placeholder7', submittedAt: '2026-09-12T16:10:00.000Z', status: 'pending', review: null },
  { id: '8', teamName: 'Theta Thinkers', leaderName: 'Sophia Martinez', collegeName: 'Columbia University', category: 'PG', pptLink: 'https://docs.google.com/presentation/d/placeholder8', submittedAt: '2026-09-12T17:25:00.000Z', status: 'pending', review: null },
];

export function useTeamsData() {
  const [teams, setTeams] = useState<Team[]>([]);

  useEffect(() => {
    const stored = localStorage.getItem('teamsData');
    if (stored) {
      const parsed: Team[] = JSON.parse(stored);
      // Migrate cache to include category
      const categories: Category[] = ['UG', 'PG', 'PPG'];
      const migrated = parsed.map((t, idx) => ({
        ...t,
        category: t.category || INITIAL_TEAMS[idx]?.category || categories[idx % 3],
        collegeName: t.collegeName || INITIAL_TEAMS[idx]?.collegeName || 'National Institute of Technology',
        leaderName: t.leaderName || INITIAL_TEAMS[idx]?.leaderName || 'Team Leader',
        submittedAt: t.submittedAt || INITIAL_TEAMS[idx]?.submittedAt || new Date(Date.now() - (idx + 1) * 3600000).toISOString()
      }));
      setTeams(migrated);
      localStorage.setItem('teamsData', JSON.stringify(migrated));
    } else {
      localStorage.setItem('teamsData', JSON.stringify(INITIAL_TEAMS));
      setTeams(INITIAL_TEAMS);
    }
  }, []);

  const updateTeamReview = (teamId: string, status: Status, comment: string, reviewerEmail: string) => {
    const updatedTeams = teams.map(team => {
      if (team.id === teamId) {
        return {
          ...team,
          status,
          review: {
            comment,
            reviewerEmail,
            reviewedAt: new Date().toISOString()
          }
        };
      }
      return team;
    });
    setTeams(updatedTeams);
    localStorage.setItem('teamsData', JSON.stringify(updatedTeams));
  };

  return { teams, updateTeamReview };
}
