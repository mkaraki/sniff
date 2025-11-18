import {test, expect} from 'bun:test';
import {isIPv4Address, isIPv6Address, getPtrAcceptableAddress, isIp, isDomain} from "./validator.ts";

test('isIPv4Address test valid', () => {
    expect(isIPv4Address('1.1.1.1')).toEqual(true);
    expect(isIPv4Address('255.255.255.255')).toEqual(true);
    expect(isIPv4Address('0.0.0.0')).toEqual(true);

    // This must be invalid, but now allow this.
    // To be fixed.
    expect(isIPv4Address('127.000.000.001')).toEqual(true);
});

test('isIPv4Address test invalid', () => {
    expect(isIPv4Address('256.256.256.256')).toEqual(false);
    expect(isIPv4Address('256.0.0.0')).toEqual(false);
    expect(isIPv4Address('123.123')).toEqual(false);
    expect(isIPv4Address('123..123')).toEqual(false);
    expect(isIPv4Address('1024.0.0.1')).toEqual(false);
});

test('isIPv6Address test valid', () => {
    expect(isIPv6Address('::')).toEqual(true);
    expect(isIPv6Address('::1')).toEqual(true);
    expect(isIPv6Address('2001:0db8:85a3:0000:0000:8a2e:0370:7334')).toEqual(true);
    expect(isIPv6Address('2001:db8:85a3:0:0:8a2e:370:7334')).toEqual(true);
    expect(isIPv6Address('2001:db8:85a3::8a2e:370:7334')).toEqual(true);
});

test('isIPv6Address test invalid', () => {
    expect(isIPv6Address('2001:db8::85a3::8a2e')).toEqual(false);
    expect(isIPv6Address('123.123.123.123')).toEqual(false);
    expect(isIPv6Address('2001:0db8:85a3:0000:0000::8a2e:0370:7334')).toEqual(false);
    expect(isIPv6Address('2001:0db8:85a3:0000:0000:8a2e:0370:7334:5212')).toEqual(false);

    // This is not supported and not planned to support
    expect(isIPv6Address('::ffff:192.0.2.128')).toEqual(false);
});

test('getPtrAcceptableAddress for IPv4', () => {
    expect(getPtrAcceptableAddress('192.0.2.1')).toEqual('1.2.0.192.in-addr.arpa.');
});

test('getPtrAcceptableAddress for IPv6', () => {
    expect(getPtrAcceptableAddress('2001:db8::567:89ab'))
        .toEqual('b.a.9.8.7.6.5.0.0.0.0.0.0.0.0.0.0.0.0.0.0.0.0.0.8.b.d.0.1.0.0.2.ip6.arpa.');
});

test('getPtrAcceptableAddress for invalid', () => {
    expect(getPtrAcceptableAddress('invalid-address')).toBeNull();
});

test('isIp', () => {
    expect(isIp('1.1.1.1')).toEqual(true);
    expect(isIp('::1')).toEqual(true);
    expect(isIp('::')).toEqual(true);
    expect(isIp('::1')).toEqual(true);
    expect(isIp('2001:0db8:85a3:0000:0000:8a2e:0370:7334')).toEqual(true);
    expect(isIp('2001:db8:85a3:0:0:8a2e:370:7334')).toEqual(true);
    expect(isIp('2001:db8:85a3::8a2e:370:7334')).toEqual(true);
    expect(isIp('not-an-ip')).toEqual(false);
    expect(isIp(null)).toEqual(false);
    expect(isIp(undefined)).toEqual(false);
});

test('isDomain', () => {
    expect(isDomain('example.com')).toEqual(true);
    expect(isDomain('sub.example.co.uk')).toEqual(true);

    // psl.isValid considers this valid
    expect(isDomain('example')).toEqual(false);
    expect(isDomain('1.1.1.1')).toEqual(false);

    // Completely invalid
    expect(isDomain('not a domain')).toEqual(false);
    expect(isDomain(null)).toEqual(false);
    expect(isDomain(undefined)).toEqual(false);
});
