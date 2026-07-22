import {
  Badge,
  Box,
  Button,
  Card,
  CardBody,
  Flex,
  Heading,
  SimpleGrid,
  Text,
} from '@chakra-ui/react';
import type { Game, Round, TeamTotals } from '../types';
import { GameStatus } from '../types';
import { az, gameStatusLabel } from '../i18n/az';
import { getCurrentRoundNumber, getLeadStatus } from '../utils/scoreCalculations';
import { isSpeechSupported, speak } from '../utils/speech';

interface GameInfoCardProps {
  game: Game;
  rounds: Round[];
  teamTotals: TeamTotals[];
}

export function GameInfoCard({ game, rounds, teamTotals }: GameInfoCardProps) {
  const currentRound = getCurrentRoundNumber(rounds);
  const isFinished = game.status === GameStatus.Finished;
  const isActive = game.status === GameStatus.Active;
  const lowest = teamTotals.length
    ? Math.min(...teamTotals.map((t) => t.grandTotal))
    : null;
  const lead = isActive ? getLeadStatus(teamTotals) : null;
  const leadText = lead
    ? lead.tie
      ? az.scoreboard.leadTie
      : az.scoreboard.leadBy(lead.leaderName, lead.margin)
    : '';

  return (
    <Card overflow="hidden" borderWidth="0" shadow="md">
      <Box
        h="4px"
        bgGradient={
          isFinished
            ? 'linear(to-r, green.400, teal.500)'
            : 'linear(to-r, teal.400, teal.600)'
        }
      />
      <CardBody px={{ base: 3, md: 6 }} py={{ base: 4, md: 5 }}>
        <Flex justify="space-between" align="flex-start" gap={2} mb={4}>
          <Heading size={{ base: 'sm', md: 'md' }} letterSpacing="-0.02em" flex={1} minW={0}>
            {game.name}
          </Heading>
          <Badge
            colorScheme={isFinished ? 'green' : 'teal'}
            borderRadius="full"
            px={2.5}
            py={0.5}
            flexShrink={0}
          >
            {gameStatusLabel(game.status)}
          </Badge>
        </Flex>

        <Box
          px={3}
          py={2}
          borderRadius="xl"
          bg="teal.50"
          borderWidth="1px"
          borderColor="teal.100"
          mb={3}
        >
          <Text fontSize="xs" color="teal.700" fontWeight="semibold">
            {az.gameInfo.currentRound}
          </Text>
          <Text fontWeight="bold" fontSize="lg" color="teal.800">
            {currentRound === 0 ? az.gameInfo.notStarted : currentRound}
            <Text as="span" fontSize="sm" fontWeight="medium" color="teal.600">
              {' '}
              / {game.total_rounds}
            </Text>
          </Text>
        </Box>

        <SimpleGrid columns={2} spacing={2}>
          {teamTotals.map((tt) => {
            const isLeading = lowest !== null && tt.grandTotal === lowest;
            return (
              <Box
                key={tt.teamId}
                px={3}
                py={2.5}
                borderRadius="xl"
                bg={isLeading ? 'teal.50' : 'gray.50'}
                borderWidth="1px"
                borderColor={isLeading ? 'teal.200' : 'gray.100'}
              >
                <Text
                  fontSize="xs"
                  fontWeight="semibold"
                  color={isLeading ? 'teal.700' : 'gray.500'}
                  noOfLines={1}
                >
                  {tt.teamName}
                </Text>
                <Text
                  fontWeight="bold"
                  fontSize="xl"
                  color={isLeading ? 'teal.800' : 'gray.800'}
                  letterSpacing="-0.02em"
                >
                  {tt.grandTotal}
                </Text>
              </Box>
            );
          })}
        </SimpleGrid>

        {lead && (
          <Flex
            mt={3}
            align="center"
            justify="space-between"
            gap={2}
            px={3}
            py={1.5}
            borderRadius="lg"
            bg="gray.50"
          >
            <Text fontSize="xs" color="gray.600" fontWeight="medium" noOfLines={1}>
              {leadText}
            </Text>
            {isSpeechSupported() && (
              <Button
                size="xs"
                variant="solid"
                colorScheme="teal"
                flexShrink={0}
                borderRadius="full"
                px={2.5}
                aria-label={az.game.speak}
                onClick={() => speak(leadText)}
              >
                🔊 {az.game.speak}
              </Button>
            )}
          </Flex>
        )}
      </CardBody>
    </Card>
  );
}
