import {
  Badge,
  Box,
  Card,
  CardBody,
  CardHeader,
  Flex,
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
  useDisclosure,
} from '@chakra-ui/react';
import { az } from '../i18n/az';
import type { Game, PlayerTotals, TeamTotals } from '../types';
import {
  getWinMargin,
  isTiedGame,
  resolveWinningTeam,
} from '../utils/scoreCalculations';

interface ScoreboardProps {
  playerTotals: PlayerTotals[];
  teamTotals: TeamTotals[];
  game: Game;
}

function PlayerScoreCard({ pt }: { pt: PlayerTotals }) {
  return (
    <Box p={3} borderWidth="1px" borderRadius="md" bg="gray.50">
      <Text fontWeight="semibold">
        {pt.playerName}{' '}
        <Text as="span" fontWeight="normal" color="gray.500" fontSize="sm">
          ({pt.teamName})
        </Text>
      </Text>
      <SimpleGrid columns={3} spacing={2} mt={2}>
        <StatCell label={az.scoreboard.points} value={pt.pointsTotal} />
        <StatCell label={az.scoreboard.penalty} value={pt.penaltyTotal} />
        <StatCell label={az.scoreboard.total} value={pt.grandTotal} highlight />
      </SimpleGrid>
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

export function Scoreboard({ playerTotals, teamTotals, game }: ScoreboardProps) {
  const winner = resolveWinningTeam(game, teamTotals);
  const draw = isTiedGame(game, teamTotals);
  const { isOpen, onToggle } = useDisclosure({ defaultIsOpen: false });

  const isGenericTeamName = (name: string) => /^Komanda \d+$/.test(name);

  const winnerPlayers = winner
    ? isGenericTeamName(winner.teamName)
      ? playerTotals
          .filter((pt) => pt.teamId === winner.teamId)
          .map((pt) => pt.playerName)
          .join(' ')
      : ''
    : '';
  const winMargin = winner ? getWinMargin(winner, teamTotals) : 0;

  return (
    <Stack spacing={6}>
      {(winner || draw) && (
        <Card borderWidth="0" shadow="sm" overflow="hidden">
          <CardBody px={{ base: 3, md: 6 }} py={{ base: 3, md: 4 }}>
            {winner && (
              <Box
                p={4}
                bg="green.50"
                borderRadius="xl"
                borderWidth="1px"
                borderColor="green.200"
              >
                <Badge colorScheme="green" mb={1} borderRadius="full">
                  {az.scoreboard.winner}
                </Badge>
                <Text fontWeight="bold" color="green.700" fontSize={{ base: 'sm', md: 'md' }}>
                  {az.scoreboard.winnerPoints(
                    winner.teamName,
                    winnerPlayers,
                    winner.grandTotal,
                    winMargin,
                  )}
                </Text>
                <Text fontSize="sm" color="green.600">
                  {game.winner_team_id
                    ? az.scoreboard.winnerManual
                    : az.scoreboard.lowestWins}
                </Text>
              </Box>
            )}

            {draw && (
              <Box
                p={4}
                bg="yellow.50"
                borderRadius="xl"
                borderWidth="1px"
                borderColor="yellow.300"
              >
                <Badge colorScheme="yellow" mb={1} borderRadius="full">
                  {az.scoreboard.draw}
                </Badge>
                <Text fontSize="sm" color="yellow.800">
                  {az.scoreboard.drawHint}
                </Text>
              </Box>
            )}
          </CardBody>
        </Card>
      )}

      <Card>
        <CardHeader pb={{ base: isOpen ? 2 : 3, md: 2 }} px={{ base: 3, md: 6 }}>
          <Flex
            justify="space-between"
            align="center"
            gap={2}
            cursor={{ base: 'pointer', md: 'default' }}
            onClick={onToggle}
          >
            <Heading size="md">{az.scoreboard.title}</Heading>
            <Text
              display={{ base: 'inline', md: 'none' }}
              fontSize="xl"
              color="gray.500"
              lineHeight={1}
            >
              {isOpen ? '\u25B4' : '\u25BE'}
            </Text>
          </Flex>
        </CardHeader>
        <CardBody
          pt={0}
          px={{ base: 3, md: 6 }}
          pb={{ base: isOpen ? 4 : 0, md: 6 }}
        >
          <Stack
            spacing={3}
            display={{ base: isOpen ? 'flex' : 'none', md: 'none' }}
          >
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
        </CardBody>
      </Card>
    </Stack>
  );
}
