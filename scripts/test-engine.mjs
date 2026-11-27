import assert from 'node:assert/strict';
import { execSync } from 'node:child_process';
import test from 'node:test';
import { createRequire } from 'node:module';

execSync(
  'npx tsc --ignoreConfig src/engine/rules.ts src/engine/ai.ts src/engine/types.ts --outDir /tmp/domino-engine-test --module commonjs --target es2022 --moduleResolution node --ignoreDeprecations 6.0 --esModuleInterop --strict --skipLibCheck',
  { stdio: 'inherit' }
);

const require = createRequire(import.meta.url);
const { chooseAiMove } = require('/tmp/domino-engine-test/ai.js');
const {
  applyDraw,
  applyPass,
  applyPlay,
  buildAiPublicView,
  canDrawFromBoneyard,
  countDoubles,
  createFullDeck,
  createInitialSetupState,
  dealNextHand,
  dealValidHands,
  determineFirstHandOpener,
  getLegalMovesForSeat,
  getNextClockwiseSeat,
  getSeatToRight,
  handPipSum,
  hasFourOrMoreDoubles,
  startNewMatch,
} = require('/tmp/domino-engine-test/rules.js');

function t(a, b) {
  const lo = Math.min(a, b);
  const hi = Math.max(a, b);
  return { id: `${lo}-${hi}`, a: lo, b: hi };
}

test('deck has 28 unique double-six tiles', () => {
  const deck = createFullDeck();
  assert.equal(deck.length, 28);
  const ids = new Set(deck.map((tile) => tile.id));
  assert.equal(ids.size, 28);
});

test('dealing enforces 4+ doubles automatic redeal', () => {
  const fourDoubles = [t(0, 0), t(1, 1), t(2, 2), t(3, 3), t(4, 5), t(1, 6), t(2, 5)];
  const normalHand = [t(0, 1), t(1, 2), t(2, 3), t(3, 4), t(4, 5), t(5, 6), t(0, 6)];
  assert.equal(countDoubles(fourDoubles), 4);
  assert.equal(hasFourOrMoreDoubles([fourDoubles, normalHand]), true);

  for (let i = 0; i < 200; i++) {
    const { hands, boneyard } = dealValidHands(4);
    assert.equal(boneyard.length, 0);
    assert.equal(hasFourOrMoreDoubles(hands), false);
  }
});

test('1v1 boneyard draw until playable, and auto-pass when boneyard empties', () => {
  const base = createInitialSetupState('1v1', 100);
  const hands = [
    [t(6, 6), t(0, 1)], // Seat 0 plays 6-6 -> ends are 6, 6
    [t(2, 3)], // Seat 1 has no 6 -> must draw from boneyard
  ];
  const boneyard = [t(1, 2), t(4, 6)]; // First draw not playable, second IS playable
  let s = dealNextHand(base, Math.random, hands, boneyard);
  s = applyPlay(s, 0, '6-6', 'start');

  // Seat 1 cannot pass while boneyard has tiles
  assert.equal(canDrawFromBoneyard(s, 1), true);
  assert.throws(() => applyPass(s, 1));

  // Draw 1: 1-2 (still not playable, still seat 1's turn)
  s = applyDraw(s, 1, 0);
  assert.equal(s.currentTurnSeat, 1);
  assert.equal(s.boneyard.length, 1);
  assert.equal(s.players[1].hand.length, 2);

  // Draw 2: 4-6 (now playable! still seat 1's turn, boneyard empty)
  s = applyDraw(s, 1, 0);
  assert.equal(s.currentTurnSeat, 1);
  assert.equal(s.boneyard.length, 0);
  assert.equal(getLegalMovesForSeat(s, 1).length, 1);

  // Now play 4-6!
  s = applyPlay(s, 1, '4-6', 'right');
  assert.equal(s.currentTurnSeat, 0);
  assert.equal(s.rightEnd, 4);
});

test('1v1 drawing last unplayable tile automatically passes turn', () => {
  const base = createInitialSetupState('1v1', 100);
  const hands = [
    [t(6, 6), t(0, 1)],
    [t(2, 3)],
  ];
  const boneyard = [t(1, 2)]; // Only 1 tile, not playable on 6-6
  let s = dealNextHand(base, Math.random, hands, boneyard);
  s = applyPlay(s, 0, '6-6', 'start');
  s = applyDraw(s, 1, 0);
  // Boneyard is now empty & seat 1 still has no 6 -> auto-passed to seat 0!
  assert.equal(s.boneyard.length, 0);
  assert.equal(s.currentTurnSeat, 0);
  assert.equal(s.consecutivePasses, 1);
});

test('1v1 first hand opening fallback when nobody has 6-6', () => {
  const h0 = [t(2, 2), t(0, 1), t(0, 2), t(0, 3), t(1, 3), t(2, 4), t(3, 5)];
  const h1 = [t(4, 4), t(0, 4), t(1, 4), t(1, 5), t(2, 5), t(3, 6), t(4, 5)];
  const openA = determineFirstHandOpener([h0, h1]);
  assert.equal(openA.openerSeat, 1);
  assert.equal(openA.forcedTileId, '4-4');

  const h2 = [t(0, 1), t(0, 2), t(1, 2), t(1, 3), t(2, 3), t(3, 4), t(4, 5)];
  const h3 = [t(0, 3), t(0, 4), t(1, 4), t(2, 4), t(2, 5), t(3, 5), t(5, 6)];
  const openB = determineFirstHandOpener([h2, h3]);
  assert.equal(openB.openerSeat, 1);
  assert.equal(openB.forcedTileId, '5-6');
});

test('opener rotates to the right on subsequent hands regardless of winner', () => {
  assert.equal(getSeatToRight(0, 4), 3);
  assert.equal(getSeatToRight(3, 4), 2);
  assert.equal(getSeatToRight(2, 4), 1);
  assert.equal(getSeatToRight(1, 4), 0);
  assert.equal(getNextClockwiseSeat(0, 4), 1);

  const s1 = startNewMatch('2v2', 100);
  const opener1 = s1.currentOpenerSeat;
  const s2 = dealNextHand(s1);
  assert.equal(s2.currentOpenerSeat, getSeatToRight(opener1, 4));
  assert.equal(s2.forcedOpeningTileId, null);
});

test('2v2 dominó scoring includes partner remaining tiles', () => {
  const base = createInitialSetupState('2v2', 100);
  const hands = [[t(6, 6)], [t(1, 2)], [t(4, 5)], [t(0, 6)]];
  const s = dealNextHand(base, Math.random, hands, []);
  const after = applyPlay(s, 0, '6-6', 'start');
  assert.equal(after.phase, 'round_summary');
  assert.equal(after.lastHandSummary.pointsAwarded, 18);
  assert.equal(after.scores[0], 18);
});

test('tranca win awards sum of all other players hands; exact tie is null hand', () => {
  const base = createInitialSetupState('1v1', 100);
  const hands = [
    [t(6, 6), t(0, 1)],
    [t(2, 3)],
  ];
  let s = dealNextHand(base, Math.random, hands, []);
  s = applyPlay(s, 0, '6-6', 'start');
  s = applyPass(s, 1);
  s = applyPass(s, 0);
  assert.equal(s.phase, 'round_summary');
  assert.equal(s.lastHandSummary.reason, 'tranca');
  assert.equal(s.lastHandSummary.pointsAwarded, 5);

  const tieHands = [
    [t(6, 6), t(1, 4)],
    [t(2, 3)],
  ];
  let sTie = dealNextHand(base, Math.random, tieHands, []);
  sTie = applyPlay(sTie, 0, '6-6', 'start');
  sTie = applyPass(sTie, 1);
  sTie = applyPass(sTie, 0);
  assert.equal(sTie.lastHandSummary.reason, 'tranca_tie');
  assert.equal(sTie.lastHandSummary.pointsAwarded, 0);
});

test('full simulated matches complete cleanly in 1v1 (with boneyard), 2v2, and 4ffa', () => {
  const modes = ['1v1', '2v2', '4ffa'];
  const targets = [50, 100, 150, 200, 250, 300];

  for (const mode of modes) {
    for (const target of targets) {
      let state = startNewMatch(mode, target);
      const expectedScores = Array(state.scores.length).fill(0);
      let safetyHands = 0;

      while (state.phase !== 'match_over' && safetyHands < 80) {
        let safetyTurns = 0;
        while (state.phase === 'playing' && safetyTurns < 140) {
          const seat = state.currentTurnSeat;
          const view = buildAiPublicView(state, seat);
          assert.equal('players' in view, false);
          assert.equal('boneyard' in view, false);
          const decision = chooseAiMove(view);
          const legal = getLegalMovesForSeat(state, seat);

          if (legal.length === 0) {
            assert.equal(decision, null);
            if (state.boneyard.length > 0) {
              state = applyDraw(state, seat);
            } else {
              state = applyPass(state, seat);
            }
          } else {
            assert.ok(decision !== null);
            state = applyPlay(state, seat, decision.tile.id, decision.side);
          }
          safetyTurns++;
        }

        const summary = state.lastHandSummary;
        const countedSum = summary.remainingHands
          .filter((r) => r.countedInScore)
          .reduce((acc, r) => acc + handPipSum(r.tiles), 0);
        assert.equal(summary.pointsAwarded, countedSum);

        if (summary.winnerScoreIndex !== null) {
          expectedScores[summary.winnerScoreIndex] += summary.pointsAwarded;
        }
        assert.deepEqual(state.scores, expectedScores);

        if (state.phase === 'round_summary') {
          state = dealNextHand(state);
        }
        safetyHands++;
      }

      assert.equal(state.phase, 'match_over');
      assert.ok(state.scores[state.matchWinnerIndex] >= target);
    }
  }
});

test('illegal moves, out-of-turn plays, and passing with legal moves are rejected', () => {
  const base = createInitialSetupState('2v2', 100);
  const hands = [
    [t(6, 6), t(0, 1)],
    [t(6, 2), t(1, 3)],
    [t(4, 5), t(2, 2)],
    [t(3, 4), t(0, 5)],
  ];
  let s = dealNextHand(base, Math.random, hands, []);
  // Opening hand forces 6-6 by seat 0
  assert.throws(() => applyPlay(s, 0, '0-1', 'start'));
  assert.throws(() => applyPlay(s, 1, '6-2', 'start'));
  assert.throws(() => applyPass(s, 0));

  s = applyPlay(s, 0, '6-6', 'start');
  // Seat 1 has 6-2 -> cannot pass and cannot play non-matching 1-3
  assert.throws(() => applyPass(s, 1));
  assert.throws(() => applyPlay(s, 1, '1-3', 'right'));
  assert.throws(() => applyPlay(s, 2, '4-5', 'right'));
});

test('1v1 tranca and domino never count remaining boneyard tiles in score', () => {
  const base = createInitialSetupState('1v1', 100);
  const boneyard = [t(5, 6), t(4, 6), t(5, 5)]; // 31 pips in boneyard -> must NEVER be scored!
  const hands = [
    [t(6, 6)], // Seat 0 dominos immediately
    [t(0, 2)], // 2 pips
  ];
  const sDomino = dealNextHand(base, Math.random, hands, boneyard);
  const afterDomino = applyPlay(sDomino, 0, '6-6', 'start');
  assert.equal(afterDomino.lastHandSummary.reason, 'domino');
  assert.equal(afterDomino.lastHandSummary.pointsAwarded, 2);
  assert.equal(afterDomino.scores[0], 2);
});

test('2v2 tranca awards all other 3 players pips (including partner) and tie is null hand', () => {
  const base = createInitialSetupState('2v2', 100);
  // Seat 0 plays 6-6 leaving 0-1 (1 pip). Others have no 6s: 1-2 (3), 2-3 (5), 3-4 (7).
  // Total other players = 3 + 5 + 7 = 15 points to Team 0.
  const hands = [
    [t(6, 6), t(0, 1)],
    [t(1, 2)],
    [t(2, 3)],
    [t(3, 4)],
  ];
  let s = dealNextHand(base, Math.random, hands, []);
  s = applyPlay(s, 0, '6-6', 'start');
  s = applyPass(s, 1);
  s = applyPass(s, 2);
  s = applyPass(s, 3);
  s = applyPass(s, 0);
  assert.equal(s.phase, 'round_summary');
  assert.equal(s.lastHandSummary.reason, 'tranca');
  assert.equal(s.lastHandSummary.winnerSeat, 0);
  assert.equal(s.lastHandSummary.pointsAwarded, 15);
  assert.equal(s.scores[0], 15);

  // Exact tie between seat 0 (0-3 = 3) and seat 1 (1-2 = 3) -> null hand (0 pts)
  const tieHands = [
    [t(6, 6), t(0, 3)],
    [t(1, 2)],
    [t(2, 3)],
    [t(3, 4)],
  ];
  let st = dealNextHand(base, Math.random, tieHands, []);
  st = applyPlay(st, 0, '6-6', 'start');
  st = applyPass(st, 1);
  st = applyPass(st, 2);
  st = applyPass(st, 3);
  st = applyPass(st, 0);
  assert.equal(st.lastHandSummary.reason, 'tranca_tie');
  assert.equal(st.lastHandSummary.winnerSeat, null);
  assert.equal(st.lastHandSummary.pointsAwarded, 0);
  assert.deepEqual(st.scores, [0, 0]);
});

test('4ffa tranca and domino award exact opponent pip sums to individual winner', () => {
  const base = createInitialSetupState('4ffa', 100);
  const hands = [
    [t(6, 6), t(0, 1)], // 1 pip
    [t(0, 2)], // 2 pips
    [t(1, 2)], // 3 pips
    [t(2, 2)], // 4 pips
  ];
  let s = dealNextHand(base, Math.random, hands, []);
  s = applyPlay(s, 0, '6-6', 'start');
  s = applyPass(s, 1);
  s = applyPass(s, 2);
  s = applyPass(s, 3);
  s = applyPass(s, 0);
  assert.equal(s.lastHandSummary.reason, 'tranca');
  assert.equal(s.lastHandSummary.winnerSeat, 0);
  assert.equal(s.lastHandSummary.pointsAwarded, 9);
  assert.deepEqual(s.scores, [9, 0, 0, 0]);
});

test('stress simulation: 300 full hands across 1v1, 2v2, and 4ffa preserve all invariants', () => {
  const modes = ['1v1', '2v2', '4ffa'];
  let totalHands = 0;

  for (const mode of modes) {
    for (let i = 0; i < 100; i++) {
      let state = startNewMatch(mode, 100);
      let safetyTurns = 0;
      while (state.phase === 'playing' && safetyTurns < 140) {
        const seat = state.currentTurnSeat;
        const view = buildAiPublicView(state, seat);
        assert.equal('players' in view, false);
        assert.equal('boneyard' in view, false);

        // Tile conservation invariant: chain + all hands + boneyard === 28 unique tiles
        const allIds = new Set([
          ...state.chain.map((c) => c.tile.id),
          ...state.boneyard.map((tile) => tile.id),
          ...state.players.flatMap((p) => p.hand.map((tile) => tile.id)),
        ]);
        assert.equal(allIds.size, 28);

        const legal = getLegalMovesForSeat(state, seat);
        const decision = chooseAiMove(view);
        if (legal.length === 0) {
          assert.equal(decision, null);
          state = state.boneyard.length > 0 ? applyDraw(state, seat) : applyPass(state, seat);
        } else {
          assert.ok(decision !== null);
          state = applyPlay(state, seat, decision.tile.id, decision.side);
        }
        safetyTurns++;
      }

      assert.ok(state.phase === 'round_summary' || state.phase === 'match_over');
      assert.ok(state.lastHandSummary !== null);
      totalHands++;
    }
  }
  assert.equal(totalHands, 300);
});
