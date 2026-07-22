import {
  Badge,
  Box,
  Button,
  Card,
  CardBody,
  Flex,
  FormControl,
  FormLabel,
  Input,
  Stack,
  Text,
} from '@chakra-ui/react';
import { useEffect, useMemo, useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { ErrorState, LoadingState } from '../components/LoadingState';
import { PageLayout } from '../components/PageLayout';
import { useGames } from '../hooks/useGames';
import { az, gameStatusLabel } from '../i18n/az';
import { GameStatus, type GameListItem } from '../types';
import {
  getInitialDateRange,
  saveDateRangeCache,
  todayDateRange,
} from '../utils/dateRangeCache';

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
  return new Date(dateStr).toLocaleString('az-AZ', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function GameListPage() {
  const { games, loading, error } = useGames();
  const [startDate, setStartDate] = useState<string>(
    () => getInitialDateRange().startDate,
  );
  const [endDate, setEndDate] = useState<string>(
    () => getInitialDateRange().endDate,
  );

  useEffect(() => {
    saveDateRangeCache({ startDate, endDate });
  }, [startDate, endDate]);

  const hasDateFilter = Boolean(startDate || endDate);

  const filteredGames = useMemo(() => {
    if (!hasDateFilter) return games;

    const startMs = startDate ? new Date(startDate).getTime() : null;
    const endMs = endDate ? new Date(endDate).getTime() : null;

    return games.filter((item) => {
      const createdMs = new Date(item.game.created_at).getTime();
      if (startMs !== null && createdMs < startMs) return false;
      if (endMs !== null && createdMs > endMs) return false;
      return true;
    });
  }, [games, startDate, endDate, hasDateFilter]);

  const clearDateFilter = () => {
    setStartDate('');
    setEndDate('');
  };

  const setTodayFilter = () => {
    const today = todayDateRange();
    setStartDate(today.startDate);
    setEndDate(today.endDate);
  };

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

  const filterBar = games.length > 0 && (
    <Flex
      gap={3}
      mb={4}
      align={{ base: 'stretch', sm: 'flex-end' }}
      direction={{ base: 'column', sm: 'row' }}
      flexWrap="wrap"
    >
      <FormControl maxW={{ sm: '240px' }}>
        <FormLabel fontSize="sm" mb={1}>
          {az.gameList.filterStart}
        </FormLabel>
        <Input
          type="datetime-local"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
        />
      </FormControl>
      <FormControl maxW={{ sm: '240px' }}>
        <FormLabel fontSize="sm" mb={1}>
          {az.gameList.filterEnd}
        </FormLabel>
        <Input
          type="datetime-local"
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
        />
      </FormControl>
      <Flex gap={3} align="flex-end" flexWrap="wrap">
        <Button
          variant="outline"
          colorScheme="teal"
          onClick={setTodayFilter}
          flex={{ base: 1, sm: 'none' }}
        >
          {az.gameList.today}
        </Button>
        <Button
          variant="outline"
          onClick={clearDateFilter}
          isDisabled={!hasDateFilter}
          flex={{ base: 1, sm: 'none' }}
        >
          {az.gameList.allDates}
        </Button>
      </Flex>
    </Flex>
  );

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
        <>
          {filterBar}
          {filteredGames.length === 0 ? (
            <Card>
              <CardBody textAlign="center" py={10}>
                <Text color="gray.600">{az.gameList.noGamesForDate}</Text>
              </CardBody>
            </Card>
          ) : (
            <Stack spacing={3}>
              {filteredGames.map((item) => (
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
                    {item.game.status === GameStatus.Finished &&
                      item.winnerTeamName && (
                        <Flex align="center" gap={2} mt={2} flexWrap="wrap">
                          <Badge colorScheme="yellow">
                            {az.gameList.winner}
                          </Badge>
                          <Text fontSize="sm" fontWeight="medium">
                            {item.winnerTeamName}
                          </Text>
                          {/^Komanda \d+$/.test(item.winnerTeamName) &&
                            item.winnerPlayerNames.length > 0 && (
                            <Text fontSize="sm" color="gray.600">
                              ({item.winnerPlayerNames.join(', ')})
                            </Text>
                          )}
                        </Flex>
                      )}
                    {item.game.status === GameStatus.Finished && item.isDraw && (
                      <Flex align="center" gap={2} mt={2} flexWrap="wrap">
                        <Badge colorScheme="yellow">{az.scoreboard.draw}</Badge>
                        <Text fontSize="sm" color="gray.600">
                          {az.scoreboard.drawHint}
                        </Text>
                      </Flex>
                    )}
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
        </>
      )}
    </PageLayout>
  );
}
