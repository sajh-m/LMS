import globals from "globals";

export default [
  {
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: "module",
      globals: {
        ...globals.node,
      },
    },
    rules: {
      "no-unused-vars": "warn",
      "no-undef": "error",
      eqeqeq: "warn",
      "no-console": "off",
    },
  },
  {
    ignores: ["node_modules", "data"],
  },
];
