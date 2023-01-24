import { readFileSync } from 'fs';
import { ValidationError } from './error';
import _decamelize from './lib/decamelize';

const allowedTypes = new Set(['string', 'number', 'boolean']);

export function isSameType(type: string, reference: string): boolean {
  return allowedTypes.has(type) && type === reference;
}

export function decamelize(value: string) {
  return _decamelize(value, { separator: '-' });
}

export function parseJSONFile(path: string): [string, unknown][] {
  try {
    const file = readFileSync(path, { encoding: 'utf8' });
    return Object.entries(JSON.parse(file));
  } catch (error) {
    throw new ValidationError(`${path} is not a valid JSON file`);
  }
}
