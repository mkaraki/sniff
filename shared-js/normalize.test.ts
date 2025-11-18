import {test, expect} from 'bun:test';
import {normalizeDomain} from "./normalize.ts";

test('normalizeDomain google.com.', () => {
    expect(normalizeDomain('google.com.')).toBe('google.com');
});

test('normalizeDomain google.com', () => {
    expect(normalizeDomain('google.com')).toBe('google.com');
});