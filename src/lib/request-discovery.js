export function availableOpenCategories(requests) {
  return [...new Set((requests ?? []).map((request) => request.category).filter(Boolean))].sort();
}

export function truncateDescription(description, maxLength = 140) {
  const value = (description ?? '').trim();
  if (value.length <= maxLength) return value;
  return `${value.slice(0, maxLength - 1)}…`;
}

export function buildRequestShareText(request) {
  return `${request.title} · ${request.category} · ${request.location_area} · Bid on this project in less than 3 minutes`;
}
