"use node";

import { createHash, randomBytes, scrypt, timingSafeEqual } from "node:crypto";

import { v } from "convex/values";

import { action } from "./_generated/server";

export const hashPassword = action({
  args: { password: v.string() },
  handler: async (_, { password }) => {
    const salt = randomBytes(16).toString("hex");
    const hash = await scryptAsync(password, salt);
    return `${salt}:${hash.toString("hex")}`;
  },
});

export const verifyPassword = action({
  args: {
    password: v.string(),
    storedHash: v.string(),
  },
  handler: async (_, { password, storedHash }) => {
    const [salt, hashHex] = storedHash.split(":") as [string, string];
    const stored = Buffer.from(hashHex, "hex");
    const derived = await scryptAsync(password, salt);
    return timingSafeEqual(stored, derived);
  },
});

export const generateApiKey = action({
  args: {},
  handler: async () => {
    const raw = randomBytes(32).toString("base64");
    const hash = createHash("sha256").update(raw).digest("hex");
    const prefix = raw.slice(0, 8);
    return { raw, hash, prefix };
  },
});

export const hashApiKey = action({
  args: { key: v.string() },
  handler: async (_, { key }) => {
    return createHash("sha256").update(key).digest("hex");
  },
});

function scryptAsync(password: string, salt: string): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    scrypt(password, salt, 64, (err, derivedKey) => {
      if (err) return reject(err);
      resolve(derivedKey as Buffer);
    });
  });
}
