import { v } from "convex/values";

import { mutation, query } from "./_generated/server";

export const list = query({
  args: {},
  handler: async ({ db }) => {
    return await db.query("authors").collect();
  },
});

export const getById = query({
  args: { id: v.id("authors") },
  handler: async ({ db }, { id }) => {
    return await db.get(id);
  },
});

export const create = mutation({
  args: {
    name: v.string(),
    birthday: v.optional(v.number()),
  },
  handler: async ({ db }, { name, birthday }) => {
    const id = await db.insert("authors", {
      name,
      birthday,
      createdAt: Date.now(),
    });
    return await db.get(id);
  },
});

export const update = mutation({
  args: {
    id: v.id("authors"),
    name: v.optional(v.string()),
    birthday: v.optional(v.union(v.number(), v.null())),
  },
  handler: async ({ db }, { id, ...data }) => {
    const existing = await db.get(id);
    if (!existing) return null;

    const patch: Record<string, unknown> = {};
    if (data.name !== undefined) patch.name = data.name;
    if (data.birthday !== undefined) patch.birthday = data.birthday;

    await db.patch(id, patch);
    return await db.get(id);
  },
});

export const remove = mutation({
  args: { id: v.id("authors") },
  handler: async ({ db }, { id }) => {
    await db.delete(id);
  },
});
