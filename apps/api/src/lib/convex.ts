import { ConvexHttpClient } from "convex/browser";

import { env } from "../data/env";

let _convex: ConvexHttpClient | null = null;

function getConvex(): ConvexHttpClient {
  if (_convex === null) {
    _convex = new ConvexHttpClient(env.CONVEX_URL);
  }
  return _convex;
}

export const convex = new Proxy({} as ConvexHttpClient, {
  get(_target, prop: keyof ConvexHttpClient) {
    const client = getConvex();
    const value = client[prop];
    return typeof value === "function" ? value.bind(client) : value;
  },
});
