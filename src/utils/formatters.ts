export function formatRevolutUsername(username?: string): string {
  if (!username) return '';
  return username.startsWith('@') ? username : `@${username}`;
}
