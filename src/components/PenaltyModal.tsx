import {
  Button,
  FormControl,
  FormErrorMessage,
  FormLabel,
  Input,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Select,
  Stack,
  Textarea,
} from '@chakra-ui/react';
import { useState } from 'react';
import { az } from '../i18n/az';
import { createPenalty } from '../services/gameService';
import { PenaltyReason, type Player } from '../types';
import { PENALTY_REASONS } from '../utils/penaltyLabels';
import { isPositiveInteger } from '../utils/scoreCalculations';

interface PenaltyModalProps {
  isOpen: boolean;
  onClose: () => void;
  roundId: string;
  players: Player[];
  onSuccess: () => void;
}

export function PenaltyModal({
  isOpen,
  onClose,
  roundId,
  players,
  onSuccess,
}: PenaltyModalProps) {
  const [playerId, setPlayerId] = useState('');
  const [penaltyValue, setPenaltyValue] = useState('');
  const [reason, setReason] = useState<PenaltyReason>(PenaltyReason.FalseDiscard);
  const [note, setNote] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const resetForm = () => {
    setPlayerId('');
    setPenaltyValue('');
    setReason(PenaltyReason.FalseDiscard);
    setNote('');
    setError(null);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleSubmit = async () => {
    setError(null);

    if (!playerId) {
      setError(az.penaltyModal.errors.playerRequired);
      return;
    }

    if (!isPositiveInteger(penaltyValue)) {
      setError(az.penaltyModal.errors.valueInvalid);
      return;
    }

    setSubmitting(true);
    try {
      await createPenalty({
        roundId,
        playerId,
        penaltyValue: parseInt(penaltyValue, 10),
        reason,
        note: note.trim() || undefined,
      });
      resetForm();
      onSuccess();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : az.penaltyModal.errors.failed);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} isCentered scrollBehavior="inside">
      <ModalOverlay />
      <ModalContent mx={{ base: 3, md: 4 }} maxH="90dvh">
        <ModalHeader>{az.penaltyModal.title}</ModalHeader>
        <ModalCloseButton />
        <ModalBody pb={6}>
          <Stack spacing={4}>
            <FormControl isRequired isInvalid={!!error && !playerId}>
              <FormLabel>{az.penaltyModal.player}</FormLabel>
              <Select
                placeholder={az.penaltyModal.selectPlayer}
                value={playerId}
                onChange={(e) => setPlayerId(e.target.value)}
              >
                {players.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </Select>
            </FormControl>

            <FormControl isRequired isInvalid={!!error && !isPositiveInteger(penaltyValue)}>
              <FormLabel>{az.penaltyModal.value}</FormLabel>
              <Input
                type="number"
                min={1}
                step={1}
                value={penaltyValue}
                onChange={(e) => setPenaltyValue(e.target.value)}
                placeholder={az.penaltyModal.valuePlaceholder}
              />
            </FormControl>

            <FormControl isRequired>
              <FormLabel>{az.penaltyModal.reason}</FormLabel>
              <Select
                value={reason}
                onChange={(e) => setReason(e.target.value as PenaltyReason)}
              >
                {PENALTY_REASONS.map((r) => (
                  <option key={r.value} value={r.value}>
                    {r.label}
                  </option>
                ))}
              </Select>
            </FormControl>

            <FormControl>
              <FormLabel>{az.penaltyModal.note}</FormLabel>
              <Textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder={az.penaltyModal.notePlaceholder}
                rows={2}
              />
            </FormControl>

            {error && (
              <FormControl isInvalid>
                <FormErrorMessage>{error}</FormErrorMessage>
              </FormControl>
            )}
          </Stack>
        </ModalBody>
        <ModalFooter
          flexDirection={{ base: 'column-reverse', sm: 'row' }}
          gap={2}
          pb={{ base: 4, md: 6 }}
        >
          <Button variant="ghost" onClick={handleClose} w={{ base: 'full', sm: 'auto' }}>
            {az.common.cancel}
          </Button>
          <Button
            colorScheme="teal"
            onClick={handleSubmit}
            isLoading={submitting}
            w={{ base: 'full', sm: 'auto' }}
          >
            {az.penaltyModal.submit}
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
