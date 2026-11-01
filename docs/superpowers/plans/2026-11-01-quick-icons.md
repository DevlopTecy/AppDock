# Quick Icons Bar — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a horizontal "Quick Icons" bar in the dock footer beside Settings for instant single-click launching of favorite apps and web links, with a `+` picker from existing groups and direct drag-and-drop support from the group app grid.

**Architecture:** 
1. Store `quickIcons: AppItem[]` in `DockSettings` and persist via `saveDockData`.
2. Create `QuickIconsBar.tsx` rendered in `DockFrame.tsx` footer alongside Settings, styled to match the sidebar button aesthetics across all themes.
3. Support HTML5 drag-and-drop: drag any card from `AppGrid` directly onto `QuickIconsBar` or its `+` button to pin it.
4. Create `AddToQuickIconsModal.tsx` opened by the `+` button, letting users select any app/URL from their existing groups with a search filter.

**Tech Stack:** React 18, TypeScript, HTML5 Drag and Drop API, Lucide icons, existing theme system and `localStorage` persistence.

---

## Global Constraints
- Backward-compatible: `quickIcons` defaults to empty array `[]` when not present.
- Never crash on missing or broken icons; fallback gracefully to Globe/AppWindow icons.
- Prevent duplicate items in Quick Icons bar.
- Dragging an internal card from group onto Quick Icons must NEVER trigger the synthetic "Drop files here" external file overlay.
- Maintain full theme integration (Dark, Light, Translucent, Death Note, Kawaii, Aether, Elden Ring, One Piece, Candy, Custom).

---

## Task 1: Data Model & Storage Integration

**Files:**
- Modify: `src/types/dock.ts`
- Modify: `src/utils/storage.ts`

- [ ] **Step 1: Add `quickIcons` to `DockSettings` in `src/types/dock.ts`**
  ```ts
  quickIcons?: AppItem[]; // Pinned quick launch items displayed in footer beside Settings
  ```

- [ ] **Step 2: Add default empty `quickIcons: []` in `DEFAULT_SETTINGS` in `src/utils/storage.ts`**

- [ ] **Step 3: Verify TypeScript compiles**
  Run: `cd "d:\Projects\projects\Project 5_AppDock" && npx tsc --noEmit`

- [ ] **Step 4: Commit**
  ```bash
  git add src/types/dock.ts src/utils/storage.ts
  git commit -m "feat(types): add quickIcons array to DockSettings"
  ```

---

## Task 2: `AddToQuickIconsModal` Component

**Files:**
- Create: `src/components/AddToQuickIconsModal.tsx`

**Responsibilities:**
- Renders a clean modal with:
  - Header with title "Add to Quick Icons" and close button.
  - Search input filter.
  - Grouped accordion or list of apps/URLs from all `groups`.
  - Badges showing items already pinned to Quick Icons ("Added").
  - Click any unpinned item to pin it to Quick Icons and close/provide feedback.

- [ ] **Step 1: Create `src/components/AddToQuickIconsModal.tsx`**
- [ ] **Step 2: TypeScript check**
  Run: `cd "d:\Projects\projects\Project 5_AppDock" && npx tsc --noEmit`
- [ ] **Step 3: Commit**
  ```bash
  git add src/components/AddToQuickIconsModal.tsx
  git commit -m "feat: create AddToQuickIconsModal for picking items from groups"
  ```

---

## Task 3: `QuickIconsBar` Component with Drag-and-Drop

**Files:**
- Create: `src/components/QuickIconsBar.tsx`

**Responsibilities:**
- Renders beside Settings in the dock footer.
- Displays horizontal list of quick launch buttons with icon, tooltip, and remove option on right-click.
- Displays a prominent `+` button to open `AddToQuickIconsModal`.
- Implements `onDragOver`, `onDragLeave`, `onDrop`:
  - Accepts internal card drags (`application/x-appdock-item-json` or `(window as any).__appdock_dragging_item` or item id lookup).
  - Highlights with an active drop border/glow when dragged over.
  - On drop, adds the item to `quickIcons` if not already present.
- Matches `GroupSidebar` button styling (size ~30–32px, rounded, shadows, theme borders).

- [ ] **Step 1: Create `src/components/QuickIconsBar.tsx`**
- [ ] **Step 2: Update `AppCard.tsx` / `AppGrid.tsx` dragstart to attach item JSON in dataTransfer**
- [ ] **Step 3: TypeScript check**
  Run: `cd "d:\Projects\projects\Project 5_AppDock" && npx tsc --noEmit`
- [ ] **Step 4: Commit**
  ```bash
  git add src/components/QuickIconsBar.tsx src/components/AppGrid.tsx
  git commit -m "feat: create QuickIconsBar with drag-and-drop and launch actions"
  ```

---

## Task 4: Integrate `QuickIconsBar` into `DockFrame` and `App`

**Files:**
- Modify: `src/components/DockFrame.tsx`
- Modify: `src/App.tsx`

- [ ] **Step 1: Add QuickIcons props to `DockFrame.tsx`**
  - Accept `quickIconsContent?: React.ReactNode` in `DockFrameProps`.
  - Render it in the footer beside the Settings button.

- [ ] **Step 2: In `src/App.tsx`, wire state, handlers, and modals**
  - Add handlers: `handleAddQuickIcon`, `handleRemoveQuickIcon`, `handleLaunchItem`.
  - Pass `quickIconsContent` containing `<QuickIconsBar ... />` to `<DockFrame>`.
  - Render `<AddToQuickIconsModal ... />`.

- [ ] **Step 3: Build check**
  Run: `cd "d:\Projects\projects\Project 5_AppDock" && npm run build`

- [ ] **Step 4: Commit**
  ```bash
  git add src/components/DockFrame.tsx src/App.tsx
  git commit -m "feat: integrate QuickIconsBar into dock footer and wire state"
  ```

---

## Task 5: Testing, Verification & Git Push

**Files:**
- Create: `tests/quick-icons.test.cjs`
- Modify: `package.json` (add to test script)

- [ ] **Step 1: Create unit & integration test in `tests/quick-icons.test.cjs`**
  - Verify `DockSettings` includes `quickIcons`.
  - Verify `QuickIconsBar.tsx` exists and exports component.
  - Verify `AddToQuickIconsModal.tsx` exists.
  - Verify footer in `DockFrame.tsx` renders quick icons beside Settings.
  - Verify drag-and-drop drop handler integration.

- [ ] **Step 2: Run test suite**
  Run: `cd "d:\Projects\projects\Project 5_AppDock" && npm test`

- [ ] **Step 3: Build check**
  Run: `cd "d:\Projects\projects\Project 5_AppDock" && npm run build`

- [ ] **Step 4: Push to origin main**
  ```bash
  git push origin main
  ```

