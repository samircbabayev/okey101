import {
  Badge,
  Box,
  Card,
  CardBody,
  CardHeader,
  Divider,
  Flex,
  Heading,
  Stack,
  Text,
  Wrap,
  WrapItem,
} from '@chakra-ui/react';
import { az } from '../i18n/az';
import type { Penalty, Player } from '../types';
import { getPenaltyReasonLabel } from '../utils/penaltyLabels';

interface ActiveRoundPenaltiesProps {
  roundId: string;
  roundNumber: number;
  players: Player[];
  penalties: Penalty[];
}

export function ActiveRoundPenalties({
  roundId,
  roundNumber,
  players,
  penalties,
}: ActiveRoundPenaltiesProps) {
  const roundPenalties = penalties.filter((p) => p.round_id === roundId);

  const grouped = players
    .map((player) => {
      const items = roundPenalties.filter((p) => p.player_id === player.id);
      const total = items.reduce((sum, p) => sum + p.penalty_value, 0);
      return { player, items, total };
    })
    .filter((g) => g.items.length > 0)
    .sort((a, b) => b.total - a.total);

  const roundTotal = roundPenalties.reduce((sum, p) => sum + p.penalty_value, 0);

  return (
    <Card borderWidth="0" shadow="sm" overflow="hidden">
      <Box h="3px" bg="orange.400" />
      <CardHeader pb={2} px={{ base: 3, md: 6 }} pt={4}>
        <Flex justify="space-between" align="center" gap={2} flexWrap="wrap">
          <Heading size="sm" letterSpacing="-0.02em">
            {az.activeRoundPenalties.title}
          </Heading>
          <Badge colorScheme="orange" borderRadius="full">
            {az.roundHistory.round(roundNumber)}
          </Badge>
        </Flex>
      </CardHeader>
      <CardBody pt={0} px={{ base: 3, md: 6 }} pb={{ base: 4, md: 6 }}>
        {grouped.length === 0 ? (
          <Text color="gray.500" fontSize="sm">
            {az.activeRoundPenalties.empty}
          </Text>
        ) : (
          <Stack spacing={3}>
            {grouped.map(({ player, items, total }) => (
              <Box key={player.id}>
                <Flex justify="space-between" align="center" mb={1} gap={2}>
                  <Text fontWeight="semibold">{player.name}</Text>
                  <Badge colorScheme="orange" fontSize="sm">
                    {az.activeRoundPenalties.playerTotal(total)}
                  </Badge>
                </Flex>
                <Wrap spacing={1}>
                  {items.map((p) => (
                    <WrapItem key={p.id}>
                      <Badge colorScheme="orange" variant="subtle" fontWeight="normal">
                        {getPenaltyReasonLabel(p.reason)}: +{p.penalty_value}
                        {p.note ? ` (${p.note})` : ''}
                      </Badge>
                    </WrapItem>
                  ))}
                </Wrap>
              </Box>
            ))}
            <Divider />
            <Text fontWeight="bold" textAlign="right" color="orange.600">
              {az.activeRoundPenalties.roundTotal(roundTotal)}
            </Text>
          </Stack>
        )}
      </CardBody>
    </Card>
  );
}
