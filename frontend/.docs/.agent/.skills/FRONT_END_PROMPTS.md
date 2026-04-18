# Front-End.md

## 1. Overview

This document describes the architecture, structure, and development philosophy of the Front-End project built with **Next.js**, **TypeScript**, **TailwindCSS**, and **ESLint**.

The goal is to ensure:

* Scalable UI architecture
* Clear separation of concerns
* Easy debugging & maintainability
* Consistent design system

---

## 2. Tech Stack

| Technology           | Purpose                                |
| -------------------- | -------------------------------------- |
| Next.js (App Router) | Framework for SSR/CSR hybrid rendering |
| TypeScript           | Type safety & maintainability          |
| TailwindCSS          | Utility-first styling system           |
| ESLint               | Code quality & consistency             |
| React Context        | Global state management                |
| Fetch / Axios        | API communication                      |

---

## 3. Project Initialization

### Create Project with `src` structure

```bash
npx create-next-app@latest my-app \
--typescript \
--eslint \
--tailwind \
--src-dir \
--app
```

### Move into project

```bash
cd my-app
npm install
npm run dev
```

---

## 4. Folder Structure

```
src/
│
├── app/                # Next.js App Router (routing + layout)
│   ├── layout.tsx
│   ├── page.tsx
│   └── (auth)/         # Route grouping (optional)
│
├── components/         # Reusable UI components
│   ├── ui/             # Atomic components (Button, Input, Card)
│   ├── layout/         # Layout components (Navbar, Sidebar)
│   └── common/         # Shared components
│
├── services/           # Business logic layer
│   ├── api/            # API calls (fetch/axios)
│   ├── context/        # React Context (Auth, Theme, etc.)
│   └── hooks/          # Custom hooks
│
├── lib/                # Utilities / helpers
│   ├── utils.ts
│   └── constants.ts
│
├── styles/             # Global styles
│   └── globals.css
│
├── types/              # Type definitions
│   └── index.ts
│
└── config/             # App configurations
    └── env.ts
```

---

## 5. Architectural Principles

### 5.1 Separation of Concerns

* `app/` → Routing & page-level structure
* `components/` → UI only (no business logic)
* `services/` → Data + logic (API, state)
* `lib/` → Pure reusable utilities

---

### 5.2 Data Flow

```
UI (components)
   ↓
Hooks / Context (services)
   ↓
API Layer (services/api)
   ↓
Backend
```

---

### 5.3 Component Design

* **Atomic Design mindset**

  * UI primitives → `components/ui`
  * Composite → `components/common`
  * Layout → `components/layout`

* Each component:

  * Must be reusable
  * Must not directly call API
  * Must receive data via props or hooks

---

## 6. Import Rules (VERY IMPORTANT)

### 6.1 Absolute Import

Use alias (`@/`) instead of relative paths:

```ts
import Button from "@/components/ui/button"
import { useAuth } from "@/services/context/auth-context"
```

### 6.2 Allowed Dependency Direction

```
app → components → services → lib
```

❌ NOT ALLOWED:

* components → app
* services → components

---

### 6.3 Import Guidelines

* UI components **must not import API directly**
* Context handles logic, components consume context
* Avoid circular dependencies

---

## 7. Styling Strategy (TailwindCSS)

### 7.1 Principles

* Utility-first
* No inline CSS
* No CSS duplication

### 7.2 Structure

* Global styles → `styles/globals.css`
* Tailwind config → `tailwind.config.ts`

### 7.3 Convention

```tsx
<div className="flex items-center justify-between p-4 bg-primary text-white">
```

---

## 8. State Management

### 8.1 Global State

* Use React Context (inside `services/context`)
* Example:

  * AuthContext
  * ThemeContext

### 8.2 Local State

* Use `useState` / `useReducer`

### 8.3 Custom Hooks

* Encapsulate reusable logic

```
services/hooks/useAuth.ts
```

---

## 9. API Communication

### Structure

```
services/api/
├── client.ts      # axios/fetch config
├── auth.api.ts
└── user.api.ts
```

### Rules

* No API call inside components
* Always go through service layer

---

## 10. ESLint & Code Quality

* Enforce consistent coding style
* Avoid unused variables
* Maintain readable structure

Run lint:

```bash
npm run lint
```

---

## 11. Running the Project

### Development

```bash
npm run dev
```

### Build

```bash
npm run build
```

### Production

```bash
npm run start
```

---

## 12. Debugging Strategy

### UI Issues

* Check component props
* Verify Tailwind classes applied

### Data Issues

* Check API response
* Validate context state

### Styling Issues

* Confirm Tailwind config
* Inspect DOM via DevTools

---

## 13. UI/UX Design Philosophy

### 13.1 Design Language

* Primary language: [Define here]
* Tone: [Modern / Minimal / Professional / etc.]

---

### 13.2 Color System

* Primary Color:
* Secondary Color:
* Background:
* Text Color:

---

### 13.3 Typography

* Font Family:
* Heading Style:
* Body Text:

---

### 13.4 Layout Principles

* Grid system:
* Spacing scale:
* Responsive breakpoints:

---

### 13.5 Component Behavior

* Button states (hover, active, disabled)
* Input validation feedback
* Loading & skeleton states

---

## 14. Future Improvements

* Introduce state management library (Redux / Zustand)
* Add testing (Jest / React Testing Library)
* Implement design system (Storybook)
* Optimize performance (lazy loading, memoization)

---

## 15. Summary

This architecture ensures:

* Clean separation of UI and logic
* Scalable folder structure
* Maintainable and debuggable system
* Consistent UI/UX design approach

---

> This document serves as the backbone for front-end development and should be updated as the system evolves.
