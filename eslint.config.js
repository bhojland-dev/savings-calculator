import js from "@eslint/js";
import globals from "globals";

export default [
  js.configs.recommended,
  {
    files: ["js/**/*.js"],
    languageOptions: { globals: globals.browser },
  },
  {
    files: ["*.js", "tests/**/*.js"],
    languageOptions: { globals: globals.node },
  },
];
