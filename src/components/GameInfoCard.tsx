import {
  Badge,
  Box,
  Card,
  CardBody,
  CardHeader,
  Heading,
  SimpleGrid,
  Text,
} from '@chakra-ui/react';
import type { Game, Player, Round, Team } from '../types';
import { GameStatus } from '../types';
import { az, gameStatusLabel } from '../i18n/az';
import { getCurrentRoundNumber } from '../utils/scoreCalculations';

interface GameInfoCardProps {
  game: Game;
  teams: Team[];
  players: Player[];
  rounds: Round[];
}

export function GameInfoCard({ game, teams, players, rounds }: GameInfoCardProps) {
  const currentRound = getCurrentRoundNumber(rounds);
  const statusColor = game.status === GameStatus.Finished ? 'green' : 'blue';
  const sortedPlayers = [...players].sort((a, b) => a.turn_order - b.turn_order);

  return (
    <Card>
      <CardHeader pb={2} px={{ base: 3, md: 6 }}>
        <Box
          display="flex"
          justifyContent="space-between"
          alignItems="flex-start"
          flexWrap="wrap"
          gap={2}
        >
          <Heading size={{ base: 'sm', md: 'md' }} flex={1} minW={0}>
            {game.name}
          </Heading>
          <Badge colorScheme={statusColor} fontSize="sm" flexShrink={0}>
            {gameStatusLabel(game.status)}
          </Badge>
        </Box>
      </CardHeader>
      <CardBody pt={0} px={{ base: 3, md: 6 }}>
        <SimpleGrid columns={{ base: 1, sm: 2, md: 4 }} spacing={4}>
          <Box>
            <Text fontSize="xs" color="gray.500" textTransform="uppercase">
              {az.gameInfo.totalRounds}
            </Text>
            <Text fontWeight="semibold">{game.total_rounds}</Text>
          </Box>
          <Box>
            <Text fontSize="xs" color="gray.500" textTransform="uppercase">
              {az.gameInfo.currentRound}
            </Text>
            <Text fontWeight="semibold">
              {currentRound === 0 ? az.gameInfo.notStarted : currentRound}
            </Text>
          </Box>
          <Box>
            <Text fontSize="xs" color="gray.500" textTransform="uppercase">
              {az.gameInfo.teams}
            </Text>
            <Text fontWeight="semibold" fontSize={{ base: 'sm', md: 'md' }}>
              {teams.map((t) => t.name).join(', ')}
            </Text>
          </Box>
          <Box>
            <Text fontSize="xs" color="gray.500" textTransform="uppercase">
              {az.gameInfo.players}
            </Text>
            <Text fontWeight="semibold" fontSize={{ base: 'sm', md: 'md' }}>
              {sortedPlayers.map((p) => p.name).join(', ')}
            </Text>
          </Box>
        </SimpleGrid>
      </CardBody>
    </Card>
  );
}
