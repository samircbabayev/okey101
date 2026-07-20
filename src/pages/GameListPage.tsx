import {
  Badge,
  Box,
  Button,
  Card,
  CardBody,
  Flex,
  FormControl,
  FormLabel,
  IconButton,
  Input,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Stack,
  Text,
  useDisclosure,
  useToast,
} from '@chakra-ui/react';
import { useMemo, useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { ErrorState, LoadingState } from '../components/LoadingState';
import { PageLayout } from '../components/PageLayout';
import { useGames } from '../hooks/useGames';
import { az, gameStatusLabel } from '../i18n/az';
import { deleteTodaysGames } from '../services/gameService';
import { GameStatus, type GameListItem } from '../types';

const DELETE_PASSWORD = 'samir1234';

function pad2(n: number): string {
  return String(n).padStart(2, '0');
}

/** Local datetime value for <input type="datetime-local" /> */
function toDateTimeLocalValue(date: Date): string {
  return `${date.getFullYear()}-${pad2(date.getMonth() + 1)}-${pad2(date.getDate())}T${pad2(date.getHours())}:${pad2(date.getMinutes())}`;
}

function startOfTodayLocal(): string {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return toDateTimeLocalValue(d);
}

function endOfTodayLocal(): string {
  const d = new Date();
  d.setHours(23, 59, 0, 0);
  return toDateTimeLocalValue(d);
}

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
  const { games, loading, error, refetch } = useGames();
  const toast = useToast();
  const deleteModal = useDisclosure();
  const [password, setPassword] = useState('');
  const [deleting, setDeleting] = useState(false);
  const [startDate, setStartDate] = useState<string>(() => startOfTodayLocal());
  const [endDate, setEndDate] = useState<string>(() => endOfTodayLocal());

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

  const openDeleteModal = () => {
    setPassword('');
    deleteModal.onOpen();
  };

  const handleDeleteToday = async () => {
    if (password !== DELETE_PASSWORD) {
      toast({
        title: az.gameList.deleteWrongPassword,
        status: 'error',
        duration: 3000,
      });
      return;
    }

    setDeleting(true);
    try {
      const count = await deleteTodaysGames();
      deleteModal.onClose();
      toast({
        title: count > 0 ? az.gameList.deleteSuccess(count) : az.gameList.deleteNoGames,
        status: count > 0 ? 'success' : 'info',
        duration: 3000,
      });
      await refetch();
    } catch (err) {
      toast({
        title: az.gameList.deleteFailed,
        description: err instanceof Error ? err.message : az.common.unknown,
        status: 'error',
        duration: 5000,
      });
    } finally {
      setDeleting(false);
    }
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
      <Flex gap={3} align="flex-end">
        <Button
          variant="outline"
          onClick={clearDateFilter}
          isDisabled={!hasDateFilter}
          flex={{ base: 1, sm: 'none' }}
        >
          {az.gameList.allDates}
        </Button>
        <IconButton
          aria-label={az.gameList.deleteToday}
          title={az.gameList.deleteToday}
          icon={<Text fontSize="lg">🗑️</Text>}
          colorScheme="red"
          variant="outline"
          onClick={openDeleteModal}
          flexShrink={0}
        />
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
                          {item.winnerPlayerNames.length > 0 && (
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

      <Modal isOpen={deleteModal.isOpen} onClose={deleteModal.onClose} isCentered>
        <ModalOverlay />
        <ModalContent mx={{ base: 3, md: 4 }} maxW="md">
          <ModalHeader fontSize={{ base: 'md', md: 'lg' }}>
            {az.gameList.deleteTodayTitle}
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Text mb={3} fontSize={{ base: 'sm', md: 'md' }} color="gray.600">
              {az.gameList.deleteTodayBody}
            </Text>
            <FormControl>
              <FormLabel>{az.gameList.deletePasswordLabel}</FormLabel>
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={az.gameList.deletePasswordPlaceholder}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleDeleteToday();
                }}
                autoFocus
              />
            </FormControl>
          </ModalBody>
          <ModalFooter flexDirection={{ base: 'column-reverse', sm: 'row' }} gap={2}>
            <Button onClick={deleteModal.onClose} w={{ base: 'full', sm: 'auto' }}>
              {az.common.cancel}
            </Button>
            <Button
              colorScheme="red"
              onClick={handleDeleteToday}
              isLoading={deleting}
              isDisabled={!password}
              w={{ base: 'full', sm: 'auto' }}
            >
              {az.gameList.deleteConfirm}
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </PageLayout>
  );
}
