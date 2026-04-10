function normalizeToUtcDate(value) {
  if (!value) {
    return null;
  }

  if (value instanceof Date) {
    return new Date(Date.UTC(value.getUTCFullYear(), value.getUTCMonth(), value.getUTCDate()));
  }

  const stringValue = String(value);
  const datePart = stringValue.includes("T") ? stringValue.split("T")[0] : stringValue;
  const [year, month, day] = datePart.split("-").map(Number);

  if (!year || !month || !day) {
    return null;
  }

  return new Date(Date.UTC(year, month - 1, day));
}

function formatDateKey(value) {
  const date = normalizeToUtcDate(value);
  return date ? date.toISOString().slice(0, 10) : null;
}

function getMonthBounds(year, month) {
  return {
    start: new Date(Date.UTC(year, month - 1, 1)),
    end: new Date(Date.UTC(year, month, 0)),
  };
}

function enumerateDateKeys(startDate, endDate) {
  const start = normalizeToUtcDate(startDate);
  const end = normalizeToUtcDate(endDate);

  if (!start || !end || start > end) {
    return [];
  }

  const dates = [];
  for (let current = new Date(start); current <= end; current.setUTCDate(current.getUTCDate() + 1)) {
    dates.push(formatDateKey(current));
  }

  return dates;
}

function getOverlapRange(startA, endA, startB, endB) {
  const normalizedStartA = normalizeToUtcDate(startA);
  const normalizedEndA = normalizeToUtcDate(endA);
  const normalizedStartB = normalizeToUtcDate(startB);
  const normalizedEndB = normalizeToUtcDate(endB);

  if (!normalizedStartA || !normalizedEndA || !normalizedStartB || !normalizedEndB) {
    return null;
  }

  const start = normalizedStartA > normalizedStartB ? normalizedStartA : normalizedStartB;
  const end = normalizedEndA < normalizedEndB ? normalizedEndA : normalizedEndB;

  if (start > end) {
    return null;
  }

  return { start, end };
}

module.exports = {
  enumerateDateKeys,
  formatDateKey,
  getMonthBounds,
  getOverlapRange,
  normalizeToUtcDate,
};
