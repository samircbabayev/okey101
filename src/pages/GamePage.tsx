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
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
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
import { finishGame, updateRoundStarter } from '../services/gameService';
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
  const [starterId, setStarterId] = useState('');
  const [starterLoading, setStarterLoading] = useState(false);

  const penaltyModal = useDisclosure();
  const finishModal = useDisclosure();
  const finishGameDialog = useDisclosure();
  const starterModal = useDisclosure();
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
  const isActive = game.status === GameStatus.Active;
  const showActiveRound = isActive && !!activeRound;
  const playerTotals = calculatePlayerTotals(players, teams, scores, penalties, rounds);
  const teamTotals = calculateTeamTotals(playerTotals);

  const handleActionSuccess = async () => {
    await refetch();
  };

  const openFinishGameDialog = () => {
    setWinnerTeamId('');
    finishGameDialog.onOpen();
  };

  const openStarterModal = () => {
    if (!activeRound) return;
    setStarterId(activeRound.started_by_player_id ?? '');
    starterModal.onOpen();
  };

  const handleSaveStarter = async () => {
    if (!activeRound || !starterId) return;
    setStarterLoading(true);
    try {
      await updateRoundStarter(activeRound.id, starterId);
      starterModal.onClose();
      toast({
        title: az.game.toasts.starterUpdated,
        status: 'success',
        duration: 3000,
      });
      await refetch();
    } catch (err) {
      toast({
        title: az.game.toasts.starterUpdateFailed,
        description: err instanceof Error ? err.message : az.common.unknown,
        status: 'error',
        duration: 5000,
      });
    } finally {
      setStarterLoading(false);
    }
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
      ? `${az.game.roundInProgressSpeech(activeRound.round_number)}. ${az.game.startingPlayer(starterName)}`
      : az.game.roundInProgressSpeech(activeRound.round_number)
    : '';

  return (
    <PageLayout>
      <Stack spacing={4}>
        <GameInfoCard game={game} rounds={rounds} teamTotals={teamTotals} />

        {showActiveRound && activeRound && (
          <Box
            borderRadius="2xl"
            bg="white"
            borderWidth="1px"
            borderColor="teal.100"
            px={{ base: 3, md: 5 }}
            py={{ base: 3, md: 4 }}
            shadow="sm"
            borderLeftWidth="4px"
            borderLeftColor="teal.400"
          >
            <Flex align="center" justify="space-between" gap={3}>
              <Flex align="center" gap={3} minW={0}>
                <Flex
                  align="center"
                  justify="center"
                  boxSize={{ base: 10, md: 12 }}
                  borderRadius="full"
                  bg="teal.500"
                  color="white"
                  fontWeight="bold"
                  fontSize={{ base: 'lg', md: 'xl' }}
                  flexShrink={0}
                >
                  {activeRound.round_number}
                </Flex>
                <Box minW={0}>
                  <Text
                    fontWeight="bold"
                    fontSize={{ base: 'md', md: 'lg' }}
                    color="gray.800"
                    letterSpacing="-0.02em"
                    noOfLines={1}
                  >
                    {az.game.roundInProgress(activeRound.round_number)}
                  </Text>
                  {starterName && (
                    <Flex align="center" gap={1.5} mt={0.5}>
                      <Text
                        fontSize={{ base: 'sm', md: 'md' }}
                        color="gray.600"
                        noOfLines={1}
                      >
                        {az.game.startingPlayer(starterName)}
                      </Text>
                      <Button
                        size="xs"
                        variant="ghost"
                        colorScheme="teal"
                        minH="auto"
                        h="22px"
                        minW="22px"
                        px={1}
                        fontSize="sm"
                        onClick={openStarterModal}
                        aria-label={az.game.editStarter}
                        title={az.game.editStarter}
                      >
                        ✏️
                      </Button>
                    </Flex>
                  )}
                </Box>
              </Flex>
              {isSpeechSupported() && (
                <Button
                  size="sm"
                  colorScheme="teal"
                  variant="solid"
                  borderRadius="full"
                  flexShrink={0}
                  aria-label={az.game.speak}
                  onClick={() => speak(roundSpeech)}
                >
                  🔊 {az.game.speak}
                </Button>
              )}
            </Flex>
          </Box>
        )}

        {isActive && (
          <SimpleGrid columns={{ base: 1, sm: 3 }} spacing={2}>
            <Button
              colorScheme="orange"
              variant="solid"
              onClick={penaltyModal.onOpen}
              isDisabled={!activeRound}
              size="md"
              w="full"
            >
              {az.game.addPenalty}
            </Button>
            <Button
              colorScheme="teal"
              variant="solid"
              onClick={finishModal.onOpen}
              isDisabled={!activeRound}
              size="md"
              w="full"
            >
              {az.game.finishRound}
            </Button>
            <Button
              colorScheme="red"
              variant="outline"
              onClick={openFinishGameDialog}
              size="md"
              w="full"
            >
              {az.game.finishGame}
            </Button>
          </SimpleGrid>
        )}

        {showActiveRound && activeRound && (
          <ActiveRoundPenalties
            roundId={activeRound.id}
            roundNumber={activeRound.round_number}
            players={players}
            penalties={penalties}
          />
        )}

        {game.status === GameStatus.Finished && (
          <Alert status="success" borderRadius="xl" variant="subtle">
            <AlertIcon />
            {az.game.gameFinished}
          </Alert>
        )}

        <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={4}>
          <Scoreboard
            playerTotals={playerTotals}
            teamTotals={teamTotals}
            game={game}
          />
          <RoundHistory
            rounds={rounds}
            teams={teams}
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

      <Modal isOpen={starterModal.isOpen} onClose={starterModal.onClose} isCentered>
        <ModalOverlay />
        <ModalContent mx={{ base: 3, md: 4 }} maxW="md">
          <ModalHeader fontSize={{ base: 'md', md: 'lg' }}>
            {az.game.editStarterTitle}
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <FormControl>
              <FormLabel>{az.game.editStarterLabel}</FormLabel>
              <Select value={starterId} onChange={(e) => setStarterId(e.target.value)}>
                {[...players]
                  .sort((a, b) => a.turn_order - b.turn_order)
                  .map((player) => {
                    const team = teams.find((t) => t.id === player.team_id);
                    return (
                      <option key={player.id} value={player.id}>
                        {player.name}
                        {team ? ` (${team.name})` : ''}
                      </option>
                    );
                  })}
              </Select>
            </FormControl>
          </ModalBody>
          <ModalFooter flexDirection={{ base: 'column-reverse', sm: 'row' }} gap={2}>
            <Button onClick={starterModal.onClose} w={{ base: 'full', sm: 'auto' }}>
              {az.common.cancel}
            </Button>
            <Button
              colorScheme="teal"
              onClick={handleSaveStarter}
              isLoading={starterLoading}
              w={{ base: 'full', sm: 'auto' }}
            >
              {az.game.save}
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </PageLayout>
  );
}
