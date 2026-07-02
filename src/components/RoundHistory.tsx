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
import type { Penalty, Player, Round, Score } from '../types';
import { getPenaltyReasonLabel } from '../utils/penaltyLabels';

interface RoundHistoryProps {
  rounds: Round[];
  players: Player[];
  scores: Score[];
  penalties: Penalty[];
}

export function RoundHistory({
  rounds,
  players,
  scores,
  penalties,
}: RoundHistoryProps) {
  const playerById = new Map(players.map((p) => [p.id, p]));
  const finishedRounds = [...rounds]
    .filter((r) => r.is_finished)
    .sort((a, b) => b.round_number - a.round_number);

  if (finishedRounds.length === 0) {
    return (
      <Card>
        <CardHeader pb={2} px={{ base: 3, md: 6 }}>
          <Heading size="md">Round History</Heading>
        </CardHeader>
        <CardBody pt={0} px={{ base: 3, md: 6 }} pb={{ base: 4, md: 6 }}>
          <Text color="gray.500" fontSize="sm">
            No completed rounds yet.
          </Text>
        </CardBody>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader pb={2} px={{ base: 3, md: 6 }}>
        <Heading size="md">Round History</Heading>
      </CardHeader>
      <CardBody pt={0} px={{ base: 3, md: 6 }} pb={{ base: 4, md: 6 }}>
        <Stack spacing={4}>
          {finishedRounds.map((round) => {
            const roundScores = scores.filter((s) => s.round_id === round.id);
            const roundPenalties = penalties.filter((p) => p.round_id === round.id);
            const starter = round.started_by_player_id
              ? playerById.get(round.started_by_player_id)
              : undefined;

            return (
              <Box
                key={round.id}
                p={4}
                borderWidth="1px"
                borderRadius="md"
                bg="white"
              >
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                  <Text fontWeight="semibold">Round {round.round_number}</Text>
                  <Badge colorScheme="gray">FINISHED</Badge>
                </Box>
                {starter && (
                  <Text fontSize="sm" color="gray.600" mb={2}>
                    Started by: {starter.name}
                  </Text>
                )}

                {roundScores.length > 0 && (
                  <Box mb={2}>
                    <Text fontSize="xs" color="gray.500" textTransform="uppercase" mb={1}>
                      Scores
                    </Text>
                    {roundScores.map((s) => {
                      const player = playerById.get(s.player_id);
                      return (
                        <Text key={s.id} fontSize="sm">
                          {player?.name ?? 'Unknown'}: {s.points}
                          {s.penalty_points > 0 ? ` (+${s.penalty_points} penalty)` : ''}
                        </Text>
                      );
                    })}
                  </Box>
                )}

                {roundPenalties.length > 0 && (
                  <Box>
                    <Text fontSize="xs" color="gray.500" textTransform="uppercase" mb={1}>
                      Penalties
                    </Text>
                    {roundPenalties.map((p) => {
                      const player = playerById.get(p.player_id);
                      return (
                        <Text key={p.id} fontSize="sm">
                          {player?.name ?? 'Unknown'}: +{p.penalty_value} (
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
