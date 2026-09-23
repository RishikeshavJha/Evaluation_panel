export interface Review {
  comment: string;
  reviewerEmail: string;
  reviewedAt: string; // ISO timestamp
}

export type Status = "pending" | "selected" | "rejected";
export type Category = "UG" | "PG" | "PPG";

export interface Team {
  id: string;
  teamName: string;
  leaderName: string;
  leaderEmail?: string;
  collegeName: string;
  category: Category;
  pptLink: string;
  submittedAt: string; // ISO timestamp for when the submission was uploaded
  status: Status;
  review: Review | null;
}
