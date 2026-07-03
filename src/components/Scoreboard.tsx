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
import { isTiedGame, resolveWinningTeam } from '../utils/scoreCalculations';

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

  const teamMembers = (teamId: string) =>
    playerTotals
      .filter((pt) => pt.teamId === teamId)
      .map((pt) => pt.playerName)
      .join(', ');

  return (
    <Stack spacing={6}>
      <Card>
        <CardHeader pb={2} px={{ base: 3, md: 6 }}>
          <Heading size="md">{az.scoreboard.teamTotals}</Heading>
        </CardHeader>
        <CardBody pt={0} px={{ base: 3, md: 6 }} pb={{ base: 4, md: 6 }}>
          <Stack spacing={2} display={{ base: 'flex', md: 'none' }}>
            {teamTotals.map((tt) => (
              <Box
                key={tt.teamId}
                display="flex"
                justifyContent="space-between"
                alignItems="center"
                gap={2}
                p={3}
                borderWidth="1px"
                borderRadius="md"
              >
                <Box minW={0}>
                  <Text fontWeight="medium">{tt.teamName}</Text>
                  {teamMembers(tt.teamId) && (
                    <Text fontSize="xs" color="gray.500">
                      {teamMembers(tt.teamId)}
                    </Text>
                  )}
                </Box>
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
                    <Td>
                      <Text fontWeight="medium">{tt.teamName}</Text>
                      {teamMembers(tt.teamId) && (
                        <Text fontSize="xs" color="gray.500">
                          {teamMembers(tt.teamId)}
                        </Text>
                      )}
                    </Td>
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
                {game.winner_team_id
                  ? az.scoreboard.winnerManual
                  : az.scoreboard.lowestWins}
              </Text>
            </Box>
          )}

          {draw && (
            <Box
              mt={4}
              p={4}
              bg="yellow.50"
              borderRadius="md"
              borderWidth="1px"
              borderColor="yellow.300"
            >
              <Badge colorScheme="yellow" mb={1}>
                {az.scoreboard.draw}
              </Badge>
              <Text fontSize="sm" color="yellow.800">
                {az.scoreboard.drawHint}
              </Text>
            </Box>
          )}
        </CardBody>
      </Card>

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
