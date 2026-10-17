// Graf over opsparingens udvikling, tegnet som SVG, med tooltip ved hover/tryk.

import { escapeHtml, formatAxisValue, formatKr } from "./format.js";

// Svarer til viewBox="0 0 900 360" på <svg id="chart">
const WIDTH = 900;
const HEIGHT = 360;
const PADDING = { left: 70, right: 16, top: 16, bottom: 34 };
const PLOT_WIDTH = WIDTH - PADDING.left - PADDING.right;
const PLOT_HEIGHT = HEIGHT - PADDING.top - PADDING.bottom;

// Højst så mange vandrette gitterlinjer, før trinnet bliver større
const MAX_GRID_LINES = 6;
const TOOLTIP_OFFSET = 12;

/**
 * Tegner begge scenarier og det indbetalte beløb.
 * rowsA/rowsB er resultater fra simulateSavings med samme antal år.
 */
export function drawChart({
  svg,
  tooltip,
  container,
  rowsA,
  rowsB,
  nameA,
  nameB,
}) {
  const lastYear = rowsA.length - 1;
  const maxBalance = Math.max(
    ...rowsA.map((row) => row.balance),
    ...rowsB.map((row) => row.balance),
    1,
  );
  const { step, top } = niceAxis(maxBalance);
  const xAt = (year) =>
    PADDING.left + PLOT_WIDTH * (lastYear ? year / lastYear : 0);
  const yAt = (value) => PADDING.top + PLOT_HEIGHT * (1 - value / top);

  const linePath = (rows, key) =>
    rows
      .map(
        (row, i) =>
          (i ? "L" : "M") + xAt(i).toFixed(1) + " " + yAt(row[key]).toFixed(1),
      )
      .join(" ");
  const areaPath = (rows) =>
    linePath(rows, "balance") +
    ` L${xAt(lastYear)} ${yAt(0)} L${xAt(0)} ${yAt(0)} Z`;

  let svgContent = "";
  for (let value = 0; value <= top + 1e-6; value += step) {
    svgContent += `<line x1="${PADDING.left}" x2="${WIDTH - PADDING.right}" y1="${yAt(value)}" y2="${yAt(value)}" stroke="var(--line)" stroke-width="1"/>`;
    svgContent += `<text x="${PADDING.left - 8}" y="${yAt(value) + 4}" text-anchor="end">${formatAxisValue(value)}</text>`;
  }
  svgContent += yearLabels(lastYear, xAt);
  svgContent += `<path d="${areaPath(rowsA)}" fill="var(--a-soft)" stroke="none"/>`;
  svgContent += `<path d="${linePath(rowsA, "paid")}" fill="none" stroke="var(--muted)" stroke-width="1.5" stroke-dasharray="5 4"/>`;
  svgContent += `<path class="ln" d="${linePath(rowsB, "balance")}" fill="none" stroke="var(--b)" stroke-width="2.5" stroke-linejoin="round"/>`;
  svgContent += `<path class="ln" d="${linePath(rowsA, "balance")}" fill="none" stroke="var(--a)" stroke-width="2.5" stroke-linejoin="round"/>`;
  svgContent += `<circle cx="${xAt(lastYear)}" cy="${yAt(rowsA[lastYear].balance)}" r="4.5" fill="var(--a)"/>`;
  svgContent += `<circle cx="${xAt(lastYear)}" cy="${yAt(rowsB[lastYear].balance)}" r="4.5" fill="var(--b)"/>`;
  svgContent += `<line id="hov" x1="0" x2="0" y1="${PADDING.top}" y2="${HEIGHT - PADDING.bottom}" stroke="var(--muted)" stroke-width="1" visibility="hidden"/>`;
  svgContent += `<rect x="${PADDING.left}" y="${PADDING.top}" width="${PLOT_WIDTH}" height="${PLOT_HEIGHT}" fill="transparent" id="hit"/>`;
  svg.innerHTML = svgContent;

  attachTooltip({
    svg,
    tooltip,
    container,
    rowsA,
    rowsB,
    nameA,
    nameB,
    lastYear,
    xAt,
  });
}

/** Vælger et pænt trin (fx 250.000 eller 500.000) og en afrundet top for y-aksen. */
function niceAxis(maxValue) {
  const magnitude = Math.pow(10, Math.floor(Math.log10(maxValue)));
  const candidates = [1, 2, 2.5, 5, 10].map(
    (factor) => (factor * magnitude) / 2,
  );
  const step =
    candidates.find((s) => maxValue / s <= MAX_GRID_LINES) || magnitude;
  return { step, top: Math.ceil(maxValue / step) * step };
}

/** Årstal under x-aksen; færre etiketter jo flere år. Sidste år vises altid. */
function yearLabels(lastYear, xAt) {
  const yearStep = lastYear <= 10 ? 1 : lastYear <= 25 ? 5 : 10;
  const label = (year) =>
    `<text x="${xAt(year)}" y="${HEIGHT - 10}" text-anchor="middle">${year}</text>`;
  let labels = "";
  for (let year = 0; year <= lastYear; year += yearStep) labels += label(year);
  if (lastYear % yearStep) labels += label(lastYear);
  return labels;
}

function attachTooltip({
  svg,
  tooltip,
  container,
  rowsA,
  rowsB,
  nameA,
  nameB,
  lastYear,
  xAt,
}) {
  const hoverLine = svg.querySelector("#hov");
  const hitArea = svg.querySelector("#hit");

  function showAt(event) {
    const svgBox = svg.getBoundingClientRect();
    const pointerX = (event.clientX - svgBox.left) * (WIDTH / svgBox.width);
    const year = Math.max(
      0,
      Math.min(
        lastYear,
        Math.round((pointerX - PADDING.left) / (PLOT_WIDTH / (lastYear || 1))),
      ),
    );
    hoverLine.setAttribute("x1", xAt(year));
    hoverLine.setAttribute("x2", xAt(year));
    hoverLine.setAttribute("visibility", "visible");

    tooltip.innerHTML =
      `<b>År ${year}</b><br>` +
      `<span style="color:var(--a)">${escapeHtml(nameA)}: ${formatKr(rowsA[year].balance)}</span><br>` +
      `<span style="color:var(--b)">${escapeHtml(nameB)}: ${formatKr(rowsB[year].balance)}</span><br>` +
      `Indbetalt: ${formatKr(rowsA[year].paid)}`;
    tooltip.hidden = false;

    // Placér til højre for markøren, eller til venstre hvis der ikke er plads
    const containerBox = container.getBoundingClientRect();
    let left = event.clientX - containerBox.left + TOOLTIP_OFFSET;
    if (left + tooltip.offsetWidth > containerBox.width) {
      left =
        event.clientX -
        containerBox.left -
        tooltip.offsetWidth -
        TOOLTIP_OFFSET;
    }
    tooltip.style.left = Math.max(0, left) + "px";
    tooltip.style.top =
      Math.max(
        0,
        event.clientY - containerBox.top - tooltip.offsetHeight - 10,
      ) + "px";
  }

  hitArea.addEventListener("pointermove", showAt);
  hitArea.addEventListener("pointerdown", showAt);
  hitArea.addEventListener("pointerleave", () => {
    tooltip.hidden = true;
    hoverLine.setAttribute("visibility", "hidden");
  });
}
