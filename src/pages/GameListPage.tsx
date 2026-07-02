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
import { GameStatus, type GameListItem } from '../types';

function getProgressLabel(item: GameListItem): string {
  const { game, finishedRoundCount, hasActiveRound } = item;

  if (game.status === GameStatus.Finished) {
    return `${game.total_rounds}/${game.total_rounds} rounds completed`;
  }

  if (hasActiveRound) {
    return `Round ${finishedRoundCount + 1} in progress`;
  }

  if (finishedRoundCount === 0) {
    return 'Not started';
  }

  return `${finishedRoundCount}/${game.total_rounds} rounds completed`;
}

function getActionLabel(item: GameListItem): string {
  if (item.game.status === GameStatus.Finished) {
    return 'View results';
  }
  return 'Continue game';
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export function GameListPage() {
  const { games, loading, error } = useGames();

  if (loading) {
    return (
      <PageLayout title="Games" subtitle="Your Okey score tracking sessions">
        <LoadingState message="Loading games..." />
      </PageLayout>
    );
  }

  if (error) {
    return (
      <PageLayout title="Games" subtitle="Your Okey score tracking sessions">
        <ErrorState message={error} />
      </PageLayout>
    );
  }

  return (
    <PageLayout title="Games" subtitle="Your Okey score tracking sessions">
      {games.length === 0 ? (
        <Card>
          <CardBody textAlign="center" py={10}>
            <Text color="gray.600" mb={4}>
              No games yet. Create your first game to start tracking scores.
            </Text>
            <Button as={RouterLink} to="/create" colorScheme="teal">
              Create Game
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
                        {item.game.status}
                      </Badge>
                    </Flex>
                    <Text fontSize="sm" color="gray.600" lineHeight="tall">
                      {item.game.team_count} teams · {item.game.total_rounds} rounds ·{' '}
                      {formatDate(item.game.created_at)}
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
