import { AiDecision, AiPublicView, PlaySide, Tile } from './types';
import { handPipSum, isDouble, tilePipSum } from './rules';

/**
 * Fair computer AI.
 * Operates strictly on `AiPublicView` (own hand + public chain + public history + tile counts).
 * Never sees other players' hands or the 14 undealt tiles in 1v1.
 */
export function chooseAiMove(view: AiPublicView): AiDecision | null {
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
    // Otherwise pick the best opening tile based on strong suit & doubles
    const suitCounts = countSuitsInHand(myHand);
    let bestTile = myHand[0];
    let bestScore = -Infinity;
    for (const tile of myHand) {
      let score = tilePipSum(tile) * 1.2;
      score += (suitCounts[tile.a] + suitCounts[tile.b]) * 4;
      if (isDouble(tile)) {
        // Opening with a double of a strong suit is great control
        score += suitCounts[tile.a] >= 2 ? 8 : 3;
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
      // Avoid duplicate evaluation when leftEnd === rightEnd? Keep right as valid option too,
      // but scoring is symmetric when leftEnd === rightEnd.
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

  // 3. Build public knowledge from history & chain
  // Track suits each seat has passed on
  const passedSuitsBySeat: Set<number>[] = Array.from(
    { length: view.numPlayers },
    () => new Set<number>()
  );
  // Track suits each seat recently played (signals strength)
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
  for (const placed of chain) {
    playedSuitTotals[placed.tile.a]++;
    if (placed.tile.b !== placed.tile.a) {
      playedSuitTotals[placed.tile.b]++;
    }
  }

  // Identify partner (in 2v2) and rivals
  const partnerSeat =
    view.mode === '2v2' ? (view.mySeat + 2) % view.numPlayers : null;
  const nextSeat = (view.mySeat + 1) % view.numPlayers;
  const rivalSeats = Array.from({ length: view.numPlayers }, (_, s) => s).filter(
    (s) => s !== view.mySeat && s !== partnerSeat
  );

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
    score += tilePipSum(tile) * 1.4;

    // B. Shed doubles (especially high ones) so they don't get trapped
    if (isDouble(tile)) {
      score += 5 + tile.a * 0.8;
    }

    // C. Favor leaving ends that match our own strong suits
    score += remainingSuitCounts[newLeft] * 4.5;
    score += remainingSuitCounts[newRight] * 4.5;
    if (newLeft === newRight && remainingSuitCounts[newLeft] > 0) {
      score += 4; // Double-ended control on our suit
    }

    // D. Penalize leaving ourselves with zero coverage on BOTH ends
    if (remainingSuitCounts[newLeft] === 0 && remainingSuitCounts[newRight] === 0) {
      score -= 10;
    }

    // E. Use public pass history: attack rivals' weaknesses (especially nextSeat)
    for (const rival of rivalSeats) {
      const multiplier = rival === nextSeat ? 1.5 : 1.0;
      if (passedSuitsBySeat[rival].has(newLeft)) score += 6 * multiplier;
      if (passedSuitsBySeat[rival].has(newRight)) score += 6 * multiplier;
      // Avoid opening suits rivals played heavily
      score -= playedSuitsBySeat[rival][newLeft] * 1.2 * multiplier;
      score -= playedSuitsBySeat[rival][newRight] * 1.2 * multiplier;
    }

    // F. In 2v2, respect partner's passes and plays
    if (partnerSeat !== null) {
      if (passedSuitsBySeat[partnerSeat].has(newLeft)) score -= 5;
      if (passedSuitsBySeat[partnerSeat].has(newRight)) score -= 5;
      score += playedSuitsBySeat[partnerSeat][newLeft] * 1.5;
      score += playedSuitsBySeat[partnerSeat][newRight] * 1.5;
    }

    // G. Tranca check: does this move dead-lock both ends?
    // A suit is completely exhausted outside our hand if played + ours == 7
    // (or in 1v1, we still estimate using played + ours).
    const newPlayedLeft =
      playedSuitTotals[newLeft] + (tile.a === newLeft || tile.b === newLeft ? 1 : 0);
    const newPlayedRight =
      playedSuitTotals[newRight] + (tile.a === newRight || tile.b === newRight ? 1 : 0);

    const leftExhaustedForOthers = newPlayedLeft + remainingSuitCounts[newLeft] >= 7;
    const rightExhaustedForOthers = newPlayedRight + remainingSuitCounts[newRight] >= 7;
    const weCanPlayNext =
      remainingSuitCounts[newLeft] > 0 || remainingSuitCounts[newRight] > 0;

    if (leftExhaustedForOthers && rightExhaustedForOthers && !weCanPlayNext) {
      // This move guarantees an immediate tranca!
      // Estimate whether our remaining hand weight is favorable compared to rivals' tile counts
      const minRivalTiles = Math.min(...rivalSeats.map((s) => view.tileCounts[s]));
      const estimatedRivalWeight = minRivalTiles * 5.5;
      if (remainingWeight < estimatedRivalWeight) {
        score += 22; // Provoke favorable tranca
      } else {
        score -= 28; // Avoid unfavorable tranca
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
