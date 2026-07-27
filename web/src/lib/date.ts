const defaultExactDateOptions: Intl.DateTimeFormatOptions = {
  day: "2-digit",
  month: "short",
  year: "numeric",
};

export function formatExactDate(
  value: string | Date,
  options: Intl.DateTimeFormatOptions = defaultExactDateOptions,
) {
  return new Intl.DateTimeFormat("pt-BR", options).format(new Date(value));
}

export function formatRelativeDate(
  value: string | Date,
  exactDateOptions: Intl.DateTimeFormatOptions = defaultExactDateOptions,
) {
  const date = new Date(value);
  const elapsedMs = Math.max(0, Date.now() - date.getTime());
  const elapsedMinutes = Math.floor(elapsedMs / 60_000);
  const elapsedHours = Math.floor(elapsedMs / 3_600_000);
  const elapsedDays = Math.floor(elapsedMs / 86_400_000);

  if (elapsedMinutes < 1) return "agora";
  if (elapsedMinutes < 60) {
    return `há ${elapsedMinutes} ${elapsedMinutes === 1 ? "minuto" : "minutos"}`;
  }
  if (elapsedHours < 24) {
    return `há ${elapsedHours} ${elapsedHours === 1 ? "hora" : "horas"}`;
  }
  if (elapsedDays === 1) return "ontem";
  if (elapsedDays <= 5) return `há ${elapsedDays} dias`;

  return formatExactDate(date, exactDateOptions);
}
