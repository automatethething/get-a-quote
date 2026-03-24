export const DEFAULT_LOCATION_AREA = 'Remote / Online only';

export function normalizeLocationArea(value) {
  const trimmed = (value ?? '').trim();
  return trimmed || DEFAULT_LOCATION_AREA;
}
