import { DRAW_NUMBER_COUNT } from "@/lib/constants";
import type {
  DrawEntrant,
  DrawMode,
  DrawResult,
  MatchTier,
  PrizePoolBreakdown,
} from "@/lib/types";

function uniqueScores(scores: number[]) {
  return [...new Set(scores)].sort((a, b) => a - b);
}

function randomBetween(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function buildPrizePool(monthlyRecurringRevenue: number, rolloverIn: number) {
  const tier5 = monthlyRecurringRevenue * 0.4 + rolloverIn;
  const tier4 = monthlyRecurringRevenue * 0.35;
  const tier3 = monthlyRecurringRevenue * 0.25;

  return {
    tier3,
    tier4,
    tier5,
    total: tier3 + tier4 + tier5,
  } satisfies PrizePoolBreakdown;
}

function drawRandomNumbers() {
  const numbers = new Set<number>();

  while (numbers.size < DRAW_NUMBER_COUNT) {
    numbers.add(randomBetween(1, 45));
  }

  return [...numbers].sort((a, b) => a - b);
}

function drawWeightedNumbers(entrants: DrawEntrant[]) {
  const frequency = new Map<number, number>();

  entrants.flatMap((entrant) => uniqueScores(entrant.scores)).forEach((score) => {
    frequency.set(score, (frequency.get(score) ?? 0) + 1);
  });

  const values = Array.from({ length: 45 }, (_, index) => index + 1);
  const maxFrequency = Math.max(...frequency.values(), 1);
  const selected = new Set<number>();

  while (selected.size < DRAW_NUMBER_COUNT) {
    const available = values.filter((value) => !selected.has(value));
    const weights = available.map((value) => {
      const freq = frequency.get(value) ?? 0;
      const rarityBoost = maxFrequency - freq + 1;

      return freq * 1.2 + rarityBoost * 0.35;
    });
    const total = weights.reduce((sum, weight) => sum + weight, 0);
    const target = Math.random() * total;
    let cursor = 0;

    for (let index = 0; index < available.length; index += 1) {
      cursor += weights[index];
      if (cursor >= target) {
        selected.add(available[index]);
        break;
      }
    }
  }

  return [...selected].sort((a, b) => a - b);
}

function countMatches(userScores: number[], drawNumbers: number[]) {
  const scoreSet = new Set(uniqueScores(userScores));
  return drawNumbers.filter((value) => scoreSet.has(value)).length;
}

export function runDrawEngine({
  entrants,
  mode,
  monthlyRecurringRevenue,
  rolloverIn,
}: {
  entrants: DrawEntrant[];
  mode: DrawMode;
  monthlyRecurringRevenue: number;
  rolloverIn: number;
}): DrawResult {
  const numbers =
    mode === "weighted" ? drawWeightedNumbers(entrants) : drawRandomNumbers();
  const prizePool = buildPrizePool(monthlyRecurringRevenue, rolloverIn);
  const tierWinners: Record<MatchTier, string[]> = {
    3: [],
    4: [],
    5: [],
  };

  entrants.forEach((entrant) => {
    const matchCount = countMatches(entrant.scores, numbers);
    if (matchCount >= 5) {
      tierWinners[5].push(entrant.userId);
    } else if (matchCount === 4) {
      tierWinners[4].push(entrant.userId);
    } else if (matchCount === 3) {
      tierWinners[3].push(entrant.userId);
    }
  });

  return {
    numbers,
    prizePool,
    jackpotRolloverOut: tierWinners[5].length > 0 ? 0 : prizePool.tier5,
    tierWinners,
  };
}

export function getMatchCount(userScores: number[], drawNumbers: number[]) {
  return countMatches(userScores, drawNumbers);
}
