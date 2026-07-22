import { GameStatus, PenaltyReason } from '../types';

// Azerbaijani ordinal suffix follows 4-way vowel harmony (-cı/-ci/-cu/-cü),
// determined by the last vowel of the spoken number word.
const UNIT_ORDINAL_SUFFIX: Record<number, string> = {
  1: 'ci',
  2: 'ci',
  3: 'cü',
  4: 'cü',
  5: 'ci',
  6: 'cı',
  7: 'ci',
  8: 'ci',
  9: 'cu',
};

const TENS_ORDINAL_SUFFIX: Record<number, string> = {
  10: 'cu',
  20: 'ci',
  30: 'cu',
  40: 'cı',
  50: 'ci',
  60: 'cı',
  70: 'ci',
  80: 'ci',
  90: 'cı',
};

export function azOrdinal(n: number): string {
  const units = n % 10;
  if (units !== 0) return `${n}-${UNIT_ORDINAL_SUFFIX[units]}`;

  const tens = n % 100;
  if (tens !== 0) return `${n}-${TENS_ORDINAL_SUFFIX[tens]}`;

  // "yüz" (hundreds) → cü, "min" (thousands) → ci
  if (n % 1000 !== 0) return `${n}-cü`;
  return `${n}-ci`;
}

export const az = {
  appTitle: '101 Okey',
  appTitleFull: '101 Okey Xal İzləyici',

  nav: {
    games: 'Oyunlar',
    newGame: 'Yeni oyun',
    stats: 'Statistika',
  },

  notFound: {
    title: 'Səhifə tapılmadı',
    code: '404',
    message: 'Axtardığın səhifə mövcud deyil və ya köçürülüb.',
    backHome: 'Ana səhifəyə qayıt',
  },

  common: {
    cancel: 'Ləğv et',
    loading: 'Yüklənir...',
    errorTitle: 'Xəta baş verdi',
    unknown: 'Naməlum xəta',
    team: (n: number) => `Komanda ${n}`,
  },

  gameStatus: {
    [GameStatus.Active]: 'Aktiv',
    [GameStatus.Finished]: 'Bitib',
  },

  gameList: {
    title: 'Oyunlar',
    subtitle: 'Okey xal oyunların',
    loading: 'Oyunlar yüklənir...',
    empty: 'Hələ oyun yoxdur. İlk oyununu yarat.',
    createGame: 'Oyun yarat',
    teams: 'komanda',
    rounds: 'raund',
    viewResults: 'Nəticəyə bax',
    continueGame: 'Davam et',
    winner: 'Qalib',
    notStarted: 'Başlamayıb',
    roundInProgress: (n: number) => `${azOrdinal(n)} raund davam edir`,
    roundsCompleted: (done: number, total: number) => `${done}/${total} raund bitib`,
    filterStart: 'Başlanğıc',
    filterEnd: 'Son',
    allDates: 'Hamısı',
    today: 'Bu gün',
    noGamesForDate: 'Bu aralıqda oyun yoxdur.',
  },

  stats: {
    title: 'Statistika',
    subtitle: 'Oyunçu statistikası',
    loading: 'Statistika yüklənir...',
    filterStart: 'Başlanğıc',
    filterEnd: 'Son',
    allDates: 'Hamısı',
    today: 'Bu gün',
    empty: 'Bu aralıqda oyun yoxdur.',
    champion: 'Günün çempionu',
    championHint: 'Ən çox qalibiyyət',
    topPenalty: 'Ən çox cərimə sayı',
    leaderboard: 'Reytinq',
    player: 'Oyunçu',
    games: 'Oyun',
    wins: 'Qalib',
    winRate: 'Qalib %',
    total: 'Cəmi xal',
    avg: 'Orta xal',
    penaltyPoints: 'Cərimə xalı',
    penaltyCount: 'Cərimə sayı',
    rounds: 'Raund',
    startedFirst: 'Birinci başlama',
    bestGame: 'Ən yaxşı oyun',
    worstGame: 'Ən pis oyun',
    penaltyByReason: 'Cərimə səbəbləri',
    noPenalties: 'Cərimə yoxdur',
    details: 'Ətraflı',
    lowestWins: 'Az xal daha yaxşıdır',
    funZone: 'Günün qazqulaxları',
    loser: 'Günün luzeri',
    loserHint: (losses: number, winRate: number) =>
      `${losses} məğlubiyyət · Qalib ${winRate}%`,
    winless: 'Əliboş',
    winlessHint: 'Bu gün heç udmadı',
    disaster: 'Fəlakət oyunu',
    disasterHint: (points: number) => `${points} xal — günün ən pis oyunu`,
    specialists: 'Cərimə mütəxəssisləri',
    specialistLine: (reason: string, name: string, count: number) =>
      `${reason}: ${name} (${count})`,
    mistakeMachine: 'Səhv maşını',
    mistakeMachineHint: (rate: number) => `Oyun başına ${rate} cərimə`,
    debtor: 'Ən çox cərimə',
    debtorHint: (points: number) => `${points} cərimə xalı`,
    biggestHit: 'Ən ağır zərbə',
    biggestHitHint: (points: number) => `Tək cərimə: +${points}`,
    master202: '202 ustası',
    master202Hint: (n: number) => `${n} dəfə 202 xal`,
    cleanPlayer: 'Təmiz oyunçu',
    cleanPlayerHint: (n: number) => `${n} raund cəriməsiz`,
  },

  createGame: {
    title: 'Yeni oyun',
    subtitle: 'Komanda, oyunçu və raund sayı',
    fillDefault: 'Standart doldur',
    fillLast: 'Son oyunu doldur',
    gameName: 'Oyun adı',
    gameNamePlaceholder: 'Cümə axşamı Okey',
    teamCount: 'Komanda sayı',
    totalRounds: 'Raund sayı',
    playerCount: 'Oyunçu sayı',
    players: 'Oyunçular',
    player: (n: number) => `Oyunçu ${n}`,
    gameNumber: (n: number) => `Oyun ${n}`,
    name: 'Ad',
    turnOrder: 'Növbə',
    startFirst: 'Birinci başla',
    startsFirst: 'Birinci başlayır',
    create: 'Oyun yarat',
    errors: {
      nameRequired: 'Oyun adı vacibdir',
      roundsInvalid: 'Raund sayı müsbət tam olmalıdır',
      playerNameRequired: (n: number) => `Oyunçu ${n} adı vacibdir`,
      turnOrderUnique: 'Hər oyunçunun unikal növbəsi olmalıdır',
      createFailed: 'Oyun yaradılmadı',
    },
    randomNames: ['Cümə', 'Şənbə', 'Bazar', 'Əfsanəvi', 'Klassik', 'Gecə', 'Çempion'],
  },

  game: {
    title: 'Oyun',
    subtitle: 'Xal və raundları izlə',
    loading: 'Oyun yüklənir...',
    notFound: 'Oyun tapılmadı',
    addPenalty: 'Cərimə əlavə et',
    finishRound: 'Raundu bitir',
    finishGame: 'Oyunu bitir',
    roundInProgress: (n: number) => `${azOrdinal(n)} raund davam edir`,
    roundInProgressSpeech: (n: number) => `${n}. raund davam edir`,
    startingPlayer: (name: string) => `Başlayan: ${name}.`,
    speak: 'Səslə',
    editStarter: 'Başlayanı dəyiş',
    editStarterTitle: 'Başlayan oyunçunu dəyiş',
    editStarterLabel: 'Başlayan oyunçu',
    save: 'Yadda saxla',
    gameFinished: 'Oyun bitdi — xallar aşağıdadır.',
    finishGameTitle: 'Oyunu bitir',
    finishGameBody:
      'Oyunu indi bitir. Qalib komandanı seçə bilərsən, seçməsən qalib cari xallara görə müəyyən olunur. Geri qaytarmaq olmaz.',
    finishGameWinnerLabel: 'Qalib komanda',
    finishGameWinnerAuto: 'Avtomatik (xala görə)',
    toasts: {
      finishRoundFirst: 'Əvvəl cari raundu bitir',
      gameFinished: 'Oyun bitdi',
      gameFinishFailed: 'Oyun bitmədi',
      starterUpdated: 'Başlayan yeniləndi',
      starterUpdateFailed: 'Başlayan yenilənmədi',
    },
  },

  activeRoundPenalties: {
    title: 'Cari raund cərimələri',
    empty: 'Bu raundda hələ cərimə yoxdur.',
    playerTotal: (n: number) => `+${n}`,
    roundTotal: (n: number) => `Raund cəmi: +${n}`,
    entryCount: (n: number) => `${n} cərimə`,
  },

  gameInfo: {
    totalRounds: 'CƏMİ raund',
    currentRound: 'CARİ raund',
    teams: 'Komandalar',
    players: 'Oyunçular',
    notStarted: 'Başlamayıb',
  },

  scoreboard: {
    title: 'Oyunçu xal cədvəli',
    player: 'Oyunçu',
    team: 'Komanda',
    points: 'Xal',
    penalty: 'Cərimə',
    total: 'Cəmi',
    teamTotals: 'Komanda xalları',
    grandTotal: 'Ümumi',
    winner: 'Qalib',
    winnerPoints: (team: string, players: string, points: number, margin: number) =>
      players
        ? `${team} (${players}) — ${points} xal (${margin} xal fərq ilə)`
        : `${team} — ${points} xal (${margin} xal fərq ilə)`,
    lowestWins: 'Avtomatik: ən az xal qazanır',
    winnerManual: 'Qalib əl ilə seçildi',
    draw: 'Bərabərlik',
    drawHint: 'Komandalar eyni xal topladı — qalib yoxdur',
    leadBy: (team: string, points: number) =>
      `${team}, ${points} xal ilə qabaqdadır`,
    leadTie: 'Komandaların xalı bərabərdir',
    unknownTeam: 'Naməlum',
  },

  roundHistory: {
    title: 'Raund tarixçəsi',
    empty: 'Hələ bitmiş raund yoxdur.',
    round: (n: number) => `${azOrdinal(n)} raund`,
    finished: 'BİTİB',
    startedBy: (name: string) => `Başlayan: ${name}`,
    scores: 'Xallar',
    penalties: 'CƏRİMƏLƏR',
    runningTotal: 'Cəmi (raunda qədər)',
    penaltyExtra: (n: number) => `(+${n} cərimə)`,
    unknownPlayer: 'Naməlum',
  },

  penaltyModal: {
    title: 'Cərimə əlavə et',
    player: 'Oyunçu',
    selectPlayer: 'Oyunçu seç',
    value: 'Cərimə xalı',
    valuePlaceholder: 'məs. 101',
    reason: 'Səbəb',
    note: 'Qeyd (istəyə bağlı)',
    notePlaceholder: 'Əlavə məlumat...',
    submit: 'Əlavə et',
    errors: {
      playerRequired: 'Oyunçu seç',
      valueInvalid: 'Müsbət tam ədəd olmalıdır',
      failed: 'Cərimə əlavə olunmadı',
    },
  },

  finishRoundModal: {
    title: (n: number) => `${azOrdinal(n)} raundu bitir`,
    hint: 'Hər oyunçu üçün xal daxil et. Bu raundun cərimələri göstərilir.',
    roundPenalties: (n: number) => `Raund cəriməsi: +${n}`,
    submit: 'Raundu bitir',
    errors: {
      scoreRequired: (name: string) => `${name} üçün düzgün tam xal daxil et`,
      failed: 'Raund bitmədi',
    },
  },
} as const;

export function gameStatusLabel(status: GameStatus): string {
  return az.gameStatus[status];
}

export function randomGameName(): string {
  const adj = az.createGame.randomNames;
  return `${adj[Math.floor(Math.random() * adj.length)]} Okey`;
}

export const PENALTY_REASON_LABELS: Record<PenaltyReason, string> = {
  [PenaltyReason.FalseDiscard]: 'İşləyən daş atmaq',
  [PenaltyReason.FalseOpen]: 'Səhv açmaq',
  [PenaltyReason.GiveTile]: 'Daş vermək',
  [PenaltyReason.JokerDiscard]: 'Kozr atmaq',
  [PenaltyReason.Other]: 'Digər',
};

export function penaltyReasonLabel(reason: PenaltyReason): string {
  return PENALTY_REASON_LABELS[reason] ?? reason;
}
