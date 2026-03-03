export default {
  extends: ["@commitlint/config-conventional"],
  rules: {
    "body-empty": [2, "never"],
    "type-enum": [
      2,
      "always",
      [
        "feat",
        "fix",
        "perf",
        "refactor",
        "docs",
        "style",
        "chore",
        "test",
        "ci",
        "build",
        "revert",
      ],
    ],
  },
};
