export interface RelativeTimeDiff {
  diffMin: number;
  diffHours: number;
  diffDays: number;
}

export function getRelativeTimeDiff(dateStr: string): RelativeTimeDiff {
  const now = new Date();
  const date = new Date(dateStr);
  const diffMs = now.getTime() - date.getTime();

  const diffMin = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMin / 60);
  const diffDays = Math.floor(diffHours / 24);

  return {
    diffMin,
    diffHours,
    diffDays,
  };
}
