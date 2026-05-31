import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  users: defineTable({
    email: v.string(),
    passwordHash: v.string(),
    role: v.union(v.literal("user"), v.literal("admin")),
    createdAt: v.number(),
  }).index("by_email", ["email"]),

  authors: defineTable({
    name: v.string(),
    birthday: v.optional(v.number()),
    createdAt: v.number(),
  }),

  books: defineTable({
    title: v.string(),
    description: v.optional(v.string()),
    publishDate: v.optional(v.number()),
    pageCount: v.optional(v.number()),
    authorId: v.id("authors"),
    addedBy: v.id("users"),
    createdAt: v.number(),
  })
    .index("by_author", ["authorId"])
    .index("by_addedBy", ["addedBy"]),

  apiKeys: defineTable({
    userId: v.id("users"),
    name: v.string(),
    keyHash: v.string(),
    keyPrefix: v.string(),
    createdAt: v.number(),
    expiresAt: v.optional(v.number()),
  })
    .index("by_userId", ["userId"])
    .index("by_keyHash", ["keyHash"]),
});
