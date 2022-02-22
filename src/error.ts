export class ValidationError extends Error {
  constructor(err: string) {
    super(err);
    this.name = 'ValidationError';
    Object.setPrototypeOf(this, ValidationError.prototype);
  }
}

export function throwErr(message: string): never {
  throw new ValidationError(message);
}
