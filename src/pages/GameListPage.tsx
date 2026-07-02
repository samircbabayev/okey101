import {
  Badge,
  Box,
  Button,
  Card,
  CardBody,
  Flex,
  Stack,
  Text,
} from '@chakra-ui/react';
import { Link as RouterLink } from 'react-router-dom';
import { ErrorState, LoadingState } from '../components/LoadingState';
import { PageLayout } from '../components/PageLayout';
import { useGames } from '../hooks/useGames';
import { az, gameStatusLabel } from '../i18n/az';
import { GameStatus, type GameListItem } from '../types';

function getProgressLabel(item: GameListItem): string {
  const { game, finishedRoundCount, hasActiveRound } = item;

  if (game.status === GameStatus.Finished) {
    return az.gameList.roundsCompleted(game.total_rounds, game.total_rounds);
  }

  if (hasActiveRound) {
    return az.gameList.roundInProgress(finishedRoundCount + 1);
  }

  if (finishedRoundCount === 0) {
    return az.gameList.notStarted;
  }

  return az.gameList.roundsCompleted(finishedRoundCount, game.total_rounds);
}

function getActionLabel(item: GameListItem): string {
  if (item.game.status === GameStatus.Finished) {
    return az.gameList.viewResults;
  }
  return az.gameList.continueGame;
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('az-AZ', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export function GameListPage() {
  const { games, loading, error } = useGames();

  if (loading) {
    return (
      <PageLayout title={az.gameList.title} subtitle={az.gameList.subtitle}>
        <LoadingState message={az.gameList.loading} />
      </PageLayout>
    );
  }

  if (error) {
    return (
      <PageLayout title={az.gameList.title} subtitle={az.gameList.subtitle}>
        <ErrorState message={error} />
      </PageLayout>
    );
  }

  return (
    <PageLayout title={az.gameList.title} subtitle={az.gameList.subtitle}>
      {games.length === 0 ? (
        <Card>
          <CardBody textAlign="center" py={10}>
            <Text color="gray.600" mb={4}>
              {az.gameList.empty}
            </Text>
            <Button as={RouterLink} to="/create" colorScheme="teal">
              {az.gameList.createGame}
            </Button>
          </CardBody>
        </Card>
      ) : (
        <Stack spacing={3}>
          {games.map((item) => (
            <Card key={item.game.id}>
              <CardBody px={{ base: 3, md: 6 }} py={{ base: 4, md: 6 }}>
                <Flex
                  justify="space-between"
                  align="stretch"
                  direction="column"
                  gap={3}
                >
                  <Box flex={1}>
                    <Flex align="center" gap={2} mb={1} flexWrap="wrap">
                      <Text fontWeight="semibold" fontSize={{ base: 'md', md: 'lg' }}>
                        {item.game.name}
                      </Text>
                      <Badge
                        colorScheme={
                          item.game.status === GameStatus.Finished ? 'green' : 'blue'
                        }
                      >
                        {gameStatusLabel(item.game.status)}
                      </Badge>
                    </Flex>
                    <Text fontSize="sm" color="gray.600" lineHeight="tall">
                      {item.game.team_count} {az.gameList.teams} · {item.game.total_rounds}{' '}
                      {az.gameList.rounds} · {formatDate(item.game.created_at)}
                    </Text>
                    <Text fontSize="sm" color="gray.500" mt={1}>
                      {getProgressLabel(item)}
                    </Text>
                  </Box>
                  <Button
                    as={RouterLink}
                    to={`/game/${item.game.id}`}
                    colorScheme="teal"
                    variant="outline"
                    size="sm"
                    w={{ base: 'full', sm: 'auto' }}
                    alignSelf={{ base: 'stretch', sm: 'center' }}
                  >
                    {getActionLabel(item)}
                  </Button>
                </Flex>
              </CardBody>
            </Card>
          ))}
        </Stack>
      )}
    </PageLayout>
  );
}
