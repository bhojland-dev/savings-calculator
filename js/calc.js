// Beregningslag: rene funktioner uden kendskab til siden.
// Bruges som facit, når iOS-appen bygges.

const MONTHS_PER_YEAR = 12;

// Forskelle under en halv krone vises som "ingen forskel"
const NO_DIFFERENCE_THRESHOLD = 0.5;

/** Nettoafkast som decimaltal, fx 7 % afkast og 0,4 % ÅOP giver 0,066. */
export function netReturn(grossReturnPercent, annualCostPercent) {
  return (grossReturnPercent - annualCostPercent) / 100;
}

/**
 * Simulerer opsparingen måned for måned med renters rente.
 * Månedlige indbetalinger sker sidst i hver måned, årlige sidst på året.
 * Indbetalingen stiger med contributionGrowth efter hvert år.
 *
 * @returns {{year: number, balance: number, paid: number}[]} én række pr. år, inkl. år 0
 */
export function simulateSavings({
  startAmount,
  contribution,
  contributionsPerYear,
  years,
  contributionGrowth,
  annualNetReturn,
}) {
  const monthlyRate = Math.pow(1 + annualNetReturn, 1 / MONTHS_PER_YEAR) - 1;
  let balance = startAmount;
  let paid = startAmount;
  let currentContribution = contribution;
  const rows = [{ year: 0, balance, paid }];

  for (let year = 1; year <= years; year++) {
    for (let month = 1; month <= MONTHS_PER_YEAR; month++) {
      balance *= 1 + monthlyRate;
      if (contributionsPerYear === MONTHS_PER_YEAR) {
        balance += currentContribution;
        paid += currentContribution;
      }
    }
    if (contributionsPerYear === 1) {
      balance += currentContribution;
      paid += currentContribution;
    }
    rows.push({ year, balance, paid });
    currentContribution *= 1 + contributionGrowth;
  }
  return rows;
}

/**
 * Sammenligner slutværdierne for to scenarier.
 *
 * @returns {{difference: number, leader: "A" | "B" | null, percentMore: number}}
 *   difference er A minus B; leader er null, når der ingen reel forskel er.
 */
export function compareScenarios(finalBalanceA, finalBalanceB) {
  const difference = finalBalanceA - finalBalanceB;
  if (Math.abs(difference) < NO_DIFFERENCE_THRESHOLD) {
    return { difference, leader: null, percentMore: 0 };
  }
  const lowerBalance = Math.min(finalBalanceA, finalBalanceB);
  return {
    difference,
    leader: difference > 0 ? "A" : "B",
    percentMore: lowerBalance ? (Math.abs(difference) / lowerBalance) * 100 : 0,
  };
}
