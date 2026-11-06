const chileDateFormatter = new Intl.DateTimeFormat("en-CA", {
  timeZone: "America/Santiago",
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
});

export function calculateEstimatedMargin(price: number, cost: number) {
  return price - cost;
}

export function getChileDateKey(value: Date) {
  const parts = chileDateFormatter.formatToParts(value);
  const part = (type: Intl.DateTimeFormatPartTypes) =>
    parts.find((item) => item.type === type)?.value ?? "";

  return `${part("year")}-${part("month")}-${part("day")}`;
}

export function isQuoteExpired(expirationDate: Date, now = new Date()) {
  return expirationDate.toISOString().slice(0, 10) < getChileDateKey(now);
}

export function getChileYear(value: Date) {
  return Number(getChileDateKey(value).slice(0, 4));
}
