import js from "@eslint/js";
import eslintPluginPrettier from "eslint-plugin-prettier/recommended";
import globals from "globals";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";
import tseslint from "typescript-eslint";

export default tseslint.config(
  { ignores: ["dist", ".output", ".vinxi"] },
  {
    extends: [js.configs.recommended, ...tseslint.configs.recommended],
    files: ["**/*.{ts,tsx}"],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
    },
    plugins: {
      "react-hooks": reactHooks,
      "react-refresh": reactRefresh,
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      "no-restricted-imports": [
        "error",
        {
          paths: [
            {
              name: "server-only",
              message:
                "TanStack Start does not use the Next.js `server-only` package. Rename the module to `*.server.ts` or mark it with `@tanstack/react-start/server-only`.",
            },
            {
              name: "lucide-react",
              message:
                "La iconografía de Creovision debe consumirse desde @/components/ui/icon. No se permiten imports directos de lucide-react.",
            },
            {
              name: "react-icons",
              message:
                "La iconografía de Creovision debe consumirse desde @/components/ui/icon. No se permiten imports directos de react-icons.",
            },
            {
              name: "@heroicons/react",
              message:
                "La iconografía de Creovision debe consumirse desde @/components/ui/icon. No se permiten imports directos de @heroicons/react.",
            },
            {
              name: "@fortawesome/react-fontawesome",
              message:
                "La iconografía de Creovision debe consumirse desde @/components/ui/icon. No se permiten imports directos de Font Awesome.",
            },
            {
              name: "@radix-ui/react-icons",
              message:
                "La iconografía de Creovision debe consumirse desde @/components/ui/icon. No se permiten imports directos de @radix-ui/react-icons.",
            },
            {
              name: "hugeicons-react",
              message:
                "Versión obsoleta. Usa @hugeicons/react solo en src/config/icons.ts y src/components/ui/icon.tsx.",
            },
          ],
        },
      ],
      "react-refresh/only-export-components": ["warn", { allowConstantExport: true }],
      "@typescript-eslint/no-unused-vars": "off",
    },
  },
  eslintPluginPrettier,
);
