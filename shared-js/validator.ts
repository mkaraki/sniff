import psl from 'psl';

// from: https://github.com/mkaraki/webtools/blob/master/js/src/utils/net/ip_address.ts
const isIPv4Address = (addr: string): boolean => {
  if (!/^([0-2]?\d?\d\.){3}[0-2]?\d?\d$/.test(addr))
    return false;

  const splitted = addr.split('.') as [string, string, string, string];
  for (let i = 0; i < 4; i++) {
    const octet = parseInt(splitted[i] as string);
    if (octet < 0 || octet > 255) return false;
  }

  return true;
}

const isIPv6AddressRegexMatch = (addr: string): boolean => {
  return /^([0-9a-f]{0,4}:)([0-9a-f]{1,4}:?|::){0,6}(:[0-9a-f]{0,4})$/i.test(addr);
}

const isIPv6Address = (addr: string): boolean => {
  if (!/^([0-9a-f]{0,4}:)([0-9a-f]{1,4}:?|::){0,6}(:[0-9a-f]{0,4})$/i.test(addr))
    return false;

  const cvt_res = convertToIPv6AddressWithoutEmpty(addr);
  if (cvt_res === null)
    return false;

  if (!isIPv6AddressWithoutEmpty(cvt_res))
    return false;

  return true;
}

const isIPv6AddressWithoutEmpty = (addr: string): boolean => {
  return /^([0-9a-f]{4}:){7}[0-9a-f]{4}$/i.test(addr);
}

const convertToIPv6AddressWithoutEmptyAndSeparator = (fromIp: string): string | null => {
  if (!isIPv6AddressRegexMatch(fromIp))
    return null;

  const shorten = fromIp.split('::') as ([string, string] | [string]);
  if (shorten.length > 2) {
    return null;
  }
  if (shorten.length == 1) {
    // No shorten (`::` not found)
    const octets = shorten[0].split(':');
    if (octets.length != 8) {
      return null;
    }
    let result = '';
    octets.forEach(octet => {
      if (!/^[0-9a-fA-F]{1,4}$/i.test(octet)) return null;
      result += (octet.padStart(4, '0'));
    });
    return result;
  }
  const beg = shorten[0].split(':');
  const end = shorten.length == 2 ? shorten[1].split(':') : [];
  const lsec = 8 - beg.length - end.length;
  let secs = '';
  [beg, Array(lsec).fill('0'), end].forEach(i => i.forEach(v => {
    secs += ('0'.repeat(4 - v.length) + v);
  }))
  return secs;
}

const convertToIPv6AddressWithoutEmpty = (fromIp: string): string | null => {
  if (!isIPv6AddressRegexMatch(fromIp))
    return null;
  const nonSeparator = convertToIPv6AddressWithoutEmptyAndSeparator(fromIp);
  if (nonSeparator === null)
    return null;

  let result = '';
  for (let i = 0; i < 8; i++) {
    result += nonSeparator.substring(i * 4, (i * 4) + 4) + ':';
  }
  result = result.substring(0, result.length - 1);
  return result;
}

const getPtrAcceptableAddress = (fromIp: string): string | null => {
  if (isIPv4Address(fromIp)) {
    // v4 convert
    const splitted = fromIp.split('.') as [string, string, string, string];
    return `${parseInt(splitted[3])}.${parseInt(splitted[2])}.${parseInt(splitted[1])}.${parseInt(splitted[0])}`
        + '.in-addr.arpa.';
  } else if (isIPv6Address(fromIp)) {
    // v6 convert
    const secs = convertToIPv6AddressWithoutEmptyAndSeparator(fromIp);
    if (secs === null)
      return null;
    return secs.split('').reverse().join('.') + '.ip6.arpa.';
  } else {
    return null;
  }
}
// end from: https://github.com/mkaraki/webtools/blob/master/js/src/utils/net/ip_address.ts

const isIp = (target: string|null|undefined) => {
  if (target === null || target === undefined)
    return false;

  if (isIPv4Address(target))
    return true;

  if (isIPv6Address(target))
    return true;

  return false;
};


const isDomain = (target: string|null|undefined) => {
  if (target === null || target === undefined)
    return false;

  const pattern = /^[0-9a-zA-Z_\-.]+\.[0-9a-zA-Z_\-]{2,}\.?$/
  if (pattern.test(target)) {
    return true;
  }

  // Has valid TLD
  if (psl.isValid(target)) {
    return true;
  }

  return false;
}

export {
  isIPv4Address,
  isIPv6Address,
  getPtrAcceptableAddress,
  isIp,
  isDomain,
}