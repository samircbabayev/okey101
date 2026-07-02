import {
  Alert,
  AlertDialog,
  AlertDialogBody,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogOverlay,
  AlertIcon,
  Box,
  Button,
  SimpleGrid,
  Stack,
  Text,
  useDisclosure,
  useToast,
} from '@chakra-ui/react';
import { useRef, useState } from 'react';
import { useParams } from 'react-router-dom';
import { FinishRoundModal } from '../components/FinishRoundModal';
import { GameInfoCard } from '../components/GameInfoCard';
import { ErrorState, LoadingState } from '../components/LoadingState';
import { PageLayout } from '../components/PageLayout';
import { PenaltyModal } from '../components/PenaltyModal';
import { RoundHistory } from '../components/RoundHistory';
import { Scoreboard } from '../components/Scoreboard';
import { useGameData } from '../hooks/useGameData';
import { finishGame, startRound } from '../services/gameService';
import { GameStatus } from '../types';
import {
  calculatePlayerTotals,
  calculateTeamTotals,
  canStartRound,
  getActiveRound,
} from '../utils/scoreCalculations';

export function GamePage() {
  const { id } = useParams<{ id: string }>();
  const { data, loading, error, refetch } = useGameData(id);
  const toast = useToast();
  const [actionLoading, setActionLoading] = useState(false);
  const [finishGameLoading, setFinishGameLoading] = useState(false);

  const penaltyModal = useDisclosure();
  const finishModal = useDisclosure();
  const finishGameDialog = useDisclosure();
  const cancelRef = useRef<HTMLButtonElement>(null);

  if (loading) {
    return (
      <PageLayout title="Game">
        <LoadingState message="Loading game..." />
      </PageLayout>
    );
  }

  if (error || !data) {
    return (
      <PageLayout title="Game">
        <ErrorState message={error ?? 'Game not found'} />
      </PageLayout>
    );
  }

  const { game, teams, players, rounds, scores, penalties } = data;
  const activeRound = getActiveRound(rounds);
  const playerTotals = calculatePlayerTotals(players, teams, scores, penalties, rounds);
  const teamTotals = calculateTeamTotals(playerTotals);
  const canStart = canStartRound(game, rounds);

  const handleStartRound = async () => {
    setActionLoading(true);
    try {
      await startRound(game, players, rounds);
      toast({
        title: 'Round started',
        status: 'success',
        duration: 3000,
      });
      await refetch();
    } catch (err) {
      toast({
        title: 'Could not start round',
        description: err instanceof Error ? err.message : 'Unknown error',
        status: 'error',
        duration: 5000,
      });
    } finally {
      setActionLoading(false);
    }
  };

  const handleActionSuccess = async () => {
    await refetch();
  };

  const handleFinishGame = async () => {
    if (activeRound) {
      toast({
        title: 'Finish the current round first',
        status: 'warning',
        duration: 4000,
      });
      return;
    }

    setFinishGameLoading(true);
    try {
      await finishGame(game.id);
      finishGameDialog.onClose();
      toast({
        title: 'Game finished',
        status: 'success',
        duration: 3000,
      });
      await refetch();
    } catch (err) {
      toast({
        title: 'Could not finish game',
        description: err instanceof Error ? err.message : 'Unknown error',
        status: 'error',
        duration: 5000,
      });
    } finally {
      setFinishGameLoading(false);
    }
  };

  const starterName = activeRound
    ? players.find((p) => p.id === activeRound.started_by_player_id)?.name
    : null;

  return (
    <PageLayout title={game.name} subtitle="Track scores and rounds">
      <Stack spacing={6}>
        <GameInfoCard game={game} teams={teams} players={players} rounds={rounds} />

        {activeRound && (
          <Alert status="info" borderRadius="md">
            <AlertIcon />
            <Box>
              <Text fontWeight="semibold">
                Round {activeRound.round_number} in progress
              </Text>
              {starterName && (
                <Text fontSize="sm">Starting player: {starterName}</Text>
              )}
            </Box>
          </Alert>
        )}

        {game.status === GameStatus.Active && (
          <SimpleGrid columns={{ base: 2, md: 4 }} spacing={3}>
            <Button
              colorScheme="teal"
              onClick={handleStartRound}
              isDisabled={!canStart}
              isLoading={actionLoading}
              size={{ base: 'sm', md: 'md' }}
              w="full"
            >
              Start Round
            </Button>
            <Button
              colorScheme="orange"
              variant="outline"
              onClick={penaltyModal.onOpen}
              isDisabled={!activeRound}
              size={{ base: 'sm', md: 'md' }}
              w="full"
            >
              Add Penalty
            </Button>
            <Button
              colorScheme="purple"
              variant="outline"
              onClick={finishModal.onOpen}
              isDisabled={!activeRound}
              size={{ base: 'sm', md: 'md' }}
              w="full"
            >
              Finish Round
            </Button>
            <Button
              colorScheme="red"
              variant="outline"
              onClick={finishGameDialog.onOpen}
              isDisabled={!!activeRound}
              size={{ base: 'sm', md: 'md' }}
              w="full"
            >
              Finish Game
            </Button>
          </SimpleGrid>
        )}

        {game.status === GameStatus.Finished && (
          <Alert status="success" borderRadius="md">
            <AlertIcon />
            Game finished — view final scores below.
          </Alert>
        )}

        <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={6}>
          <Scoreboard
            playerTotals={playerTotals}
            teamTotals={teamTotals}
            gameStatus={game.status}
          />
          <RoundHistory
            rounds={rounds}
            players={players}
            scores={scores}
            penalties={penalties}
          />
        </SimpleGrid>
      </Stack>

      {activeRound && (
        <>
          <PenaltyModal
            isOpen={penaltyModal.isOpen}
            onClose={penaltyModal.onClose}
            roundId={activeRound.id}
            players={players}
            onSuccess={handleActionSuccess}
          />
          <FinishRoundModal
            isOpen={finishModal.isOpen}
            onClose={finishModal.onClose}
            round={activeRound}
            game={game}
            players={players}
            penalties={penalties}
            onSuccess={handleActionSuccess}
          />
        </>
      )}

      <AlertDialog
        isOpen={finishGameDialog.isOpen}
        leastDestructiveRef={cancelRef}
        onClose={finishGameDialog.onClose}
        isCentered
      >
        <AlertDialogOverlay>
          <AlertDialogContent mx={{ base: 3, md: 4 }} maxW="md">
            <AlertDialogHeader fontSize={{ base: 'md', md: 'lg' }}>
              Finish Game
            </AlertDialogHeader>
            <AlertDialogBody fontSize={{ base: 'sm', md: 'md' }}>
              End this game now? The winner will be determined from current scores.
              This cannot be undone.
            </AlertDialogBody>
            <AlertDialogFooter
              flexDirection={{ base: 'column-reverse', sm: 'row' }}
              gap={2}
            >
              <Button ref={cancelRef} onClick={finishGameDialog.onClose} w={{ base: 'full', sm: 'auto' }}>
                Cancel
              </Button>
              <Button
                colorScheme="red"
                onClick={handleFinishGame}
                isLoading={finishGameLoading}
                w={{ base: 'full', sm: 'auto' }}
              >
                Finish Game
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>
    </PageLayout>
  );
}
