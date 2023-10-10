export function isJwtTokenStructureValid(token: string) {
  return token?.split('.').length === 3;
}
