import type { GameId } from '../games/types';
import type { Locale } from './config';
import type { StrategyItem } from './types';

/**
 * Long-form improvement advice shown under each game's strategy section:
 * the mistakes beginners make most and a concrete way to practise against
 * the built-in AI. Kept apart from the dictionaries so it can grow freely.
 */
export const LEARN_TITLE: Record<Locale, string> = {
  en: 'Common mistakes and how to improve',
  ko: '자주 하는 실수와 실력 향상 방법',
  ja: 'よくあるミスと上達のコツ',
  zh: '常見錯誤與進步方法',
};

type Learn = Record<GameId, StrategyItem[]>;

const en: Learn = {
  gomoku: [
    { h: 'Only attacking in one direction', p: 'Beginners build a long line and forget that a single open four can be blocked from one side. Strong players spread stones so that one move creates two threats at once — an open three plus another open three, or a four plus an open three. Before each move, ask which of your stones can share a future intersection.' },
    { h: 'Ignoring the opponent’s open threes', p: 'An open three (three in a row with both ends free) must be answered immediately, because it becomes an unstoppable open four next turn. Make a habit of scanning every line through the opponent’s last stone before you look at your own plans.' },
    { h: 'How to practise', p: 'Start on level 1 and win by building double threats rather than a single long line. Once that is easy, move up a level and try to win as the second player, who has to defend accurately for the first ten moves.' },
  ],
  reversi: [
    { h: 'Grabbing too many discs early', p: 'Having the most discs mid-game is usually a sign you are losing. Every disc you flip opens new moves for your opponent. Aim for fewer discs and more mobility: keep options available while your opponent runs out of safe moves.' },
    { h: 'Giving away corners', p: 'The squares diagonally next to a corner (the X-squares) are the most common beginner blunder, because they let the opponent take the corner. Corners can never be flipped, so a single corner often anchors a whole edge.' },
    { h: 'How to practise', p: 'Play a game where your only goal is to never take an X-square or C-square unless forced. Then review the final board: you should see how your safe moves left the AI to break its own structure.' },
  ],
  janggi: [
    { h: 'Trading pieces without a plan', p: 'Because the palace limits the general, material matters more than in chess, but careless trades also weaken your guard. Before capturing, check whether the recapture opens a diagonal line into your palace.' },
    { h: 'Forgetting the blocked horse and elephant', p: 'A horse or elephant can be stopped by a single piece on its first step. Beginners plan attacks that the opponent’s adjacent piece quietly cancels. Use the red markers on the board until you see these blocks without help.' },
    { h: 'How to practise', p: 'Play the same opening setup several games in a row. Learning how the cannon uses a screen and how the chariot controls files is faster when the starting position stays the same.' },
  ],
  chess: [
    { h: 'Moving the same piece repeatedly in the opening', p: 'Develop each knight and bishop once, castle early and connect your rooks. Spending several moves on a single piece, or bringing the queen out early, gives the opponent free tempi to attack.' },
    { h: 'Leaving pieces undefended', p: 'Most games below club level are decided by a piece hanging for one move. Before every move, check what the opponent’s last move attacks and whether your intended move leaves anything unprotected.' },
    { h: 'How to practise', p: 'Use the mate-in-one and mate-in-two puzzles to train pattern recognition, then play level 2 and try to finish each game without losing a piece for nothing.' },
  ],
  shogi: [
    { h: 'Forgetting that captured pieces come back', p: 'In shogi a captured piece can be dropped back on any empty square, so a position that looks safe can collapse after one drop. Always ask what the opponent could drop next, especially a rook or bishop.' },
    { h: 'Neglecting king safety', p: 'Beginners rush to attack and leave the king in the open. Build a castle first — even the simple Mino or Yagura formation — then begin the attack with pieces in hand.' },
    { h: 'How to practise', p: 'Solve the tsume (mate) puzzles on this site; recognising drop checks is the fastest way to improve and it pays off in every game.' },
  ],
  go: [
    { h: 'Playing too close to the opponent', p: 'Beginners pile stones against the opponent’s stones and end up with thin, weak groups. Strong players claim open space first, in the corners, then along the sides, and only fight where their stones are already strong.' },
    { h: 'Not counting liberties', p: 'Most lost stones are lost because the player did not count liberties in a fight. In every local battle, count your liberties and the opponent’s before you play.' },
    { h: 'How to practise', p: 'Start on the 9×9 board at level 1. Aim to make two eyes with every group you care about, and let the scoring note show you how territory actually decides the game.' },
  ],
  baghchal: [
    { h: 'Playing goats too early to the edge', p: 'Goats on the edge are hard to capture, but placing all of them there too early leaves the centre to the tigers. Place goats in connected chains so each one is protected from a jump by the stone behind it.' },
    { h: 'Letting tigers get trapped one by one', p: 'As the tigers, keep them spread out and near the centre. A tiger in a corner with no free move is already half lost, and blocking all four tigers is how the goats win.' },
    { h: 'How to practise', p: 'Play as the goats first and try to win without sacrificing a single goat. Then switch sides to see how tigers punish a loose goat chain.' },
  ],
  xiangqi: [
    { h: 'Moving the chariot out too slowly', p: 'The chariot is the strongest piece, and the player who activates both chariots first usually controls the game. Open files and bring a chariot out within the first few moves.' },
    { h: 'Forgetting the flying-general rule', p: 'The two generals may never face each other on an open file. Beginners miss tactics that rely on this, both as an attack and as a way an innocent move turns out to be illegal.' },
    { h: 'How to practise', p: 'Learn how the cannon needs exactly one screen to capture, and practise attacking with a chariot and cannon together against a defended palace.' },
  ],
  oware: [
    { h: 'Counting only your own side', p: 'Beginners sow seeds without counting where the last seed will land. Count each sowing to its end, including how it affects the opponent’s houses, and remember that two- and three-seed houses are capture targets.' },
    { h: 'Running out of moves', p: 'If your side empties, you lose seeds to the opponent. Keep a reserve of seeds in the houses nearest your store so you always have a move, and force the opponent to feed you.' },
    { h: 'How to practise', p: 'Play a few games trying only to set up a chain capture, then go back to playing for the long game of keeping more seeds in reserve.' },
  ],
};

const ko: Learn = {
  gomoku: [
    { h: '한쪽 방향으로만 공격하기', p: '초보자는 긴 줄을 만들다가 한쪽만 막히면 끝나는 것을 잊습니다. 고수는 한 수로 두 개의 위협을 만들어, 열린 삼과 열린 삼, 또는 사와 열린 삼을 동시에 노립니다. 둘 때마다 내 돌들이 앞으로 같은 교차점을 공유할 수 있는지 살펴보세요.' },
    { h: '상대의 열린 삼을 놓치기', p: '양쪽이 열린 삼은 다음 수에 막을 수 없는 열린 사가 되므로 즉시 막아야 합니다. 내 계획을 세우기 전에 상대가 마지막으로 둔 돌을 지나는 모든 줄을 먼저 확인하는 습관을 들이세요.' },
    { h: '연습 방법', p: '난이도 1에서 긴 줄 대신 이중 위협으로 이기는 연습을 하세요. 익숙해지면 난이도를 올리고, 처음 열 수를 정확히 막아야 하는 후수로 이겨 보세요.' },
  ],
  reversi: [
    { h: '초반에 돌을 너무 많이 먹기', p: '중반에 돌이 가장 많다면 오히려 지고 있다는 신호인 경우가 많습니다. 돌을 뒤집을수록 상대의 착수 가능 위치가 늘어납니다. 돌 수보다 착수 가능한 곳의 수(모빌리티)를 늘리고, 상대가 둘 곳이 없어지게 만드세요.' },
    { h: '모서리를 내주기', p: '모서리 대각선 옆 칸(X칸)은 초보자가 가장 자주 하는 실수로, 상대에게 모서리를 내주게 됩니다. 모서리 돌은 뒤집히지 않아서 한 개의 모서리가 변 전체를 지탱하기도 합니다.' },
    { h: '연습 방법', p: '강제로 두는 경우가 아니면 X칸과 C칸에 두지 않는 것만 목표로 한 판을 두어 보세요. 대국 후 AI가 스스로 구조를 무너뜨리는 과정을 볼 수 있을 겁니다.' },
  ],
  janggi: [
    { h: '계획 없이 기물 교환하기', p: '궁성 때문에 장기에서는 체스보다 기물 가치가 중요하지만, 무심코 교환하면 수비도 약해집니다. 잡기 전에 되잡혔을 때 궁성으로 이어지는 대각선이 열리지 않는지 확인하세요.' },
    { h: '마와 상이 막히는 것 잊기', p: '마와 상은 첫 걸음에 기물이 하나만 있어도 움직일 수 없습니다(멱). 초보자는 상대의 인접한 기물 하나가 공격을 조용히 무력화하는 것을 놓칩니다. 막힌 곳이 눈에 익을 때까지 대국판의 빨간 표시를 활용하세요.' },
    { h: '연습 방법', p: '같은 상차림으로 여러 판을 연속해서 두어 보세요. 포가 받침을 쓰는 방식과 차가 줄을 지배하는 방식은 시작 배치가 같을 때 훨씬 빨리 익힙니다.' },
  ],
  chess: [
    { h: '오프닝에서 같은 기물만 움직이기', p: '나이트와 비숍은 한 번씩 전개하고, 일찍 캐슬링해서 룩을 연결하세요. 한 기물에 여러 수를 쓰거나 퀸을 일찍 꺼내면 상대에게 공격할 템포를 공짜로 줍니다.' },
    { h: '기물을 지키지 않고 두기', p: '클럽 수준 아래의 대국은 대부분 기물 하나를 공짜로 내주는 한 수로 갈립니다. 두기 전에 상대의 직전 수가 무엇을 노리는지, 내 수가 무방비 기물을 남기지 않는지 확인하세요.' },
    { h: '연습 방법', p: '1수·2수 메이트 퍼즐로 패턴 인식을 훈련한 뒤, 난이도 2에서 기물을 공짜로 잃지 않고 끝까지 두는 것을 목표로 해 보세요.' },
  ],
  shogi: [
    { h: '잡은 기물이 되돌아온다는 점 잊기', p: '쇼기에서는 잡은 기물을 빈 칸 어디에나 다시 둘 수 있어서, 안전해 보이던 형태가 한 번의 기물 놓기로 무너집니다. 특히 비차나 각행을 상대가 어디에 둘 수 있는지 항상 살피세요.' },
    { h: '왕의 안전 소홀히 하기', p: '초보자는 공격을 서두르다 왕을 노출시킵니다. 미노나 야구라 같은 간단한 성(囲い)을 먼저 짓고, 가진 기물로 공격을 시작하세요.' },
    { h: '연습 방법', p: '이 사이트의 쓰메쇼기(외통수) 퍼즐을 풀어 보세요. 기물 놓기 장기를 알아보는 눈이 가장 빠른 실력 향상이며 모든 대국에 도움이 됩니다.' },
  ],
  go: [
    { h: '상대에게 너무 바짝 붙여 두기', p: '초보자는 상대 돌에 붙여 두다가 얇고 약한 모양이 됩니다. 고수는 먼저 귀, 그다음 변의 넓은 곳을 차지하고, 이미 내 돌이 강한 곳에서만 싸웁니다.' },
    { h: '공배를 세지 않기', p: '돌을 잃는 대부분의 이유는 전투에서 공배 수를 세지 않았기 때문입니다. 국지전이 벌어지면 둘 곳을 정하기 전에 내 공배와 상대 공배를 세어 보세요.' },
    { h: '연습 방법', p: '9×9 판에서 난이도 1로 시작하세요. 중요한 돌 무리마다 두 집을 만드는 것을 목표로 하고, 계가 안내를 통해 집이 승부를 어떻게 결정하는지 확인하세요.' },
  ],
  baghchal: [
    { h: '염소를 너무 일찍 가장자리에 두기', p: '가장자리의 염소는 잡기 어렵지만, 너무 일찍 모두 거기에 두면 중앙을 호랑이에게 내줍니다. 염소는 뒤의 돌이 뛰어넘기를 막도록 서로 이어서 두세요.' },
    { h: '호랑이가 하나씩 갇히기', p: '호랑이는 흩어져서 중앙 가까이에 두세요. 모서리에서 움직일 곳이 없는 호랑이는 이미 반쯤 진 것이고, 네 마리 모두를 막는 것이 염소의 승리 방법입니다.' },
    { h: '연습 방법', p: '먼저 염소를 맡아 한 마리도 잃지 않고 이겨 보세요. 그다음 진영을 바꿔 호랑이가 느슨한 염소 줄을 어떻게 벌하는지 확인하세요.' },
  ],
  xiangqi: [
    { h: '차를 너무 늦게 내기', p: '차는 가장 강한 기물이며, 두 차를 먼저 활성화한 쪽이 대개 주도권을 쥡니다. 첫 몇 수 안에 줄을 열고 차를 내보내세요.' },
    { h: '장군끼리 마주 보면 안 된다는 규칙 잊기', p: '두 장군은 열린 줄에서 마주 볼 수 없습니다. 초보자는 이 규칙을 이용한 전술을 놓치거나, 평범해 보이는 수가 사실 불법이라는 것을 모릅니다.' },
    { h: '연습 방법', p: '포가 잡으려면 받침이 정확히 하나 필요하다는 점을 익히고, 차와 포를 함께 써서 방어된 궁을 공격하는 연습을 하세요.' },
  ],
  oware: [
    { h: '내 쪽만 세기', p: '초보자는 마지막 씨앗이 어디에 떨어질지 세지 않고 뿌립니다. 상대 구덩이에 미치는 영향까지 끝까지 세어 보고, 씨앗이 2~3개인 구덩이가 잡기 대상임을 기억하세요.' },
    { h: '둘 곳이 없어지기', p: '내 쪽이 비면 상대에게 씨앗을 빼앗깁니다. 내 창고에 가까운 구덩이에 예비 씨앗을 남겨 항상 둘 곳을 확보하고, 상대가 내게 씨앗을 주게 만드세요.' },
    { h: '연습 방법', p: '연쇄 잡기를 만드는 것만 노려 몇 판 두어 본 뒤, 씨앗을 더 많이 비축하는 장기전으로 돌아가 보세요.' },
  ],
};

const ja: Learn = {
  gomoku: [
    { h: '一方向だけで攻めてしまう', p: '初心者は長い列を作ることに集中し、片側を止められると終わることを忘れがちです。上級者は一手で二つの脅威を作り、三三や四三を狙います。打つたびに、自分の石が将来同じ交点を共有できるか確認しましょう。' },
    { h: '相手の活三を見逃す', p: '両端が空いた三（活三）は、次の手で止められない四になるため直ちに対応が必要です。自分の計画を考える前に、相手の最後の石を通るすべての列を確認する習慣をつけましょう。' },
    { h: '練習方法', p: 'レベル1で、長い列ではなくダブルの脅威で勝つ練習をしましょう。慣れたらレベルを上げ、最初の十手を正確に受ける後手で勝ってみてください。' },
  ],
  reversi: [
    { h: '序盤で石を取りすぎる', p: '中盤で石が最も多いのは、むしろ負けている兆候であることが多いです。石を返すほど相手の打てる場所が増えます。石数より着手可能数（モビリティ）を重視し、相手の打てる手を減らしましょう。' },
    { h: '隅を献上する', p: '隅の斜め隣（X打ち）は初心者が最もよくやるミスで、相手に隅を取らせてしまいます。隅の石は返されないため、一つの隅が辺全体を支えることもあります。' },
    { h: '練習方法', p: '強制されない限りXやCに打たないことだけを目標に一局打ってみてください。終局後、AIが自ら形を崩していく様子が見えるはずです。' },
  ],
  janggi: [
    { h: '計画なしに駒を交換する', p: '宮の制約により、チェスより駒の価値が重要ですが、無造作な交換は守りも弱めます。取る前に、取り返された後で宮に通じる斜めの線が開かないか確認しましょう。' },
    { h: '馬と象の足止めを忘れる', p: '馬や象は最初の一歩に駒が一つあるだけで動けません。初心者は、隣接する相手の駒が静かに攻撃を無効にしていることを見落とします。足止めが見えるようになるまで、盤上の赤い印を活用しましょう。' },
    { h: '練習方法', p: '同じ初期配置で何局か続けて打ちましょう。砲が台を使う仕組みや、車が筋を支配する感覚は、開始局面が同じほうが早く身につきます。' },
  ],
  chess: [
    { h: '序盤で同じ駒ばかり動かす', p: 'ナイトとビショップは一度ずつ展開し、早めにキャスリングしてルークをつなげましょう。一つの駒に何手も使ったり、クイーンを早く出したりすると、相手に攻撃の手番を与えてしまいます。' },
    { h: '駒を守らずに指す', p: 'クラブ以下の対局の多くは、駒を一手でタダ取りされることで決まります。指す前に、相手の直前の手が何を狙っているか、自分の手が無防備な駒を残さないかを確認しましょう。' },
    { h: '練習方法', p: '1手・2手詰めのパズルでパターン認識を鍛え、レベル2で駒をタダで失わずに最後まで指すことを目標にしてください。' },
  ],
  shogi: [
    { h: '取った駒が戻ってくることを忘れる', p: '将棋では取った駒を空いた任意のマスに打てるため、安全に見えた形が一手の打ち込みで崩れます。特に飛車や角を相手がどこに打てるか、常に確認しましょう。' },
    { h: '玉の安全をおろそかにする', p: '初心者は攻めを急ぎ、玉を囲わないままにしがちです。美濃囲いや矢倉などの簡単な囲いを先に作り、持ち駒で攻め始めましょう。' },
    { h: '練習方法', p: 'このサイトの詰将棋を解いてみてください。打ち込みの王手を見抜く力が最も早い上達法で、すべての対局に役立ちます。' },
  ],
  go: [
    { h: '相手にくっつきすぎる', p: '初心者は相手の石にくっつけて打ち、薄く弱い形になりがちです。上級者はまず隅、次に辺の広い場所を確保し、自分の石が強い場所でだけ戦います。' },
    { h: 'ダメ（呼吸点）を数えない', p: '石を失う原因の多くは、戦いでダメを数えなかったことです。局地戦では、打つ前に自分と相手のダメを数えましょう。' },
    { h: '練習方法', p: '9路盤のレベル1から始めましょう。大切な石の集団には二つの眼を作ることを目標にし、計算の説明で地が勝敗をどう決めるかを確認してください。' },
  ],
  baghchal: [
    { h: 'ヤギを早く端に置きすぎる', p: '端のヤギは取られにくいですが、早く全部置くと中央を虎に明け渡します。ヤギは後ろの石が飛び越えを防ぐよう、つなげて置きましょう。' },
    { h: '虎が一頭ずつ閉じ込められる', p: '虎は散らして中央近くに置きましょう。隅で動けない虎はすでに半分負けで、四頭すべてを封じることがヤギの勝ち方です。' },
    { h: '練習方法', p: 'まずヤギ側で、一頭も失わずに勝つことを目指しましょう。次に陣営を替えて、虎がゆるいヤギの並びをどう罰するか確認してください。' },
  ],
  xiangqi: [
    { h: '車の展開が遅い', p: '車は最強の駒で、先に二つの車を働かせたほうが主導権を握ります。序盤の数手で筋を開き、車を出しましょう。' },
    { h: '将帥の対面ルールを忘れる', p: '二つの将は開いた筋で向かい合えません。初心者はこのルールを使った戦術を見逃したり、何気ない手が実は反則だと気づかなかったりします。' },
    { h: '練習方法', p: '砲が取るには駒（台）がちょうど一つ必要なことを覚え、車と砲を組み合わせて守られた宮を攻める練習をしましょう。' },
  ],
  oware: [
    { h: '自分の側だけを数える', p: '初心者は最後の種がどこに落ちるか数えずに撒きます。相手の穴への影響まで最後まで数え、種が2〜3個の穴が取られる対象であることを覚えておきましょう。' },
    { h: '打てる手がなくなる', p: '自分の側が空になると種を相手に取られます。自分の倉に近い穴に予備の種を残して常に手を確保し、相手に種を送らせましょう。' },
    { h: '練習方法', p: '連続取りを作ることだけを狙って数局打ち、その後、種をより多く蓄える長期戦に戻ってみましょう。' },
  ],
};

const zh: Learn = {
  gomoku: [
    { h: '只往一個方向進攻', p: '初學者常常只顧著連成一長條，卻忘了一端被堵就結束了。高手會讓一手棋同時製造兩個威脅，例如雙活三或四三。每次落子前，先想想自己的棋子未來能否共用同一個交叉點。' },
    { h: '忽略對手的活三', p: '兩端皆空的活三，下一手就會變成無法阻擋的活四，必須立刻應對。在思考自己的計畫之前，先檢查通過對手最後一子的所有直線。' },
    { h: '練習方法', p: '從難度 1 開始，練習用雙重威脅而非單一長線取勝。熟練後提高難度，嘗試以後手獲勝，前十手必須準確防守。' },
  ],
  reversi: [
    { h: '開局吃太多子', p: '中盤棋子最多，往往是正在落敗的徵兆。翻的子越多，對手可下的位置就越多。與其追求子數，不如增加行動力，讓對手無處可下。' },
    { h: '把角送給對手', p: '角旁斜對角的格子（X 格）是初學者最常犯的錯，會讓對手拿下角。角上的棋子無法被翻轉，一個角往往能支撐整條邊。' },
    { h: '練習方法', p: '除非被迫，否則整局都不下 X 格與 C 格。下完後檢視終盤，你會看到 AI 如何自己破壞陣型。' },
  ],
  janggi: [
    { h: '沒有計畫就交換棋子', p: '因為九宮限制，將棋中子力比西洋棋更重要，但輕率交換也會削弱防守。吃子之前，先確認被回吃後是否會打開通往自己九宮的斜線。' },
    { h: '忘了馬與象會被絆', p: '馬和象只要第一步有一枚棋子就無法移動。初學者常忽略對手相鄰的棋子悄悄化解了攻擊。在熟悉絆腳之前，善用棋盤上的紅色標記。' },
    { h: '練習方法', p: '連續幾局都用相同的開局佈陣。起始局面相同時，炮如何利用炮架、車如何控制直線，學起來更快。' },
  ],
  chess: [
    { h: '開局重複移動同一子', p: '騎士與主教各出動一次，儘早易位並連接雙車。把好幾步棋花在同一枚棋子上，或過早出后，都會讓對手白白獲得進攻的先手。' },
    { h: '讓棋子無人保護', p: '俱樂部水準以下的棋局多半輸在一步棋白送一子。每步棋之前，確認對手上一步在攻擊什麼，以及自己的著法是否留下無保護的棋子。' },
    { h: '練習方法', p: '用一步殺、兩步殺的謎題訓練棋形辨識，再以難度 2 對局，目標是整局不白白丟子。' },
  ],
  shogi: [
    { h: '忘了被吃的棋子會回來', p: '在將棋中，吃到的棋子可以打在任何空格，看似安全的陣型可能被一手打入瓦解。務必注意對手能把飛車或角行打在哪裡。' },
    { h: '忽視玉將的安全', p: '初學者急於進攻，讓玉將暴露在外。先築好美濃囲或矢倉等簡單的圍，再用手中的棋子開始進攻。' },
    { h: '練習方法', p: '解本站的詰將棋謎題。看出打入將軍是進步最快的方法，對每一局都有幫助。' },
  ],
  go: [
    { h: '貼得離對手太近', p: '初學者喜歡貼著對手的棋下，結果形狀單薄脆弱。高手先佔角，再佔邊上的空曠處，只在自己棋子已強的地方戰鬥。' },
    { h: '不數氣', p: '大多數被吃的棋都是因為戰鬥時沒有數氣。每次局部戰鬥，落子前先數自己和對手的氣。' },
    { h: '練習方法', p: '從 9×9 棋盤的難度 1 開始。每一塊重要的棋都要做出兩個眼，並透過計分說明了解地盤如何決定勝負。' },
  ],
  baghchal: [
    { h: '太早把羊放到邊上', p: '邊上的羊不容易被吃，但太早全部放在那裡，會把中央讓給老虎。羊要連成一串，讓後面的棋子防止被跳吃。' },
    { h: '老虎被逐隻困住', p: '老虎要分散並靠近中央。被困在角落沒有行動空間的老虎等於已經輸了一半，封住四隻老虎就是羊的獲勝方式。' },
    { h: '練習方法', p: '先執羊，嘗試不損失任何一隻羊而獲勝。再換邊，看看老虎如何懲罰鬆散的羊陣。' },
  ],
  xiangqi: [
    { h: '車出得太慢', p: '車是最強的棋子，先讓兩隻車活躍的一方通常掌握主動。開局幾步內就要打開直線並出車。' },
    { h: '忘了將帥不能對面', p: '兩個將帥不能在開放的直線上相對。初學者常錯過利用此規則的戰術，或不知道看似平常的一步其實是犯規。' },
    { h: '練習方法', p: '記住炮吃子必須恰好隔一個炮架，並練習用車與炮配合進攻有防守的九宮。' },
  ],
  oware: [
    { h: '只數自己這一側', p: '初學者撒種時不數最後一顆會落在哪裡。請數到最後，包括對對手各坑的影響，並記住有 2～3 顆種子的坑是被吃的目標。' },
    { h: '無棋可走', p: '若自己這一側被掏空，種子會被對手拿走。在靠近自己倉庫的坑留一些存糧，確保永遠有棋可走，並逼對手餵種給你。' },
    { h: '練習方法', p: '先專注於製造連續吃子的局面，幾局之後，再回到儲存更多種子的長線打法。' },
  ],
};

export const LEARN: Record<Locale, Learn> = { en, ko, ja, zh };
