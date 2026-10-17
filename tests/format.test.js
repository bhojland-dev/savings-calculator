import { describe, expect, it } from "vitest";
import {
  escapeHtml,
  formatAxisValue,
  formatDecimal,
  formatKr,
  formatNumber,
  parseAmount,
  parseDecimal,
  signPrefix,
} from "../js/format.js";

describe("parseAmount", () => {
  it("læser punktum som tusindtalsseparator og komma som decimal", () => {
    expect(parseAmount("1.500.000")).toBe(1_500_000);
    expect(parseAmount("12.345,6")).toBe(12_345.6);
    expect(parseAmount(" 3 000 ")).toBe(3_000);
  });

  it("giver 0 ved tom eller ugyldig tekst", () => {
    expect(parseAmount("")).toBe(0);
    expect(parseAmount("abc")).toBe(0);
  });
});

describe("parseDecimal", () => {
  it("læser både komma og punktum som decimal", () => {
    expect(parseDecimal("0,4")).toBe(0.4);
    expect(parseDecimal("2.5")).toBe(2.5);
  });

  it("giver 0 ved tom tekst", () => {
    expect(parseDecimal("")).toBe(0);
  });
});

describe("formatering", () => {
  it("formaterer kroner med dansk tusindtalsseparator", () => {
    expect(formatNumber(1_814_240.6)).toBe("1.814.241");
    expect(formatKr(195_678)).toBe("195.678 kr.");
  });

  it("formaterer decimaltal med komma", () => {
    expect(formatDecimal(6.6)).toBe("6,6");
    expect(formatDecimal(12.0912)).toBe("12,09");
  });

  it("giver fortegn med rigtigt minustegn", () => {
    expect(signPrefix(5)).toBe("+");
    expect(signPrefix(-5)).toBe("−");
    expect(signPrefix(0)).toBe("");
  });

  it("forkorter aksetal", () => {
    expect(formatAxisValue(1_500_000)).toBe("1,5 mio.");
    expect(formatAxisValue(500_000)).toBe("500t");
    expect(formatAxisValue(0)).toBe("0");
  });
});

describe("escapeHtml", () => {
  it("escaper tegn, der ellers kunne blive til HTML", () => {
    expect(escapeHtml('X<y> & "z"')).toBe("X&lt;y&gt; &amp; &quot;z&quot;");
  });
});
