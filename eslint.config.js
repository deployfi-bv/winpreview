import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import simpleImportSort from 'eslint-plugin-simple-import-sort'
import tseslint from 'typescript-eslint'
import { defineConfig, globalIgnores } from 'eslint/config'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      js.configs.recommended,
      tseslint.configs.recommended,
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
    ],
    plugins: {
      'simple-import-sort': simpleImportSort,
    },
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
    },
    rules: {
      // --- Import ordering (architecture.md §5.1) ---
      'simple-import-sort/imports': ['warn', {
        groups: [
          // 1. External packages (react, lucide-react, sonner, etc.)
          ['^react', '^[a-z]', '^@(?!/)'],
          // 2. @/components
          ['^@/components'],
          // 3. @/hooks
          ['^@/hooks'],
          // 4. @/lib
          ['^@/lib'],
          // 5. @/constants
          ['^@/constants'],
          // 6. @/types
          ['^@/types'],
          // 7. Relative imports
          ['^\\.'],
          // 8. Type-only imports last
          ['^.*\\u0000$'],
        ],
      }],
      'simple-import-sort/exports': 'warn',

      // --- Enforce `import type` for type-only imports (architecture.md §6.1) ---
      '@typescript-eslint/consistent-type-imports': ['warn', {
        prefer: 'type-imports',
        fixStyle: 'separate-type-imports',
      }],

      // --- No explicit `any` (architecture.md §6.1) ---
      '@typescript-eslint/no-explicit-any': 'error',

      // --- File length soft limit (architecture.md §6.2 — 80 lines JSX/logic target) ---
      'max-lines': ['warn', { max: 150, skipBlankLines: true, skipComments: true }],

      // --- Allow co-located cva() variant exports in shadcn UI files ---
      'react-refresh/only-export-components': ['warn', {
        allowConstantExport: true,
      }],
    },
  },
  // --- Override for shadcn UI primitives: intentional co-located variant+component exports ---
  {
    files: ['src/components/ui/badge.tsx', 'src/components/ui/button.tsx', 'src/components/ui/tabs.tsx', 'src/components/ui/toggle.tsx'],
    rules: {
      'react-refresh/only-export-components': 'off',
    },
  },
  // --- Override for co-located hook+provider pattern ---
  {
    files: ['src/hooks/useAppState.tsx'],
    rules: {
      'react-refresh/only-export-components': 'off',
    },
  },
  // --- Override for annotation sub-renderers: export helper fns alongside internal components ---
  {
    files: ['src/components/canvas/annotations/ShapeAnnotation.tsx', 'src/components/canvas/annotations/LineAnnotation.tsx', 'src/components/canvas/annotations/TextAnnotation.tsx', 'src/components/canvas/annotations/PathAnnotations.tsx'],
    rules: {
      'react-refresh/only-export-components': 'off',
    },
  },
  // --- Override for TanStack Virtual incompatibility (known library limitation) ---
  {
    files: ['src/components/sidebar/ThumbnailPanel.tsx'],
    rules: {
      'react-hooks/incompatible-library': 'off',
    },
  },
  // --- Override for shadcn UI primitives (vendor-generated, excluded by .claudeignore) ---
  {
    files: ['src/components/ui/*.tsx'],
    rules: {
      'max-lines': 'off',
    },
  },
  // --- Override for test files (inherently verbose, splitting reduces readability) ---
  {
    files: ['**/*.test.ts', '**/*.test.tsx'],
    rules: {
      'max-lines': ['warn', { max: 300, skipBlankLines: true, skipComments: true }],
    },
  },
])
