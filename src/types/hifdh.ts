export type DashboardStat = {
  label: string;
  value: string;
};

export type RevisionItem = {
  id: string;
  surahId: number;
  ayahStart: number;
  ayahEnd: number;
  dueAt: string;
  strength: "new" | "weak" | "steady" | "strong";
};
