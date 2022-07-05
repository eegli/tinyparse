const allowedTypes = new Set(['string', 'number', 'boolean']);

export function isSameType(type: string, reference: string): boolean {
  return allowedTypes.has(type) && type === reference;
}
