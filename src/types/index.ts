export enum GameStatus {
  Active = 'ACTIVE',
  Finished = 'FINISHED',
}

export enum PenaltyReason {
  FalseDiscard = 'FALSE_DISCARD',
  FalseOpen = 'FALSE_OPEN',
  GiveTile = 'GIVE_TILE',
  JokerDiscard = 'JOKER_DISCARD',
  Other = 'OTHER',
}

export interface Game {
  id: string;
  name: string;
  team_count: number;
  total_rounds: number;
  status: GameStatus;
  created_at: string;
}

export interface Team {
  id: string;
  game_id: string;
  name: string;
}

export interface Player {
  id: string;
  game_id: string;
  team_id: string | null;
  name: string;
  turn_order: number;
}

export interface Round {
  id: string;
  game_id: string;
  round_number: number;
  started_by_player_id: string | null;
  is_finished: boolean;
  created_at: string;
}

export interface Score {
  id: string;
  round_id: string;
  player_id: string;
  points: number;
  penalty_points: number;
}

export interface Penalty {
  id: string;
  round_id: string;
  player_id: string;
  penalty_value: number;
  reason: PenaltyReason;
  note: string | null;
  created_at: string;
}

export interface CreateGameInput {
  name: string;
  teamCount: number;
  totalRounds: number;
  players: CreatePlayerInput[];
}

export interface CreatePlayerInput {
  name: string;
  teamNumber: number;
  turnOrder: number;
}

export interface PlayerScoreInput {
  playerId: string;
  points: number;
}

export interface CreatePenaltyInput {
  roundId: string;
  playerId: string;
  penaltyValue: number;
  reason: PenaltyReason;
  note?: string;
}

export interface PlayerTotals {
  playerId: string;
  playerName: string;
  teamId: string;
  teamName: string;
  pointsTotal: number;
  penaltyTotal: number;
  grandTotal: number;
}

export interface TeamTotals {
  teamId: string;
  teamName: string;
  grandTotal: number;
}

export interface GameData {
  game: Game;
  teams: Team[];
  players: Player[];
  rounds: Round[];
  scores: Score[];
  penalties: Penalty[];
}

export interface GameListItem {
  game: Game;
  finishedRoundCount: number;
  hasActiveRound: boolean;
}
