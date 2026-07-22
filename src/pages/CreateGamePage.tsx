import {
  Alert,
  AlertIcon,
  Badge,
  Box,
  Button,
  Card,
  CardBody,
  Flex,
  FormControl,
  FormErrorMessage,
  FormLabel,
  Input,
  Select,
  SimpleGrid,
  Stack,
  Text,
} from '@chakra-ui/react';
import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageLayout } from '../components/PageLayout';
import { az } from '../i18n/az';
import { createGame, getNextGameNameForToday } from '../services/gameService';
import {
  hasLastGameCache,
  loadLastGameCache,
  saveLastGameCache,
} from '../utils/lastGameCache';

interface PlayerFormRow {
  name: string;
  teamNumber: number;
  turnOrder: number;
}

function createEmptyPlayers(count: number): PlayerFormRow[] {
  return Array.from({ length: count }, (_, i) => ({
    name: '',
    teamNumber: 1,
    turnOrder: i + 1,
  }));
}

const DEFAULT_PLAYERS: PlayerFormRow[] = [
  { name: 'Orxan', teamNumber: 1, turnOrder: 1 },
  { name: 'Ferid', teamNumber: 2, turnOrder: 2 },
  { name: 'Fuad', teamNumber: 1, turnOrder: 3 },
  { name: 'Samir', teamNumber: 2, turnOrder: 4 },
];

const TEAM_COLORS = [
  { scheme: 'teal', border: 'teal.400', bg: 'teal.50', avatar: 'teal.500' },
  { scheme: 'orange', border: 'orange.400', bg: 'orange.50', avatar: 'orange.500' },
  { scheme: 'blue', border: 'blue.400', bg: 'blue.50', avatar: 'blue.500' },
  { scheme: 'pink', border: 'pink.400', bg: 'pink.50', avatar: 'pink.500' },
] as const;

function playerInitials(name: string, fallbackIndex: number): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return String(fallbackIndex + 1);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
}

export function CreateGamePage() {
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [nextGameName, setNextGameName] = useState('');
  const [teamCount, setTeamCount] = useState(2);
  const [totalRounds, setTotalRounds] = useState('5');
  const [playerCount, setPlayerCount] = useState(2);
  const [players, setPlayers] = useState<PlayerFormRow[]>(createEmptyPlayers(2));
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const showLastGameButton = useMemo(() => hasLastGameCache(), []);

  useEffect(() => {
    let active = true;
    getNextGameNameForToday()
      .then((next) => {
        if (!active) return;
        setNextGameName(next);
        setName((prev) => prev || next);
      })
      .catch(() => {});
    return () => {
      active = false;
    };
  }, []);

  const teamOptions = useMemo(
    () => Array.from({ length: teamCount }, (_, i) => i + 1),
    [teamCount],
  );

  const handleTeamCountChange = (value: number) => {
    setTeamCount(value);
    setPlayers((prev) =>
      prev.map((p) => ({
        ...p,
        teamNumber: Math.min(p.teamNumber, value),
      })),
    );
  };

  const handlePlayerCountChange = (value: number) => {
    setPlayerCount(value);
    setPlayers((prev) => {
      const next = createEmptyPlayers(value);
      for (let i = 0; i < Math.min(prev.length, value); i++) {
        next[i] = { ...prev[i], turnOrder: i + 1 };
      }
      return next;
    });
  };

  const updatePlayer = (index: number, updates: Partial<PlayerFormRow>) => {
    setPlayers((prev) =>
      prev.map((p, i) => (i === index ? { ...p, ...updates } : p)),
    );
  };

  const setPlayerStartFirst = (index: number) => {
    setPlayers((prev) => {
      const count = prev.length;
      return prev.map((p, i) => ({
        ...p,
        turnOrder: ((i - index + count) % count) + 1,
      }));
    });
  };

  const fillDefaultData = () => {
    setName((prev) => nextGameName || prev);
    setTeamCount(2);
    setTotalRounds('5');
    setPlayerCount(4);
    setPlayers(DEFAULT_PLAYERS);
    setError(null);
  };

  const fillLastGameData = () => {
    const cached = loadLastGameCache();
    if (!cached) return;

    setName((prev) => nextGameName || prev);
    setTeamCount(cached.teamCount);
    setTotalRounds(String(cached.totalRounds));
    setPlayerCount(cached.players.length);
    setPlayers(
      cached.players.map((p) => ({
        name: p.name,
        teamNumber: p.teamNumber,
        turnOrder: p.turnOrder,
      })),
    );
    setError(null);
  };

  const validate = (): string | null => {
    if (!name.trim()) return az.createGame.errors.nameRequired;
    if (!/^\d+$/.test(totalRounds) || parseInt(totalRounds, 10) < 1) {
      return az.createGame.errors.roundsInvalid;
    }
    for (let i = 0; i < players.length; i++) {
      if (!players[i].name.trim()) {
        return az.createGame.errors.playerNameRequired(i + 1);
      }
    }
    const turnOrders = players.map((p) => p.turnOrder);
    const uniqueTurns = new Set(turnOrders);
    if (uniqueTurns.size !== turnOrders.length) {
      return az.createGame.errors.turnOrderUnique;
    }
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }

    setError(null);
    setSubmitting(true);

    try {
      const input = {
        name: name.trim(),
        teamCount,
        totalRounds: parseInt(totalRounds, 10),
        players: players.map((p) => ({
          name: p.name.trim(),
          teamNumber: p.teamNumber,
          turnOrder: p.turnOrder,
        })),
      };
      const gameId = await createGame(input);
      saveLastGameCache(input);
      navigate(`/game/${gameId}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : az.createGame.errors.createFailed);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <PageLayout title={az.createGame.title} subtitle={az.createGame.subtitle}>
      <Card maxW="720px" mx="auto" borderRadius="2xl" shadow="md" borderWidth="0" overflow="hidden">
        <Box h="4px" bgGradient="linear(to-r, teal.400, teal.600, orange.300)" />
        <CardBody px={{ base: 3, md: 6 }} py={{ base: 4, md: 6 }}>
          <Box as="form" onSubmit={handleSubmit}>
            <Stack spacing={5}>
              <SimpleGrid columns={showLastGameButton ? 2 : 1} spacing={2}>
                <Button
                  type="button"
                  variant="solid"
                  colorScheme="teal"
                  size="sm"
                  onClick={fillDefaultData}
                >
                  {az.createGame.fillDefault}
                </Button>
                {showLastGameButton && (
                  <Button
                    type="button"
                    variant="solid"
                    colorScheme="orange"
                    size="sm"
                    onClick={fillLastGameData}
                  >
                    {az.createGame.fillLast}
                  </Button>
                )}
              </SimpleGrid>

              <Box
                p={3}
                borderRadius="xl"
                bg="teal.50"
                borderWidth="1px"
                borderColor="teal.100"
              >
                <SimpleGrid columns={2} spacing={3}>
                  <FormControl isRequired>
                    <FormLabel>{az.createGame.gameName}</FormLabel>
                    <Input
                      bg="white"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder={az.createGame.gameNamePlaceholder}
                    />
                  </FormControl>

                  <FormControl isRequired>
                    <FormLabel>{az.createGame.teamCount}</FormLabel>
                    <Select
                      bg="white"
                      value={teamCount}
                      onChange={(e) => handleTeamCountChange(parseInt(e.target.value, 10))}
                    >
                      {[2, 3, 4].map((n) => (
                        <option key={n} value={n}>
                          {n}
                        </option>
                      ))}
                    </Select>
                  </FormControl>

                  <FormControl isRequired>
                    <FormLabel>{az.createGame.totalRounds}</FormLabel>
                    <Input
                      bg="white"
                      type="number"
                      min={1}
                      step={1}
                      value={totalRounds}
                      onChange={(e) => setTotalRounds(e.target.value)}
                    />
                  </FormControl>

                  <FormControl isRequired>
                    <FormLabel>{az.createGame.playerCount}</FormLabel>
                    <Select
                      bg="white"
                      value={playerCount}
                      onChange={(e) => handlePlayerCountChange(parseInt(e.target.value, 10))}
                    >
                      {[2, 3, 4].map((n) => (
                        <option key={n} value={n}>
                          {n}
                        </option>
                      ))}
                    </Select>
                  </FormControl>
                </SimpleGrid>
              </Box>

              <Box>
                <Flex align="center" justify="space-between" mb={3}>
                  <Text fontWeight="bold" fontSize="md" letterSpacing="-0.02em">
                    {az.createGame.players}
                  </Text>
                  <Badge colorScheme="teal" variant="subtle" borderRadius="full" px={2}>
                    {players.length}
                  </Badge>
                </Flex>
                <Stack spacing={3}>
                  {players.map((player, index) => {
                    const color =
                      TEAM_COLORS[(player.teamNumber - 1) % TEAM_COLORS.length];
                    const isFirst = player.turnOrder === 1;

                    return (
                      <Box
                        key={index}
                        p={3}
                        borderWidth="1px"
                        borderRadius="xl"
                        bg="white"
                        borderColor="gray.200"
                        borderLeftWidth="4px"
                        borderLeftColor={color.border}
                        shadow="sm"
                      >
                        <Flex justify="space-between" align="center" mb={3} gap={2}>
                          <Flex align="center" gap={2} minW={0}>
                            <Flex
                              align="center"
                              justify="center"
                              boxSize="36px"
                              borderRadius="full"
                              bg={color.avatar}
                              color="white"
                              fontSize="xs"
                              fontWeight="bold"
                              flexShrink={0}
                            >
                              {playerInitials(player.name, index)}
                            </Flex>
                            <Box minW={0}>
                              <Text
                                fontSize="sm"
                                fontWeight="bold"
                                color="gray.800"
                                noOfLines={1}
                              >
                                {player.name.trim() || az.createGame.player(index + 1)}
                              </Text>
                              <Text fontSize="xs" color={`${color.scheme}.600`}>
                                {az.common.team(player.teamNumber)} · #{player.turnOrder}
                              </Text>
                            </Box>
                          </Flex>
                          {isFirst ? (
                            <Badge
                              colorScheme="teal"
                              borderRadius="full"
                              px={2}
                              py={1}
                              flexShrink={0}
                            >
                              {az.createGame.startsFirst}
                            </Badge>
                          ) : (
                            <Button
                              type="button"
                              size="xs"
                              variant="outline"
                              colorScheme="teal"
                              borderRadius="full"
                              onClick={() => setPlayerStartFirst(index)}
                              flexShrink={0}
                            >
                              {az.createGame.startFirst}
                            </Button>
                          )}
                        </Flex>
                        <SimpleGrid columns={2} spacing={2}>
                          <FormControl isRequired gridColumn="1 / -1">
                            <FormLabel fontSize="xs" mb={1}>
                              {az.createGame.name}
                            </FormLabel>
                            <Input
                              size="sm"
                              bg={color.bg}
                              borderColor={`${color.scheme}.100`}
                              value={player.name}
                              onChange={(e) =>
                                updatePlayer(index, { name: e.target.value })
                              }
                              placeholder={az.createGame.player(index + 1)}
                            />
                          </FormControl>

                          <FormControl isRequired>
                            <FormLabel fontSize="xs" mb={1}>
                              {az.scoreboard.team}
                            </FormLabel>
                            <Select
                              size="sm"
                              bg={color.bg}
                              borderColor={`${color.scheme}.100`}
                              value={player.teamNumber}
                              onChange={(e) =>
                                updatePlayer(index, {
                                  teamNumber: parseInt(e.target.value, 10),
                                })
                              }
                            >
                              {teamOptions.map((n) => (
                                <option key={n} value={n}>
                                  {az.common.team(n)}
                                </option>
                              ))}
                            </Select>
                          </FormControl>

                          <FormControl isRequired>
                            <FormLabel fontSize="xs" mb={1}>
                              {az.createGame.turnOrder}
                            </FormLabel>
                            <Select
                              size="sm"
                              bg={color.bg}
                              borderColor={`${color.scheme}.100`}
                              value={player.turnOrder}
                              onChange={(e) =>
                                updatePlayer(index, {
                                  turnOrder: parseInt(e.target.value, 10),
                                })
                              }
                            >
                              {players.map((_, i) => (
                                <option key={i + 1} value={i + 1}>
                                  {i + 1}
                                </option>
                              ))}
                            </Select>
                          </FormControl>
                        </SimpleGrid>
                      </Box>
                    );
                  })}
                </Stack>
              </Box>

              {error && (
                <FormControl isInvalid>
                  <Alert status="error" borderRadius="xl">
                    <AlertIcon />
                    <FormErrorMessage m={0}>{error}</FormErrorMessage>
                  </Alert>
                </FormControl>
              )}

              <Button
                type="submit"
                colorScheme="teal"
                size="lg"
                w="full"
                borderRadius="xl"
                shadow="md"
                isLoading={submitting}
              >
                {az.createGame.create}
              </Button>
            </Stack>
          </Box>
        </CardBody>
      </Card>
    </PageLayout>
  );
}
