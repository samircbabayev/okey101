import {
  Badge,
  Box,
  Card,
  CardBody,
  CardHeader,
  Divider,
  Heading,
  SimpleGrid,
  Stack,
  Table,
  Tbody,
  Td,
  Text,
  Th,
  Thead,
  Tr,
} from '@chakra-ui/react';
import { az } from '../i18n/az';
import type { Game, PlayerTotals, TeamTotals } from '../types';
import { GameStatus } from '../types';
import { getWinningTeam } from '../utils/scoreCalculations';

interface ScoreboardProps {
  playerTotals: PlayerTotals[];
  teamTotals: TeamTotals[];
  gameStatus: Game['status'];
}

function PlayerScoreCard({ pt }: { pt: PlayerTotals }) {
  return (
    <Box p={3} borderWidth="1px" borderRadius="md" bg="gray.50">
      <FlexRow label={az.scoreboard.player} value={pt.playerName} bold />
      <FlexRow label={az.scoreboard.team} value={pt.teamName} />
      <SimpleGrid columns={3} spacing={2} mt={2}>
        <StatCell label={az.scoreboard.points} value={pt.pointsTotal} />
        <StatCell label={az.scoreboard.penalty} value={pt.penaltyTotal} />
        <StatCell label={az.scoreboard.total} value={pt.grandTotal} highlight />
      </SimpleGrid>
    </Box>
  );
}

function FlexRow({
  label,
  value,
  bold,
}: {
  label: string;
  value: string;
  bold?: boolean;
}) {
  return (
    <Box display="flex" justifyContent="space-between" gap={2} mb={1}>
      <Text fontSize="xs" color="gray.500" textTransform="uppercase">
        {label}
      </Text>
      <Text fontSize="sm" fontWeight={bold ? 'semibold' : 'medium'} textAlign="right">
        {value}
      </Text>
    </Box>
  );
}

function StatCell({
  label,
  value,
  highlight,
}: {
  label: string;
  value: number;
  highlight?: boolean;
}) {
  return (
    <Box textAlign="center">
      <Text fontSize="xs" color="gray.500">
        {label}
      </Text>
      <Text fontSize="sm" fontWeight={highlight ? 'bold' : 'semibold'}>
        {value}
      </Text>
    </Box>
  );
}

export function Scoreboard({ playerTotals, teamTotals, gameStatus }: ScoreboardProps) {
  const winner = gameStatus === GameStatus.Finished ? getWinningTeam(teamTotals) : null;

  return (
    <Card>
      <CardHeader pb={2} px={{ base: 3, md: 6 }}>
        <Heading size="md">{az.scoreboard.title}</Heading>
      </CardHeader>
      <CardBody pt={0} px={{ base: 3, md: 6 }}>
        <Stack spacing={3} display={{ base: 'flex', md: 'none' }}>
          {playerTotals.map((pt) => (
            <PlayerScoreCard key={pt.playerId} pt={pt} />
          ))}
        </Stack>

        <Box overflowX="auto" display={{ base: 'none', md: 'block' }}>
          <Table size="sm" variant="simple">
            <Thead>
              <Tr>
                <Th>{az.scoreboard.player}</Th>
                <Th>{az.scoreboard.team}</Th>
                <Th isNumeric>{az.scoreboard.points}</Th>
                <Th isNumeric>{az.scoreboard.penalty}</Th>
                <Th isNumeric>{az.scoreboard.total}</Th>
              </Tr>
            </Thead>
            <Tbody>
              {playerTotals.map((pt) => (
                <Tr key={pt.playerId}>
                  <Td fontWeight="medium">{pt.playerName}</Td>
                  <Td>{pt.teamName}</Td>
                  <Td isNumeric>{pt.pointsTotal}</Td>
                  <Td isNumeric>{pt.penaltyTotal}</Td>
                  <Td isNumeric fontWeight="semibold">
                    {pt.grandTotal}
                  </Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
        </Box>

        <Divider my={5} />

        <Heading size="sm" mb={3}>
          {az.scoreboard.teamTotals}
        </Heading>

        <Stack spacing={2} display={{ base: 'flex', md: 'none' }}>
          {teamTotals.map((tt) => (
            <Box
              key={tt.teamId}
              display="flex"
              justifyContent="space-between"
              p={3}
              borderWidth="1px"
              borderRadius="md"
            >
              <Text fontWeight="medium">{tt.teamName}</Text>
              <Text fontWeight="bold">{tt.grandTotal}</Text>
            </Box>
          ))}
        </Stack>

        <Box overflowX="auto" display={{ base: 'none', md: 'block' }}>
          <Table size="sm" variant="simple">
            <Thead>
              <Tr>
                <Th>{az.scoreboard.team}</Th>
                <Th isNumeric>{az.scoreboard.grandTotal}</Th>
              </Tr>
            </Thead>
            <Tbody>
              {teamTotals.map((tt) => (
                <Tr key={tt.teamId}>
                  <Td fontWeight="medium">{tt.teamName}</Td>
                  <Td isNumeric fontWeight="semibold">
                    {tt.grandTotal}
                  </Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
        </Box>

        {winner && (
          <Box
            mt={4}
            p={4}
            bg="green.50"
            borderRadius="md"
            borderWidth="1px"
            borderColor="green.200"
          >
            <Badge colorScheme="green" mb={1}>
              {az.scoreboard.winner}
            </Badge>
            <Text fontWeight="bold" color="green.700" fontSize={{ base: 'sm', md: 'md' }}>
              {az.scoreboard.winnerPoints(winner.teamName, winner.grandTotal)}
            </Text>
            <Text fontSize="sm" color="green.600">
              {az.scoreboard.lowestWins}
            </Text>
          </Box>
        )}
      </CardBody>
    </Card>
  );
}
