import { v } from "convex/values";

import { mutation, query } from "./_generated/server";

export const list = query({
  args: {},
  handler: async ({ db }) => {
    const books = await db.query("books").collect();
    return await Promise.all(
      books.map(async (book) => ({
        ...book,
        author: await db.get(book.authorId),
      }))
    );
  },
});

export const getById = query({
  args: { id: v.id("books") },
  handler: async ({ db }, { id }) => {
    const book = await db.get(id);
    if (!book) return null;
    return {
      ...book,
      author: await db.get(book.authorId),
    };
  },
});

export const create = mutation({
  args: {
    title: v.string(),
    description: v.optional(v.string()),
    publishDate: v.optional(v.number()),
    pageCount: v.optional(v.number()),
    authorId: v.id("authors"),
    addedBy: v.id("users"),
  },
  handler: async ({ db }, args) => {
    const id = await db.insert("books", {
      ...args,
      createdAt: Date.now(),
    });
    return await db.get(id);
  },
});

export const update = mutation({
  args: {
    id: v.id("books"),
    title: v.optional(v.string()),
    description: v.optional(v.union(v.string(), v.null())),
    publishDate: v.optional(v.union(v.number(), v.null())),
    pageCount: v.optional(v.union(v.number(), v.null())),
    authorId: v.optional(v.id("authors")),
    userId: v.id("users"),
    role: v.union(v.literal("user"), v.literal("admin")),
  },
  handler: async ({ db }, { id, userId, role, ...data }) => {
    const existing = await db.get(id);
    if (!existing) return null;

    if (role !== "admin" && existing.addedBy !== userId) return null;

    const patch: Record<string, unknown> = {};
    if (data.title !== undefined) patch.title = data.title;
    if (data.description !== undefined) patch.description = data.description;
    if (data.publishDate !== undefined) patch.publishDate = data.publishDate;
    if (data.pageCount !== undefined) patch.pageCount = data.pageCount;
    if (data.authorId !== undefined) patch.authorId = data.authorId;

    await db.patch(id, patch);
    return await db.get(id);
  },
});

export const remove = mutation({
  args: {
    id: v.id("books"),
    userId: v.id("users"),
    role: v.union(v.literal("user"), v.literal("admin")),
  },
  handler: async ({ db }, { id, userId, role }) => {
    const existing = await db.get(id);
    if (!existing) return;

    if (role !== "admin" && existing.addedBy !== userId) return;

    await db.delete(id);
  },
});
