import { config } from "@workspace/eslint-config/base";

export default [
  {
    ignores: ["convex/_generated/**"],
  },
  ...config,
];
