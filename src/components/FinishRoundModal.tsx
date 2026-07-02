import {
  Alert,
  AlertIcon,
  Box,
  Button,
  FormControl,
  FormLabel,
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
} from '@chakra-ui/react';
import { useEffect, useState } from 'react';
import { az } from '../i18n/az';
import { finishRound } from '../services/gameService';
import type { Game, Penalty, Player, Round } from '../types';
import {
  getRoundPenaltiesForPlayer,
  isValidIntegerInput,
  parseIntegerInput,
} from '../utils/scoreCalculations';

interface FinishRoundModalProps {
  isOpen: boolean;
  onClose: () => void;
  round: Round;
  game: Game;
  players: Player[];
  penalties: Penalty[];
  onSuccess: () => void;
}

export function FinishRoundModal({
  isOpen,
  onClose,
  round,
  game,
  players,
  penalties,
  onSuccess,
}: FinishRoundModalProps) {
  const [points, setPoints] = useState<Record<string, string>>({});
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      const initial: Record<string, string> = {};
      for (const p of players) {
        initial[p.id] = '';
      }
      setPoints(initial);
      setError(null);
    }
  }, [isOpen, players]);

  const handlePointsChange = (playerId: string, value: string) => {
    if (!isValidIntegerInput(value)) return;
    setPoints((prev) => ({ ...prev, [playerId]: value }));
  };

  const handleSubmit = async () => {
    setError(null);

    for (const player of players) {
      const value = points[player.id] ?? '';
      if (parseIntegerInput(value) === null) {
        setError(az.finishRoundModal.errors.scoreRequired(player.name));
        return;
      }
    }

    setSubmitting(true);
    try {
      const playerScores = players.map((p) => ({
        playerId: p.id,
        points: parseIntegerInput(points[p.id])!,
      }));

      await finishRound(round, game, playerScores, penalties);
      onSuccess();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : az.finishRoundModal.errors.failed);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} isCentered scrollBehavior="inside" size="lg">
      <ModalOverlay />
      <ModalContent mx={{ base: 3, md: 4 }} maxH="90dvh">
        <ModalHeader fontSize={{ base: 'md', md: 'lg' }}>
          {az.finishRoundModal.title(round.round_number)}
        </ModalHeader>
        <ModalCloseButton />
        <ModalBody pb={2}>
          <Stack spacing={4}>
            <Text fontSize="sm" color="gray.600">
              {az.finishRoundModal.hint}
            </Text>

            {players.map((player) => {
              const roundPenalty = getRoundPenaltiesForPlayer(
                penalties,
                round.id,
                player.id,
              );

              return (
                <Box key={player.id} p={3} borderWidth="1px" borderRadius="md">
                  <FormControl
                    isRequired
                    isInvalid={
                      !!error &&
                      parseIntegerInput(points[player.id] ?? '') === null
                    }
                  >
                    <FormLabel mb={1}>{player.name}</FormLabel>
                    <Input
                      value={points[player.id] ?? ''}
                      onChange={(e) => handlePointsChange(player.id, e.target.value)}
                      placeholder="0"
                      inputMode="numeric"
                    />
                    {roundPenalty > 0 && (
                      <Text fontSize="xs" color="orange.600" mt={1}>
                        {az.finishRoundModal.roundPenalties(roundPenalty)}
                      </Text>
                    )}
                  </FormControl>
                </Box>
              );
            })}

            {error && (
              <Alert status="error" borderRadius="md">
                <AlertIcon />
                {error}
              </Alert>
            )}
          </Stack>
        </ModalBody>
        <ModalFooter
          flexDirection={{ base: 'column-reverse', sm: 'row' }}
          gap={2}
          pb={{ base: 4, md: 6 }}
        >
          <Button variant="ghost" onClick={onClose} w={{ base: 'full', sm: 'auto' }}>
            {az.common.cancel}
          </Button>
          <Button
            colorScheme="teal"
            onClick={handleSubmit}
            isLoading={submitting}
            w={{ base: 'full', sm: 'auto' }}
          >
            {az.finishRoundModal.submit}
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
