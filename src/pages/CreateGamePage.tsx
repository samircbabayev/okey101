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
      <Card maxW="720px" mx="auto">
        <CardBody px={{ base: 3, md: 6 }} py={{ base: 4, md: 6 }}>
          <Box as="form" onSubmit={handleSubmit}>
            <Stack spacing={5}>
              <Stack
                direction={{ base: 'column', sm: 'row' }}
                spacing={3}
                align={{ base: 'stretch', sm: 'center' }}
              >
                <Button
                  type="button"
                  variant="outline"
                  colorScheme="teal"
                  w={{ base: 'full', sm: 'auto' }}
                  onClick={fillDefaultData}
                >
                  {az.createGame.fillDefault}
                </Button>
                {showLastGameButton && (
                  <Button
                    type="button"
                    variant="outline"
                    colorScheme="blue"
                    w={{ base: 'full', sm: 'auto' }}
                    onClick={fillLastGameData}
                  >
                    {az.createGame.fillLast}
                  </Button>
                )}
              </Stack>

              <FormControl isRequired>
                <FormLabel>{az.createGame.gameName}</FormLabel>
                <Input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder={az.createGame.gameNamePlaceholder}
                />
              </FormControl>

              <SimpleGrid columns={{ base: 1, sm: 3 }} spacing={4}>
                <FormControl isRequired>
                  <FormLabel>{az.createGame.teamCount}</FormLabel>
                  <Select
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

              <Box>
                <Text fontWeight="semibold" mb={3}>
                  {az.createGame.players}
                </Text>
                <Stack spacing={3}>
                  {players.map((player, index) => (
                    <Box
                      key={index}
                      p={4}
                      borderWidth="1px"
                      borderRadius="md"
                      bg="gray.50"
                    >
                      <Flex justify="space-between" align="center" mb={3} gap={2} flexWrap="wrap">
                        <Text fontSize="sm" fontWeight="medium">
                          {az.createGame.player(index + 1)}
                        </Text>
                        {player.turnOrder === 1 ? (
                          <Badge colorScheme="teal">{az.createGame.startsFirst}</Badge>
                        ) : (
                          <Button
                            type="button"
                            size="xs"
                            variant="outline"
                            colorScheme="teal"
                            onClick={() => setPlayerStartFirst(index)}
                          >
                            {az.createGame.startFirst}
                          </Button>
                        )}
                      </Flex>
                      <SimpleGrid columns={{ base: 1, sm: 3 }} spacing={3}>
                        <FormControl isRequired>
                          <FormLabel fontSize="sm">{az.createGame.name}</FormLabel>
                          <Input
                            size="sm"
                            value={player.name}
                            onChange={(e) =>
                              updatePlayer(index, { name: e.target.value })
                            }
                            placeholder={az.createGame.player(index + 1)}
                          />
                        </FormControl>

                        <FormControl isRequired>
                          <FormLabel fontSize="sm">{az.scoreboard.team}</FormLabel>
                          <Select
                            size="sm"
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
                          <FormLabel fontSize="sm">{az.createGame.turnOrder}</FormLabel>
                          <Select
                            size="sm"
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
                  ))}
                </Stack>
              </Box>

              {error && (
                <FormControl isInvalid>
                  <Alert status="error" borderRadius="md">
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
