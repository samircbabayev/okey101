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
  Flex,
  FormControl,
  FormLabel,
  Select,
  SimpleGrid,
  Stack,
  Text,
  useDisclosure,
  useToast,
} from '@chakra-ui/react';
import { useRef, useState } from 'react';
import { useParams } from 'react-router-dom';
import { ActiveRoundPenalties } from '../components/ActiveRoundPenalties';
import { FinishRoundModal } from '../components/FinishRoundModal';
import { GameInfoCard } from '../components/GameInfoCard';
import { ErrorState, LoadingState } from '../components/LoadingState';
import { PageLayout } from '../components/PageLayout';
import { PenaltyModal } from '../components/PenaltyModal';
import { RoundHistory } from '../components/RoundHistory';
import { Scoreboard } from '../components/Scoreboard';
import { useGameData } from '../hooks/useGameData';
import { az } from '../i18n/az';
import { finishGame } from '../services/gameService';
import { GameStatus } from '../types';
import {
  calculatePlayerTotals,
  calculateTeamTotals,
  getActiveRound,
} from '../utils/scoreCalculations';
import { isSpeechSupported, speak } from '../utils/speech';

export function GamePage() {
  const { id } = useParams<{ id: string }>();
  const { data, loading, error, refetch } = useGameData(id);
  const toast = useToast();
  const [finishGameLoading, setFinishGameLoading] = useState(false);
  const [winnerTeamId, setWinnerTeamId] = useState('');

  const penaltyModal = useDisclosure();
  const finishModal = useDisclosure();
  const finishGameDialog = useDisclosure();
  const cancelRef = useRef<HTMLButtonElement>(null);

  if (loading) {
    return (
      <PageLayout title={az.game.title}>
        <LoadingState message={az.game.loading} />
      </PageLayout>
    );
  }

  if (error || !data) {
    return (
      <PageLayout title={az.game.title}>
        <ErrorState message={error ?? az.game.notFound} />
      </PageLayout>
    );
  }

  const { game, teams, players, rounds, scores, penalties } = data;
  const activeRound = getActiveRound(rounds);
  const playerTotals = calculatePlayerTotals(players, teams, scores, penalties, rounds);
  const teamTotals = calculateTeamTotals(playerTotals);

  const handleActionSuccess = async () => {
    await refetch();
  };

  const openFinishGameDialog = () => {
    setWinnerTeamId('');
    finishGameDialog.onOpen();
  };

  const handleFinishGame = async () => {
    setFinishGameLoading(true);
    try {
      await finishGame(game.id, winnerTeamId || null);
      finishGameDialog.onClose();
      toast({
        title: az.game.toasts.gameFinished,
        status: 'success',
        duration: 3000,
      });
      await refetch();
    } catch (err) {
      toast({
        title: az.game.toasts.gameFinishFailed,
        description: err instanceof Error ? err.message : az.common.unknown,
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

  const roundSpeech = activeRound
    ? starterName
      ? `${az.game.roundInProgress(activeRound.round_number)}. ${az.game.startingPlayer(starterName)}`
      : az.game.roundInProgress(activeRound.round_number)
    : '';

  return (
    <PageLayout>
      <Stack spacing={6}>
        <GameInfoCard game={game} teams={teams} players={players} rounds={rounds} />

        {activeRound && (
          <Alert status="info" borderRadius="md">
            <AlertIcon />
            <Flex flex={1} align="center" justify="space-between" gap={3}>
              <Box>
                <Text fontWeight="bold" fontSize={{ base: 'lg', md: 'xl' }}>
                  {az.game.roundInProgress(activeRound.round_number)}
                </Text>
                {starterName && (
                  <Text fontSize={{ base: 'md', md: 'lg' }}>
                    {az.game.startingPlayer(starterName)}
                  </Text>
                )}
              </Box>
              {isSpeechSupported() && (
                <Button
                  size="sm"
                  colorScheme="blue"
                  variant="ghost"
                  flexShrink={0}
                  aria-label={az.game.speak}
                  onClick={() => speak(roundSpeech)}
                >
                  🔊 {az.game.speak}
                </Button>
              )}
            </Flex>
          </Alert>
        )}

        {game.status === GameStatus.Active && (
          <SimpleGrid columns={{ base: 1, md: 3 }} spacing={3}>
            <Button
              colorScheme="orange"
              variant="outline"
              onClick={penaltyModal.onOpen}
              isDisabled={!activeRound}
              size={{ base: 'sm', md: 'md' }}
              w="full"
            >
              {az.game.addPenalty}
            </Button>
            <Button
              colorScheme="purple"
              variant="outline"
              onClick={finishModal.onOpen}
              isDisabled={!activeRound}
              size={{ base: 'sm', md: 'md' }}
              w="full"
            >
              {az.game.finishRound}
            </Button>
            <Button
              colorScheme="red"
              variant="outline"
              onClick={openFinishGameDialog}
              size={{ base: 'sm', md: 'md' }}
              w="full"
            >
              {az.game.finishGame}
            </Button>
          </SimpleGrid>
        )}

        {activeRound && (
          <ActiveRoundPenalties
            roundId={activeRound.id}
            roundNumber={activeRound.round_number}
            players={players}
            penalties={penalties}
          />
        )}

        {game.status === GameStatus.Finished && (
          <Alert status="success" borderRadius="md">
            <AlertIcon />
            {az.game.gameFinished}
          </Alert>
        )}

        <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={6}>
          <Scoreboard
            playerTotals={playerTotals}
            teamTotals={teamTotals}
            game={game}
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
              {az.game.finishGameTitle}
            </AlertDialogHeader>
            <AlertDialogBody fontSize={{ base: 'sm', md: 'md' }}>
              <Text mb={3}>{az.game.finishGameBody}</Text>
              <FormControl>
                <FormLabel fontSize={{ base: 'md', md: 'lg' }} fontWeight="bold" mb={2}>
                  {az.game.finishGameWinnerLabel}
                </FormLabel>
                <Select
                  value={winnerTeamId}
                  onChange={(e) => setWinnerTeamId(e.target.value)}
                >
                  <option value="">{az.game.finishGameWinnerAuto}</option>
                  {teams.map((team) => {
                    const teamPlayers = players
                      .filter((p) => p.team_id === team.id)
                      .sort((a, b) => a.turn_order - b.turn_order)
                      .map((p) => p.name)
                      .join(', ');
                    return (
                      <option key={team.id} value={team.id}>
                        {team.name}
                        {teamPlayers ? ` (${teamPlayers})` : ''}
                      </option>
                    );
                  })}
                </Select>
              </FormControl>
            </AlertDialogBody>
            <AlertDialogFooter
              flexDirection={{ base: 'column-reverse', sm: 'row' }}
              gap={2}
            >
              <Button ref={cancelRef} onClick={finishGameDialog.onClose} w={{ base: 'full', sm: 'auto' }}>
                {az.common.cancel}
              </Button>
              <Button
                colorScheme="red"
                onClick={handleFinishGame}
                isLoading={finishGameLoading}
                w={{ base: 'full', sm: 'auto' }}
              >
                {az.game.finishGame}
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>
    </PageLayout>
  );
}
