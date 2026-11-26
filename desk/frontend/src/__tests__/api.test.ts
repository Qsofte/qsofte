import { describe, expect, it } from 'vitest';
import { errorMessage } from '../api';

describe('server errors become sentences', () => {
  it('passes our own messages through', () =>
    expect(errorMessage({ detail: 'Sign in to use the Desk.' }, 401)).toBe('Sign in to use the Desk.'));
  it('reads validation errors', () =>
    expect(
      errorMessage({ detail: [{ loc: ['body', 'so_what'], msg: "Value error, 'So what for Qsofte' is required" }] }, 422),
    ).toBe("'So what for Qsofte' is required"));
  it('names the field for other validation errors', () =>
    expect(errorMessage({ detail: [{ loc: ['body', 'source_url'], msg: 'Value error, Links must start with http:// or https://' }] }, 422)).toBe(
      'source_url: Links must start with http:// or https://',
    ));
  it('falls back for server failures', () => expect(errorMessage(null, 502)).toMatch(/server/));
});
