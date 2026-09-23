import { useState, useEffect } from 'react';
import {
  collectionGroup,
  query,
  onSnapshot,
  doc,
  getDoc,
  updateDoc,
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import type { Team, Status } from '../types';

const SELECTION_WEBHOOK_URL = "https://colloquium.app.n8n.cloud/webhook/e749f049-559a-4a6e-a5f8-2842e389dc97";
const REJECTION_WEBHOOK_URL = "https://colloquium.app.n8n.cloud/webhook/220f51ec-7939-48e6-81ee-617d66dcb2fe";

export function useTeamsData() {
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    setError(null);

    // Query projectSubmissions collectionGroup and filter pptLink in JS to avoid index requirement
    const q = query(collectionGroup(db, 'projectSubmissions'));

    const unsubscribe = onSnapshot(
      q,
      async (snapshot) => {
        // Collect unique parent user IDs to fetch user metadata (leader name & college name)
        const uniqueUserIds = Array.from(
          new Set(
            snapshot.docs
              .map((d) => d.ref.parent.parent?.id)
              .filter((id): id is string => Boolean(id))
          )
        );

        const userCache: Record<string, { name?: string; email?: string; college?: string; institution?: string; teamName?: string }> = {};
        await Promise.all(
          uniqueUserIds.map(async (uid) => {
            try {
              const uSnap = await getDoc(doc(db, 'users', uid));
              if (uSnap.exists()) {
                userCache[uid] = uSnap.data();
              }
            } catch (err) {
              console.warn('Could not fetch parent user doc:', uid, err);
            }
          })
        );

        const result: Team[] = snapshot.docs
          .filter((d) => {
            const data = d.data();
            const link = data.pptLink || data.pdfLink || '';
            return link && String(link).trim() !== '';
          })
          .map((d) => {
            const data = d.data();
            const link = data.pptLink || data.pdfLink || '';
            const evalStatus = data.evaluationStatus || data.status || 'PENDING';
            const userId = d.ref.parent.parent?.id || '';
            const userMeta = userCache[userId] || {};

            let submittedAtISO = new Date().toISOString();
            if (data._createdAt?.toDate) {
              submittedAtISO = data._createdAt.toDate().toISOString();
            } else if (data.createdAtIST) {
              const raw = String(data.createdAtIST);
              const parts = raw.split(/[\s,]+/);
              if (parts.length >= 2) {
                const dmy = parts[0].split(/[-/]/);
                if (dmy.length === 3) {
                  const [day, month, year] = dmy.map(Number);
                  const [hour, min, sec] = parts[1].split(':').map(Number);
                  const parsed = new Date(year, month - 1, day, hour || 0, min || 0, sec || 0);
                  if (!isNaN(parsed.getTime())) {
                    submittedAtISO = parsed.toISOString();
                  }
                }
              }
            }

            const category = (data.category as Team['category']) || 'UG';
            const isSolo = category === 'PG' || category === 'PPG';
            const finalLeaderEmail = data.email || userMeta.email || '';

            // Resolve leader name accurately (avoid fallback to email when full name exists)
            const rawNameCandidate =
              data.leaderName ||
              data.fullName ||
              data.name ||
              userMeta.name ||
              (isSolo && data.teamName && !data.teamName.includes('@') ? data.teamName : '');

            const finalLeaderName = rawNameCandidate || (finalLeaderEmail ? finalLeaderEmail.split('@')[0] : 'Participant');

            // Resolve team name accurately
            let finalTeamName = data.teamName || userMeta.teamName || '';
            if (isSolo) {
              finalTeamName = finalTeamName && finalTeamName !== finalLeaderName && !finalTeamName.includes('@')
                ? finalTeamName
                : finalLeaderName;
            } else if (!finalTeamName) {
              finalTeamName = `Team ${finalLeaderName}`;
            }

            const finalCollegeName =
              data.collegeName || data.college || userMeta.college || userMeta.institution || '—';

            return {
              id: d.id,
              teamName: finalTeamName,
              leaderName: finalLeaderName,
              leaderEmail: finalLeaderEmail,
              collegeName: finalCollegeName,
              category,
              pptLink: link,
              submittedAt: submittedAtISO,
              status: (evalStatus.toLowerCase() as Status) || 'pending',
              review: data.evaluatedBy
                ? {
                    comment: data.evaluatorRemarks || '',
                    reviewerEmail: data.evaluatedBy,
                    reviewedAt: data.evaluatedAt || '',
                  }
                : null,
              // Extra fields for display
              _userId: userId,
              _submissionId: d.id,
              _email: finalLeaderEmail,
              _track: data.track || '',
              _solutionSummary: data.solutionSummary || '',
              _problemStatement: data.problemStatement || '',
            };
          });
        setTeams(result);
        setLoading(false);
      },
      (err) => {
        console.error('Firestore onSnapshot error:', err);
        setError('Failed to load submissions. Please ensure you have pasted the complete firestore.rules into your Firebase Console.');
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  /**
   * Update a team's evaluation status + reviewer info in Firestore.
   * Writes to: users/{userId}/projectSubmissions/{submissionId}
   */
  const updateTeamReview = async (
    teamId: string,
    status: Status,
    comment: string,
    reviewerEmail: string
  ) => {
    const team = teams.find((t) => t.id === teamId);
    if (!team) return;

    const userId = (team as Team & { _userId: string })._userId;
    if (!userId) {
      console.error('Cannot find userId for team', teamId);
      alert('Error: Could not identify parent user document ID for this submission.');
      return;
    }

    const now = new Date().toISOString();

    // Map Status → evaluationStatus value
    const evaluationStatus =
      status === 'selected' ? 'SELECTED' :
      status === 'rejected' ? 'REJECTED' : 'PENDING';

    // Optimistically update local state for immediate UI responsiveness
    const previousTeams = [...teams];
    setTeams((prev) =>
      prev.map((t) =>
        t.id === teamId
          ? {
              ...t,
              status,
              review: {
                comment,
                reviewerEmail,
                reviewedAt: now,
              },
            }
          : t
      )
    );

    try {
      const submissionRef = doc(db, 'users', userId, 'projectSubmissions', teamId);
      await updateDoc(submissionRef, {
        evaluationStatus,
        evaluatedBy: reviewerEmail,
        evaluatedAt: now,
        evaluatorRemarks: comment,
      });

      // Trigger n8n Evaluation Webhook (Selected or Rejected)
      const targetWebhookUrl =
        evaluationStatus === 'SELECTED'
          ? SELECTION_WEBHOOK_URL
          : evaluationStatus === 'REJECTED'
          ? REJECTION_WEBHOOK_URL
          : null;

      if (targetWebhookUrl) {
        const payload = {
          userId,
          submissionId: teamId,
          teamName: team.teamName,
          leaderName: team.leaderName,
          leaderEmail: team.leaderEmail || (team as any)._email || '',
          email: team.leaderEmail || (team as any)._email || '',
          collegeName: team.collegeName,
          category: team.category,
          track: (team as any)._track || '',
          problemStatement: (team as any)._problemStatement || '',
          solutionSummary: (team as any)._solutionSummary || '',
          evaluationStatus,
          evaluatedBy: reviewerEmail,
          evaluatedAt: now,
          evaluatorRemarks: comment,
        };

        fetch(targetWebhookUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload),
        }).catch((err) => {
          console.warn(`Standard fetch failed for evaluation webhook (${evaluationStatus}), trying fallback:`, err);
          fetch(targetWebhookUrl, {
            method: 'POST',
            mode: 'no-cors',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload),
          }).catch((e) => console.error('Evaluation webhook fallback error:', e));
        });
      }
    } catch (err) {
      console.error('Failed to update evaluation in Firestore:', err);
      // Revert optimistic update on failure
      setTeams(previousTeams);
      alert(
        'Failed to save evaluation decision to Firestore.\n\n' +
        'Please ensure you have published the updated firestore.rules in Firebase Console.'
      );
    }
  };

  return { teams, updateTeamReview, loading, error };
}
