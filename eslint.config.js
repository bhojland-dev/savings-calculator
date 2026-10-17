import js from "@eslint/js";
import html from "eslint-plugin-html";
import globals from "globals";

export default [
  js.configs.recommended,
  {
    // Lint the inline <script> in HTML pages as browser code
    files: ["**/*.html"],
    plugins: { html },
    languageOptions: { globals: globals.browser },
  },
  {
    files: ["**/*.js"],
    languageOptions: { globals: globals.node },
  },
];
