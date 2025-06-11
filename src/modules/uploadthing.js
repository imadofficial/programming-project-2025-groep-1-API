const { SQIds, defaultOptions } = require("sqids");
require("dotenv").config();

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

async function uploadFile(file) {
  const searchParams = new URLSearchParams({
    expires: Date.now() + 1000 * 60 * 10, // 10 minutes
    "x-u-identifier": "gt0kk4fbet",
    "x-ut-file-name": file.originalname,
    "x-ut-file-size": file.size,
  });

  const fileKey = generateKey(
    "gt0kk4fbet",
    file.fieldname + file.originalname + file.size + file.mimetype + 42
  );

  const url = new URL(
    `https://sea1.ingest.uploadthing.com/${fileKey}`
  );
  url.search = searchParams.toString();

  const signature = `hmac-sha256=${hmacSha256(url, process.env.UPLOADTHING_TOKEN)}`;
  url.searchParams.append("signature", signature);

  const formData = new FormData();
  formData.append("file", file);

  const response = await fetch(url, {
    method: "PUT",
    body: formData,
  });

  if (!response.ok) {
    throw new Error(`Upload failed: ${response.statusText}`);
  }

  return response.json();
}

module.exports = { uploadFile };