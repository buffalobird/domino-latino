import { AiDecision, AiPublicView, Tile } from './types';
import { handPipSum, isDouble, tilePipSum } from './rules';

export type AiDifficulty = 'casual' | 'normal' | 'pro';

/**
 * Fair computer AI with 3 genuinely distinct tactical difficulty tiers:
 * - `casual` ("Fácil"): sheds high pips with light natural play; does not track opponent passes or engineer trancas.
 * - `normal` ("Club"): balanced suit control, pass-history pressure, 2v2 partner respect, and basic tranca checks.
 * - `pro` ("Experto"): full public suit-counting, aggressive next-seat blocking, endgame rival defense, and sharper tranca math.
 *
 * Operates strictly on `AiPublicView` (own hand + public chain + public history + tile counts).
 * Never sees other players' hands or the 14 undealt tiles in 1v1.
 */
export function chooseAiMove(
  view: AiPublicView,
  difficulty: AiDifficulty = 'normal'
): AiDecision | null {
  const { myHand, chain, leftEnd, rightEnd, forcedOpeningTileId } = view;

  // 1. Opening move on empty board
  if (chain.length === 0) {
    if (forcedOpeningTileId) {
      const forced = myHand.find((t) => t.id === forcedOpeningTileId);
      return forced ? { tile: forced, side: 'start' } : null;
    }
    // Always open with 6-6 if held
    const sixSix = myHand.find((t) => t.a === 6 && t.b === 6);
    if (sixSix) {
      return { tile: sixSix, side: 'start' };
    }

    if (difficulty === 'casual') {
      // Casual opening: pick the heaviest tile without deep suit-control planning
      let heaviest = myHand[0];
      for (const tile of myHand) {
        if (tilePipSum(tile) > tilePipSum(heaviest)) heaviest = tile;
      }
      return heaviest ? { tile: heaviest, side: 'start' } : null;
    }

    // Normal & Pro: pick the best opening tile based on strong suit & doubles
    const suitCounts = countSuitsInHand(myHand);
    let bestTile = myHand[0];
    let bestScore = -Infinity;
    for (const tile of myHand) {
      let score = tilePipSum(tile) * (difficulty === 'pro' ? 1.35 : 1.2);
      score += (suitCounts[tile.a] + suitCounts[tile.b]) * (difficulty === 'pro' ? 5.2 : 4);
      if (isDouble(tile)) {
        // Opening with a double of a strong suit is great control; opening an isolated high double is risky in Pro
        if (difficulty === 'pro') {
          score += suitCounts[tile.a] >= 3 ? 11 : suitCounts[tile.a] === 2 ? 6 : -2;
        } else {
          score += suitCounts[tile.a] >= 2 ? 8 : 3;
        }
      }
      if (score > bestScore) {
        bestScore = score;
        bestTile = tile;
      }
    }
    return bestTile ? { tile: bestTile, side: 'start' } : null;
  }

  // 2. Collect all legal (tile, side) candidates
  const candidates: AiDecision[] = [];
  for (const tile of myHand) {
    if (tile.a === leftEnd || tile.b === leftEnd) {
      candidates.push({ tile, side: 'left' });
    }
    if (tile.a === rightEnd || tile.b === rightEnd) {
      if (leftEnd !== rightEnd) {
        candidates.push({ tile, side: 'right' });
      }
    }
  }

  if (candidates.length === 0) {
    return null;
  }
  if (candidates.length === 1) {
    return candidates[0];
  }

  // Casual tier: straightforward heuristic — always take immediate dominó, otherwise shed heavier tiles
  // with light self-suit preference and zero opponent pass-tracking or tranca engineering.
  if (difficulty === 'casual') {
    let bestCandidate = candidates[0];
    let bestScore = -Infinity;
    for (const candidate of candidates) {
      const remainingHand = myHand.filter((t) => t.id !== candidate.tile.id);
      if (remainingHand.length === 0) return candidate;
      const newLeft =
        candidate.side === 'left'
          ? candidate.tile.a === leftEnd
            ? candidate.tile.b
            : candidate.tile.a
          : leftEnd!;
      const newRight =
        candidate.side === 'right'
          ? candidate.tile.a === rightEnd
            ? candidate.tile.b
            : candidate.tile.a
          : rightEnd!;
      const remSuits = countSuitsInHand(remainingHand);
      const score =
        tilePipSum(candidate.tile) * 1.1 +
        (isDouble(candidate.tile) ? 2.5 : 0) +
        (remSuits[newLeft] + remSuits[newRight]) * 1.2;
      if (score > bestScore) {
        bestScore = score;
        bestCandidate = candidate;
      }
    }
    return bestCandidate;
  }

  // 3. Build public knowledge from history & chain (Normal & Pro)
  const passedSuitsBySeat: Set<number>[] = Array.from(
    { length: view.numPlayers },
    () => new Set<number>()
  );
  const playedSuitsBySeat: number[][] = Array.from({ length: view.numPlayers }, () =>
    Array(7).fill(0)
  );

  for (const entry of view.history) {
    if (entry.seat < 0 || entry.seat >= view.numPlayers) continue;
    if ((entry.type === 'pass' || entry.type === 'draw') && entry.openEndsAtPass) {
      passedSuitsBySeat[entry.seat].add(entry.openEndsAtPass[0]);
      passedSuitsBySeat[entry.seat].add(entry.openEndsAtPass[1]);
    } else if (entry.type === 'play' && entry.tile) {
      playedSuitsBySeat[entry.seat][entry.tile.a]++;
      if (entry.tile.b !== entry.tile.a) {
        playedSuitsBySeat[entry.seat][entry.tile.b]++;
      }
    }
  }

  // Count how many times each suit (0..6) appears in chain (7 total per suit in a full deck)
  const playedSuitTotals = Array(7).fill(0);
  let playedPipTotal = 0;
  for (const placed of chain) {
    playedPipTotal += tilePipSum(placed.tile);
    playedSuitTotals[placed.tile.a]++;
    if (placed.tile.b !== placed.tile.a) {
      playedSuitTotals[placed.tile.b]++;
    }
  }

  // Public total pips across a double-six deck = 168; unseen avg pips per unseen tile
  const myHandPips = handPipSum(myHand);
  const unseenTilesCount = Math.max(1, 28 - chain.length - myHand.length);
  const unseenAvgPipPerTile = Math.max(
    2.5,
    Math.min(9.5, (168 - playedPipTotal - myHandPips) / unseenTilesCount)
  );

  const partnerSeat =
    view.mode === '2v2' ? (view.mySeat + 2) % view.numPlayers : null;
  const nextSeat = (view.mySeat + 1) % view.numPlayers;
  const rivalSeats = Array.from({ length: view.numPlayers }, (_, s) => s).filter(
    (s) => s !== view.mySeat && s !== partnerSeat
  );

  const isPro = difficulty === 'pro';
  let bestCandidate = candidates[0];
  let bestScore = -Infinity;

  for (const candidate of candidates) {
    const { tile, side } = candidate;
    const remainingHand = myHand.filter((t) => t.id !== tile.id);

    // Immediate win by dominó -> highest possible priority
    if (remainingHand.length === 0) {
      return candidate;
    }

    const newLeft =
      side === 'left' ? (tile.a === leftEnd ? tile.b : tile.a) : leftEnd!;
    const newRight =
      side === 'right' ? (tile.a === rightEnd ? tile.b : tile.a) : rightEnd!;

    const remainingSuitCounts = countSuitsInHand(remainingHand);
    const remainingWeight = handPipSum(remainingHand);

    let score = 0;

    // A. Shed heavier tiles early to protect against tranca
    score += tilePipSum(tile) * (isPro ? 1.55 : 1.4);

    // B. Shed doubles (especially high ones or isolated ones) so they don't get trapped
    if (isDouble(tile)) {
      const isolatedBonus = isPro && remainingSuitCounts[tile.a] === 0 ? 4.5 : 0;
      score += 5 + tile.a * (isPro ? 1.0 : 0.8) + isolatedBonus;
    }

    // C. Favor leaving ends that match our own strong suits
    score += remainingSuitCounts[newLeft] * (isPro ? 5.0 : 4.5);
    score += remainingSuitCounts[newRight] * (isPro ? 5.0 : 4.5);
    if (newLeft === newRight && remainingSuitCounts[newLeft] > 0) {
      score += isPro ? 5.5 : 4;
    }

    // D. Penalize leaving ourselves with zero coverage on BOTH ends
    if (remainingSuitCounts[newLeft] === 0 && remainingSuitCounts[newRight] === 0) {
      score -= isPro ? 13 : 10;
    }

    // E. Use public pass history: attack rivals' weaknesses (especially nextSeat)
    for (const rival of rivalSeats) {
      const isNext = rival === nextSeat;
      const multiplier = isPro ? (isNext ? 2.1 : 1.15) : isNext ? 1.5 : 1.0;
      const rivalTiles = view.tileCounts[rival] ?? 7;
      // In Pro mode, double down on blocking a rival who is down to 1-2 tiles!
      const dangerMult = isPro && rivalTiles <= 2 ? 1.65 : 1.0;

      if (passedSuitsBySeat[rival].has(newLeft)) score += 6 * multiplier * dangerMult;
      if (passedSuitsBySeat[rival].has(newRight)) score += 6 * multiplier * dangerMult;
      score -= playedSuitsBySeat[rival][newLeft] * 1.2 * multiplier * dangerMult;
      score -= playedSuitsBySeat[rival][newRight] * 1.2 * multiplier * dangerMult;
    }

    // F. In 2v2, respect partner's passes and plays
    if (partnerSeat !== null) {
      const partnerTiles = view.tileCounts[partnerSeat] ?? 7;
      const partnerBoost = isPro && partnerTiles <= 2 ? 1.6 : 1.0;
      if (passedSuitsBySeat[partnerSeat].has(newLeft)) score -= (isPro ? 7 : 5) * partnerBoost;
      if (passedSuitsBySeat[partnerSeat].has(newRight)) score -= (isPro ? 7 : 5) * partnerBoost;
      score += playedSuitsBySeat[partnerSeat][newLeft] * (isPro ? 2.0 : 1.5) * partnerBoost;
      score += playedSuitsBySeat[partnerSeat][newRight] * (isPro ? 2.0 : 1.5) * partnerBoost;
    }

    // G. Pro suit-scarcity control & tranca check
    const newPlayedLeft =
      playedSuitTotals[newLeft] + (tile.a === newLeft || tile.b === newLeft ? 1 : 0);
    const newPlayedRight =
      playedSuitTotals[newRight] + (tile.a === newRight || tile.b === newRight ? 1 : 0);

    const unseenLeft = Math.max(0, 7 - newPlayedLeft - remainingSuitCounts[newLeft]);
    const unseenRight = Math.max(0, 7 - newPlayedRight - remainingSuitCounts[newRight]);

    if (isPro) {
      // Reward controlling suits where few unseen tiles remain outside our hand
      if (remainingSuitCounts[newLeft] > 0 && unseenLeft <= 1) score += 5;
      if (remainingSuitCounts[newRight] > 0 && unseenRight <= 1) score += 5;
      // Avoid stranding an unplayed high double in hand if we can keep its suit alive
      for (const rem of remainingHand) {
        if (isDouble(rem) && rem.a >= 4 && (rem.a === newLeft || rem.a === newRight)) {
          score += 3.5;
        }
      }
    }

    const leftExhaustedForOthers = unseenLeft === 0;
    const rightExhaustedForOthers = unseenRight === 0;
    const weCanPlayNext =
      remainingSuitCounts[newLeft] > 0 || remainingSuitCounts[newRight] > 0;

    if (leftExhaustedForOthers && rightExhaustedForOthers && !weCanPlayNext) {
      const minRivalTiles = Math.min(...rivalSeats.map((s) => view.tileCounts[s]));
      const estimatedRivalWeight = minRivalTiles * (isPro ? unseenAvgPipPerTile : 5.5);
      if (remainingWeight < estimatedRivalWeight) {
        score += isPro ? 28 : 22; // Provoke favorable tranca
      } else {
        score -= isPro ? 34 : 28; // Avoid unfavorable tranca
      }
    }

    if (score > bestScore) {
      bestScore = score;
      bestCandidate = candidate;
    }
  }

  return bestCandidate;
}

function countSuitsInHand(hand: Tile[]): number[] {
  const counts = Array(7).fill(0);
  for (const t of hand) {
    counts[t.a]++;
    if (t.b !== t.a) {
      counts[t.b]++;
    }
  }
  return counts;
}
