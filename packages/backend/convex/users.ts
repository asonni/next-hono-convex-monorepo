import { v } from "convex/values";

import { mutation, query } from "./_generated/server";

export const getByEmail = query({
  args: { email: v.string() },
  handler: async ({ db }, { email }) => {
    return await db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", email))
      .unique();
  },
});

export const create = mutation({
  args: {
    email: v.string(),
    passwordHash: v.string(),
  },
  handler: async ({ db }, { email, passwordHash }) => {
    const id = await db.insert("users", {
      email,
      passwordHash,
      role: "user",
      createdAt: Date.now(),
    });
    return { id, email };
  },
});
