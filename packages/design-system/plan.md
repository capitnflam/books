# Design System Implementation Plan

**TL;DR - what, why, and how (your recommended approach).**
The immediate priority is to resolve the build failure for `@repo/design-system` by configuring Vite correctly for library mode. Once the build process is stable, we will proceed with implementing more foundational atomic components like `Input` and `Checkbox` to expand the design system's utility.

**Steps**

### Phase 1: Stabilize Library Build Process (Immediate Fix)

1.  **Create Vite Configuration:** Create a `vite.config.ts` file in `packages/design-system`. This configuration will be set up to build React components as a library, ensuring correct output formats for consumption by other packages.
2.  **Update Package Scripts:** Modify `packages/design-system/package.json` to explicitly use the new Vite configuration and ensure the `build` script correctly compiles the source code into distributable assets.

### Phase 2: Implement Next Atomic Components (Feature Expansion)

1.  **Implement Input Component:** Create a dedicated component folder (`Input/`) containing `Input.tsx`, `Input.module.scss`, and necessary types. This component will handle text input, validation states, and styling based on the design system's tokens.
2.  **Implement Checkbox Component:** Create a dedicated component folder (`Checkbox/`) for a reusable checkbox control, focusing on accessibility and state management.

### Phase 3: Integration & Verification

1.  **Update Consuming App:** In `apps/webapp`, update the necessary configuration (if required by Next.js) to ensure it correctly resolves imports from `@repo/design-system` after the build is stable.
2.  **Verification:** Run the build script for `@repo/design-system` (`pnpm --filter=@repo/design-system build`) and verify that a functional output bundle is generated. Then, test rendering `Input` and `Checkbox` in `apps/webapp`.

**Relevant files**

- `packages/design-system/vite.config.ts` — **(New File)**: To configure Vite for library mode (using Rollup options).
- `packages/design-system/package.json` — Modify the `"scripts"` section to correctly reference and execute the build process via Vite.
- `packages/design-system/src/components/Input/` — **(New Directory)**: To house the input component logic and styles.
- `packages/design-system/src/components/Checkbox/` — **(New Directory)**: To house the checkbox component logic and styles.

**Verification**

1.  Execute the build command for `@repo/design-system` in a terminal (`pnpm --filter=@repo/design-system build`). Verify that it completes successfully without errors, producing output files (e.g., in a `dist` folder).
2.  In `apps/webapp`, update `src/app/page.tsx` to import and render the new `<Input />` component.

**Decisions** (if applicable)

- **Build Tool:** We are proceeding with configuring Vite for library mode, as it is already a dependency in the package.
- **Component Scope:** The next components will be `Input` and `Checkbox`, focusing on form elements which are critical to any design system.

**Further Considerations** (if applicable, 1-3 items)

1.  **TypeScript Configuration for Library:** Should we explicitly add a `tsconfig.lib.json` file within `@repo/design-system` to ensure the library is compiled with correct target settings for distribution?
2.  **Styling Consistency:** When implementing `Input`, should I strictly adhere to the SCSS Module pattern, or should I explore using CSS variables defined in the global styles (`apps/webapp/src/styles/globals.css`) directly within the component's module for better theme integration?
3.  **Testing Strategy:** Should we implement unit tests (using Vitest) for `Button` and `Typography` before moving on to new components, or prioritize feature completion first?
