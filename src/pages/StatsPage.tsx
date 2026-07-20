import {
  Badge,
  Box,
  Button,
  Card,
  CardBody,
  Divider,
  Flex,
  FormControl,
  FormLabel,
  Heading,
  Input,
  SimpleGrid,
  Stack,
  Table,
  Tbody,
  Td,
  Text,
  Th,
  Thead,
  Tr,
  Wrap,
  WrapItem,
} from '@chakra-ui/react';
import { useMemo, useState } from 'react';
import { ErrorState, LoadingState } from '../components/LoadingState';
import { PageLayout } from '../components/PageLayout';
import { useDailyStats } from '../hooks/useDailyStats';
import { az } from '../i18n/az';
import { PenaltyReason, type PlayerDayStats } from '../types';
import { getPenaltyReasonLabel, PENALTY_REASONS } from '../utils/penaltyLabels';
import {
  getBiggestDebtor,
  getBiggestLoser,
  getBiggestSinglePenalty,
  get202Master,
  getCleanPlayer,
  getDayChampion,
  getDisasterGame,
  getMistakeMachine,
  getReasonSpecialists,
  getTopPenaltyPlayer,
  getWinlessPlayers,
  lossCount,
} from '../utils/statsCalculations';

function pad2(n: number): string {
  return String(n).padStart(2, '0');
}

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

function ReasonBadges({ stats }: { stats: PlayerDayStats }) {
  const active = PENALTY_REASONS.filter(
    (r) => stats.penaltyByReason[r.value] > 0,
  );
  if (active.length === 0) {
    return (
      <Text fontSize="xs" color="gray.400">
        {az.stats.noPenalties}
      </Text>
    );
  }
  return (
    <Wrap spacing={1}>
      {active.map((r) => (
        <WrapItem key={r.value}>
          <Badge colorScheme="orange" variant="subtle" fontWeight="normal">
            {getPenaltyReasonLabel(r.value as PenaltyReason)}: {stats.penaltyByReason[r.value]}
          </Badge>
        </WrapItem>
      ))}
    </Wrap>
  );
}

function StatCell({ label, value }: { label: string; value: string | number }) {
  return (
    <Box textAlign="center">
      <Text fontSize="xs" color="gray.500">
        {label}
      </Text>
      <Text fontSize="sm" fontWeight="semibold">
        {value}
      </Text>
    </Box>
  );
}

function PlayerStatsCard({ stats, rank }: { stats: PlayerDayStats; rank: number }) {
  return (
    <Box p={3} borderWidth="1px" borderRadius="md" bg="gray.50">
      <Flex justify="space-between" align="center" mb={2}>
        <Text fontWeight="semibold">
          {rank}. {stats.name}
        </Text>
        <Badge colorScheme="teal">
          {stats.wins} {az.stats.wins}
        </Badge>
      </Flex>
      <SimpleGrid columns={3} spacing={2} mb={2}>
        <StatCell label={az.stats.games} value={stats.gamesPlayed} />
        <StatCell label={az.stats.winRate} value={`${stats.winRate}%`} />
        <StatCell label={az.stats.avg} value={stats.avgScore} />
        <StatCell label={az.stats.total} value={stats.grandTotal} />
        <StatCell label={az.stats.penaltyPoints} value={stats.penaltyTotal} />
        <StatCell label={az.stats.penaltyCount} value={stats.penaltyCount} />
        <StatCell label={az.stats.rounds} value={stats.roundsPlayed} />
        <StatCell label={az.stats.startedFirst} value={stats.timesStartedFirst} />
        <StatCell
          label={az.stats.bestGame}
          value={stats.bestGame ?? '—'}
        />
      </SimpleGrid>
      <Box>
        <Text fontSize="xs" color="gray.500" textTransform="uppercase" mb={1}>
          {az.stats.penaltyByReason}
        </Text>
        <ReasonBadges stats={stats} />
      </Box>
    </Box>
  );
}

function FunCard({
  title,
  colorScheme,
  name,
  subtitle,
}: {
  title: string;
  colorScheme: string;
  name: string;
  subtitle: string;
}) {
  return (
    <Card bg={`${colorScheme}.50`} borderWidth="1px" borderColor={`${colorScheme}.200`}>
      <CardBody>
        <Badge colorScheme={colorScheme} mb={1}>
          {title}
        </Badge>
        <Text fontWeight="bold" fontSize="lg" noOfLines={1}>
          {name}
        </Text>
        <Text fontSize="sm" color={`${colorScheme}.700`}>
          {subtitle}
        </Text>
      </CardBody>
    </Card>
  );
}

export function StatsPage() {
  const [startDate, setStartDate] = useState<string>(() => startOfTodayLocal());
  const [endDate, setEndDate] = useState<string>(() => endOfTodayLocal());
  const hasDateFilter = Boolean(startDate || endDate);
  const { stats, gameCount, loading, error } = useDailyStats(startDate, endDate);

  const champion = useMemo(() => getDayChampion(stats), [stats]);
  const topPenalty = useMemo(() => getTopPenaltyPlayer(stats), [stats]);
  const loser = useMemo(() => getBiggestLoser(stats), [stats]);
  const winless = useMemo(() => getWinlessPlayers(stats), [stats]);
  const disaster = useMemo(() => getDisasterGame(stats), [stats]);
  const mistakeMachine = useMemo(() => getMistakeMachine(stats), [stats]);
  const debtor = useMemo(() => getBiggestDebtor(stats), [stats]);
  const biggestHit = useMemo(() => getBiggestSinglePenalty(stats), [stats]);
  const master202 = useMemo(() => get202Master(stats), [stats]);
  const cleanPlayer = useMemo(() => getCleanPlayer(stats), [stats]);
  const specialists = useMemo(() => getReasonSpecialists(stats), [stats]);

  const filterBar = (
    <Flex
      gap={3}
      mb={5}
      align={{ base: 'stretch', sm: 'flex-end' }}
      direction={{ base: 'column', sm: 'row' }}
      flexWrap="wrap"
    >
      <FormControl maxW={{ sm: '240px' }}>
        <FormLabel fontSize="sm" mb={1}>
          {az.stats.filterStart}
        </FormLabel>
        <Input
          type="datetime-local"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
        />
      </FormControl>
      <FormControl maxW={{ sm: '240px' }}>
        <FormLabel fontSize="sm" mb={1}>
          {az.stats.filterEnd}
        </FormLabel>
        <Input
          type="datetime-local"
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
        />
      </FormControl>
      <Button
        variant="outline"
        onClick={() => {
          setStartDate('');
          setEndDate('');
        }}
        isDisabled={!hasDateFilter}
        w={{ base: 'full', sm: 'auto' }}
      >
        {az.stats.allDates}
      </Button>
    </Flex>
  );

  return (
    <PageLayout title={az.stats.title} subtitle={az.stats.subtitle}>
      {filterBar}

      {loading ? (
        <LoadingState message={az.stats.loading} />
      ) : error ? (
        <ErrorState message={error} />
      ) : gameCount === 0 ? (
        <Card>
          <CardBody textAlign="center" py={10}>
            <Text color="gray.600">{az.stats.empty}</Text>
          </CardBody>
        </Card>
      ) : (
        <Stack spacing={5}>
          <SimpleGrid columns={{ base: 1, sm: 2 }} spacing={4}>
            {champion && (
              <Card bg="teal.50" borderWidth="1px" borderColor="teal.200">
                <CardBody>
                  <Badge colorScheme="teal" mb={1}>
                    {az.stats.champion}
                  </Badge>
                  <Text fontWeight="bold" fontSize="lg">
                    {champion.name}
                  </Text>
                  <Text fontSize="sm" color="teal.700">
                    {champion.wins} {az.stats.wins} · {az.stats.avg} {champion.avgScore}
                  </Text>
                </CardBody>
              </Card>
            )}
            {topPenalty && (
              <Card bg="orange.50" borderWidth="1px" borderColor="orange.200">
                <CardBody>
                  <Badge colorScheme="orange" mb={1}>
                    {az.stats.topPenalty}
                  </Badge>
                  <Text fontWeight="bold" fontSize="lg">
                    {topPenalty.name}
                  </Text>
                  <Text fontSize="sm" color="orange.700">
                    {topPenalty.penaltyCount} {az.stats.penaltyCount} ·{' '}
                    {topPenalty.penaltyTotal} {az.stats.penaltyPoints}
                  </Text>
                </CardBody>
              </Card>
            )}
          </SimpleGrid>

          <Card>
            <CardBody px={{ base: 3, md: 6 }}>
              <Heading size="md" mb={3}>
                {az.stats.funZone}
              </Heading>
              <SimpleGrid columns={{ base: 1, sm: 2, md: 3 }} spacing={4}>
                {loser && (
                  <FunCard
                    title={az.stats.loser}
                    colorScheme="red"
                    name={loser.name}
                    subtitle={az.stats.loserHint(lossCount(loser), loser.winRate)}
                  />
                )}
                {winless.length > 0 && (
                  <FunCard
                    title={az.stats.winless}
                    colorScheme="gray"
                    name={winless.map((w) => w.name).join(', ')}
                    subtitle={az.stats.winlessHint}
                  />
                )}
                {disaster && disaster.worstGame !== null && (
                  <FunCard
                    title={az.stats.disaster}
                    colorScheme="purple"
                    name={disaster.name}
                    subtitle={az.stats.disasterHint(disaster.worstGame)}
                  />
                )}
                {mistakeMachine && (
                  <FunCard
                    title={az.stats.mistakeMachine}
                    colorScheme="pink"
                    name={mistakeMachine.name}
                    subtitle={az.stats.mistakeMachineHint(
                      Math.round(
                        (mistakeMachine.penaltyCount /
                          mistakeMachine.gamesPlayed) *
                          10,
                      ) / 10,
                    )}
                  />
                )}
                {debtor && (
                  <FunCard
                    title={az.stats.debtor}
                    colorScheme="yellow"
                    name={debtor.name}
                    subtitle={az.stats.debtorHint(debtor.penaltyTotal)}
                  />
                )}
                {biggestHit && (
                  <FunCard
                    title={az.stats.biggestHit}
                    colorScheme="red"
                    name={biggestHit.name}
                    subtitle={az.stats.biggestHitHint(biggestHit.maxSinglePenalty)}
                  />
                )}
                {master202 && (
                  <FunCard
                    title={az.stats.master202}
                    colorScheme="orange"
                    name={master202.name}
                    subtitle={az.stats.master202Hint(master202.score202Count)}
                  />
                )}
                {cleanPlayer && (
                  <FunCard
                    title={az.stats.cleanPlayer}
                    colorScheme="green"
                    name={cleanPlayer.name}
                    subtitle={az.stats.cleanPlayerHint(cleanPlayer.cleanRounds)}
                  />
                )}
              </SimpleGrid>

              {specialists.length > 0 && (
                <Box mt={5}>
                  <Heading size="sm" mb={2}>
                    {az.stats.specialists}
                  </Heading>
                  <Stack spacing={1}>
                    {specialists.map((sp) => (
                      <Text key={sp.reason} fontSize="sm">
                        {az.stats.specialistLine(
                          getPenaltyReasonLabel(sp.reason),
                          sp.name,
                          sp.count,
                        )}
                      </Text>
                    ))}
                  </Stack>
                </Box>
              )}
            </CardBody>
          </Card>

          <Card>
            <CardBody px={{ base: 3, md: 6 }}>
              <Heading size="md" mb={1}>
                {az.stats.leaderboard}
              </Heading>
              <Text fontSize="xs" color="gray.500" mb={3}>
                {az.stats.lowestWins}
              </Text>

              {/* Mobile: cards */}
              <Stack spacing={3} display={{ base: 'flex', lg: 'none' }}>
                {stats.map((s, i) => (
                  <PlayerStatsCard key={s.name} stats={s} rank={i + 1} />
                ))}
              </Stack>

              {/* Desktop: table */}
              <Box overflowX="auto" display={{ base: 'none', lg: 'block' }}>
                <Table size="sm" variant="simple">
                  <Thead>
                    <Tr>
                      <Th>#</Th>
                      <Th>{az.stats.player}</Th>
                      <Th isNumeric>{az.stats.games}</Th>
                      <Th isNumeric>{az.stats.wins}</Th>
                      <Th isNumeric>{az.stats.winRate}</Th>
                      <Th isNumeric>{az.stats.avg}</Th>
                      <Th isNumeric>{az.stats.total}</Th>
                      <Th isNumeric>{az.stats.penaltyPoints}</Th>
                      <Th isNumeric>{az.stats.penaltyCount}</Th>
                      <Th isNumeric>{az.stats.rounds}</Th>
                      <Th isNumeric>{az.stats.startedFirst}</Th>
                    </Tr>
                  </Thead>
                  <Tbody>
                    {stats.map((s, i) => (
                      <Tr key={s.name}>
                        <Td>{i + 1}</Td>
                        <Td fontWeight="medium">{s.name}</Td>
                        <Td isNumeric>{s.gamesPlayed}</Td>
                        <Td isNumeric fontWeight="semibold">
                          {s.wins}
                        </Td>
                        <Td isNumeric>{s.winRate}%</Td>
                        <Td isNumeric>{s.avgScore}</Td>
                        <Td isNumeric>{s.grandTotal}</Td>
                        <Td isNumeric>{s.penaltyTotal}</Td>
                        <Td isNumeric>{s.penaltyCount}</Td>
                        <Td isNumeric>{s.roundsPlayed}</Td>
                        <Td isNumeric>{s.timesStartedFirst}</Td>
                      </Tr>
                    ))}
                  </Tbody>
                </Table>
              </Box>

              <Divider my={5} display={{ base: 'none', lg: 'block' }} />

              {/* Desktop: penalty by reason */}
              <Box display={{ base: 'none', lg: 'block' }}>
                <Heading size="sm" mb={3}>
                  {az.stats.penaltyByReason}
                </Heading>
                <Stack spacing={2}>
                  {stats
                    .filter((s) => s.penaltyCount > 0)
                    .map((s) => (
                      <Flex key={s.name} gap={3} align="center" flexWrap="wrap">
                        <Text fontSize="sm" fontWeight="medium" minW="120px">
                          {s.name}
                        </Text>
                        <ReasonBadges stats={s} />
                      </Flex>
                    ))}
                </Stack>
              </Box>
            </CardBody>
          </Card>
        </Stack>
      )}
    </PageLayout>
  );
}
