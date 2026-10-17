// Visningslag: læser felterne, kalder beregningen og opdaterer siden.

import { compareScenarios, netReturn, simulateSavings } from "./calc.js";
import { drawChart } from "./chart.js";
import {
  formatDecimal,
  formatKr,
  formatNumber,
  parseAmount,
  parseDecimal,
  signPrefix,
} from "./format.js";

const MIN_YEARS = 1;
const MAX_YEARS = 70;
const DEFAULT_NAME_A = "Scenarie A";
const DEFAULT_NAME_B = "Scenarie B";

// Uændret nøgle, så besøgende beholder deres gemte tal
const STORAGE_KEY = "opsparing-v1";
const INPUT_IDS = [
  "start",
  "pay",
  "freq",
  "years",
  "growth",
  "nameA",
  "retA",
  "costA",
  "nameB",
  "retB",
  "costB",
];
const AMOUNT_INPUT_IDS = ["start", "pay"];

const $ = (id) => document.getElementById(id);

function readInputs() {
  const years = Math.round(parseDecimal($("years").value)) || MIN_YEARS;
  return {
    startAmount: Math.max(0, parseAmount($("start").value)),
    contribution: Math.max(0, parseAmount($("pay").value)),
    contributionsPerYear: parseInt($("freq").value, 10),
    years: Math.max(MIN_YEARS, Math.min(MAX_YEARS, years)),
    contributionGrowth: parseDecimal($("growth").value) / 100,
    netReturnA: netReturn(
      parseDecimal($("retA").value),
      parseDecimal($("costA").value),
    ),
    netReturnB: netReturn(
      parseDecimal($("retB").value),
      parseDecimal($("costB").value),
    ),
    nameA: $("nameA").value || DEFAULT_NAME_A,
    nameB: $("nameB").value || DEFAULT_NAME_B,
  };
}

function update() {
  const inputs = readInputs();
  const shared = {
    startAmount: inputs.startAmount,
    contribution: inputs.contribution,
    contributionsPerYear: inputs.contributionsPerYear,
    years: inputs.years,
    contributionGrowth: inputs.contributionGrowth,
  };
  const rowsA = simulateSavings({
    ...shared,
    annualNetReturn: inputs.netReturnA,
  });
  const rowsB = simulateSavings({
    ...shared,
    annualNetReturn: inputs.netReturnB,
  });

  renderNetReturns(inputs);
  renderNames(inputs);
  renderResults(inputs, rowsA, rowsB);
  renderTable(rowsA, rowsB);
  drawChart({
    svg: $("chart"),
    tooltip: $("tip"),
    container: $("chartBox"),
    rowsA,
    rowsB,
    nameA: inputs.nameA,
    nameB: inputs.nameB,
  });
  saveInputs();
}

function renderNetReturns({ netReturnA, netReturnB }) {
  $("netA").textContent = formatDecimal(netReturnA * 100) + " %";
  $("netB").textContent = formatDecimal(netReturnB * 100) + " %";
}

function renderNames({ nameA, nameB }) {
  ["lblA", "legA", "thA"].forEach((id) => ($(id).textContent = nameA));
  ["lblB", "legB", "thB"].forEach((id) => ($(id).textContent = nameB));
}

function renderResults({ years, nameA, nameB }, rowsA, rowsB) {
  const finalA = rowsA[years];
  const finalB = rowsB[years];
  $("valA").textContent = formatKr(finalA.balance);
  $("valB").textContent = formatKr(finalB.balance);
  $("subA").textContent =
    `Heraf afkast: ${formatKr(finalA.balance - finalA.paid)}`;
  $("subB").textContent =
    `Heraf afkast: ${formatKr(finalB.balance - finalB.paid)}`;

  const comparison = compareScenarios(finalA.balance, finalB.balance);
  $("valD").textContent =
    signPrefix(comparison.difference) +
    formatKr(Math.abs(comparison.difference));
  $("subD").textContent = differenceText(
    comparison,
    { years, nameA, nameB },
    finalA.paid,
  );
}

function differenceText(
  { leader, percentMore },
  { years, nameA, nameB },
  totalPaid,
) {
  if (!leader) return "Ingen forskel";
  const [best, worst] = leader === "A" ? [nameA, nameB] : [nameB, nameA];
  return (
    `${best} giver ${formatDecimal(percentMore)} % mere end ${worst} efter ${years} år. ` +
    `Indbetalt i alt: ${formatKr(totalPaid)}`
  );
}

function renderTable(rowsA, rowsB) {
  $("tbody").innerHTML = rowsA
    .slice(1)
    .map((rowA, i) => {
      const rowB = rowsB[i + 1];
      const difference = rowA.balance - rowB.balance;
      return (
        `<tr><td>${rowA.year}</td>` +
        `<td>${formatNumber(rowA.paid)}</td>` +
        `<td class="ca">${formatNumber(rowA.balance)}</td>` +
        `<td class="cb">${formatNumber(rowB.balance)}</td>` +
        `<td>${signPrefix(difference) + formatNumber(Math.abs(difference))}</td></tr>`
      );
    })
    .join("");
}

function saveInputs() {
  try {
    const values = Object.fromEntries(INPUT_IDS.map((id) => [id, $(id).value]));
    localStorage.setItem(STORAGE_KEY, JSON.stringify(values));
  } catch {
    /* lagring kan være blokeret; siden virker uden */
  }
}

function restoreInputs() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || "null");
    if (!saved) return;
    INPUT_IDS.forEach((id) => {
      if (saved[id] != null) $(id).value = saved[id];
    });
  } catch {
    /* lagring kan være blokeret; brug standardværdier */
  }
}

restoreInputs();

// Vis beløb med tusindtalsseparator, når feltet forlades
AMOUNT_INPUT_IDS.forEach((id) =>
  $(id).addEventListener("blur", () => {
    $(id).value = formatNumber(Math.max(0, parseAmount($(id).value)));
  }),
);
INPUT_IDS.forEach((id) => {
  $(id).addEventListener("input", update);
  $(id).addEventListener("change", update);
});
update();
