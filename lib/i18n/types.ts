import type { GameId } from '../games/types';

export interface FaqItem {
  q: string;
  a: string;
}

export interface StrategyItem {
  h: string;
  p: string;
}

export interface GameContent {
  /** Localised display name, e.g. "오목". */
  name: string;
  /** Native / alternate names shown under the title, e.g. "Gomoku · 五目並べ". */
  aka: string;
  /** One line under the hero title. */
  tagline: string;
  /** Two-sentence description used on the hub cards. */
  blurb: string;
  metaTitle: string;
  metaDescription: string;
  /** Search keywords folded into the page metadata. */
  keywords: string[];
  rulesTitle: string;
  rules: string[];
  strategyTitle: string;
  strategy: StrategyItem[];
  historyTitle: string;
  history: string[];
  faqTitle: string;
  faq: FaqItem[];
}

export interface Dictionary {
  meta: {
    siteTagline: string;
    homeTitle: string;
    homeDescription: string;
    keywords: string[];
  };
  nav: {
    games: string;
    about: string;
    privacy: string;
    language: string;
    theme: string;
    skipToGame: string;
  };
  hero: {
    eyebrow: string;
    titleLine1: string;
    titleLine2: string;
    subtitle: string;
    ctaPlay: string;
    ctaBrowse: string;
    stat1: string;
    stat1Label: string;
    stat2: string;
    stat2Label: string;
    stat3: string;
    stat3Label: string;
  };
  home: {
    pickEyebrow: string;
    pickTitle: string;
    pickSubtitle: string;
    whyEyebrow: string;
    whyTitle: string;
    why: StrategyItem[];
    closingTitle: string;
    closingBody: string;
    difficultyNote: string;
  };
  game: {
    play: string;
    difficulty: string;
    levels: [string, string, string, string];
    levelHints: [string, string, string, string];
    yourSide: string;
    newGame: string;
    undo: string;
    pass: string;
    resign: string;
    hint: string;
    thinking: string;
    yourTurn: string;
    aiTurn: string;
    moveLog: string;
    captured: string;
    inHand: string;
    score: string;
    boardSize: string;
    komi: string;
    setup: string;
    setups: { inner: string; outer: string; left: string; right: string };
    playFirst: string;
    playSecond: string;
    black: string;
    white: string;
    cho: string;
    han: string;
    sente: string;
    gote: string;
    check: string;
    /** Result banner strings. */
    youWin: string;
    youLose: string;
    draw: string;
    playAgain: string;
    tryAnother: string;
    reasons: Record<string, string>;
    promotePrompt: string;
    promoteYes: string;
    promoteNo: string;
    passedNotice: string;
    scoringNote: string;
    loading: string;
  };
  sections: {
    otherGames: string;
    otherGamesNote: string;
    onThisPage: string;
    faqSchemaNote: string;
  };
  footer: {
    blurb: string;
    rights: string;
    disclaimer: string;
  };
  about: {
    title: string;
    intro: string;
    body: StrategyItem[];
  };
  privacy: {
    title: string;
    updated: string;
    body: StrategyItem[];
  };
  games: Record<GameId, GameContent>;
}
