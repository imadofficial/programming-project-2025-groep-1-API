const { UTApi } = require('uploadthing/server');

const utapi = new UTApi();

// This module provides a function to generate a unique file key for UploadThing uploads
const SQIds = require("sqids");
const { defaultOptions } = require("sqids");

function djb2(s) {
  let h = 5381;
  let i = s.length;
  while (i) {
    h = (h * 33) ^ s.charCodeAt(--i);
  }
  return (h & 0xbfffffff) | ((h >>> 1) & 0x40000000);
}

// A simple function to shuffle the alphabet for the Sqids
function shuffle(str, seed) {
  const chars = str.split("");
  const seedNum = djb2(seed);

  let temp;
  let j;
  for (let i = 0; i < chars.length; i++) {
    j = ((seedNum % (i + 1)) + i) % chars.length;
    temp = chars[i];
    chars[i] = chars[j];
    chars[j] = temp;
  }

  return chars.join("");
}

// Helper for base64 encoding (URL safe)
function encodeBase64(str) {
  return Buffer.from(str, "utf8")
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

function generateKey(appId, fileSeed) {
  // Hash and Encode the parts and apiKey as sqids
  const alphabet = shuffle(defaultOptions.alphabet, appId);

  const encodedAppId = new SQIds({ alphabet, minLength: 12 }).encode([
    Math.abs(djb2(appId)),
  ]);

  // We use a base64 encoding here to ensure the file seed is url safe, but
  // you can do this however you want
  const encodedFileSeed = encodeBase64(fileSeed);

  return `${encodedAppId}${encodedFileSeed}`;
}

module.exports = { utapi, generateKey };