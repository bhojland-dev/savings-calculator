// Formatering og læsning af tal på dansk.

const wholeNumber = new Intl.NumberFormat("da-DK", {
  maximumFractionDigits: 0,
});
const decimalNumber = new Intl.NumberFormat("da-DK", {
  maximumFractionDigits: 2,
});

const MINUS_SIGN = "−";

/** 1234567 → "1.234.567" */
export function formatNumber(value) {
  return wholeNumber.format(Math.round(value));
}

/** 1234567 → "1.234.567 kr." */
export function formatKr(value) {
  return formatNumber(value) + " kr.";
}

/** 6.6 → "6,6" */
export function formatDecimal(value) {
  return decimalNumber.format(value);
}

/** Fortegn foran et allerede formateret tal: "+", "−" eller intet ved 0. */
export function signPrefix(value) {
  if (value > 0) return "+";
  if (value < 0) return MINUS_SIGN;
  return "";
}

/** Kort aksetekst: 1500000 → "1,5 mio.", 500000 → "500t". */
export function formatAxisValue(value) {
  const size = Math.abs(value);
  if (size >= 1e6) return formatDecimal(Math.round(value / 1e5) / 10) + " mio.";
  if (size >= 1e3) return formatNumber(value / 1e3) + "t";
  return wholeNumber.format(value);
}

/**
 * Læser et kronebeløb: punktum er tusindtalsseparator, komma er decimal.
 * "1.500.000" → 1500000. Tom eller ugyldig tekst giver 0.
 */
export function parseAmount(text) {
  return toNumber(stripSpaces(text).replace(/\./g, "").replace(",", "."));
}

/**
 * Læser procent eller år: både komma og punktum tæller som decimal.
 * "0,4" → 0.4. Tom eller ugyldig tekst giver 0.
 */
export function parseDecimal(text) {
  return toNumber(stripSpaces(text).replace(",", "."));
}

export function escapeHtml(text) {
  const entities = { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" };
  return String(text).replace(/[&<>"]/g, (char) => entities[char]);
}

function stripSpaces(text) {
  return String(text).trim().replace(/\s/g, "");
}

function toNumber(text) {
  const value = parseFloat(text);
  return isFinite(value) ? value : 0;
}
