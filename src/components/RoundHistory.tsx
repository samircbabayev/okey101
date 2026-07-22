import {
  Badge,
  Box,
  Card,
  CardBody,
  CardHeader,
  Heading,
  Stack,
  Text,
} from '@chakra-ui/react';
import { useMemo } from 'react';
import { az } from '../i18n/az';
import type { Penalty, Player, Round, Score, Team } from '../types';
import { getPenaltyReasonLabel } from '../utils/penaltyLabels';

interface RoundHistoryProps {
  rounds: Round[];
  teams: Team[];
  players: Player[];
  scores: Score[];
  penalties: Penalty[];
}

interface TeamRunningTotal {
  teamId: string;
  teamName: string;
  total: number;
}

function cumulativeTeamTotalsAfterRound(
  upToRoundNumber: number,
  rounds: Round[],
  teams: Team[],
  players: Player[],
  scores: Score[],
): TeamRunningTotal[] {
  const roundIds = new Set(
    rounds
      .filter((r) => r.is_finished && r.round_number <= upToRoundNumber)
      .map((r) => r.id),
  );

  const teamIdByPlayer = new Map(
    players.map((p) => [p.id, p.team_id ?? '']),
  );
  const totals = new Map<string, number>();
  for (const team of teams) {
    totals.set(team.id, 0);
  }

  for (const score of scores) {
    if (!roundIds.has(score.round_id)) continue;
    const teamId = teamIdByPlayer.get(score.player_id);
    if (!teamId || !totals.has(teamId)) continue;
    totals.set(
      teamId,
      (totals.get(teamId) ?? 0) + score.points + score.penalty_points,
    );
  }

  return [...teams]
    .sort((a, b) => a.name.localeCompare(b.name))
    .map((team) => ({
      teamId: team.id,
      teamName: team.name,
      total: totals.get(team.id) ?? 0,
    }));
}

export function RoundHistory({
  rounds,
  teams,
  players,
  scores,
  penalties,
}: RoundHistoryProps) {
  const playerById = useMemo(
    () => new Map(players.map((p) => [p.id, p])),
    [players],
  );

  const finishedRounds = useMemo(
    () =>
      [...rounds]
        .filter((r) => r.is_finished)
        .sort((a, b) => b.round_number - a.round_number),
    [rounds],
  );

  if (finishedRounds.length === 0) {
    return (
      <Card>
        <CardHeader pb={2} px={{ base: 3, md: 6 }}>
          <Heading size="md">{az.roundHistory.title}</Heading>
        </CardHeader>
        <CardBody pt={0} px={{ base: 3, md: 6 }} pb={{ base: 4, md: 6 }}>
          <Text color="gray.500" fontSize="sm">
            {az.roundHistory.empty}
          </Text>
        </CardBody>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader pb={2} px={{ base: 3, md: 6 }}>
        <Heading size="md">{az.roundHistory.title}</Heading>
      </CardHeader>
      <CardBody pt={0} px={{ base: 3, md: 6 }} pb={{ base: 4, md: 6 }}>
        <Stack spacing={4}>
          {finishedRounds.map((round) => {
            const roundScores = scores.filter((s) => s.round_id === round.id);
            const roundPenalties = penalties.filter((p) => p.round_id === round.id);
            const starter = round.started_by_player_id
              ? playerById.get(round.started_by_player_id)
              : undefined;
            const running = cumulativeTeamTotalsAfterRound(
              round.round_number,
              rounds,
              teams,
              players,
              scores,
            );

            return (
              <Box
                key={round.id}
                p={4}
                borderWidth="1px"
                borderRadius="md"
                bg="white"
              >
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                  <Text fontWeight="semibold">{az.roundHistory.round(round.round_number)}</Text>
                  <Badge colorScheme="gray">{az.roundHistory.finished}</Badge>
                </Box>
                {starter && (
                  <Text fontSize="sm" color="gray.600" mb={2}>
                    {az.roundHistory.startedBy(starter.name)}
                  </Text>
                )}

                {running.length >= 2 && (
                  <Box
                    mb={3}
                    px={3}
                    py={2}
                    borderRadius="md"
                    bg="teal.50"
                    borderWidth="1px"
                    borderColor="teal.100"
                  >
                    <Text fontSize="xs" color="teal.700" textTransform="uppercase" mb={0.5}>
                      {az.roundHistory.runningTotal}
                    </Text>
                    <Text fontWeight="bold" color="teal.800" fontSize={{ base: 'sm', md: 'md' }}>
                      {running.map((t) => t.total).join(' vs ')}
                    </Text>
                    <Text fontSize="xs" color="teal.600">
                      {running.map((t) => `${t.teamName}: ${t.total}`).join(' · ')}
                    </Text>
                  </Box>
                )}

                {roundScores.length > 0 && (
                  <Box mb={2}>
                    <Text fontSize="xs" color="gray.500" textTransform="uppercase" mb={1}>
                      {az.roundHistory.scores}
                    </Text>
                    {roundScores.map((s) => {
                      const player = playerById.get(s.player_id);
                      return (
                        <Text key={s.id} fontSize="sm">
                          {player?.name ?? az.roundHistory.unknownPlayer}: {s.points}
                          {s.penalty_points > 0
                            ? ` ${az.roundHistory.penaltyExtra(s.penalty_points)}`
                            : ''}
                        </Text>
                      );
                    })}
                  </Box>
                )}

                {roundPenalties.length > 0 && (
                  <Box>
                    <Text fontSize="xs" color="gray.500" textTransform="uppercase" mb={1}>
                      {az.roundHistory.penalties}
                    </Text>
                    {roundPenalties.map((p) => {
                      const player = playerById.get(p.player_id);
                      return (
                        <Text key={p.id} fontSize="sm">
                          {player?.name ?? az.roundHistory.unknownPlayer}: +{p.penalty_value} (
                          {getPenaltyReasonLabel(p.reason)})
                          {p.note ? ` — ${p.note}` : ''}
                        </Text>
                      );
                    })}
                  </Box>
                )}
              </Box>
            );
          })}
        </Stack>
      </CardBody>
    </Card>
  );
}
