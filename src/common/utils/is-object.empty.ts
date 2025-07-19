export function isObjectEmpty(object: any) {
  if (typeof object !== 'object') return true;

  if (Object.keys(object).length === 0) return true;

  return false;
}
