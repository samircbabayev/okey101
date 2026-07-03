import { GameStatus, PenaltyReason } from '../types';

export const az = {
  appTitle: '101 Okey',
  appTitleFull: '101 Okey Xal İzləyici',

  nav: {
    games: 'Oyunlar',
    newGame: 'Yeni oyun',
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
    notStarted: 'Başlamayıb',
    roundInProgress: (n: number) => `${n}. raund davam edir`,
    roundsCompleted: (done: number, total: number) => `${done}/${total} raund bitib`,
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
    startRound: 'Raund başlat',
    addPenalty: 'Cərimə əlavə et',
    finishRound: 'Raundu bitir',
    finishGame: 'Oyunu bitir',
    roundInProgress: (n: number) => `${n}. raund davam edir`,
    startingPlayer: (name: string) => `Başlayan: ${name}`,
    gameFinished: 'Oyun bitdi — xallar aşağıdadır.',
    finishGameTitle: 'Oyunu bitir',
    finishGameBody:
      'Oyunu indi bitirmək istəyirsən? Qalib cari xallara görə müəyyən olunacaq. Geri qaytarmaq olmaz.',
    toasts: {
      roundStarted: 'Raund başladı',
      roundStartFailed: 'Raund başlamadı',
      finishRoundFirst: 'Əvvəl cari raundu bitir',
      gameFinished: 'Oyun bitdi',
      gameFinishFailed: 'Oyun bitmədi',
    },
  },

  gameInfo: {
    totalRounds: 'CƏMİ raund',
    currentRound: 'CARİ raund',
    teams: 'Komandalar',
    players: 'Oyunçular',
    notStarted: 'Başlamayıb',
  },

  scoreboard: {
    title: 'Xal cədvəli',
    player: 'Oyunçu',
    team: 'Komanda',
    points: 'Xal',
    penalty: 'Cərimə',
    total: 'Cəmi',
    teamTotals: 'Komanda xalları',
    grandTotal: 'Ümumi',
    winner: 'Qalib',
    winnerPoints: (team: string, points: number) => `${team} — ${points} xal`,
    lowestWins: 'Ən az xal qazanır',
    unknownTeam: 'Naməlum',
  },

  roundHistory: {
    title: 'Raund tarixçəsi',
    empty: 'Hələ bitmiş raund yoxdur.',
    round: (n: number) => `${n}. raund`,
    finished: 'BİTİB',
    startedBy: (name: string) => `Başlayan: ${name}`,
    scores: 'Xallar',
    penalties: 'CƏRİMƏLƏR',
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
    title: (n: number) => `${n}. raundu bitir`,
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
