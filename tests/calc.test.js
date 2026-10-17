import { describe, expect, it } from "vitest";
import { compareScenarios, netReturn, simulateSavings } from "../js/calc.js";

// Standardværdierne på siden
const DEFAULTS = {
  startAmount: 100_000,
  contribution: 3_000,
  contributionsPerYear: 12,
  years: 20,
  contributionGrowth: 0,
};

const finalBalance = (options) => {
  const rows = simulateSavings(options);
  return rows[rows.length - 1].balance;
};

describe("netReturn", () => {
  it("trækker ÅOP fra afkastet og returnerer et decimaltal", () => {
    expect(netReturn(7, 0.4)).toBeCloseTo(0.066, 10);
    expect(netReturn(7, 1.3)).toBeCloseTo(0.057, 10);
  });
});

describe("simulateSavings", () => {
  it("giver facit-tallene med sidens standardværdier", () => {
    const passive = finalBalance({
      ...DEFAULTS,
      annualNetReturn: netReturn(7, 0.4),
    });
    const active = finalBalance({
      ...DEFAULTS,
      annualNetReturn: netReturn(7, 1.3),
    });
    expect(Math.round(passive)).toBe(1_814_241);
    expect(Math.round(active)).toBe(1_618_563);
  });

  it("returnerer én række pr. år inkl. år 0", () => {
    const rows = simulateSavings({ ...DEFAULTS, annualNetReturn: 0.05 });
    expect(rows).toHaveLength(21);
    expect(rows[0]).toEqual({ year: 0, balance: 100_000, paid: 100_000 });
    expect(rows[20].year).toBe(20);
  });

  it("svarer til renters rente-formlen uden indbetalinger", () => {
    const balance = finalBalance({
      ...DEFAULTS,
      contribution: 0,
      years: 10,
      annualNetReturn: 0.05,
    });
    expect(balance).toBeCloseTo(100_000 * 1.05 ** 10, 6);
  });

  it("svarer til annuitetsformlen ved årlige indbetalinger sidst på året", () => {
    const rate = 0.04;
    const years = 15;
    const balance = finalBalance({
      startAmount: 0,
      contribution: 10_000,
      contributionsPerYear: 1,
      years,
      contributionGrowth: 0,
      annualNetReturn: rate,
    });
    expect(balance).toBeCloseTo((10_000 * ((1 + rate) ** years - 1)) / rate, 6);
  });

  it("lader indbetalingen stige efter hvert år", () => {
    const rows = simulateSavings({
      startAmount: 0,
      contribution: 1_000,
      contributionsPerYear: 1,
      years: 3,
      contributionGrowth: 0.1,
      annualNetReturn: 0,
    });
    expect(rows.map((row) => row.paid)).toEqual([0, 1_000, 2_100, 3_310]);
  });

  it("holder indbetalt beløb uafhængigt af afkastet", () => {
    const rows = simulateSavings({ ...DEFAULTS, annualNetReturn: 0.07 });
    expect(rows[20].paid).toBe(100_000 + 3_000 * 12 * 20);
  });
});

describe("compareScenarios", () => {
  it("finder det bedste scenarie og forskellen i procent", () => {
    const result = compareScenarios(1_100, 1_000);
    expect(result.difference).toBe(100);
    expect(result.leader).toBe("A");
    expect(result.percentMore).toBeCloseTo(10, 10);
  });

  it("kan også give B som bedst", () => {
    const result = compareScenarios(1_000, 1_250);
    expect(result.difference).toBe(-250);
    expect(result.leader).toBe("B");
    expect(result.percentMore).toBeCloseTo(25, 10);
  });

  it("melder ingen forskel under en halv krone", () => {
    expect(compareScenarios(1_000, 1_000.4).leader).toBeNull();
    expect(compareScenarios(1_000, 1_000).percentMore).toBe(0);
  });

  it("undgår division med nul", () => {
    expect(compareScenarios(500, 0).percentMore).toBe(0);
  });
});
