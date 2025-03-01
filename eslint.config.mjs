import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  ...compat.extends("next/core-web-vitals", "next/typescript"),
  {
    rules: {
      "@typescript-eslint/no-unused-vars": "warn", // Nur warnen statt Fehler bei unbenutzten Variablen
      "@typescript-eslint/no-explicit-any": "warn", // Nur warnen für explizite any-Typen
      "react-hooks/exhaustive-deps": "warn", // Nur warnen für Hook-Abhängigkeiten
      "prefer-const": "warn", // Nur warnen für let statt const
    },
  },
];

export default eslintConfig;
