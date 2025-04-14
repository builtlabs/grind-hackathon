export const COOKIE_MAX_AGE = 60 * 60 * 24 * 7;
export const COOKIE_BASE = 'built-labs.grind';
export const THEME_COOKIE_KEY = `${COOKIE_BASE}.theme`;

export function setCookie(key: string, value: string) {
  document.cookie = `${key}=${value}; path=/; max-age=${COOKIE_MAX_AGE}`;
}

export function getCookie(name: string) {
  const match = new RegExp(`(^| )${name}=([^;]+)`).exec(document.cookie);
  if (match) return match[2];
  return null;
}
