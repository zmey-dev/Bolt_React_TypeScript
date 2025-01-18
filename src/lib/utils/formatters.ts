export function formatTimeline(timeline: string): string {
  return timeline.replace(/_/g, ' ');
}

export function formatBudget(budget: string): string {
  return budget.replace(/_/g, ' ');
}