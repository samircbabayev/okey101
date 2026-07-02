import { PenaltyReason } from '../types';
import { penaltyReasonLabel, PENALTY_REASON_LABELS } from '../i18n/az';

export const PENALTY_REASONS: { value: PenaltyReason; label: string }[] = [
  PenaltyReason.FalseDiscard,
  PenaltyReason.FalseOpen,
  PenaltyReason.GiveTile,
  PenaltyReason.JokerDiscard,
  PenaltyReason.Other,
].map((value) => ({ value, label: PENALTY_REASON_LABELS[value] }));

export function getPenaltyReasonLabel(reason: PenaltyReason): string {
  return penaltyReasonLabel(reason);
}
