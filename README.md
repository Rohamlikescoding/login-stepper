# Login Stepper

A multi-step registration wizard built with **Angular 22** (zoneless, standalone, signal-based) and **Tailwind CSS 4**. The user progresses through four steps — Personal Information, Document Upload, Contact Information, and Review — with progress persisted to `localStorage`, strict step-order enforcement via a route guard, and a mock API simulating network submissions.

---

## Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Getting Started](#getting-started)
- [Available Scripts](#available-scripts)
- [Project Structure](#project-structure)
- [Architecture](#architecture)
  - [Bootstrapping & App Configuration](#bootstrapping--app-configuration)
  - [Routing & Lazy Loading](#routing--lazy-loading)
  - [Step Order Guard](#step-order-guard)
  - [State Management](#state-management)
  - [Mock API](#mock-api)
  - [The Four Steps](#the-four-steps)
  - [Shared UI Components](#shared-ui-components)
- [Validation Rules](#validation-rules)
- [Data Model](#data-model)
- [Styling](#styling)
- [Testing](#testing)
- [Build & Budgets](#build--budgets)
- [Code Conventions](#code-conventions)

---

## Features

- **4-step wizard flow** — Personal Info → Document Upload → Contact Info → Review & Submit
- **Route-based steps** — each step is its own lazy-loaded route (`/login-stepper/personal`, `/login-stepper/document`, etc.), so the browser back/forward buttons work naturally and every step is deep-linkable
- **Step-order enforcement** — a `canMatch` route guard prevents skipping ahead (e.g., you cannot open `/login-stepper/review` before completing the earlier steps); unauthorized jumps redirect back to the furthest unlocked step
- **Persistent progress** — the full form state and current step are saved to `localStorage` (`login-stepper-state` key), so a page refresh resumes exactly where you left off
- **Return-to-edit** — the Review page shows every collected value with per-section **Edit** buttons that navigate back to the right step (pre-filled form)
- **Simulated backend** — a mock API adds ~400 ms latency and randomly fails ~10% of requests, so loading/error handling in the UI is exercised realistically
- **Image upload with preview** — file type (`image/*`) and size (max 5 MB) validation with an instant object-URL preview
- **Responsive step indicator** — colored progress circles and connector lines; labels show on `sm+` screens
- **Accessible forms** — every input has an associated `<label for>`, inline error messages, and visible focus rings
- **Zoneless change detection** — the app runs without `zone.js`, relying on signals for reactivity

## Tech Stack

| Technology | Version | Purpose |
|---|---|---|
| [Angular](https://angular.dev) | ^22.0.0 | Framework (standalone components, signals, zoneless) |
| [TypeScript](https://www.typescriptlang.org) | ~6.0.2 | Language (strict mode) |
| [Tailwind CSS](https://tailwindcss.com) | ^4.1.12 | Utility-first styling (via PostCSS plugin) |
| [RxJS](https://rxjs.dev) | ~7.8.0 | Reactivity primitives used by Angular internals |
| [Vitest](https://vitest.dev) | ^4.0.8 | Unit test runner (with `jsdom`) |
| [Prettier](https://prettier.io) | ^3.8.1 | Code formatting |
| [@angular/build](https://angular.dev/tools/cli) | ^22.0.5 | Esbuild-based build system (application builder) |

No third-party UI libraries are used — all components are hand-written with Tailwind utilities.

## Getting Started

### Prerequisites

- **Node.js** (v20.19+ is required by Angular 22)
- **npm** 11.8.0 (declared via the `packageManager` field)

### Installation

```bash
npm install
```

### Development server

```bash
npm start          # or: ng serve
```

Navigate to [http://localhost:4200/](http://localhost:4200/). The root route (`/`) redirects to `/login-stepper`, which redirects to the first step at `/login-stepper/personal`. The app hot-reloads on source changes.

> **Tip:** to see the persistence feature, fill in a step, refresh the page, and you'll land back on the saved step with the data restored. To wipe the saved state, clear the `login-stepper-state` key from `localStorage` (or click **Start Over** after submitting on the Review step).

## Available Scripts

| Script | Command | Description |
|---|---|---|
| `start` | `ng serve` | Dev server with HMR at port 4200 |
| `build` | `ng build` | Production build (default configuration) → `dist/` |
| `watch` | `ng build --watch --configuration development` | Rebuild on change in development mode |
| `test` | `ng test` | Run unit tests with Vitest |

## Project Structure

The project follows a **feature-based folder organization** with a clear separation between `core` (single-responsibility services, models, guards) and `features` (self-contained UI), plus reusable `shared` UI.

```
login-stepper/
├── public/
│   └── favicon.ico                    # Static assets copied verbatim into the build
├── src/
│   ├── index.html                     # HTML host page (<app-root> mount point)
│   ├── main.ts                        # Bootstrap entry — bootstrapApplication(App, appConfig)
│   ├── styles.css                     # Global stylesheet; imports Tailwind CSS
│   │
│   └── app/
│       ├── app.ts                     # Root component (renders <router-outlet/>)
│       ├── app.html                   # Root template
│       ├── app.css                    # Root component styles
│       ├── app.config.ts              # App providers (router, zoneless CD, error listeners)
│       ├── app.routes.ts              # Top-level routes (redirect + lazy feature)
│       ├── app.spec.ts                # Root component tests
│       │
│       ├── core/                      # Framework-agnostic, app-wide concerns
│       │   ├── guards/
│       │   │   └── step-order.guard.ts        # canMatch guard enforcing step sequence
│       │   ├── models/
│       │   │   ├── step.enum.ts               # StepId enum: Personal=0 … Review=3
│       │   │   └── stepper-data.model.ts      # PersonalInfo / DocumentInfo / ContactInfo /
│       │   │                                  #   StepperFormData interfaces
│       │   └── services/
│       │       ├── stepper-state.service.ts   # Signal-based wizard state + localStorage sync
│       │       └── mock-api.service.ts        # Fake backend (latency + random failures)
│       │
│       ├── features/
│       │   └── login-stepper/
│       │       ├── login-stepper.routes.ts    # Child routes: shell + 4 lazy step routes
│       │       ├── login-stepper-shell/
│       │       │   └── login-stepper-shell.component.ts  # Step indicator + <router-outlet/>
│       │       └── steps/
│       │           ├── personal-info/
│       │           │   └── personal-info.component.ts    # Step 0 — name + nationality form
│       │           ├── document-upload/
│       │           │   └── document-upload.component.ts  # Step 1 — image upload + preview
│       │           ├── contact-info/
│       │           │   └── contact-info.component.ts     # Step 2 — province/city/address
│       │           └── review/
│       │               └── review.component.ts           # Step 3 — summary + submit
│       │
│       └── shared/
│           └── ui/
│               ├── step-indicator/
│               │   ├── step-indicator.ts          # Presentational progress component
│               │   └── step-indicator.html        #   (external template)
│               └── form-field-error/
│                   └── form-field-error.component.ts  # Generic inline validation message
│
├── angular.json          # Workspace/build/serve/test configuration
├── package.json          # Dependencies and npm scripts
├── tsconfig.json         # Base TS config (strict flags, ES2022 target, project references)
├── tsconfig.app.json     # App compilation scope
├── tsconfig.spec.json    # Test compilation scope
├── .postcssrc.json       # Registers the @tailwindcss/postcss plugin
├── .prettierrc           # Prettier rules (100 col width, single quotes, Angular HTML parser)
├── .editorconfig         # Editor consistency rules
├── .gitignore
└── AGENTS.md             # AI-assistant coding guidelines for this repo
```

## Architecture

### Bootstrapping & App Configuration

`src/main.ts` bootstraps the standalone root component `App` with `bootstrapApplication` — there is **no NgModule** anywhere in the codebase.

`src/app/app.config.ts` registers three providers:

```ts
providers: [
  provideZonelessChangeDetection(),      // No zone.js — signal-driven change detection
  provideBrowserGlobalErrorListeners(),  // Global uncaught-error reporting
  provideRouter(routes),                 // Router with the top-level route table
]
```

The root `App` component does nothing but render `<router-outlet />` — all real UI lives in lazily loaded features.

### Routing & Lazy Loading

Routing is **two levels deep and fully lazy**:

1. **`app.routes.ts`** — `/` redirects to `/login-stepper`, which uses `loadChildren` to pull in the feature route table on demand.
2. **`login-stepper.routes.ts`** — an empty path loads the `LoginStepperShellComponent` (also lazy via `loadComponent`), which has four children:

| Route | Step ID | Guard | Title |
|---|---|---|---|
| `/login-stepper/personal` | `Personal` (0) | — (always allowed) | Personal Information \| Login Stepper |
| `/login-stepper/document` | `Document` (1) | `canMatchStepOrder` | Document Upload \| Login Stepper |
| `/login-stepper/contact` | `Contact` (2) | `canMatchStepOrder` | Contact Information \| Login Stepper |
| `/login-stepper/review` | `Review` (3) | `canMatchStepOrder` | Review & Submit \| Login Stepper |

Every step component uses `loadComponent` for true per-route code splitting. Each route also sets a document `title` via the router's title strategy.

### Step Order Guard

`core/guards/step-order.guard.ts` exports `canMatchStepOrder`, a functional `CanMatchFn`:

1. Reads the requested step from `route.data['step']`.
2. Compares it against `stepperState.highestCompletedStep()` — a `computed()` derived from which sections of the form data are non-null.
3. Allows navigation if `requestedStep <= highestCompletedStep + 1` (i.e., the next incomplete step, or any earlier step for editing).
4. Otherwise returns a `UrlTree` redirecting to the furthest unlocked step — deep-linking past your progress silently lands you where you belong.

Because it is a `canMatch` guard on every step route, it also works for direct URL entry, not just in-app navigation.

### State Management

`StepperStateService` (`providedIn: 'root'`) is the single source of truth for the wizard:

- **Signals**: `currentStep` (`StepId`) and `formData` (`StepperFormData`) are readonly signals; the service never mutates, only `set()`/`update()`-style replacements with new objects.
- **Derived state**: `highestCompletedStep` is a `computed()` — the highest step whose data section is non-null.
- **Persistence**: every state change is serialized to `localStorage` under `login-stepper-state`. Reads/writes are guarded by `typeof window === 'undefined'` checks (SSR-safe) and wrapped in `try/catch` so storage failures never crash the app. Corrupt or missing stored state falls back to the default.
- **API**: `goToStep()`, `nextStep()` (clamped to `Review`), `previousStep()` (clamped to `Personal`), `updatePersonalInfo()`, `updateDocumentInfo()`, `updateContactInfo()`, and `resetAll()` (clears storage and resets signals).

Step components inject the service with the `inject()` function and patch their forms from state in `ngOnInit`, enabling the edit flow from Review.

### Mock API

`MockApiService` simulates a backend for the four submit operations (`submitPersonalInfo`, `uploadDocument`, `submitContactInfo`, `submitAll`). Each call:

- resolves after **~400 ms**, and
- **rejects ~10% of the time** at random (so the red "Something went wrong. Please try again." error path is actually reachable in demos).

Swap this service for a real HTTP implementation (e.g., behind the same method signatures) and the components don't change.

### The Four Steps

**1. Personal Info** (`personal-info.component.ts`) — Reactive form (non-nullable `FormBuilder`) with first name, last name, and a nationality `<select>` (Iran, Germany, USA, France, Other). Submit calls the mock API, saves to state, advances the step, and navigates to `/login-stepper/document`. Validation errors render inline only after the control is touched; the submit button is disabled while the form is invalid.

**2. Document Upload** (`document-upload.component.ts`) — A native file input restricted to `accept="image/*"` with client-side validation (must be an image, ≤ **5 MB**) and an instant preview via `URL.createObjectURL`. Previously uploaded documents show a green "Document already uploaded" badge; resubmitting without a new file reuses the stored metadata. This step writes only file **metadata** (name, size, uploaded flag) to state — the file itself is not persisted.

**3. Contact Info** (`contact-info.component.ts`) — Reactive form with province, city, and address. Same submit pattern: mock API → save → advance → navigate to `/login-stepper/review`.

**4. Review** (`review.component.ts`) — Renders all three data sections as definition lists with per-section **Edit** buttons (navigate back to that step's route, forms re-hydrate from state). **Confirm & Submit** calls `mockApi.submitAll()`; on success it hides the submit button, shows a green success message and a **Start Over** button, which calls `stepperState.resetAll()` and returns to step 1.

### Shared UI Components

- **`StepIndicator`** (`app-step-indicator`) — presentational component receiving `currentStep` and `highestCompletedStep` via the `input()` function. Renders one circle per step with connector lines: green + ✓ for completed, blue outline for the current incomplete step, gray for locked steps. Labels are hidden on mobile (`hidden sm:block`).
- **`FormFieldErrorComponent`** (`app-form-field-error`) — generic validation-message component taking an `AbstractControl` and a `Record<errorKey, message>` map via `input()`; a `computed()` resolves the first error key to its message once the control is touched. (Available as the reusable pattern; the step forms currently inline their messages.)

## Validation Rules

| Field | Rules | Error messages |
|---|---|---|
| First name | required, min length 2, letters-only pattern `^[A-Za-zÀ-ÖØ-öø-ÿ]+$` (Latin + accented) | "First name is required." / "…at least 2 characters." / "…may only contain letters." |
| Last name | same as first name | Analogous messages |
| Nationality | required, placeholder `<option disabled>` | "Nationality is required." |
| Document file | `image/*` MIME type, ≤ 5 MB (5 × 1024 × 1024 bytes), required unless already uploaded | "Please select an image file." / "File size must be 5MB or less." / "Please select a document to upload." |
| Province / City / Address | each: required, min length 3 | "…is required." / "…must be at least 3 characters." |

## Data Model

Defined in `core/models/stepper-data.model.ts`:

```ts
interface PersonalInfo {  // Step 0
  firstName: string;
  lastName: string;
  nationality: string;
}

interface DocumentInfo {  // Step 1 — file metadata only
  fileName: string;
  fileSize: number;       // bytes
  hasUploaded: boolean;
}

interface ContactInfo {   // Step 2
  province: string;
  city: string;
  address: string;
}

interface StepperFormData {       // Aggregate stored in signals + localStorage
  personal: PersonalInfo | null;  // null = step not completed
  document: DocumentInfo | null;
  contact: ContactInfo | null;
}
```

Steps are enumerated in `core/models/step.enum.ts`:

```ts
enum StepId {
  Personal = 0,
  Document = 1,
  Contact = 2,
  Review = 3,
}
```

## Styling

- **Tailwind CSS 4** via the `@tailwindcss/postcss` plugin (registered in `.postcssrc.json`); the global stylesheet is just `@import 'tailwindcss';`.
- All components use inline templates with utility classes — no external CSS files except the root shell.
- Conditional styling uses **class bindings** (`[class.border-red-500]="..."`), not `ngClass`/`ngStyle`.
- The shell constrains content to `max-w-2xl` and centers it; forms stack on mobile and go two-column at `sm:`.

## Testing

Unit tests run on **Vitest** (browser-less, via `jsdom`):

```bash
npm test
```

The scaffolded `app.spec.ts` verifies the root component is created and renders its title. Step components, the state service, and the guard are structured to be testable in isolation — services are pure signal containers, and the guard is a plain function injectable in tests.

## Build & Budgets

```bash
npm run build
```

Artifacts land in `dist/login-stepper` with all output filenames hashed (`outputHashing: 'all'`). The production configuration enforces size budgets:

| Budget | Warning | Error |
|---|---|---|
| Initial bundle | 500 kB | 1 MB |
| Any component style | 4 kB | 8 kB |

## Code Conventions

This codebase (and any contribution to it) follows the guidelines in [AGENTS.md](AGENTS.md):

- **Standalone components only** — no NgModules; `standalone: true` is not written explicitly (default in v20+).
- **`OnPush` everywhere** — every component declares `changeDetection: ChangeDetectionStrategy.OnPush`.
- **Signals for state** — `signal()` for local state, `computed()` for derived values, `input()`/`output()` functions instead of decorators; never `mutate()`.
- **`inject()` over constructor injection**.
- **Native control flow** — `@if` / `@for` / `@switch` instead of structural directives (`track` is used in every `@for`).
- **Reactive forms** over template-driven forms.
- **Functional guards** (`CanMatchFn`) rather than class-based ones.
- **Strict TypeScript** — `noImplicitOverride`, `noImplicitReturns`, `noFallthroughCasesInSwitch`, `noPropertyAccessFromIndexSignature`, strict injection parameters, ES2022 target.

---

Built with Angular CLI 22.0.5. For CLI reference, see the [Angular CLI documentation](https://angular.dev/tools/cli).
