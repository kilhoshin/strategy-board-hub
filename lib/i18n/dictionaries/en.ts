import type { Dictionary } from '../types';

export const en: Dictionary = {
  meta: {
    siteTagline: 'Seven abstract strategy games. One browser. No sign-up.',
    homeTitle:
      'Strategy Board Hub — Play Gomoku, Reversi, Chess, Janggi, Shogi, Go & Bagh-Chal vs AI, free',
    homeDescription:
      'Free online abstract strategy games with a built-in AI opponent: Gomoku, Reversi, Janggi (Korean chess), chess, shogi, Go and Bagh-Chal (the Nepali tiger-and-goat hunt game). Nothing to install, no account, four difficulty levels, plus full rules and strategy guides.',
    keywords: [
      'abstract strategy games',
      'play gomoku online free',
      'reversi vs computer',
      'korean chess online',
      'shogi against AI',
      'play go 9x9 online',
      'bagh chal online',
      'free board games no download',
    ],
  },
  nav: {
    games: 'Games',
    about: 'About',
    privacy: 'Privacy',
    language: 'Language',
    theme: 'Toggle theme',
    skipToGame: 'Skip to the board',
  },
  hero: {
    eyebrow: 'Seven games · Four difficulties · Zero downloads',
    titleLine1: 'The oldest games',
    titleLine2: 'ever devised',
    subtitle:
      'Gomoku, Reversi, Janggi, chess, shogi, Go and Bagh-Chal — each with an AI opponent that runs entirely inside your browser. No account, no install, no waiting for a match.',
    ctaPlay: 'Play Gomoku now',
    ctaBrowse: 'Browse all seven',
    stat1: '7',
    stat1Label: 'Complete games',
    stat2: '4',
    stat2Label: 'AI difficulty levels',
    stat3: '0',
    stat3Label: 'Accounts required',
  },
  home: {
    pickEyebrow: 'Choose your board',
    pickTitle: 'Seven ways to think',
    pickSubtitle:
      'Every game here is one of pure information: no dice, no hidden cards, no luck. Just a board, a position, and whatever you can see in it.',
    whyEyebrow: 'Why this hub',
    whyTitle: 'Built to be played, not monetised into oblivion',
    why: [
      {
        h: 'The engine runs on your machine',
        p: 'Every search — minimax for the piece games, Monte-Carlo tree search for Go — executes in a Web Worker on your own device. Nothing about your game is sent anywhere, and there is no server to be down.',
      },
      {
        h: 'Four honest difficulty levels',
        p: 'Level 1 is a genuine beginner that will hang pieces. Level 4 thinks for several seconds and will punish a loose move. Pick the one that makes you think, not the one that makes you lose.',
      },
      {
        h: 'Rules and strategy on the same page',
        p: 'Each board sits above a full explanation of how the game works, the ideas that actually win games, and where the game came from. Learn and play without switching tabs.',
      },
      {
        h: 'Instant, everywhere',
        p: 'Static pages, deferred engine loading and no third-party frameworks in the critical path. It opens fast on a phone on mobile data, which is where most people actually play.',
      },
    ],
    closingTitle: 'Pick a board and start thinking',
    closingBody:
      'Nothing here needs an account, an app store, or an opponent who is awake. Choose a game, choose a level, and play a move.',
    difficultyNote:
      'The AI thinks in a background thread, so the page stays responsive even while the hardest level is searching.',
  },
  game: {
    play: 'Play',
    difficulty: 'Difficulty',
    levels: ['Novice', 'Casual', 'Strong', 'Expert'],
    levelHints: [
      'Plays quickly and makes real mistakes — a fair fight for a first game.',
      'Looks a couple of moves ahead. Punishes obvious blunders.',
      'Searches for about a second and a half. A solid club-level sparring partner.',
      'Thinks for several seconds per move. Expect to work for the win.',
    ],
    yourSide: 'Your side',
    newGame: 'New game',
    undo: 'Undo',
    pass: 'Pass',
    resign: 'Resign',
    hint: 'Hint',
    thinking: 'Thinking…',
    yourTurn: 'Your move',
    aiTurn: 'AI to move',
    moveLog: 'Moves',
    captured: 'Captured',
    inHand: 'in hand',
    score: 'Score',
    boardSize: 'Board size',
    komi: 'Komi',
    setup: 'Opening setup',
    setups: {
      inner: 'Inner elephants (象內)',
      outer: 'Outer elephants (象外)',
      left: 'Left elephant',
      right: 'Right elephant',
    },
    pieceStyle: 'Piece symbols',
    pieceStyles: { hanja: '漢字', icon: 'Icons', letter: 'K G R' },
    defaultPieceStyle: 'icon',
    colorScheme: 'Colours',
    colorSchemes: { traditional: 'Cho / Han', mono: 'White / Black' },
    legend: 'Piece guide',
    pieces: {
      general: {
        name: 'General (King)',
        move: 'One step along the lines. Never leaves the 3×3 palace.',
      },
      guard: {
        name: 'Guard',
        move: 'One step along the lines, palace only. It exists to shield the general.',
      },
      chariot: {
        name: 'Chariot (Rook)',
        move: 'Any distance in a straight line — plus along the palace diagonals.',
      },
      cannon: {
        name: 'Cannon',
        move: 'Must jump exactly one piece. Never over, and never onto, another cannon.',
      },
      horse: {
        name: 'Horse (Knight)',
        move: 'One step straight, then one diagonally outward. Blocked if the straight step is occupied.',
      },
      elephant: {
        name: 'Elephant',
        move: 'One step straight, then two diagonally outward. Blocked at either of the first two points.',
      },
      soldier: {
        name: 'Soldier (Pawn)',
        move: 'One step forward or sideways, never backward. Uses the palace diagonals when attacking.',
      },
    },
    blockedNote:
      '✕ marks a piece standing in the way. Horses and elephants must walk their first step or two through empty points, so a single blocker shuts down a whole direction.',
    playFirst: 'first',
    playSecond: 'second',
    black: 'Black',
    white: 'White',
    cho: 'Cho (楚)',
    han: 'Han (漢)',
    sente: 'Sente',
    gote: 'Gote',
    goat: 'Goat',
    tiger: 'Tiger',
    check: 'Check',
    youWin: 'You win',
    youLose: 'You lose',
    draw: 'Draw',
    playAgain: 'Play again',
    tryAnother: 'Try another game',
    reasons: {
      five: 'Five in a row',
      boardFull: 'The board is full',
      discs: 'Counted by discs',
      checkmate: 'Checkmate',
      stalemate: 'Stalemate',
      fiftyMove: 'Fifty-move rule',
      insufficientMaterial: 'Insufficient material',
      repetition: 'Threefold repetition',
      sennichite: 'Repetition (sennichite)',
      bikjang: 'Bikjang — the generals face each other',
      quiet: 'No capture for a long time',
      area: 'Counted by area',
      goatsCaptured: 'Five goats captured',
      tigersTrapped: 'Every tiger is blocked',
      goatsTrapped: 'The goats have no move left',
    },
    hints: {
      title: 'AI suggestion',
      enable: 'Show AI suggestions',
      show: 'Suggest a move',
      thinking: 'Working it out…',
      suggestion: 'It would play',
      hide: 'Hide',
      none: 'No move to suggest here.',
      offNote:
        'Suggestions are off. Flip the switch if you would like a nudge — it stays off until you turn it back on.',
      disclaimer:
        'This is the same limited engine you are playing against, thinking for a few seconds in your browser. It is often useful and it is regularly wrong — treat it as a second opinion, not the answer.',
    },
    promotePrompt: 'Promote?',
    promoteYes: 'Promote',
    promoteNo: 'Stay',
    passedNotice: 'No legal move — turn passed',
    scoringNote:
      'Both players passing ends the game. The result is settled with Chinese area scoring, and dead stones are judged by playing the position out hundreds of times — so you do not need to capture everything by hand.',
    loading: 'Loading the board…',
  },
  sections: {
    otherGames: 'More games on this site',
    otherGamesNote: 'Same engine approach, entirely different kind of thinking.',
    onThisPage: 'On this page',
    faqSchemaNote: 'Frequently asked questions',
  },
  puzzle: {
    title: 'Puzzles',
    tagline: 'Find the forced win.',
    tierLabel: ['Mate in 1', 'Mate in 2', 'Mate in 3'],
    prompt: 'Find the winning move.',
    correct: 'Correct!',
    incorrect: 'Not quite — try again.',
    retry: 'Retry',
    next: 'Next puzzle',
    solved: 'Solved!',
    hint: 'Hint',
    showHint: 'Show hint',
    progress: 'Puzzle',
    backToGame: 'Back to the game',
  },
  footer: {
    blurb:
      'A quiet corner of the web for abstract strategy games. Everything runs client-side, so your games stay on your machine.',
    rights: 'All rights reserved.',
    disclaimer:
      'Reversi is the historic public-domain name for the game; "Othello" is a registered trademark and is not used here. All game rules are traditional and unencumbered.',
  },
  about: {
    title: 'About Strategy Board Hub',
    intro:
      'Strategy Board Hub is a small, independent site for playing abstract strategy games against a computer opponent that runs entirely in your browser.',
    body: [
      {
        h: 'What this site is',
        p: 'Seven traditional games — Gomoku, Reversi, Janggi, chess, shogi, Go and Bagh-Chal — each with a playable board, a tunable AI opponent, and a written guide covering the rules, the core strategic ideas, and the history of the game. There is no account system, no matchmaking queue and no chat.',
      },
      {
        h: 'How the AI works',
        p: 'The piece games use classical game-tree search: alpha-beta pruning over a hand-written evaluation function, with iterative deepening under a fixed time budget so the engine always answers promptly. Go uses Monte-Carlo tree search with random playouts, which is the approach that made 9×9 computer Go respectable long before neural networks arrived. All of it is TypeScript compiled to JavaScript and executed in a Web Worker on your own device.',
      },
      {
        h: 'How strong is it, honestly',
        p: 'It is a browser, not a data centre. Expect a strong club player in Reversi and Gomoku, a decent amateur in chess and shogi, and a mid-kyu opponent on a 9×9 Go board. That is deliberately the range where a game stays interesting for most people — you should be able to beat level 1 immediately and struggle against level 4.',
      },
      {
        h: 'Naming and trademarks',
        p: 'The rules of all seven games are traditional and in the public domain. Where a modern trademark exists for a commercial edition of a traditional game, we use the historic generic name instead — most notably Reversi rather than the trademarked "Othello".',
      },
      {
        h: 'Contact',
        p: 'This is a hobby project. If something is broken, mis-translated, or a rule is implemented incorrectly, corrections are genuinely welcome.',
      },
    ],
  },
  privacy: {
    title: 'Privacy Policy',
    updated: 'Last updated: 26 July 2026',
    body: [
      {
        h: 'The short version',
        p: 'We do not ask you to create an account, and we do not collect your name, email address or any other personal identifier. Your games are played and stored on your own device.',
      },
      {
        h: 'Local storage',
        p: 'The site stores a small amount of data in your browser’s local storage: your chosen colour theme, and optionally a game in progress so you can come back to it. This never leaves your device and you can clear it at any time through your browser settings.',
      },
      {
        h: 'Advertising',
        p: 'This site is supported by Google AdSense. Google and its partners may use cookies to serve ads based on your prior visits to this or other websites. You can opt out of personalised advertising through Google Ads Settings, and you can review how Google uses information from sites that use its services at policies.google.com/technologies/partner-sites.',
      },
      {
        h: 'Analytics',
        p: 'If aggregate traffic analytics are enabled, they record page views and referrers only. No cross-site profile is built and no personally identifying information is collected.',
      },
      {
        h: 'Children',
        p: 'This site is intended for a general audience and does not knowingly collect information from children under 13.',
      },
      {
        h: 'Changes',
        p: 'If this policy changes, the revised version will be posted on this page with an updated date.',
      },
    ],
  },
  games: {
    gomoku: {
      name: 'Gomoku',
      aka: 'Omok · 五目並べ · 五子棋',
      tagline: 'Five in a row on a 15×15 grid. Ten seconds to learn, a lifetime to stop losing.',
      blurb:
        'Place stones on intersections and be the first to line up five. The rules fit in a sentence; the tactics of double threats do not.',
      metaTitle: 'Play Gomoku Online Free vs AI — Rules, Strategy & Five-in-a-Row Tactics',
      metaDescription:
        'Play Gomoku (five in a row, omok) free against a computer opponent, right in your browser. Four difficulty levels, no download, plus a complete guide to the rules, opening theory and double-threat tactics.',
      keywords: [
        'gomoku online',
        'play gomoku free',
        'five in a row game',
        'omok online',
        'gomoku rules',
        'gomoku strategy',
        'gomoku vs computer',
      ],
      rulesTitle: 'How to play Gomoku',
      rules: [
        'Gomoku is played on the intersections of a 15×15 grid. Black plays first, then players alternate placing one stone per turn.',
        'Stones are placed on empty intersections and never move again once played. There is no capturing.',
        'The first player to get five of their own stones in an unbroken line — horizontally, vertically or diagonally — wins immediately.',
        'This site plays freestyle Gomoku: an overline of six or more also counts as a win, and there are no forbidden moves for Black. Tournament Renju adds restrictions on Black to offset the first-move advantage; freestyle is the version most people play casually.',
        'If every intersection is filled and no one has five in a row, the game is a draw. In practice this almost never happens.',
        'Because Black moves first, Black holds a real advantage in freestyle. If you want a harder game, take White.',
      ],
      strategyTitle: 'Gomoku strategy guide',
      strategy: [
        {
          h: 'Count threats, not stones',
          p: 'A "three" is three stones that can become four; a "four" is four stones with an open end, which forces an immediate block. The entire game is about creating threats faster than your opponent can answer them. A single four is useless on its own — your opponent just blocks it.',
        },
        {
          h: 'The double threat wins games',
          p: 'A move that creates two fours at once, or a four and an open three simultaneously, cannot be answered by one block. Almost every won game of Gomoku ends this way. Look for intersections where two of your lines cross.',
        },
        {
          h: 'Open threes are more dangerous than closed fours',
          p: 'An "open three" — three in a row with empty points at both ends — threatens to become an open four, which is unstoppable. Blocking a closed four is trivial; letting an open three live is often fatal. Treat open threes as emergencies.',
        },
        {
          h: 'Play toward the centre early',
          p: 'A stone near the centre participates in more potential lines than one near the edge. Opening on or near the central intersection and building outward gives your stones more ways to combine. Edge play only makes sense when it blocks something.',
        },
        {
          h: 'Block on the side that helps you',
          p: 'When you must block, you usually have two choices of which end to close. Prefer the end that also extends one of your own lines — defending and building at the same time is how you take over the initiative.',
        },
      ],
      historyTitle: 'The history of Gomoku',
      history: [
        'Gomoku descends from a family of line-forming games played across East Asia for well over a thousand years. The Japanese name 五目並べ (gomoku narabe) literally means "five points in a row", and the game was already a common pastime in Japan by the Edo period, played on borrowed Go equipment — a Go board and Go stones, but an entirely different game.',
        'The first-player advantage was recognised early and mathematically confirmed in 1993, when Victor Allis proved that freestyle Gomoku on a 15×15 board is a win for Black with perfect play. The competitive answer was Renju, a regulated variant that forbids Black from making double-threes, double-fours or overlines, restoring the balance for tournament play.',
        'In Korea the game is known as omok (오목) and remains one of the most commonly played pencil-and-paper and board games; in China it is wuziqi (五子棋). Because the rules are so compact, Gomoku has also long been a favourite test bed for game-tree search algorithms — which is exactly what powers the opponent on this page.',
      ],
      faqTitle: 'Gomoku FAQ',
      faq: [
        {
          q: 'Is Gomoku the same as Connect Four?',
          a: 'No. Connect Four is played in a vertical grid where pieces fall to the bottom, so you cannot choose the row. Gomoku lets you place a stone on any empty intersection, which makes the tactics far richer, and needs five in a row rather than four.',
        },
        {
          q: 'Does Black always win in Gomoku?',
          a: 'With perfect play on a 15×15 freestyle board, yes — that was proven in 1993. In real games between humans it matters much less than the proof suggests, and playing White against a strong opponent is excellent training.',
        },
        {
          q: 'What is the difference between Gomoku and Renju?',
          a: 'Renju is competitive Gomoku with handicap rules: Black is forbidden from playing a double-three, a double-four, or a line of six or more. This site implements freestyle Gomoku, where Black has no restrictions.',
        },
        {
          q: 'Does a row of six count as a win?',
          a: 'In freestyle Gomoku, yes — six or more in a row contains five and wins. In Renju, an overline is a forbidden move for Black and loses the game.',
        },
        {
          q: 'How do I get better at Gomoku quickly?',
          a: 'Learn to recognise open threes and forced fours on sight, then practise spotting moves that make two threats at once. Almost all improvement below expert level comes from those two skills, and from checking your opponent’s threats before playing your own.',
        },
      ],
    },

    reversi: {
      name: 'Reversi',
      aka: 'Rivāsi · 黑白棋 · 리버시',
      tagline: 'Flip your opponent’s discs and own the board when the last square is filled.',
      blurb:
        'Outflank a line of enemy discs and they all turn to your colour. Being ahead in the middlegame is usually a bad sign.',
      metaTitle: 'Play Reversi Online Free vs AI — Rules, Corner Strategy & Mobility Tactics',
      metaDescription:
        'Play Reversi free against a computer opponent in your browser. Four difficulty levels with an exact endgame solver, no download, plus a full guide to the rules, corner play and the mobility strategy that actually wins games.',
      keywords: [
        'reversi online',
        'play reversi free',
        'reversi vs computer',
        'reversi rules',
        'reversi strategy',
        'black and white board game',
        'reversi corner strategy',
      ],
      rulesTitle: 'How to play Reversi',
      rules: [
        'Reversi is played on an 8×8 board. The four central squares start filled: two black discs and two white discs, placed diagonally. Black moves first.',
        'A legal move places one disc so that it outflanks at least one straight line of the opponent’s discs — that is, there is an unbroken row of enemy discs between your new disc and another of your discs, in any of the eight directions.',
        'Every enemy disc that is outflanked by the move flips to your colour. A single move can flip discs in several directions at once.',
        'If you have no legal move, your turn is skipped and the opponent moves again. If neither player has a legal move, the game ends immediately.',
        'The game also ends when the board is full. Whoever has more discs of their colour on the board wins; an equal count is a draw.',
        'You may never pass voluntarily. If a legal move exists, you must play one.',
      ],
      strategyTitle: 'Reversi strategy guide',
      strategy: [
        {
          h: 'Corners are permanent, everything else is not',
          p: 'A disc in a corner can never be outflanked, because there is no square beyond it. Corners are the only truly stable squares on an empty board, and they anchor whole edges. Winning a corner is usually worth more than a dozen discs elsewhere.',
        },
        {
          h: 'Never touch the X-squares early',
          p: 'The four diagonal neighbours of the corners — c3, f3, c6, f6 in standard notation — are called X-squares. Playing one usually hands your opponent the adjacent corner. The squares directly beside a corner (the C-squares) are nearly as dangerous.',
        },
        {
          h: 'Fewer discs is better in the middlegame',
          p: 'This is the counter-intuitive heart of Reversi. The player with fewer discs typically has more legal moves available and forces the opponent into bad ones. Flipping a huge number of discs in move twenty usually just gives your opponent more edges to attack.',
        },
        {
          h: 'Mobility is the real currency',
          p: 'Count how many legal moves each side has. If you can keep your options open while shrinking your opponent’s, they will eventually be forced to play an X-square or hand you a corner. Quiet moves that flip one or two interior discs are often the strongest.',
        },
        {
          h: 'Switch to counting in the endgame',
          p: 'With roughly twelve empty squares left, positional thinking gives way to exact calculation — the final disc count is all that matters. The engine here solves the last dozen squares perfectly, so a "safe" positional lead can evaporate on the final move.',
        },
      ],
      historyTitle: 'The history of Reversi',
      history: [
        'Reversi was invented in England around 1883. Two men, Lewis Waterman and John W. Mollett, each claimed to have created it and spent years publicly disputing the other’s claim; the game was published commercially by Jaques of London and became a Victorian parlour staple.',
        'The modern competitive form dates to 1971, when Goro Hasegawa standardised the fixed starting position and 8×8 board in Japan and marketed it under a name that is now a registered trademark. That commercial edition drove an enormous boom in Japan and a serious tournament scene, which is why the strongest human players and the deepest opening theory are still largely Japanese.',
        'Reversi has also been a landmark for computer game playing. The program Logistello defeated the reigning world champion Takeshi Murakami 6–0 in 1997, and modern engines solve the 8×8 game far beyond human reach. In 2023 the game was weakly solved: with perfect play by both sides, Reversi on the standard board is a draw.',
      ],
      faqTitle: 'Reversi FAQ',
      faq: [
        {
          q: 'Why is this called Reversi and not Othello?',
          a: '"Othello" is a registered trademark for a specific commercial edition of the game. The underlying rules are traditional and unencumbered, and Reversi is the original public-domain name, dating to the 1880s. So that is the name used here.',
        },
        {
          q: 'Is it bad to have more discs in the middle of the game?',
          a: 'Usually, yes. Holding fewer discs tends to mean you have more safe moves available and your opponent has fewer. Experienced players deliberately keep their disc count low until the last ten or so moves.',
        },
        {
          q: 'What happens if I have no legal move?',
          a: 'Your turn is skipped automatically and your opponent moves again. If neither side can move, the game ends there and the discs are counted, even if the board is not full.',
        },
        {
          q: 'Does the first player have an advantage?',
          a: 'Not a decisive one. With perfect play the game is a draw. Black’s first move is a small practical edge at club level, but far less than Black’s advantage in Gomoku.',
        },
        {
          q: 'How strong is the AI on this page?',
          a: 'The higher levels search several moves deep with a mobility- and stability-aware evaluation, and solve the final twelve to eighteen empty squares exactly. Level 4 will beat most casual players comfortably.',
        },
      ],
    },

    janggi: {
      name: 'Janggi',
      aka: 'Korean Chess · 장기 · 朝鮮將棋',
      tagline: 'Cannons that need a screen, generals locked in a palace, and elephants that leap.',
      blurb:
        'Korea’s national chess. Faster and sharper than its Chinese cousin, with no river, no blocked pieces at the start, and the option to simply pass.',
      metaTitle: 'Play Janggi (Korean Chess) Online Free vs AI — Rules, Pieces & Strategy',
      metaDescription:
        'Play Janggi, Korean chess, free against a computer opponent in your browser. Full rules including cannon screens, palace diagonals and bikjang, four difficulty levels, plus a complete strategy and history guide in English.',
      keywords: [
        'janggi online',
        'korean chess online',
        'play janggi free',
        'janggi rules english',
        'janggi vs computer',
        'korean chess strategy',
        '장기 온라인',
      ],
      rulesTitle: 'How to play Janggi (Korean chess)',
      rules: [
        'Janggi is played on the intersections of a board nine files wide and ten ranks deep. Each side has a General, two Guards, two Elephants, two Horses, two Chariots, two Cannons and five Soldiers. Cho (楚, green) moves first.',
        'The General and both Guards may never leave the 3×3 palace at their end of the board. They move one point at a time along the marked lines, including the palace diagonals.',
        'The Chariot (車) moves any distance in a straight line, like a rook, and may additionally slide along the palace diagonal lines.',
        'The Horse (馬) moves one point orthogonally then one point diagonally outward, and is blocked if the orthogonal step is occupied. The Elephant (象) moves one point orthogonally then two points diagonally outward, and is blocked at either of the first two squares of its path.',
        'The Cannon (包) must jump exactly one piece — the "screen" — to move or capture, and the screen may be either colour. A cannon may never jump over another cannon, and may never capture a cannon.',
        'Soldiers (卒/兵) move one point forward or sideways, never backward. Inside the enemy palace they may also use the diagonal lines when moving forward.',
        'A player may pass instead of moving. This is legal and sometimes correct — but you may not pass while in check.',
        'If the two Generals end up facing each other down an open file with nothing between them, the game is an immediate draw. This is called bikjang (빅장).',
        'You win by checkmating the enemy General. There is no stalemate, because passing is always available when you are not in check.',
      ],
      strategyTitle: 'Janggi strategy guide',
      strategy: [
        {
          h: 'Cannons are the sharpest pieces on the board',
          p: 'Because a cannon needs a screen, its power depends entirely on the arrangement of other pieces. Placing a cannon behind your own soldier gives it reach; removing the screen turns it off. Watch for enemy cannons lining up on your palace — a cannon on the central file with a screen is the most common source of sudden mate.',
        },
        {
          h: 'The palace is a trap as well as a shelter',
          p: 'Your General cannot run. Every attacking piece that reaches the palace diagonals is worth several times what it would be elsewhere. Keep both Guards home in the early game, and be very careful about opening the file in front of your General.',
        },
        {
          h: 'Chariots decide most games',
          p: 'The Chariot is worth roughly twice a Cannon and far more than a Horse. Trading a Chariot for anything less is almost always bad. Getting a Chariot onto an open file, especially one aimed at the enemy palace, is the standard plan.',
        },
        {
          h: 'Choose your opening setup deliberately',
          p: 'Before the game begins, each side may swap the positions of their Horses and Elephants. Elephants inside gives a solid, defensive structure; elephants outside frees the Horses to develop toward the centre quickly. Pick a setup that fits the game you want to play — and notice which one your opponent chose.',
        },
        {
          h: 'Remember that passing is a move',
          p: 'Players coming from international chess routinely forget this. In a locked position, passing can force the opponent to commit first, and in a lost endgame it can hold a draw. Bikjang is also a legitimate defensive resource when you are behind.',
        },
      ],
      historyTitle: 'The history of Janggi',
      history: [
        'Janggi and Chinese xiangqi share a common ancestor in the Indian game chaturanga, which travelled east along the Silk Road and reached the Korean peninsula roughly a thousand years ago. Korean records mention board games of this family from the Goryeo period onward, and the modern rule set had largely settled by the Joseon dynasty.',
        'The Korean game diverged from xiangqi in several decisive ways. Janggi has no river, so Elephants and Soldiers cross freely; the Generals sit inside the palace rather than on its back edge; Soldiers can move sideways from the very first move; and the Cannon rules are stricter, forbidding cannon-takes-cannon entirely. The result is a faster, more tactical game with fewer long manoeuvring phases.',
        'The two sides are marked 漢 (Han) and 楚 (Cho), naming the Chu–Han contention of the 3rd century BCE — the same historical conflict that gives xiangqi its 楚河漢界 river. Janggi remains widely played in Korea, in parks and community centres as much as in clubs, and has an active professional scene with televised matches.',
      ],
      faqTitle: 'Janggi FAQ',
      faq: [
        {
          q: 'How is Janggi different from Chinese chess (xiangqi)?',
          a: 'Janggi has no river, so Elephants and Soldiers can cross the whole board. Soldiers move sideways immediately rather than only after crossing. The General sits in the middle of the palace at the start. Cannons cannot capture other cannons. And passing is legal in Janggi but not in xiangqi.',
        },
        {
          q: 'Can I really just pass my turn?',
          a: 'Yes, as long as you are not in check. Passing is a normal part of Janggi strategy, particularly in blocked positions and endgames where whoever moves first loses ground.',
        },
        {
          q: 'What is bikjang?',
          a: 'Bikjang is the position where both Generals face each other along a file with no piece in between. Under standard modern rules the game is immediately drawn. It is a genuine defensive resource for the losing side.',
        },
        {
          q: 'Why can’t my cannon move at the start of the game?',
          a: 'A cannon must jump exactly one piece to move at all. If there is no screen in its line, it simply has no legal move in that direction. Cannons also can never jump over or capture another cannon.',
        },
        {
          q: 'What does choosing the opening setup do?',
          a: 'Each side may arrange their Horses and Elephants in one of four ways before play begins. Inner elephants is compact and defensive; outer elephants gives the Horses freer central development. Both are fully playable and the choice is a matter of style.',
        },
      ],
    },

    chess: {
      name: 'Chess',
      aka: 'Schach · 체스 · 国際チェス',
      tagline: 'The game everyone means when they say "chess" — with a real engine behind it.',
      blurb:
        'Full rules including castling, en passant and promotion, against an alpha-beta engine with quiescence search. Four levels, from beginner to genuinely annoying.',
      metaTitle: 'Play Chess Online Free vs Computer — Full Rules, Openings & Tactics Guide',
      metaDescription:
        'Play chess free against a computer opponent in your browser, with complete rules including castling, en passant, promotion, stalemate and threefold repetition. Four difficulty levels, no account, plus a beginner-friendly strategy guide.',
      keywords: [
        'play chess online free',
        'chess vs computer',
        'chess against ai',
        'chess rules',
        'chess strategy for beginners',
        'free chess no download',
      ],
      rulesTitle: 'How to play chess',
      rules: [
        'Chess is played on an 8×8 board of alternating light and dark squares. Each side starts with a king, a queen, two rooks, two bishops, two knights and eight pawns. White moves first.',
        'The rook moves any distance in straight lines; the bishop any distance diagonally; the queen combines both. The knight jumps in an L — two squares one way and one square perpendicular — and is the only piece that can leap over others.',
        'The king moves one square in any direction. Pawns move one square forward, or two from their starting rank, and capture one square diagonally forward.',
        'Castling moves the king two squares toward a rook and jumps that rook to the other side. It requires that neither piece has moved, the squares between are empty, and the king is not in check and does not pass through or land on an attacked square.',
        'En passant: if a pawn advances two squares and lands beside an enemy pawn, that pawn may capture it as if it had only moved one square — but only on the immediately following move.',
        'A pawn reaching the far rank promotes, usually to a queen, but a rook, bishop or knight may be chosen instead.',
        'You win by delivering checkmate: the enemy king is attacked and no legal move escapes. If a player has no legal move and is not in check, the game is a stalemate — a draw.',
        'Other draws: threefold repetition of the same position, fifty moves by each side with no capture and no pawn move, and insufficient material to mate.',
      ],
      strategyTitle: 'Chess strategy guide',
      strategy: [
        {
          h: 'Fight for the centre',
          p: 'Pieces control more squares from the middle of the board, and central pawns restrict where your opponent can put things. Openings like 1.e4 and 1.d4 exist because occupying and contesting e4, d4, e5 and d5 is worth real material over time.',
        },
        {
          h: 'Develop every piece before attacking',
          p: 'The most common beginner mistake is bringing the queen out early and chasing it around the board while the opponent develops with tempo. Knights and bishops first, castle your king to safety, connect your rooks — then look for targets.',
        },
        {
          h: 'Check every capture and check, every move',
          p: 'Before you play anything, scan for all captures, all checks and all threats — yours and theirs. Almost every game below 1500 is decided by a piece left hanging or a two-move tactic that neither side saw. This one habit is worth more than any opening you can memorise.',
        },
        {
          h: 'Know the rough value of the pieces',
          p: 'A pawn is 1, a knight and bishop about 3, a rook 5, a queen 9. The king is priceless. These are guidelines, not laws — two bishops working together are worth more than the sum of their parts, and a knight in a locked position can be worthless — but they will keep you from bad trades.',
        },
        {
          h: 'In the endgame, activate your king',
          p: 'Once the queens are gone, the king becomes a strong attacking piece. Marching it toward the centre and toward passed pawns is often the winning plan. Meanwhile, a passed pawn should be pushed, and rooks belong behind passed pawns — yours or your opponent’s.',
        },
      ],
      historyTitle: 'The history of chess',
      history: [
        'Chess grew out of chaturanga, a four-player Indian war game of roughly the 6th century, which became shatranj in Persia and travelled to Europe through the Islamic world. The medieval European version was slow: the queen moved one square diagonally and the bishop jumped exactly two.',
        'The modern game appeared in Spain and Italy at the end of the 15th century, when the queen and bishop gained their long-range moves. The change was so dramatic that the new game was called "mad queen chess". Castling, en passant and the rest of the modern rules settled over the following two centuries, and the first official World Championship was held in 1886.',
        'Chess has been the central proving ground of artificial intelligence since Claude Shannon’s 1950 paper on programming a computer to play it. Deep Blue beat Garry Kasparov in 1997 using exactly the kind of alpha-beta search this page uses, only vastly faster; AlphaZero in 2017 showed that self-play reinforcement learning could surpass it. The engine here is deliberately modest by comparison — it is meant to be beatable.',
      ],
      faqTitle: 'Chess FAQ',
      faq: [
        {
          q: 'Is this a strong chess engine?',
          a: 'It is an honest one, not a strong one. It runs alpha-beta search with quiescence and piece-square evaluation entirely in your browser, reaching a few plies deep within a fixed time budget. Level 4 will beat a casual player; it will not trouble a rated club player.',
        },
        {
          q: 'Can I castle and capture en passant here?',
          a: 'Yes. All standard rules are implemented, including both castlings with their full legality conditions, en passant, underpromotion to rook, bishop or knight, stalemate, threefold repetition, the fifty-move rule and insufficient material.',
        },
        {
          q: 'What is the best first move in chess?',
          a: '1.e4 and 1.d4 are the two most popular, and neither is objectively better. 1.e4 tends to lead to open, tactical games; 1.d4 to slower positional ones. At club level the opening matters far less than not hanging pieces.',
        },
        {
          q: 'Why did the game end in a draw when I was clearly winning?',
          a: 'Most likely stalemate — if your opponent has no legal move and is not in check, the game is drawn regardless of material. Threefold repetition and the fifty-move rule can also end a won position. Keep an escape square available for the enemy king when you are mating.',
        },
        {
          q: 'How do I improve fastest as a beginner?',
          a: 'Play slowly enough to check every check, capture and threat before moving; study basic checkmates and simple endgames; and review your losses to find the exact move where things went wrong. Openings are the least valuable thing to study first.',
        },
      ],
    },

    shogi: {
      name: 'Shogi',
      aka: 'Japanese Chess · 将棋 · 쇼기',
      tagline: 'Captured pieces change sides. Nothing is ever really off the board.',
      blurb:
        'Japanese chess, where every piece you capture can be dropped back into play as your own. Draws are almost unheard of, and endgames are pure attacking races.',
      metaTitle: 'Play Shogi Online Free vs AI — Rules, Drops, Promotion & Strategy in English',
      metaDescription:
        'Play shogi (Japanese chess) free against a computer opponent in your browser. Full rules including drops, promotion, nifu and uchifuzume, four difficulty levels, and a complete English guide to shogi strategy and castles.',
      keywords: [
        'shogi online',
        'play shogi free',
        'japanese chess online',
        'shogi rules english',
        'shogi vs computer',
        'shogi drops',
        '将棋 オンライン',
      ],
      rulesTitle: 'How to play shogi',
      rules: [
        'Shogi is played on a 9×9 board. Each side has a king, a rook, a bishop, two golds, two silvers, two knights, two lances and nine pawns. Sente (black) moves first.',
        'The gold general moves one square in any direction except the two backward diagonals. The silver general moves one square diagonally in any direction or one square straight forward. The lance slides any distance straight forward only. The knight jumps two forward and one sideways — forward only, and it may leap over pieces. Pawns move and capture one square straight forward.',
        'Rook and bishop move as in international chess. The king moves one square in any direction.',
        'Any piece you capture goes into your hand. On any turn, instead of moving, you may drop a piece from your hand onto any empty square, where it becomes yours and faces your opponent.',
        'Drop restrictions: a pawn or lance may not be dropped on the last rank, a knight may not be dropped on the last two ranks, you may not drop a pawn on a file where you already have an unpromoted pawn (nifu), and you may not deliver immediate checkmate with a dropped pawn (uchifuzume).',
        'The last three ranks on the opponent’s side are the promotion zone. A piece that moves into, out of, or entirely within the zone may promote. Promotion is compulsory if the piece would otherwise have no legal move.',
        'Promoted rook and bishop gain king-style steps in the directions they lack. Every other promotable piece — pawn, lance, knight, silver — simply becomes a gold general. Gold generals and kings never promote.',
        'A piece dropped from hand always enters unpromoted, even into the promotion zone.',
        'You win by checkmate. Fourfold repetition of the same position with the same side to move is a draw (sennichite).',
      ],
      strategyTitle: 'Shogi strategy guide',
      strategy: [
        {
          h: 'Build a castle before you attack',
          p: 'Shogi kings are fragile because the attacker can drop pieces next to them. Standard formations — Yagura, Mino, Anaguma — surround the king with golds and silvers before any assault begins. A player who attacks first with a bare king almost always loses the counterattack.',
        },
        {
          h: 'Material in hand beats material on the board',
          p: 'A rook in hand can be dropped anywhere; a rook on the board must travel. Because of this, trading pieces is not neutral in shogi — it is a way of loading your hand for an attack. Count what your opponent holds before you initiate an exchange.',
        },
        {
          h: 'Golds and silvers are the real workhorses',
          p: 'Beginners from international chess undervalue the generals because they move slowly. In shogi they are the backbone of both castles and attacks. Silvers are better attackers, golds better defenders, and a gold in hand is one of the most valuable things you can own.',
        },
        {
          h: 'The game is a race, so count tempo',
          p: 'Because captured pieces come back, positions rarely simplify into quiet endgames. Once both sides commit, it usually becomes a direct race to mate. Learn to count how many moves each attack needs — being one move faster is the whole game.',
        },
        {
          h: 'Promote the pawn, not the piece',
          p: 'A promoted pawn (tokin) is a gold general that cost you a pawn, and if your opponent captures it they only get a pawn back. Building tokin near the enemy castle is one of the most efficient attacking plans in shogi.',
        },
      ],
      historyTitle: 'The history of shogi',
      history: [
        'Shogi reached Japan from China or Korea by the Heian period, descending like chess and janggi from Indian chaturanga. Early Japanese versions were larger and slower — dai shogi used a 15×15 board, and chu shogi with its 12×12 board and lion piece was still widely played into the 20th century.',
        'The defining innovation, the drop rule, appeared around the 16th century, and it changed the game completely: material never leaves the board, so positions do not simplify and draws become vanishingly rare. Roughly one professional game in a hundred is drawn, compared to well over half in top-level chess.',
        'Shogi became a state-supported art under the Tokugawa shogunate, with hereditary schools and an official title of Meijin. The modern professional system, run by the Japan Shogi Association, awards eight major titles and supports a serious full-time profession. Computer shogi lagged chess by roughly fifteen years — precisely because drops make the branching factor enormous — but programs finally overtook top human players in the 2010s.',
      ],
      faqTitle: 'Shogi FAQ',
      faq: [
        {
          q: 'What makes shogi different from chess?',
          a: 'The drop rule. Pieces you capture join your hand and can be placed back on the board as your own. Material never disappears, so there are almost no drawn endgames and the game is a constant attacking race. The board is also 9×9 and most pieces move much more slowly than their chess counterparts.',
        },
        {
          q: 'What is nifu?',
          a: 'Nifu is the rule that you may not drop a pawn onto a file where you already have an unpromoted pawn. A promoted pawn does not count, so you can have two pawns on a file if one of them is a tokin.',
        },
        {
          q: 'What is uchifuzume?',
          a: 'You may not win by dropping a pawn that delivers immediate checkmate. Moving a pawn to give mate is fine, and dropping a pawn to give ordinary check is fine — only the drop-mate is forbidden.',
        },
        {
          q: 'When must I promote?',
          a: 'Promotion is optional whenever a move starts or ends in the last three ranks, except that it becomes compulsory when the piece would otherwise have no legal move — a pawn or lance on the last rank, or a knight on the last two ranks.',
        },
        {
          q: 'Can I read the pieces if I don’t know kanji?',
          a: 'Each piece shows its standard kanji, and promoted pieces are marked in red. There are only eight symbols to learn, and the shape of the pentagon tells you which way each piece is facing — the point aims at the opponent.',
        },
      ],
    },

    go: {
      name: 'Go',
      aka: 'Baduk 바둑 · 囲碁 · 圍棋',
      tagline: 'Surround territory. The simplest rules in this hub, and by far the deepest game.',
      blurb:
        'Two rules — stones need liberties, and you cannot repeat the position — produce a game that resisted computers for fifty years. Play 9×9, 13×13 or 19×19.',
      metaTitle: 'Play Go Online Free vs AI — 9×9, 13×13 & 19×19 with Rules and Strategy',
      metaDescription:
        'Play Go (baduk, weiqi, igo) free against a Monte-Carlo tree search AI in your browser. Choose 9×9, 13×13 or 19×19, four difficulty levels, automatic dead-stone scoring, plus a complete guide to the rules and strategy.',
      keywords: [
        'play go online free',
        'go game 9x9',
        'baduk online',
        'weiqi online',
        'igo online',
        'go rules for beginners',
        'go vs computer',
      ],
      rulesTitle: 'How to play Go',
      rules: [
        'Go is played on the intersections of a grid — traditionally 19×19, with 13×13 and 9×9 used for shorter games. Black plays first, and players alternate placing one stone on any empty intersection.',
        'Stones never move once played. A group is a set of stones of the same colour connected along the lines, and its liberties are the empty intersections directly adjacent to it.',
        'When a group has no liberties left, it is captured and removed from the board. Captures happen immediately after the opponent’s stone is placed.',
        'You may not play a stone that would leave your own group with no liberties — unless that same move captures enemy stones and thereby creates a liberty. This is the suicide rule.',
        'The ko rule forbids a move that would recreate the position immediately before your opponent’s last move. You must play elsewhere first; that intervening move is called a ko threat.',
        'Either player may pass instead of playing. When both players pass in succession, the game ends.',
        'The winner is decided by area: your score is the number of intersections you occupy plus the empty intersections that only you surround. White receives komi — a compensation of 6.5 points here — for moving second, which also prevents draws.',
        'Stones that cannot avoid capture are called dead and count as territory for the opponent even if they are still sitting on the board. This site resolves dead stones automatically by simulating the position to the end hundreds of times.',
      ],
      strategyTitle: 'Go strategy guide',
      strategy: [
        {
          h: 'Corners first, then sides, then centre',
          p: 'Surrounding territory in a corner takes the fewest stones, because two edges do the work for you. The centre is the most expensive place on the board to make territory. Standard openings occupy corners, extend along sides, and only fight for the middle later.',
        },
        {
          h: 'Two eyes means alive',
          p: 'A group with two separate internal empty points can never be captured, because your opponent would have to fill both and the first fill is suicide. Every life-and-death problem in Go reduces to whether a group can make two eyes. Learn to see this before you learn anything else.',
        },
        {
          h: 'Do not answer every move',
          p: 'The biggest jump in strength for most beginners comes from asking "is there something larger elsewhere?" before responding locally. A move that saves three stones while your opponent takes a twenty-point corner is a losing exchange, however satisfying it feels.',
        },
        {
          h: 'Stay connected, keep them separated',
          p: 'Connected stones share liberties and are far harder to kill; separated groups each need their own eyes. Most fighting in Go is really an argument about connection. If you can cut your opponent into two weak groups, you will usually profit from attacking both.',
        },
        {
          h: 'Play the 9×9 board to learn faster',
          p: 'A full 19×19 game takes 250 moves and hides your mistakes in the noise. On 9×9, every move matters immediately and a game takes ten minutes, so the feedback loop is far tighter. The AI here is also strongest on 9×9, which makes it the best board to train against.',
        },
      ],
      historyTitle: 'The history of Go',
      history: [
        'Go originated in China at least 2,500 years ago — it is mentioned in the Analects of Confucius — making it the oldest board game still played in essentially its original form. It reached Korea and then Japan by the 7th century, and each culture developed its own name and tradition: weiqi (圍棋) in China, baduk (바둑) in Korea, igo (囲碁) in Japan.',
        'Japan formalised professional Go under the Tokugawa shogunate, establishing four hereditary houses that competed for the title of Meijin and produced centuries of recorded games. The 20th century saw the centre of gravity move to Korea and then back to China, and today the strongest professionals come from all three countries.',
        'Go was the last classical board game to fall to computers. Its branching factor and the difficulty of evaluating a position defeated alpha-beta search entirely; the breakthrough came from Monte-Carlo tree search in the mid-2000s, which made competitive 9×9 programs possible, and then from AlphaGo’s defeat of Lee Sedol in 2016. The engine on this page uses the earlier approach — MCTS with random playouts, no neural network — which is why it plays best on the smaller boards.',
      ],
      faqTitle: 'Go FAQ',
      faq: [
        {
          q: 'Should I start on 9×9 or 19×19?',
          a: '9×9, without question. The rules are identical, a game takes ten minutes instead of two hours, and every move has visible consequences. Move up to 13×13 once capturing races and eye shape feel natural.',
        },
        {
          q: 'What is komi and why is it 6.5?',
          a: 'Komi is a point compensation given to White for playing second. The half point guarantees there can be no draw. 6.5 is a common value for smaller boards; 19×19 tournaments typically use 6.5 or 7.5 depending on the rule set.',
        },
        {
          q: 'How does scoring work on this site?',
          a: 'Chinese area scoring: your score is your stones on the board plus the empty points only you surround, and White adds komi. Rather than asking you to mark dead stones, the site plays the finished position out hundreds of times and lets the statistics decide what was alive.',
        },
        {
          q: 'Why can’t I play in that one spot?',
          a: 'Two possible reasons. Either the move would be suicide — your stone would have no liberties and captures nothing — or it is forbidden by the ko rule, which stops you from immediately recapturing and repeating the position. Play a ko threat elsewhere first.',
        },
        {
          q: 'How strong is the Go AI here?',
          a: 'It uses Monte-Carlo tree search with random playouts, entirely in your browser and without a neural network. On 9×9 at the highest level it is a reasonable mid-kyu opponent. On 19×19 it is much weaker, because the number of positions to sample grows far faster than the time available.',
        },
      ],
    },

    baghchal: {
      name: 'Bagh-Chal',
      aka: 'Goats & Tigers · बाघचाल',
      tagline: 'Four tigers hunt twenty goats on a 25-point board. Herd them into a corner, or lose one goat too many.',
      blurb:
        'An asymmetric hunt game from Nepal: goats try to trap every tiger, tigers try to jump-capture five goats first. Nothing here is fair by design — that is the entire point.',
      metaTitle: 'Play Bagh-Chal (Goats & Tigers) Online Free vs AI — Rules & Strategy',
      metaDescription:
        'Play Bagh-Chal, the Nepali tiger-and-goat hunt game, free against a computer opponent in your browser. Full rules for both sides, four difficulty levels, and a complete strategy and history guide.',
      keywords: [
        'bagh chal online',
        'play bagh chal free',
        'goats and tigers game',
        'bagh chal rules',
        'tiger and goat game online',
        'nepali board game',
        'bagh chal strategy',
      ],
      rulesTitle: 'How to play Bagh-Chal',
      rules: [
        'Bagh-Chal is played on a 5×5 grid of 25 points, connected by straight lines — some orthogonal, some diagonal — the same board pattern as the older Alquerque. Pieces sit on points and move along the drawn lines only.',
        'Four tigers start on the four corners of the board. The rest of the board is empty. The goat side has 20 goats, but none of them start on the board.',
        'The goat side moves first. While any goats remain unplaced, a goat turn consists of placing one goat on any empty point instead of moving.',
        'Tigers move from the very first turn: one step along a line to an empty adjacent point, or a jump straight over one adjacent goat to the empty point immediately beyond it, which captures that goat. Capturing is never compulsory, and a tiger may only capture one goat per move — there is no chain-jumping.',
        'Once all 20 goats have been placed, the goat side stops placing and starts moving: one step along a line to an empty adjacent point, the same as a tiger’s ordinary step.',
        'Tigers win the moment they have captured five goats.',
        'Goats win the moment every tiger is simultaneously unable to move or capture — four tigers fully fenced in, wherever that happens to occur on the board.',
        'If the same position with the same side to move recurs three times, the game is a draw.',
      ],
      strategyTitle: 'Bagh-Chal strategy guide',
      strategy: [
        {
          h: 'Goats: never leave a piece jumpable',
          p: 'A tiger captures by jumping a goat into an empty point directly beyond it. Before placing or moving a goat, check every line through it: if a tiger sits on one side and the point on the other side is empty, that goat is already lost. Early goats are cheap to lose and expensive to spare — guard the landing squares, not just the goats.',
        },
        {
          h: 'Goats: build a wall, don’t scatter',
          p: 'Goats that stand next to each other support one another, because a supported goat has no empty landing square behind it in that direction. Isolated goats in the open are the tiger’s easiest targets. Aim to advance as a connected front rather than filling random points.',
        },
        {
          h: 'Tigers: spread out before the goats coordinate',
          p: 'In the first several moves, goats are placed one at a time and cannot yet support each other. This is the tiger’s only real window of superior mobility — use it to threaten multiple jump lines at once and force an early capture before the goat wall forms.',
        },
        {
          h: 'Tigers: a threatened capture is often worth more than a taken one',
          p: 'Jumping a goat immediately can walk a tiger into a corner where the goats then fence it in. Sometimes the stronger move is to sit on a square that threatens two different captures, forcing the goat side to give up material or mobility either way.',
        },
        {
          h: 'Both sides: count moves, not just position',
          p: 'A tiger fully out of moves loses instantly, even mid-board — goats do not need to corral all four tigers into a literal corner, just deny every one of them a step or a jump at the same time. Goats should track each tiger’s remaining escape squares like a countdown; tigers should always keep at least one open line free.',
        },
      ],
      historyTitle: 'The history of Bagh-Chal',
      history: [
        'Bagh-Chal — "moving tigers" in Nepali — is the best-known member of a whole family of hunt games found across South and Southeast Asia, in which two sides with genuinely different pieces, different numbers, and different win conditions face off on the same board. Relatives include Aadu Puli Aattam in Tamil Nadu, Rimau-rimau in Malaysia, and Catch the Tiger in Sri Lanka, all built on the same predator-versus-herd idea.',
        'The board itself is older than the game: it is the same 5×5 lined grid used for Alquerque, a piece-jumping game recorded in the Middle East over a thousand years ago and generally considered an ancestor of draughts (checkers). Bagh-Chal repurposes that board for an asymmetric hunt rather than a symmetric capturing race, which is what makes it stand apart from every other game on this site — chess, janggi, shogi and xiangqi all descend from the symmetric Indian war game chaturanga, while Bagh-Chal belongs to this separate, much older lineage of uneven hunt games.',
        'The game remains a genuinely popular pastime in Nepal today, traditionally played with goat pellets and pieces of stone or seed on a board scratched into wood, stone or the ground itself — no special equipment required, which is much of why it survived so well outside of formal publishing.',
      ],
      faqTitle: 'Bagh-Chal FAQ',
      faq: [
        {
          q: 'Is Bagh-Chal fair — do tigers or goats have the advantage?',
          a: 'The two sides are built entirely differently, so "fair" is not really the goal. With careful play the goat side is generally considered to have at least an even game and arguably the edge, since a coordinated wall of goats is very hard for four tigers to break without early captures. Weak goat play, on the other hand, loses fast.',
        },
        {
          q: 'Can a tiger jump more than one goat in a single turn?',
          a: 'No. A tiger move is either one step or exactly one jump-capture. Unlike draughts, there is no rule allowing a tiger to chain several jumps together in one turn.',
        },
        {
          q: 'Is a tiger forced to capture when it can?',
          a: 'No, capturing is always optional. A tiger can choose a quiet step instead of an available jump — sometimes the right choice, since jumping can walk a tiger into a position the goats can fence in.',
        },
        {
          q: 'What happens if the goat side has no legal move?',
          a: 'The tigers win immediately. This can only happen after all 20 goats are placed and every goat on the board happens to be boxed in, which is rare but does end the game rather than stalling it.',
        },
        {
          q: 'Why did my game end in a draw?',
          a: 'Threefold repetition: if the exact same position, with the same side to move, occurs three times, the game is drawn. This mostly shows up in long movement-phase manoeuvring where neither side wants to commit.',
        },
      ],
    },
  },
};
