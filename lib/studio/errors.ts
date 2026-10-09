/** Thrown when the person (or their agent) isn't allowed to do something. The message says what to do instead. */
export class PermissionError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "PermissionError";
  }
}

/** Thrown when input isn't acceptable. The message says how to fix it. */
export class ValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ValidationError";
  }
}
