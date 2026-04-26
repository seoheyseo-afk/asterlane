import type { PrivateNotes } from "../types";

const encoder = new TextEncoder();
const decoder = new TextDecoder();
const ITERATIONS = 310000;

function bytesToBase64(bytes: Uint8Array) {
  let binary = "";
  bytes.forEach((byte) => {
    binary += String.fromCharCode(byte);
  });
  return btoa(binary);
}

function base64ToBytes(value: string) {
  const binary = atob(value);
  const bytes = new Uint8Array(binary.length);
  for (let index = 0; index < binary.length; index += 1) {
    bytes[index] = binary.charCodeAt(index);
  }
  return bytes;
}

function toArrayBuffer(bytes: Uint8Array) {
  return bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength) as ArrayBuffer;
}

async function deriveAesKey(passcode: string, salt: Uint8Array, iterations: number) {
  const baseKey = await crypto.subtle.importKey("raw", toArrayBuffer(encoder.encode(passcode)), "PBKDF2", false, [
    "deriveKey",
  ]);

  return crypto.subtle.deriveKey(
    {
      name: "PBKDF2",
      hash: "SHA-256",
      salt: toArrayBuffer(salt),
      iterations,
    },
    baseKey,
    {
      name: "AES-GCM",
      length: 256,
    },
    false,
    ["encrypt", "decrypt"],
  );
}

export async function encryptNote(note: string, passcode: string): Promise<PrivateNotes> {
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const key = await deriveAesKey(passcode, salt, ITERATIONS);
  const encrypted = await crypto.subtle.encrypt(
    { name: "AES-GCM", iv: toArrayBuffer(iv) },
    key,
    toArrayBuffer(encoder.encode(note)),
  );

  return {
    algorithm: "PBKDF2-SHA-256/AES-GCM",
    iterations: ITERATIONS,
    salt: bytesToBase64(salt),
    iv: bytesToBase64(iv),
    ciphertext: bytesToBase64(new Uint8Array(encrypted)),
  };
}

export async function decryptNote(privateNotes: PrivateNotes, passcode: string) {
  const salt = base64ToBytes(privateNotes.salt);
  const iv = base64ToBytes(privateNotes.iv);
  const key = await deriveAesKey(passcode, salt, privateNotes.iterations);
  const decrypted = await crypto.subtle.decrypt(
    {
      name: "AES-GCM",
      iv: toArrayBuffer(iv),
    },
    key,
    toArrayBuffer(base64ToBytes(privateNotes.ciphertext)),
  );

  return decoder.decode(decrypted);
}
