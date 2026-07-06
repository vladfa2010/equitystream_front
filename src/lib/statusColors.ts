/**
 * Deal status color helper
 * Returns background and text colors for each deal status
 */

export type DealStatus =
  | 'draft'
  | 'Pipeline'
  | 'Skip'
  | 'Reserve'
  | 'Founding'
  | 'Deal done'
  | 'Wait IPO'
  | 'Lock-up'
  | 'Exit';

const STATUS_COLORS: Record<DealStatus, { bg: string; text: string }> = {
  draft:       { bg: 'rgba(107,114,128,0.15)',   text: '#6B7280' },   // gray
  Pipeline:    { bg: 'rgba(79,110,247,0.15)',    text: '#4F6EF7' },   // blue
  Skip:        { bg: 'rgba(100,116,139,0.15)',   text: '#64748B' },   // slate
  Reserve:     { bg: 'rgba(139,92,246,0.15)',    text: '#8B5CF6' },   // purple
  Founding:    { bg: 'rgba(245,158,11,0.15)',    text: '#F59E0B' },   // orange
  'Deal done': { bg: 'rgba(16,185,129,0.15)',    text: '#10B981' },   // green
  'Wait IPO':  { bg: 'rgba(6,182,212,0.15)',     text: '#06B6D4' },   // cyan
  'Lock-up':   { bg: 'rgba(234,179,8,0.15)',     text: '#EAB308' },   // yellow
  Exit:        { bg: 'rgba(239,68,68,0.15)',      text: '#EF4444' },   // red
};

/**
 * Get color style for a deal status
 */
export function getDealStatusColor(status: string): { bg: string; text: string } {
  return STATUS_COLORS[status as DealStatus] || { bg: 'rgba(107,114,128,0.15)', text: '#6B7280' };
}

/**
 * Get inline style string for a deal status badge
 */
export function getDealStatusStyle(status: string): React.CSSProperties {
  const c = getDealStatusColor(status);
  return {
    background: c.bg,
    color: c.text,
  };
}

/**
 * All deal statuses for dropdowns/filters
 */
export const ALL_DEAL_STATUSES: DealStatus[] = [
  'draft',
  'Pipeline',
  'Skip',
  'Reserve',
  'Founding',
  'Deal done',
  'Wait IPO',
  'Lock-up',
  'Exit',
];

/**
 * Statuses that count as "active" (deal is still in progress)
 */
export const ACTIVE_DEAL_STATUSES: DealStatus[] = [
  'Pipeline',
  'Reserve',
  'Founding',
  'Deal done',
  'Wait IPO',
];

/**
 * Check if a deal status counts as active
 */
export function isDealActive(status: string): boolean {
  return ACTIVE_DEAL_STATUSES.includes(status as DealStatus);
}
