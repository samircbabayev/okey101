import { PenaltyReason } from '../types';

export const PENALTY_REASONS: { value: PenaltyReason; label: string }[] = [
  { value: PenaltyReason.FalseDiscard, label: 'False Discard' },
  { value: PenaltyReason.FalseOpen, label: 'False Open' },
  { value: PenaltyReason.GiveTile, label: 'Give Tile' },
  { value: PenaltyReason.JokerDiscard, label: 'Joker Discard' },
  { value: PenaltyReason.Other, label: 'Other' },
];

export function getPenaltyReasonLabel(reason: PenaltyReason): string {
  return PENALTY_REASONS.find((r) => r.value === reason)?.label ?? reason;
}
