import { defineConfig } from "vite-plus";

export default defineConfig({
  staged: {
    "*.{ts,tsx,js,mjs,cjs,json,md}": "vp fmt",
  },
  test: {
    include: ["tests/**/*.test.ts"],
  },
  lint: {
    options: {
      typeAware: true,
      typeCheck: true,
    },
  },
});
