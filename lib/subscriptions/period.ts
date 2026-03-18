function addMonths(date: Date, months: number) {
  const d = new Date(date);
  const day = d.getDate();
  d.setMonth(d.getMonth() + months);
  // handle month rollover (e.g. Jan 31 -> Feb)
  if (d.getDate() < day) d.setDate(0);
  return d;
}

export function getMonthlyPeriodFrom(start: Date) {
  const periodStart = new Date(start);
  periodStart.setMilliseconds(0);
  const periodEnd = addMonths(periodStart, 1);
  return { periodStart, periodEnd };
}

