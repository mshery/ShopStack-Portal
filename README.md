# React + TypeScript + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) (or [oxc](https://oxc.rs) when used in [rolldown-vite](https://vite.dev/guide/rolldown)) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type-aware lint rules:

```js
export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...

      // Remove tseslint.configs.recommended and replace with this
      tseslint.configs.recommendedTypeChecked,
      // Alternatively, use this for stricter rules
      tseslint.configs.strictTypeChecked,
      // Optionally, add this for stylistic rules
      tseslint.configs.stylisticTypeChecked,

      // Other configs...
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from 'eslint-plugin-react-x'
import reactDom from 'eslint-plugin-react-dom'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...
      // Enable lint rules for React
      reactX.configs['recommended-typescript'],
      // Enable lint rules for React DOM
      reactDom.configs.recommended,
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```

# FRONTEND RULES — React Router + Zustand
## Clean • Simple • Pro-Level • Crash-Free

THIS FILE IS THE **ONLY SOURCE OF TRUTH**  
EVERYTHING — RULES, EXPLANATION, AND CODE — IS **INSIDE THIS FILE**  
IF CODE DOES NOT FOLLOW THIS FILE → **DO NOT MERGE**

---

## 1) WHY THIS APPROACH

This structure is used by **senior / pro-level frontend engineers** because:

- UI files stay clean and readable
- Logic is not scattered across components
- State is predictable and safe
- Null / undefined never crash the app
- Every screen behaves the same

**Mental model**

- Pages → render UI only  
- Hooks → decide what happens  
- Stores → store state safely  
- API → talk to server  
- Components → reusable UI  

---

## 2) FOLDER STRUCTURE (MANDATORY)

```txt
src/
  app/
    App.tsx
    router.tsx
    layouts/
      AppLayout.tsx
      AuthLayout.tsx

  api/
    http.ts              # fetch / axios wrapper
    auth.ts
    users.ts

  stores/
    auth.store.ts
    users.store.ts

  hooks/
    useAuth.ts
    useUsers.ts

  pages/
    LoginPage.tsx        # UI only
    UsersPage.tsx        # UI only

  components/
    ui/                  # Button, Input, Modal
    common/              # ErrorState, EmptyState, PageHeader
    skeletons/           # modern shimmer skeletons

  utils/
    format.ts
    validate.ts

  styles/
    globals.css
    skeleton.css




