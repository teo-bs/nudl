
import js from "@eslint/js";
import globals from "globals";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";
import tseslint from "typescript-eslint";
import tailwindcss from "eslint-plugin-tailwindcss";

export default tseslint.config(
  { ignores: ["dist", "public"] },
  {
    extends: [
      js.configs.recommended, 
      ...tseslint.configs.recommended,
      ...tailwindcss.configs["flat/recommended"]
    ],
    files: ["**/*.{ts,tsx}"],
    languageOptions: {
      ecmaVersion: 2020,
      globals: {
        ...globals.browser,
        ...globals.webextensions,
        chrome: "readonly",
      },
    },
    plugins: {
      "react-hooks": reactHooks,
      "react-refresh": reactRefresh,
      "tailwindcss": tailwindcss,
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      "react-refresh/only-export-components": [
        "warn",
        { allowConstantExport: true },
      ],
      "@typescript-eslint/no-unused-vars": "off",
      "tailwindcss/classnames-order": "warn",
      "tailwindcss/no-custom-classname": "warn",
    },
  }
);
