const timeZone = "America/Santiago";

const chileDateTimeFormatter = new Intl.DateTimeFormat("en-CA", {
  timeZone,
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
  hourCycle: "h23",
});

export function parseChileLocalDateTime(value: string) {
  const match =
    /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})$/.exec(value);

  if (!match) {
    return new Date(Number.NaN);
  }

  const [, yearText, monthText, dayText, hourText, minuteText] = match;
  const year = Number(yearText);
  const month = Number(monthText);
  const day = Number(dayText);
  const hour = Number(hourText);
  const minute = Number(minuteText);
  const localAsUtc = Date.UTC(year, month - 1, day, hour, minute);
  const renderedParts = chileDateTimeFormatter.formatToParts(new Date(localAsUtc));
  const part = (type: Intl.DateTimeFormatPartTypes) =>
    Number(renderedParts.find((item) => item.type === type)?.value);
  const renderedAsUtc = Date.UTC(
    part("year"),
    part("month") - 1,
    part("day"),
    part("hour"),
    part("minute"),
  );
  const result = new Date(localAsUtc + (localAsUtc - renderedAsUtc));
  const verifiedParts = chileDateTimeFormatter.formatToParts(result);
  const verified = verifiedParts
    .filter(({ type }) =>
      ["year", "month", "day", "hour", "minute"].includes(type),
    )
    .map(({ value }) => value)
    .join("-");
  const expected = [
    yearText,
    monthText,
    dayText,
    hourText,
    minuteText,
  ].join("-");

  return verified === expected ? result : new Date(Number.NaN);
}

export function formatChileLocalDateTime(value: Date | null | undefined) {
  if (!value) {
    return "";
  }

  const parts = chileDateTimeFormatter.formatToParts(value);
  const part = (type: Intl.DateTimeFormatPartTypes) =>
    parts.find((item) => item.type === type)?.value ?? "";

  return `${part("year")}-${part("month")}-${part("day")}T${part("hour")}:${part("minute")}`;
}

export function formatDate(value: Date | null | undefined) {
  if (!value) {
    return "Sin fecha";
  }

  return new Intl.DateTimeFormat("es-CL", {
    dateStyle: "medium",
    timeZone,
  }).format(value);
}

export function formatDateInput(value: Date | null | undefined) {
  return value ? value.toISOString().slice(0, 10) : "";
}

export function formatClp(
  value: number | { toString(): string } | null | undefined,
) {
  if (value === null || value === undefined) {
    return "Sin monto";
  }

  return new Intl.NumberFormat("es-CL", {
    style: "currency",
    currency: "CLP",
    maximumFractionDigits: 0,
  }).format(Number(value));
}

export function formatDateTime(value: Date | null | undefined) {
  if (!value) {
    return "Sin fecha";
  }

  return new Intl.DateTimeFormat("es-CL", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone,
  }).format(value);
}

export function getChileDayBounds(now = new Date()) {
  const parts = chileDateTimeFormatter.formatToParts(now);
  const part = (type: Intl.DateTimeFormatPartTypes) =>
    parts.find((item) => item.type === type)?.value ?? "";
  const year = part("year");
  const month = part("month");
  const day = part("day");
  const nextDate = new Date(Date.UTC(Number(year), Number(month) - 1, Number(day) + 1));
  const nextDateText = nextDate.toISOString().slice(0, 10);

  return {
    start: parseChileLocalDateTime(`${year}-${month}-${day}T00:00`),
    end: parseChileLocalDateTime(`${nextDateText}T00:00`),
  };
}
