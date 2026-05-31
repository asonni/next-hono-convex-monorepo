import { v } from "convex/values";

import { mutation, query } from "./_generated/server";

export const listByUser = query({
  args: { userId: v.id("users") },
  handler: async ({ db }, { userId }) => {
    const keys = await db
      .query("apiKeys")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .collect();

    return keys.map((key) => ({
      _id: key._id,
      name: key.name,
      keyPrefix: key.keyPrefix,
      createdAt: key.createdAt,
      expiresAt: key.expiresAt,
    }));
  },
});

export const getByHash = query({
  args: { keyHash: v.string() },
  handler: async ({ db }, { keyHash }) => {
    const apiKey = await db
      .query("apiKeys")
      .withIndex("by_keyHash", (q) => q.eq("keyHash", keyHash))
      .unique();

    if (!apiKey) return null;

    const user = await db.get(apiKey.userId);
    if (!user) return null;

    return {
      ...apiKey,
      user: { id: user._id, role: user.role, email: user.email },
    };
  },
});

export const create = mutation({
  args: {
    userId: v.id("users"),
    name: v.string(),
    keyHash: v.string(),
    keyPrefix: v.string(),
    expiresAt: v.optional(v.union(v.number(), v.null())),
  },
  handler: async ({ db }, { userId, name, keyHash, keyPrefix, expiresAt }) => {
    const id = await db.insert("apiKeys", {
      userId,
      name,
      keyHash,
      keyPrefix,
      createdAt: Date.now(),
      expiresAt: expiresAt ?? undefined,
    });
    return { id };
  },
});

export const remove = mutation({
  args: {
    id: v.id("apiKeys"),
    userId: v.id("users"),
  },
  handler: async ({ db }, { id, userId }) => {
    const apiKey = await db.get(id);
    if (!apiKey || apiKey.userId !== userId) return;
    await db.delete(id);
  },
});
