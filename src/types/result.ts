/**
 * Result type for functional error handling.
 * Inspired by Rust's Result<T, E> and functional programming patterns.
 * 
 * This allows methods to return success/error states without throwing exceptions,
 * making error handling explicit and type-safe.
 */
export type Result<T, E = Error> =
  | { ok: true; value: T }
  | { ok: false; error: E };

/**
 * Creates a successful Result
 */
export function ok<T>(value: T): Result<T, never> {
  return { ok: true, value };
}

/**
 * Creates an error Result
 */
export function err<E>(error: E): Result<never, E> {
  return { ok: false, error };
}
