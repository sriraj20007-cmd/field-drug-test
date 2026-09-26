/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Calculates SHA-256 cryptographic hash of a given string (e.g. Base64 data URL)
 * Using the standard browser Web Crypto API.
 */
export async function calculateSha256(input: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(input);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hexString = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  return hexString;
}

/**
 * Verifies if an image data string matches an expected SHA-256 hash.
 */
export async function verifyImageHash(
  imageData: string,
  expectedHashHex: string
): Promise<{
  isValid: boolean;
  computedHash: string;
  expectedHash: string;
}> {
  const computedHash = await calculateSha256(imageData);
  const isValid = computedHash.toLowerCase() === expectedHashHex.toLowerCase();
  return {
    isValid,
    computedHash,
    expectedHash: expectedHashHex,
  };
}

/**
 * Creates an altered version of a Data URL (for testing and demonstrating tamper-evidence).
 * It flips a minor character in the Base64 payload, simulating altered or corrupted evidence.
 */
export function tamperDataUrl(dataUrl: string): string {
  const commaIndex = dataUrl.indexOf(',');
  if (commaIndex === -1) return dataUrl + '_tampered';

  const prefix = dataUrl.substring(0, commaIndex + 1);
  const base64 = dataUrl.substring(commaIndex + 1);

  if (base64.length < 20) return prefix + base64 + 'A';

  // Invert one character in the middle
  const targetIdx = Math.floor(base64.length / 2);
  const origChar = base64.charAt(targetIdx);
  const replacementChar = origChar === 'A' ? 'B' : 'A';
  const tamperedBase64 =
    base64.substring(0, targetIdx) +
    replacementChar +
    base64.substring(targetIdx + 1);

  return prefix + tamperedBase64;
}

/**
 * Formats a 64-char hash into readable blocks for forensic audit reports.
 */
export function formatHashDisplay(hash: string): string {
  return hash.match(/.{1,8}/g)?.join(' ') || hash;
}
